"use client"

import { useEffect } from "react"

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)"

type SmoothScrollProviderProps = {
  children: React.ReactNode
}

function scrollToHash(hash: string) {
  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash
  if (!normalizedHash) {
    return
  }

  const idTarget = document.getElementById(normalizedHash)
  const namedTarget = document.querySelector(`[name="${CSS.escape(normalizedHash)}"]`)
  const target = idTarget ?? namedTarget

  if (!target) {
    return
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    const reduceMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
    const html = document.documentElement
    const body = document.body
    const previousHtmlBehavior = html.style.scrollBehavior
    const previousBodyBehavior = body.style.scrollBehavior

    if (!reduceMotion) {
      html.style.scrollBehavior = "smooth"
      body.style.scrollBehavior = "smooth"
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (reduceMotion || event.defaultPrevented) {
        return
      }

      const target = event.target
      if (!(target instanceof Element)) {
        return
      }

      const anchor = target.closest<HTMLAnchorElement>('a[href*="#"]')
      if (!anchor) {
        return
      }

      const href = anchor.getAttribute("href")
      if (!href || href === "#") {
        return
      }

      const url = new URL(href, window.location.href)
      const isSamePage =
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        Boolean(url.hash)

      if (!isSamePage) {
        return
      }

      event.preventDefault()
      window.history.pushState({}, "", url.hash)
      scrollToHash(url.hash)
    }

    const handleHashChange = () => {
      if (reduceMotion || !window.location.hash) {
        return
      }

      scrollToHash(window.location.hash)
    }

    document.addEventListener("click", handleDocumentClick, { capture: true })
    window.addEventListener("hashchange", handleHashChange)

    if (!reduceMotion && window.location.hash) {
      requestAnimationFrame(() => scrollToHash(window.location.hash))
    }

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true })
      window.removeEventListener("hashchange", handleHashChange)
      html.style.scrollBehavior = previousHtmlBehavior
      body.style.scrollBehavior = previousBodyBehavior
    }
  }, [])

  return <>{children}</>
}

