import { usePathname } from "next/navigation"

export function isQueryParamOnlyNavigation(currentPath: string, targetHref: string): boolean {
  try {
    const currentUrl = new URL(currentPath, "http://dummy")
    const targetUrl = new URL(targetHref, "http://dummy")
    
    // Check if only query parameters differ
    const pathnamesEqual = currentUrl.pathname === targetUrl.pathname
    const hasQueryParams = targetUrl.searchParams.size > 0
    
    return pathnamesEqual && hasQueryParams
  } catch {
    return false
  }
}

export function useNavigationHelper() {
  const pathname = usePathname()
  
  return {
    isQueryParamOnly: (href: string) => isQueryParamOnlyNavigation(pathname, href),
  }
}
