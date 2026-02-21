import { useEffect, useRef } from 'react'

const SCROLL_THRESHOLD = 150
const BASE_SCROLL_SPEED = 15
const MAX_SCROLL_SPEED = 30

interface AutoScrollState {
  isEnabled: boolean
  isDragging: boolean
  lastTouchY: number
}

export function useAutoScroll(isEnabled: boolean) {
  const stateRef = useRef<AutoScrollState>({
    isEnabled: false,
    isDragging: false,
    lastTouchY: 0,
  })

  const styleRef = useRef<HTMLStyleElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const isScrollingRef = useRef(false)

  useEffect(() => {
    const isGridDragTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return false
      return Boolean(target.closest(".react-grid-item, .react-draggable, [data-grid]"))
    }

    const stopScrolling = () => {
      isScrollingRef.current = false
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const performScroll = () => {
      const state = stateRef.current
      if (!state.isEnabled || !state.isDragging) {
        isScrollingRef.current = false
        return
      }

      const windowHeight = window.innerHeight
      const currentScrollY = window.scrollY
      const maxScrollY = document.documentElement.scrollHeight - windowHeight
      const touchY = state.lastTouchY

      let shouldScroll = false
      let nextScrollY = currentScrollY

      if (touchY < SCROLL_THRESHOLD) {
        const factor = 1 - touchY / SCROLL_THRESHOLD
        const speed = Math.min(MAX_SCROLL_SPEED, BASE_SCROLL_SPEED + MAX_SCROLL_SPEED * factor)
        nextScrollY = Math.max(0, currentScrollY - speed)
        shouldScroll = true
      } else if (touchY > windowHeight - SCROLL_THRESHOLD) {
        const factor = (touchY - (windowHeight - SCROLL_THRESHOLD)) / SCROLL_THRESHOLD
        const speed = Math.min(MAX_SCROLL_SPEED, BASE_SCROLL_SPEED + MAX_SCROLL_SPEED * factor)
        nextScrollY = Math.min(maxScrollY, currentScrollY + speed)
        shouldScroll = true
      }

      if (shouldScroll && nextScrollY !== currentScrollY) {
        window.scrollTo({ top: nextScrollY, behavior: 'auto' })
      }

      if (shouldScroll) {
        rafRef.current = requestAnimationFrame(performScroll)
      } else {
        isScrollingRef.current = false
      }
    }

    const startScrolling = () => {
      if (isScrollingRef.current) return
      isScrollingRef.current = true
      rafRef.current = requestAnimationFrame(performScroll)
    }

    const handleTouchStart = (event: TouchEvent) => {
      if (!isGridDragTarget(event.target)) return
      const state = stateRef.current
      if (!state.isEnabled) return
      state.isDragging = true
      document.body.classList.add('dragging')
    }

    const handleTouchMove = (event: TouchEvent) => {
      const state = stateRef.current
      if (!state.isEnabled || !state.isDragging) return

      const touch = event.touches[0]
      if (!touch) return

      state.lastTouchY = touch.clientY
      const windowHeight = window.innerHeight
      const isNearEdge =
        touch.clientY < SCROLL_THRESHOLD ||
        touch.clientY > windowHeight - SCROLL_THRESHOLD

      if (isNearEdge) {
        startScrolling()
      } else {
        stopScrolling()
      }
    }

    const handleTouchEnd = () => {
      const state = stateRef.current
      state.isDragging = false
      document.body.classList.remove('dragging')
      stopScrolling()
    }

    const cleanup = () => {
      stopScrolling()
      if (styleRef.current) {
        styleRef.current.remove()
        styleRef.current = null
      }

      document.body.classList.remove('dragging')
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
      document.removeEventListener('touchcancel', handleTouchEnd)

      stateRef.current.isEnabled = false
      stateRef.current.isDragging = false
    }

    if (!isEnabled) {
      cleanup()
      return
    }

    stateRef.current.isEnabled = true

    if (!styleRef.current) {
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
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
    document.addEventListener('touchcancel', handleTouchEnd, { passive: true })

    return cleanup
  }, [isEnabled])
}
