import { NextResponse } from "next/server";
import { createClient, getWebsiteURL } from "@/server/auth";
import { whop } from "@/lib/whop";

async function handleWhopTeamCheckout(user: any, websiteURL: string, teamName?: string) {
    const planId = process.env.NEXT_PUBLIC_WHOP_TEAM_PLAN_ID;

    if (!planId) {
        return NextResponse.json({ message: "Team Plan ID not found" }, { status: 404 });
    }

    const companyId = process.env.WHOP_COMPANY_ID || "biz_jh37YZGpH5dWIY";

    try {
        const checkoutConfig = await whop.checkoutConfigurations.create({
            company_id: companyId,
            plan_id: planId,
            metadata: {
                user_id: user.id,
                email: user.email,
                team_name: teamName || '',
                type: 'team',
            },
            redirect_url: `${websiteURL}dashboard/settings?success=team_created`,
        });

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

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(
            `${websiteURL}authentication?subscription=true&plan=team`,
            303
        );
    }

    return handleWhopTeamCheckout(user, websiteURL, teamName || undefined);
}

export async function GET(req: Request) {
    const websiteURL = await getWebsiteURL();
    const { searchParams } = new URL(req.url);
    const teamName = searchParams.get('teamName');

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.redirect(
            `${websiteURL}authentication?subscription=true&plan=team`,
            303
        );
    }

    return handleWhopTeamCheckout(user, websiteURL, teamName || undefined);
}
