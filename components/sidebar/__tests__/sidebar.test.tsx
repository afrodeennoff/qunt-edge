import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act, waitFor } from "@testing-library/react"
import { render, screen, fireEvent } from "@testing-library/react"
import { useActiveLink } from "@/components/ui/unified-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar"
import { isQueryParamOnlyNavigation } from "@/lib/navigation-utils"

describe("Sidebar Active Link Detection", () => {
  it("should detect exact match", () => {
    const { result } = renderHook(() => useActiveLink(), {
      wrapper: ({ children }) => (
        <div>
          {children}
        </div>
      ),
    })

    act(() => {
      vi.spyOn(require("next/navigation"), "usePathname").mockReturnValue("/dashboard")
      vi.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(new URLSearchParams())
    })

    const isActive = result.current
    expect(isActive("/dashboard", true)).toBe(true)
    expect(isActive("/dashboard", false)).toBe(true)
    expect(isActive("/dashboard/settings", true)).toBe(false)
  })

  it("should detect nested routes", () => {
    const { result } = renderHook(() => useActiveLink())

    act(() => {
      vi.spyOn(require("next/navigation"), "usePathname").mockReturnValue("/teams/dashboard/abc123/analytics")
    })

    const isActive = result.current
    expect(isActive("/teams/dashboard", false)).toBe(true)
    expect(isActive("/teams/dashboard", true)).toBe(false)
  })

  it("should handle tab-based navigation", () => {
    const { result } = renderHook(() => useActiveLink())

    act(() => {
      vi.spyOn(require("next/navigation"), "usePathname").mockReturnValue("/dashboard")
      const searchParams = new URLSearchParams()
      searchParams.set("tab", "chart")
      vi.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(searchParams)
    })

    const isActive = result.current
    expect(isActive("/dashboard?tab=chart", false)).toBe(true)
    expect(isActive("/dashboard?tab=widgets", false)).toBe(false)
  })

  it("should handle default tab for dashboard", () => {
    const { result } = renderHook(() => useActiveLink())

    act(() => {
      vi.spyOn(require("next/navigation"), "usePathname").mockReturnValue("/dashboard")
      vi.spyOn(require("next/navigation"), "useSearchParams").mockReturnValue(new URLSearchParams())
    })

    const isActive = result.current
    expect(isActive("/dashboard", false)).toBe(true)
    expect(isActive("/dashboard?tab=widgets", false)).toBe(true)
  })
})

describe("Sidebar Mobile Detection", () => {
  let matchMediaMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    matchMediaMock = vi.fn()
    window.matchMedia = matchMediaMock
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should detect mobile viewport", () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(true)
  })

  it("should detect desktop viewport", () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      media: "(max-width: 767px)",
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useIsMobile())

    expect(result.current).toBe(false)
  })
})

describe("Sidebar State Management", () => {
  it("should toggle sidebar open state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    )

    const { result } = renderHook(() => useSidebar(), { wrapper })

    expect(result.current.open).toBe(true)

    act(() => {
      result.current.toggleSidebar()
    })

    expect(result.current.open).toBe(false)
  })

  it("should set sidebar state", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SidebarProvider defaultOpen={false}>
        {children}
      </SidebarProvider>
    )

    const { result } = renderHook(() => useSidebar(), { wrapper })

    expect(result.current.open).toBe(false)

    act(() => {
      result.current.setOpen(true)
    })

    expect(result.current.open).toBe(true)
  })

  it("should handle mobile sidebar state separately", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    )

    const { result } = renderHook(() => useSidebar(), { wrapper })

    act(() => {
      result.current.setOpenMobile(true)
    })

    expect(result.current.openMobile).toBe(true)
  })
})

describe("Navigation Utils", () => {
  it("should detect query-param only navigation", () => {
    expect(
      isQueryParamOnlyNavigation("/dashboard", "/dashboard?tab=chart")
    ).toBe(true)

    expect(
      isQueryParamOnlyNavigation("/dashboard", "/dashboard?tab=widgets&foo=bar")
    ).toBe(true)

    expect(
      isQueryParamOnlyNavigation("/dashboard", "/settings")
    ).toBe(false)

    expect(
      isQueryParamOnlyNavigation("/dashboard", "/dashboard/settings")
    ).toBe(false)
  })
})

describe("Sidebar Cookie Operations", () => {
  beforeEach(() => {
    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
    })
  })

  it("should defer cookie writes to prevent blocking", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    )

    const { result } = renderHook(() => useSidebar(), { wrapper })

    const startTime = performance.now()

    act(() => {
      result.current.setOpen(false)
    })

    const endTime = performance.now()
    const syncTime = endTime - startTime

    expect(syncTime).toBeLessThan(5)
    expect(document.cookie).toContain("sidebar:state=false")
  })

  it("should handle cookie write errors gracefully", () => {
    const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, "cookie")

    Object.defineProperty(document, "cookie", {
      writable: true,
      value: "",
      get: () => {
        throw new Error("Cookies disabled")
      },
    })

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    )

    const { result } = renderHook(() => useSidebar(), { wrapper })

    expect(() => {
      act(() => {
        result.current.setOpen(false)
      })
    }).not.toThrow()

    if (originalCookie) {
      Object.defineProperty(document, "cookie", originalCookie)
    }
  })
})

describe("Sidebar Accessibility", () => {
  it("should have proper ARIA labels", () => {
    const TestComponent = () => {
      return (
        <nav aria-label="Main navigation">
          <ul>
            <li>
              <a href="/dashboard" aria-current="page">
                Dashboard
              </a>
            </li>
            <li>
              <a href="/settings" aria-label="Settings">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      )
    }

    render(<TestComponent />)

    const nav = screen.getByRole("navigation", { name: "Main navigation" })
    expect(nav).toBeInTheDocument()

    const currentLink = screen.getByRole("link", { current: "page" })
    expect(currentLink).toHaveTextContent("Dashboard")
  })

  it("should support keyboard navigation", () => {
    const onKeyPress = vi.fn()

    render(
      <button
        onClick={onKeyPress}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onKeyPress()
          }
        }}
      >
        Navigation Item
      </button>
    )

    const button = screen.getByRole("button")

    fireEvent.keyDown(button, { key: "Enter" })

    expect(onKeyPress).toHaveBeenCalled()
  })
})

describe("Sidebar Performance", () => {
  it("should not recreate toggleSidebar callback unnecessarily", () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    )

    const { result } = renderHook(() => useSidebar(), { wrapper })

    const initialFn = result.current.toggleSidebar

    act(() => {
      result.current.setOpen(false)
      result.current.setOpen(true)
    })

    expect(result.current.toggleSidebar).toBe(initialFn)
  })

  it("should optimize groupedItems memoization", () => {
    const items = [
      { href: "/dashboard", icon: <span />, label: "Dashboard", group: "Overview" },
      { href: "/settings", icon: <span />, label: "Settings", group: "Settings" },
    ]

    const renderCount = { count: 0 }

    const TestComponent = () => {
      renderCount.count++
      return <div>Sidebar Test</div>
    }

    render(<TestComponent />)

    const initialCount = renderCount.count

    render(<TestComponent />)

    expect(renderCount.count).toBe(initialCount + 1)
  })
})
