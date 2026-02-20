"use client"

import React, { useState, useEffect, useCallback } from 'react'

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

const SidebarContext = React.createContext<{
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
  toggleSidebar: () => void
} | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  children,
}: {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  const [openMobile, setOpenMobile] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const openRef = React.useRef(defaultOpen)

  const [open, _setOpen] = useState(defaultOpen)

  const openState = openProp ?? open
  setOpenProp ??= _setOpen

  const setOpen = useCallback((value: boolean | ((value: boolean) => boolean)) => {
    const openState = typeof value === "function" ? value(openRef.current) : value
    if (setOpenProp) {
      setOpenProp(openState)
    } else {
      _setOpen(openState)
    }
    openRef.current = openState
    updateCookie(openState)
  }, [setOpenProp])

  const updateCookie = useCallback((state: boolean) => {
    try {
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${state}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`
    } catch (e) {
      console.warn('Failed to update sidebar cookie:', e)
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    const isOpen = isMobile ? !openMobile : !openState
    if (isMobile) {
      setOpenMobile(isOpen)
    } else {
      setOpen(isOpen)
    }
  }, [isMobile, openMobile, openState, setOpen, setOpenMobile])

  useEffect(() => {
    const mobileBreakpointMatches = () => window.innerWidth < 768
    setIsMobile(mobileBreakpointMatches())

    let lastMatch = mobileBreakpointMatches()

    const handleResize = () => {
      const currentMatch = mobileBreakpointMatches()
      if (currentMatch !== lastMatch) {
        lastMatch = currentMatch
        setIsMobile(currentMatch)
        if (!currentMatch) {
          setOpenMobile(false)
        }
      }
    }

    const resizeHandler = () => {
      requestAnimationFrame(handleResize)
    }

    window.addEventListener("resize", resizeHandler, { passive: true })
    return () => window.removeEventListener("resize", resizeHandler)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = {
    open: openState,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
  }

  return (
    <SidebarContext.Provider value={state}>
      {children}
    </SidebarContext.Provider>
  )
}

export { useSidebar, SidebarProvider, SIDEBAR_KEYBOARD_SHORTCUT }
