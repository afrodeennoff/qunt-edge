import { NextResponse } from "next/server";
import { getWebsiteURL } from "@/server/auth";
import { getWhop } from "@/lib/whop";
import { createRouteClient } from "@/lib/supabase/route-client";
import { z } from "zod";
import { rateLimit, createRateLimitResponse } from "@/lib/rate-limit";
import { parseQuery } from "@/app/api/_utils/validate";

function safeLocale(value: string | null | undefined): string {
    const raw = (value || "").trim().toLowerCase();
    if (!raw) return "en";
    if (!/^[a-z]{2}(-[a-z]{2})?$/.test(raw)) return "en";
    return raw;
}

function withLocalePrefix(locale: string, pathWithOptionalQuery: string): string {
    const normalized = `/${pathWithOptionalQuery.replace(/^\/+/, "")}`;
    if (normalized.startsWith("/api/")) return normalized;
    if (/^\/[a-z]{2}(?:-[a-z]{2})?(?:\/|$)/i.test(normalized)) return normalized;
    return `/${locale}${normalized}`;
}

const teamCheckoutQuerySchema = z.object({
    teamName: z.string().trim().min(1).max(80).optional(),
    locale: z.string().optional(),
});

const checkoutRateLimiter = rateLimit({
    identifier: "whop-team-checkout",
    limit: 20,
    window: 60_000,
});

type CheckoutUser = { id: string; email?: string | null };

async function handleWhopTeamCheckout(user: CheckoutUser, websiteURL: string, locale: string, teamName?: string) {
    const planId = process.env.NEXT_PUBLIC_WHOP_TEAM_PLAN_ID;

    if (!planId) {
        return NextResponse.json({ message: "Team Plan ID not found" }, { status: 404 });
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
                team_name: teamName || '',
                type: 'team',
            },
            redirect_url: new URL(
                withLocalePrefix(locale, "/dashboard/settings?success=team_created"),
                websiteURL
            ).toString(),
        });

        if (!checkoutConfig.purchase_url) {
            throw new Error("No purchase_url returned from Whop");
        }

        return NextResponse.redirect(checkoutConfig.purchase_url, 303);
    } catch (error) {
        console.error("Error creating Whop team checkout:", error);
        return NextResponse.json({ message: "Error creating checkout session" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const limit = await checkoutRateLimiter(req);
    if (!limit.success) {
        return createRateLimitResponse(limit);
    }

    const body = await req.formData();
    const websiteURL = await getWebsiteURL();
    const parsed = teamCheckoutQuerySchema.safeParse({
        teamName: body.get("teamName"),
        locale: body.get("locale"),
    });

    if (!parsed.success) {
        return NextResponse.json({ message: "Invalid checkout input" }, { status: 400 });
    }

    const teamName = parsed.data.teamName ?? null;
    const locale = safeLocale(parsed.data.locale);

    const supabase = createRouteClient(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const search = new URLSearchParams();
        search.set('subscription', 'true');
        search.set('plan', 'team');
        search.set('locale', locale);
        if (teamName) search.set('teamName', teamName);
        return NextResponse.redirect(
            new URL(withLocalePrefix(locale, `/authentication?${search.toString()}`), websiteURL),
            303
        );
    }

    return handleWhopTeamCheckout(user, websiteURL, locale, teamName || undefined);
}

export async function GET(req: Request) {
    const limit = await checkoutRateLimiter(req);
    if (!limit.success) {
        return createRateLimitResponse(limit);
    }

    const websiteURL = await getWebsiteURL();
    const { searchParams } = new URL(req.url);
    const { teamName, locale } = parseQuery(searchParams, teamCheckoutQuerySchema);
    const safe = safeLocale(locale);

    const supabase = createRouteClient(req);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        const search = new URLSearchParams();
        search.set('subscription', 'true');
        search.set('plan', 'team');
        search.set('locale', safe);
        if (teamName) search.set('teamName', teamName);
        return NextResponse.redirect(
            new URL(withLocalePrefix(safe, `/authentication?${search.toString()}`), websiteURL),
            303
        );
    }

    return handleWhopTeamCheckout(user, websiteURL, safe, teamName || undefined);
}
