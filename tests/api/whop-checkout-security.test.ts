import { beforeEach, describe, expect, it, vi } from "vitest"

const {
  getUser,
  createCheckoutConfiguration,
  getSubscriptionDetails,
} = vi.hoisted(() => ({
  getUser: vi.fn(),
  createCheckoutConfiguration: vi.fn(),
  getSubscriptionDetails: vi.fn(),
}))

vi.mock("@/lib/supabase/route-client", () => ({
  createRouteClient: vi.fn(() => ({
    auth: {
      getUser,
    },
  })),
}))

vi.mock("@/server/auth", () => ({
  getWebsiteURL: vi.fn(async () => "https://example.com"),
}))

vi.mock("@/server/subscription", () => ({
  getSubscriptionDetails,
}))

vi.mock("@/server/referral", () => ({
  getReferralBySlug: vi.fn(async () => null),
}))

vi.mock("@/lib/whop", () => ({
  getWhop: vi.fn(() => ({
    checkoutConfigurations: {
      create: createCheckoutConfiguration,
    },
  })),
}))

import { GET as checkoutGet } from "@/app/api/whop/checkout/route"
import { GET as checkoutTeamGet } from "@/app/api/whop/checkout-team/route"

describe("Whop checkout security guards", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getUser.mockResolvedValue({ data: { user: { id: "user_1", email: "u@example.com" } } })
    getSubscriptionDetails.mockResolvedValue({ isActive: false })
    createCheckoutConfiguration.mockResolvedValue({ purchase_url: "https://checkout.whop.com" })

    process.env.NEXT_PUBLIC_WHOP_MONTHLY_PLAN_ID = "plan_monthly"
    process.env.NEXT_PUBLIC_WHOP_TEAM_PLAN_ID = "plan_team"
    delete process.env.WHOP_COMPANY_ID
  })

  it("fails closed when WHOP_COMPANY_ID is missing for checkout route", async () => {
    const request = new Request("http://localhost/api/whop/checkout?lookup_key=plus_monthly_usd")
    const response = await checkoutGet(request)

    expect(response.status).toBe(500)
    expect(createCheckoutConfiguration).not.toHaveBeenCalled()
  })

  it("fails closed when WHOP_COMPANY_ID is missing for team checkout route", async () => {
    const request = new Request("http://localhost/api/whop/checkout-team?teamName=Alpha")
    const response = await checkoutTeamGet(request)

    expect(response.status).toBe(500)
    expect(createCheckoutConfiguration).not.toHaveBeenCalled()
  })
})
