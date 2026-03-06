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

  it("does not render an extra trigger in unified sidebar header", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/unified-sidebar.tsx"),
      "utf8"
    )

    const triggerUsages = source.match(/<SidebarTrigger/g) || []

    expect(triggerUsages).toHaveLength(0)
  })

  it("does not reference SidebarTrigger in unified sidebar", () => {
    const source = readFileSync(
      join(process.cwd(), "components/ui/unified-sidebar.tsx"),
      "utf8"
    )

    expect(source).not.toContain("SidebarTrigger")
  })
})
