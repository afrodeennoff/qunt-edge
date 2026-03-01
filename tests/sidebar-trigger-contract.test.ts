import { describe, expect, it } from "vitest"
import { readFileSync } from "node:fs"
import { join } from "node:path"

describe("Dashboard sidebar trigger contract", () => {
  it("keeps a dashboard header trigger with responsive sizing classes", () => {
    const source = readFileSync(
      join(process.cwd(), "app/[locale]/dashboard/components/dashboard-header.tsx"),
      "utf8"
    )

    expect(source).toMatch(/<SidebarTrigger className=\"[^\"]*h-11[^\"]*w-11[^\"]*md:h-7[^\"]*md:w-7[^\"]*\"/)
  })

  it("keeps a single desktop trigger in unified sidebar", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/unified-sidebar.tsx"),
      "utf8"
    )

    const triggerUsages = source.match(/<SidebarTrigger/g) || []

    expect(triggerUsages).toHaveLength(1)
    expect(source).toContain("hidden md:flex")
  })

  it("does not nest SidebarTrigger inside SidebarMenuButton", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/unified-sidebar.tsx"),
      "utf8"
    )

    expect(source).toMatch(
      /<SidebarMenuButton[\s\S]*?<\/SidebarMenuButton>\s*<SidebarTrigger/
    )
  })
})
