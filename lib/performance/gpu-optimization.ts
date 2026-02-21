'use client'

import { css } from '@emotion/css'

export const gpuAcceleratedStyles = {
  transform: css`
    will-change: transform;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  `,

  smoothTransition: (properties: string = 'all', duration: number = 300) => css`
    transition: ${properties} ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
    will-change: ${properties};
  `,

  fadeAnimation: css`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    animation: fadeIn 300ms ease-out forwards;
  `,

  scaleAnimation: css`
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    animation: scaleIn 200ms ease-out forwards;
  `,

  slideAnimation: (direction: 'left' | 'right' | 'up' | 'down' = 'right') => {
    const transforms = {
      left: 'translateX(-20px)',
      right: 'translateX(20px)',
      up: 'translateY(-20px)',
      down: 'translateY(20px)'
    }
    return css`
      @keyframes slideIn {
        from { opacity: 0; transform: ${transforms[direction]}; }
        to { opacity: 1; transform: translate(0, 0); }
      }
      animation: slideIn 300ms ease-out forwards;
    `
  }
}

export function createGPUAcceleratedStyle(
  properties: Record<string, string>
): string {
  return css`
    ${gpuAcceleratedStyles.transform}
    ${Object.entries(properties)
      .map(([key, value]) => `${key}: ${value}`)
      .join(';')}
  `
}

export function useGPUAcceleratedAnimation(
  elementRef: React.RefObject<HTMLElement>,
  animation: 'fade' | 'scale' | 'slide',
  direction?: 'left' | 'right' | 'up' | 'down'
) {
  React.useEffect(() => {
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
