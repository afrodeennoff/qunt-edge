"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

let loadingState = {
  isLoading: false,
  currentPath: "",
}

export function useNavigationLoading() {
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== lastPath) {
      setIsLoading(false)
      setLastPath(pathname)
    }
  }, [pathname, lastPath])

  const startLoading = () => setIsLoading(true)

  return {
    isLoading,
    startLoading,
  }
}

export function useNavigationListener() {
  useEffect(() => {
    const handleStart = () => {
      loadingState.isLoading = true
    }

    const handleComplete = () => {
      loadingState.isLoading = false
    }

    window.addEventListener("beforeunload", handleStart)
    window.addEventListener("load", handleComplete)

    return () => {
      window.removeEventListener("beforeunload", handleStart)
      window.removeEventListener("load", handleComplete)
    }
  }, [])

  return loadingState
}
