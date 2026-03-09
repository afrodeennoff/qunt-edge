'use client'

import { type RefObject, useEffect } from 'react'

export const gpuAcceleratedStyles = {
  transform: 'will-change-transform translate-z-0 backface-hidden perspective-1000',

  smoothTransition: (properties: string = 'all', duration: number = 300) =>
    `transition-[${properties}] duration-[${duration}ms] ease-in-out`,

  fadeAnimation: 'animate-in fade-in slide-in-from-bottom-2 duration-300',

  scaleAnimation: 'animate-in zoom-in-95 duration-200',

  slideAnimation: (direction: 'left' | 'right' | 'up' | 'down' = 'right') => {
    const transforms = {
      left: 'slide-in-from-left-5',
      right: 'slide-in-from-right-5',
      up: 'slide-in-from-top-5',
      down: 'slide-in-from-bottom-5'
    }
    return `animate-in ${transforms[direction]} duration-300`
  }
}

export function createGPUAcceleratedStyle(
  properties: Record<string, string>
): string {
  const inlineStyles = Object.entries(properties)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')
  return `${gpuAcceleratedStyles.transform};${inlineStyles}`
}

export function useGPUAcceleratedAnimation(
  elementRef: RefObject<HTMLElement | null>,
  animation: 'fade' | 'scale' | 'slide',
  direction?: 'left' | 'right' | 'up' | 'down'
) {
  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    let animationClass: string
    switch (animation) {
      case 'fade':
        animationClass = gpuAcceleratedStyles.fadeAnimation
        break
      case 'scale':
        animationClass = gpuAcceleratedStyles.scaleAnimation
        break
      case 'slide':
        animationClass = gpuAcceleratedStyles.slideAnimation(direction || 'right')
        break
      default:
        return
    }

    element.classList.add(animationClass)

    return () => {
      element.classList.remove(animationClass)
    }
  }, [elementRef, animation, direction])
}

export const optimizedAnimationClasses = {
  fadeIn: 'animate-in fade-in duration-300',
  fadeOut: 'animate-out fade-out duration-300',
  slideInFromRight: 'animate-in slide-in-from-right duration-300',
  slideInFromLeft: 'animate-in slide-in-from-left duration-300',
  slideInFromTop: 'animate-in slide-in-from-top duration-300',
  slideInFromBottom: 'animate-in slide-in-from-bottom duration-300',
  zoomIn: 'animate-in zoom-in duration-300',
  zoomOut: 'animate-out zoom-out duration-300',
  spin: 'animate-spin',
  ping: 'animate-ping',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce'
}

export function createOptimizedTransition(
  duration: number = 300,
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' = 'ease-out'
): string {
  return `transition-all ${duration}ms ${easing}`
}

export const reduceMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function getOptimizedAnimation(
  normal: string,
  reduced: string = ''
): string {
  return reduceMotion() ? reduced : normal
}
