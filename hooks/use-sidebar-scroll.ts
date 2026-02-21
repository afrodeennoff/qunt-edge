"use client"

import { useRef, useState, useEffect } from "react"

export function useSidebarScroll(isOpen: boolean, isMobile: boolean) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  useEffect(() => {
    if (!isMobile && !isOpen && scrollRef.current) {
      setScrollTop(scrollRef.current.scrollTop || 0)
    }
  }, [isOpen, isMobile])

  useEffect(() => {
    if (scrollRef.current && scrollTop > 0 && isOpen) {
      scrollRef.current.scrollTop = scrollTop
    }
  }, [isOpen, scrollTop])

  return scrollRef
}
