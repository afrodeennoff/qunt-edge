import { ImageProps } from 'next/image';

export interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'loader'> {
  src: string;
  quality?: number;
  priority?: boolean;
}

export const imageSizes = {
  avatar: [32, 64, 128, 256] as const,
  card: [300, 600, 900, 1200] as const,
  hero: [640, 1024, 1440, 1920] as const,
  thumbnail: [150, 300, 450] as const,
  banner: [800, 1200, 1600, 2400] as const,
} as const;

export const getImageConfig = (type: keyof typeof imageSizes) => {
  const sizes = imageSizes[type];
  return {
    sizes: sizes.map((size) => `${size}px`).join(', '),
    srcSet: sizes.map((size) => `${size}w`).join(', '),
  };
};

export const getResponsiveProps = (
  type: keyof typeof imageSizes,
  customQuality?: number
): Partial<OptimizedImageProps> => {
  const config = getImageConfig(type);
  return {
    sizes: config.sizes,
    quality: customQuality ?? 75,
    placeholder: 'blur' as const,
    loading: 'lazy' as const,
  };
};

export const optimizeImageUrl = (
  url: string,
  width: number,
  quality: number = 75
): string => {
  if (url.startsWith('/')) return url;
  
  const urlObj = new URL(url);
  urlObj.searchParams.set('w', width.toString());
  urlObj.searchParams.set('q', quality.toString());
  return urlObj.toString();
};

export const getCdnImageUrl = (
  path: string,
  width: number,
  quality: number = 75
): string => {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL;
  if (!cdnUrl) return path;
  
  return `${cdnUrl}${path}?w=${width}&q=${quality}`;
};
