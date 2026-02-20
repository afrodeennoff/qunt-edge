/**
 * Advanced Image Optimization System
 * 
 * Provides responsive image strategies, blur placeholders, 
 * lazy loading, and error handling for Next.js Image component.
 */

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * Responsive image sizes for different breakpoints
 */
export const imageSizes = {
  avatar: [32, 64, 128, 256, 512],
  card: [300, 600, 900, 1200, 1800],
  hero: [640, 1024, 1440, 1920, 2560],
  thumbnail: [100, 200, 400, 800],
  banner: [800, 1200, 1600, 2400, 3200],
} as const

export type ImageSizeCategory = keyof typeof imageSizes

/**
 * Generate responsive srcset for Next.js Image
 */
export function generateSrcSet(
  baseUrl: string,
  sizes: number[],
  quality = 80
): string {
  return sizes
    .map(size => `${baseUrl}?w=${size}&q=${quality} ${size}w`)
    .join(', ')
}

/**
 * Generate sizes attribute for responsive images
 */
export function generateSizes(breakpoints: Record<string, string>): string {
  return Object.entries(breakpoints)
    .map(([breakpoint, size]) => `(min-width: ${breakpoint}) ${size}`)
    .join(', ')
}

/**
 * Image blur placeholder generator
 */
export function generateBlurDataURL(
  width: number,
  height: number,
  color = '#e5e7eb'
): string {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  
  if (ctx) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
    
    // Add some noise for better visual
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = Math.random() * 20 - 10
      data[i] = Math.max(0, Math.min(255, data[i] + noise))
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise))
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)
  }
  
  return canvas.toDataURL('image/jpeg', 0.1)
}

/**
 * Optimized Image component with blur placeholder and lazy loading
 */
export interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  sizes?: string
  className?: string
  priority?: boolean
  fill?: boolean
  category?: ImageSizeCategory
  blurDataURL?: string
  placeholder?: 'blur' | 'empty'
  quality?: number
  loading?: 'lazy' | 'eager'
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  priority = false,
  fill = false,
  category,
  blurDataURL,
  placeholder = 'blur',
  quality = 75,
  loading = 'lazy',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Generate blur placeholder if not provided
  const finalBlurDataURL = blurDataURL || (width && height ? generateBlurDataURL(width, height) : undefined)

  // Handle loading state
  const handleLoad = () => {
    setIsLoading(false)
  }

  // Handle error state
  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    console.error(`Failed to load image: ${src}`)
  }

  // Error fallback component
  if (hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
        style={{ width, height }}
      >
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', isLoading && 'animate-pulse bg-muted', className)}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        sizes={sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        quality={quality}
        priority={priority}
        loading={loading}
        placeholder={placeholder === 'blur' ? 'blur' : undefined}
        blurDataURL={finalBlurDataURL}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}

/**
 * Progressive image loading component
 */
export interface ProgressiveImageProps {
  lowQualitySrc: string
  highQualitySrc: string
  alt: string
  width: number
  height: number
  className?: string
}

export function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  width,
  height,
  className,
}: ProgressiveImageProps) {
  const [src, setSrc] = useState(lowQualitySrc)
  const [isLoading, setIsLoading] = useState(true)

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={src === lowQualitySrc ? 30 : 75}
        placeholder="blur"
        blurDataURL={generateBlurDataURL(10, 10)}
        className={cn(
          'transition-all duration-500 ease-in-out',
          src === lowQualitySrc ? 'scale-105 blur-sm' : 'scale-100 blur-0'
        )}
        onLoad={() => {
          if (src === lowQualitySrc) {
            // Preload high quality image
            const img = new Image()
            img.src = highQualitySrc
            img.onload = () => {
              setSrc(highQualitySrc)
              setIsLoading(false)
            }
          } else {
            setIsLoading(false)
          }
        }}
      />
      {isLoading && <div className="absolute inset-0 animate-pulse bg-muted/20" />}
    </div>
  )
}

/**
 * Image preloading utility
 */
export class ImagePreloader {
  private preloadCache = new Map<string, HTMLImageElement>()

