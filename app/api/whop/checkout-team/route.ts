import { NextResponse } from "next/server";
import { getWebsiteURL } from "@/server/auth";
import { getWhop } from "@/lib/whop";
import { createRouteClient } from "@/lib/supabase/route-client";

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

type CheckoutUser = { id: string; email?: string | null }

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
    const body = await req.formData();
    const websiteURL = await getWebsiteURL();
    const teamName = body.get('teamName') as string | null;
    const locale = safeLocale(body.get('locale') as string | null);

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
    const websiteURL = await getWebsiteURL();
    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get('teamName');
    const locale = safeLocale(searchParams.get('locale'));

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
