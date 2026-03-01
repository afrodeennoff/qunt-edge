import { NextResponse } from "next/server";
import { getWebsiteURL } from "@/server/auth";
import { getWhop } from "@/lib/whop";
import { createRouteClient } from "@/lib/supabase/route-client";

const FORM_CONTENT_TYPES = [
    "multipart/form-data",
    "application/x-www-form-urlencoded",
]

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

export async function GET() {
    return NextResponse.json(
        { error: "Method Not Allowed", code: "METHOD_NOT_ALLOWED" },
        { status: 405, headers: { Allow: "POST" } },
    );
}
