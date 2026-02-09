import { z } from "zod";
import { NextResponse } from "next/server";
import { createClient, getWebsiteURL } from "@/server/auth";
import { whop } from "@/lib/whop";
import { getSubscriptionDetails } from "@/server/subscription";
import { getReferralBySlug } from "@/server/referral";

async function handleWhopCheckout(
  lookupKey: string,
  user: { id: string; email?: string | null },
  websiteURL: string,
  referral?: string | null,
) {
  const subscriptionDetails = await getSubscriptionDetails();

  if (subscriptionDetails?.isActive) {
    return NextResponse.redirect(`${websiteURL}dashboard?error=already_subscribed`, 303);
  }

  let planId = "";
  if (lookupKey.includes("monthly")) {
    planId = process.env.NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID || "plan_55MGVOxft6Ipz";
  } else if (lookupKey.includes("6month") || lookupKey.includes("quarterly")) {
    planId = process.env.NEXT_PUBLIC_WHOP_6MONTH_PLAN_ID || "plan_LqkGRNIhM2A2z";
  } else if (lookupKey.includes("yearly")) {
    planId = process.env.NEXT_PUBLIC_WHOP_YEARLY_PLAN_ID || "plan_JWhvqxtgDDqFf";
  } else if (lookupKey.includes("lifetime") || lookupKey.includes("elite")) {
    planId = process.env.NEXT_PUBLIC_WHOP_LIFETIME_PLAN_ID || "";
  }

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

  try {
    const checkoutConfig = await whop.checkoutConfigurations.create({
      company_id: companyId,
      plan_id: planId,
      metadata: {
        user_id: user.id,
        email: user.email ?? "",
        plan: lookupKey,
        ...(safeReferral ? { referral_code: safeReferral } : {}),
      },
      redirect_url: `${websiteURL}dashboard?success=true&referral_applied=${safeReferral ? "true" : "false"}`,
    });

    if (!checkoutConfig.purchase_url) {
      throw new Error("No purchase_url returned from Whop");
    }

    return NextResponse.redirect(checkoutConfig.purchase_url, 303);
  } catch (error) {
    console.error("[Whop Checkout] Failed to create checkout:", error);
    return NextResponse.redirect(
      `${websiteURL}dashboard?error=checkout_failed&reason=provider_error`,
      303,
    );
  }
}

export async function POST(req: Request) {
  const body = await req.formData();
  const websiteURL = await getWebsiteURL();

  const lookupKey = body.get("lookup_key") as string;
  const referral = body.get("referral") as string | null;

  const validation = z
    .object({
      lookup_key: z.string().min(1, "Lookup key is required"),
      referral: z.string().nullable().optional(),
    })
    .safeParse({ lookup_key: lookupKey, referral });

  if (!validation.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: validation.error.format() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const referralParam = referral ? `&referral=${encodeURIComponent(referral)}` : "";
    return NextResponse.redirect(
      `${websiteURL}authentication?subscription=true&lookup_key=${lookupKey}${referralParam}`,
      303,
    );
  }

  return handleWhopCheckout(lookupKey, user, websiteURL, referral);
}

export async function GET(req: Request) {
  const websiteURL = await getWebsiteURL();
  const { searchParams } = new URL(req.url);
  const lookupKey = searchParams.get("lookup_key");
  const referral = searchParams.get("referral");

  if (!lookupKey) {
    return NextResponse.json({ message: "Lookup key is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const referralParam = referral ? `&referral=${encodeURIComponent(referral)}` : "";
    return NextResponse.redirect(
      `${websiteURL}authentication?subscription=true&lookup_key=${lookupKey}${referralParam}`,
      303,
    );
  }

  return handleWhopCheckout(lookupKey, user, websiteURL, referral);
}
