import { useEffect, useRef } from 'react'

const SCROLL_THRESHOLD = 150
const BASE_SCROLL_SPEED = 15
const MAX_SCROLL_SPEED = 30
const SCROLL_INTERVAL = 32

interface AutoScrollState {
  isEnabled: boolean
  isDragging: boolean
  lastTouchY: number
  scrollInterval: ReturnType<typeof setInterval> | null
}

export function useAutoScroll(isEnabled: boolean) {
  const stateRef = useRef<AutoScrollState>({
    isEnabled: false,
    isDragging: false,
    lastTouchY: 0,
    scrollInterval: null,
  })

  const styleRef = useRef<HTMLStyleElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)

  useEffect(() => {
    if (!isEnabled) {
      cleanup()
      return
    }

    stateRef.current.isEnabled = true
    setup()
    return cleanup
  }, [isEnabled])

  const cleanup = () => {
    const state = stateRef.current
    
    if (state.scrollInterval) {
      clearInterval(state.scrollInterval)
      state.scrollInterval = null
    }

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    if (styleRef.current) {
      styleRef.current.remove()
      styleRef.current = null
    }

    document.body.classList.remove('dragging')
    document.removeEventListener('touchstart', handleTouchStart, { passive: true })
    document.removeEventListener('touchmove', handleTouchMove, { passive: false } as any)
    document.removeEventListener('touchend', handleTouchEnd, { passive: true })
    document.removeEventListener('touchcancel', handleTouchEnd, { passive: true })
    
    state.isEnabled = false
    state.isDragging = false
    isScrollingRef.current = false
  }

  const setup = () => {
    if (styleRef.current) return

    const style = document.createElement('style')
    style.textContent = `
      body.dragging {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        touch-action: none !important;
        -webkit-touch-callout: none !important;
      }
      body.dragging * {
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        -webkit-touch-callout: none !important;
      }
    `
    document.head.appendChild(style)
    styleRef.current = style

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false } as any)
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true })
  }

  const performScroll = () => {
    const state = stateRef.current
    if (!state.isEnabled || !state.isDragging) return

    const windowHeight = window.innerHeight
    const scrollY = window.scrollY
    const maxScroll = document.documentElement.scrollHeight - windowHeight
    const lastTouchY = state.lastTouchY

    let shouldScroll = false
    let newScrollY = scrollY

    if (lastTouchY < SCROLL_THRESHOLD) {
      const factor = 1 - lastTouchY / SCROLL_THRESHOLD
      const speed = Math.min(MAX_SCROLL_SPEED, BASE_SCROLL_SPEED + MAX_SCROLL_SPEED * factor)
      newScrollY = Math.max(0, scrollY - speed)
      shouldScroll = true
    } else if (lastTouchY > windowHeight - SCROLL_THRESHOLD) {
      const factor = (lastTouchY - (windowHeight - SCROLL_THRESHOLD)) / SCROLL_THRESHOLD
      const speed = Math.min(MAX_SCROLL_SPEED, BASE_SCROLL_SPEED + MAX_SCROLL_SPEED * factor)
      newScrollY = Math.min(maxScroll, scrollY + speed)
      shouldScroll = true
    }

    if (shouldScroll && newScrollY !== scrollY) {
      window.scrollTo({ top: newScrollY, behavior: 'instant' as any })
    }

    if (shouldScroll) {
      rafRef.current = requestAnimationFrame(performScroll)
    } else {
      isScrollingRef.current = false
    }
  }

  const startScrolling = () => {
    if (!isScrollingRef.current) {
      isScrollingRef.current = true
      rafRef.current = requestAnimationFrame(performScroll)
    }
  }

  const stopScrolling = () => {
    isScrollingRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    if (!stateRef.current.isEnabled) return
    stateRef.current.isDragging = true
    document.body.classList.add('dragging')
  }

  const handleTouchMove = (e: TouchEvent) => {
    const state = stateRef.current
    if (!state.isEnabled || !state.isDragging) return

    const touch = e.touches[0]
    const touchY = touch.clientY
    state.lastTouchY = touchY
    const windowHeight = window.innerHeight

    const isNearEdge = touchY < SCROLL_THRESHOLD || touchY > windowHeight - SCROLL_THRESHOLD

    if (isNearEdge && !isScrollingRef.current) {
      startScrolling()
    } else if (!isNearEdge && isScrollingRef.current) {
      stopScrolling()
    }
  }

  const handleTouchEnd = () => {
    const state = stateRef.current
    state.isDragging = false
    document.body.classList.remove('dragging')
    stopScrolling()
  }
}