  /**
   * Preload an image
   */
  preload(src: string, priority = false): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if already preloaded
      if (this.preloadCache.has(src)) {
        resolve()
        return
      }

      const img = new Image()
      
      img.onload = () => {
        this.preloadCache.set(src, img)
        resolve()
      }

      img.onerror = () => {
        reject(new Error(`Failed to preload image: ${src}`))
      }

      // Set priority hint
      if (priority) {
        img.fetchPriority = 'high'
      }

      img.src = src
    })
  }

  /**
   * Preload multiple images
   */
  async preloadMany(sources: string[], priority = false): Promise<void> {
    const promises = sources.map(src => this.preload(src, priority))
    await Promise.allSettled(promises)
  }

  /**
   * Check if image is preloaded
   */
  isPreloaded(src: string): boolean {
    return this.preloadCache.has(src)
  }

  /**
   * Clear preload cache (for memory management)
   */
  clear(): void {
    this.preloadCache.clear()
  }
}

export const imagePreloader = new ImagePreloader()

/**
 * Responsive image container with art direction
 */
export interface ResponsiveImageProps {
  src: string
  alt: string
  mobileSrc?: string
  tabletSrc?: string
  desktopSrc?: string
  className?: string
  priority?: boolean
}

export function ResponsiveImage({
  src,
  alt,
  mobileSrc,
  tabletSrc,
  desktopSrc,
  className,
  priority = false,
}: ResponsiveImageProps) {
  return (
    <picture className={className}>
      {mobileSrc && (
        <source
          media="(max-width: 640px)"
          srcSet={mobileSrc}
        />
      )}
      {tabletSrc && (
        <source
          media="(max-width: 1024px)"
          srcSet={tabletSrc}
        />
      )}
      {desktopSrc && (
        <source
          media="(min-width: 1025px)"
          srcSet={desktopSrc}
        />
      )}
      <OptimizedImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
      />
    </picture>
  )
}

/**
 * Image optimization utilities
 */
export const imageOptimizationUtils = {
  /**
   * Calculate optimal image size based on device pixel ratio
   */
  getOptimalSize(baseSize: number, dpr = window.devicePixelRatio || 1): number {
    return Math.ceil(baseSize * dpr)
  },

  /**
   * Generate WebP source with fallback
   */
  generateWebPSource(originalSrc: string): string {
    return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  },

  /**
   * Check if browser supports WebP
   */
  supportsWebP(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return Promise.resolve(false)
    }

    return new Promise((resolve) => {
      const webP = new Image()
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2)
      }
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA'
    })
  },

  /**
   * Convert SVG to data URL for embedding
   */
  svgToDataURL(svg: string): string {
    const base64 = btoa(svg)
    return `data:image/svg+xml;base64,${base64}`
  },

  /**
   * Extract dominant color from image (for placeholder)
   */
  async extractDominantColor(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        canvas.width = 1
        canvas.height = 1
        ctx.drawImage(img, 0, 0, 1, 1)
        
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
        resolve(`rgb(${r}, ${g}, ${b})`)
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = src
    })
  },
}

/**
 * Critical images ESG (Above the fold images)
 * Preload these for immediate display
 */
export const criticalImages = [
  '/images/hero-bg.jpg',
  '/images/logo.png',
  '/images/avatar-placeholder.png',
]

/**
 * Preload critical images
 */
export function preloadCriticalImages(): void {
  if (typeof window === 'undefined') return

  criticalImages.forEach(src => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = src
    document.head.appendChild(link)
  })
}

/**
 * Image size constants for common use cases
 */
export const IMAGE_SIZES = {
  avatar: {
    xs: 32,
    sm: 48,
    md: 64,
    lg: 96,
    xl: 128,
  },
  card: {
    xs: 300,
    sm: 400,
    md: 600,
    lg: 800,
    xl: 1200,
  },
  thumbnail: {
    xs: 100,
    sm: 150,
    md: 200,
    lg: 300,
    xl: 400,
  },
  full: {
    xs: 640,
    sm: 1024,
    md: 1440,
    lg: 1920,
    xl: 2560,
  },
} as const
