export const IMMUTABLE_CACHE_CONTROL_SECONDS = 31_536_000
export const IMMUTABLE_CACHE_CONTROL = `${IMMUTABLE_CACHE_CONTROL_SECONDS}`

type PublicTransformOptions = {
  width?: number
  height?: number
  quality?: number
}

/**
 * Adds Supabase Storage transformation parameters to public object URLs.
 * Returns the original URL for non-Supabase URLs.
 */
export function withSupabaseImageTransform(
  url: string,
  options: PublicTransformOptions
): string {
  if (!url.includes('/storage/v1/object/public/')) {
    return url
  }

  let transformedUrl: URL
  try {
    transformedUrl = new URL(url)
  } catch {
    return url
  }

  if (options.width) {
    transformedUrl.searchParams.set('width', `${options.width}`)
  }
  if (options.height) {
    transformedUrl.searchParams.set('height', `${options.height}`)
  }
  if (options.quality) {
    transformedUrl.searchParams.set('quality', `${options.quality}`)
  }

  return transformedUrl.toString()
}
