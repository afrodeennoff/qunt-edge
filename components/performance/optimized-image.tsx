'use client';

import { ImageProps } from 'next/image';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImageProps, 'onLoad' | 'onError'> {
  fallback?: string;
  onLoadCallback?: () => void;
  onErrorCallback?: () => void;
  showPlaceholder?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  fallback = '/images/placeholder.png',
  onLoadCallback,
  onErrorCallback,
  showPlaceholder = true,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoadCallback?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    setImgSrc(fallback);
    onErrorCallback?.();
  };

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {isLoading && showPlaceholder && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
          Image unavailable
        </div>
      )}
      
      <Image
        {...props}
        src={imgSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300',
          isLoading ? 'opacity-0' : 'opacity-100',
          className
        )}
      />
    </div>
  );
}

export default OptimizedImage;
