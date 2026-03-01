import { z } from "zod";
import { NextResponse } from "next/server";
import { getWebsiteURL } from "@/server/auth";
import { getWhop } from "@/lib/whop";
import { getReferralBySlug } from "@/server/referral";
import { getSubscriptionDetails } from "@/server/subscription";
import { createRouteClient } from "@/lib/supabase/route-client";

const FORM_CONTENT_TYPES = [
  "multipart/form-data",
  "application/x-www-form-urlencoded",
]

function safeLocale(value: string | null | undefined): string {
  const raw = (value || "").trim().toLowerCase();
  if (!raw) return "en";
  // Keep permissive (supports en, fr, hi, ja, es, it, etc.)
  if (!/^[a-z]{2}(-[a-z]{2})?$/.test(raw)) return "en";
  return raw;
}

function withLocalePrefix(locale: string, pathWithOptionalQuery: string): string {
  const normalized = `/${pathWithOptionalQuery.replace(/^\/+/, "")}`;
  if (normalized.startsWith("/api/")) return normalized;
  if (/^\/[a-z]{2}(?:-[a-z]{2})?(?:\/|$)/i.test(normalized)) return normalized;
  return `/${locale}${normalized}`;
}

function resolvePlanId(lookupKey: string): string {
  // Expected format from UI: "plus_{interval}_{currency}", e.g. plus_monthly_usd
  const parts = lookupKey.toLowerCase().split("_");
  const intervalRaw = parts[1] || "";
  const currencyRaw = parts[2] || "";

  const interval =
    intervalRaw === "6month" ? "quarterly" : intervalRaw; // legacy alias
  const currency = currencyRaw === "usd" || currencyRaw === "eur" ? currencyRaw.toUpperCase() : "";

  const env = process.env as Record<string, string | undefined>;

  // Prefer currency-specific env vars when present, fall back to existing ones.
  const candidates: Array<string | undefined> = [
    env[`NEXT_PUBLIC_WHOP_${interval.toUpperCase()}_PLAN_ID_${currency}`],
    env[`NEXT_PUBLIC_WHOP_PLUS_${interval.toUpperCase()}_PLAN_ID_${currency}`],
    env[`NEXT_PUBLIC_WHOP_${interval.toUpperCase()}_PLAN_ID`],
    // Legacy name kept for backwards compatibility
    interval === "quarterly" ? process.env.NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID : undefined,
    interval === "monthly" ? process.env.NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID : undefined,
    interval === "yearly" ? process.env.NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID : undefined,
    interval === "lifetime" ? process.env.NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID : undefined,
  ];

  const found = candidates.find((v) => typeof v === "string" && v.trim().length > 0);
  return found?.trim() || "";
}

function isAllowedFormContentType(contentType: string | null): boolean {
  if (!contentType) return false
  const normalized = contentType.toLowerCase()
  return FORM_CONTENT_TYPES.some((allowed) => normalized.startsWith(allowed))
}

function isTrustedOrigin(request: Request, websiteURL: string): boolean {
  const origin = request.headers.get("origin")
  if (!origin) return true
  try {
    return new URL(origin).origin === new URL(websiteURL).origin
  } catch {
    return false
  }
}

async function handleWhopCheckout(
  lookupKey: string,
  user: { id: string; email?: string | null },
  websiteURL: string,
  referral?: string | null,
  locale?: string | null,
  promoCode?: string | null,
  teamId?: string | null,
) {
  const subscriptionDetails = await getSubscriptionDetails();

  const effectiveLocale = safeLocale(locale);

  if (subscriptionDetails?.isActive) {
    return NextResponse.redirect(
      new URL(withLocalePrefix(effectiveLocale, "/dashboard?error=already_subscribed"), websiteURL),
      303,
    );
  }

  const planId = resolvePlanId(lookupKey);

  if (!planId) {
    return NextResponse.json(
      { message: "Plan configuration missing for this selection. Please contact support." },
      { status: 404 },
    );
  }

  let safeReferral = referral ?? null;
  if (safeReferral) {
    const referralData = await getReferralBySlug(safeReferral);
    if (!referralData || (user.id && referralData.userId === user.id)) {
      safeReferral = null;
    }
  }

  const companyId = process.env.WHOP_COMPANY_ID || "biz_jh37YZGpH5dWIY";
  const whop = getWhop();

  try {
    const checkoutConfig = await whop.checkoutConfigurations.create({
      company_id: companyId,
      plan_id: planId,
      metadata: {
        user_id: user.id,
        email: user.email || '',
        plan: lookupKey,
        ...(safeReferral ? { referral_code: safeReferral } : {}),
        ...(promoCode ? { promo_code: promoCode } : {}),
        ...(teamId ? { team_id: teamId } : {}),
      },
      redirect_url: new URL(
        withLocalePrefix(
          effectiveLocale,
          `/dashboard?success=true&referral_applied=${safeReferral ? "true" : "false"}${teamId ? "&team_id=" + teamId : ""}`,
        ),
        websiteURL,
      ).toString(),
    });

    if (!checkoutConfig.purchase_url) {
      throw new Error("No purchase_url returned from Whop");
    }

    return NextResponse.redirect(checkoutConfig.purchase_url, 303);
  } catch (error) {
    console.error("[Whop Checkout] Failed to create checkout:", error);
    return NextResponse.redirect(
      new URL(withLocalePrefix(effectiveLocale, "/dashboard?error=checkout_failed&reason=provider_error"), websiteURL),
      303,
    );
  }
}

export async function POST(req: Request) {
  const websiteURL = await getWebsiteURL();
  if (!isTrustedOrigin(req, websiteURL)) {
    return NextResponse.json(
      { error: "Forbidden", code: "ORIGIN_MISMATCH" },
      { status: 403 },
    );
  }

  if (!isAllowedFormContentType(req.headers.get("content-type"))) {
    return NextResponse.json(
      { error: "Unsupported content type", code: "UNSUPPORTED_CONTENT_TYPE" },
      { status: 415 },
    );
  }

  const body = await req.formData();

  const lookupKey = body.get("lookup_key") as string;
  const referral = body.get("referral") as string | null;
  const locale = body.get("locale") as string | null;
  const promoCode = body.get("promo_code") as string | null;

  const validation = z
    .object({
      lookup_key: z.string().min(1, "Lookup key is required"),
      referral: z.string().nullable().optional(),
      locale: z.string().nullable().optional(),
      promo_code: z.string().nullable().optional(),
    })
    .safeParse({ lookup_key: lookupKey, referral, locale, promo_code: promoCode });

  if (!validation.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: validation.error.format() },
      { status: 400 },
    );
  }

  const supabase = createRouteClient(req);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const effectiveLocale = safeLocale(locale);
    const search = new URLSearchParams();
    search.set("subscription", "true");
    search.set("lookup_key", lookupKey);
    if (referral) search.set("referral", referral);
    if (promoCode) search.set("promo_code", promoCode);
    return NextResponse.redirect(
      new URL(withLocalePrefix(effectiveLocale, `/authentication?${search.toString()}`), websiteURL),
      303,
    );
  }

  return handleWhopCheckout(lookupKey, user, websiteURL, referral, locale, promoCode);
}

export async function GET() {
  return NextResponse.json(
    { error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" },
    { status: 405, headers: { Allow: "POST" } },
  );
}
