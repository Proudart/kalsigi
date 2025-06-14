'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { getOptimizedImageProps, supportsWebP, supportsAVIF } from '@/lib/image-optimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className,
  sizes,
  quality = 85,
  placeholder = 'blur',
  blurDataURL,
  onLoad,
  onError,
  fallbackSrc,
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [imageFormat, setImageFormat] = useState<'avif' | 'webp' | 'original'>('original');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Detect supported formats and prefer the most efficient one
    const detectFormats = async () => {
      if (await supportsAVIF()) {
        setImageFormat('avif');
      } else if (await supportsWebP()) {
        setImageFormat('webp');
      }
    };

    detectFormats();
  }, []);

  useEffect(() => {
    // Update src based on supported format
    if (imageFormat !== 'original' && src.includes('http')) {
      const url = new URL(src);
      url.searchParams.set('format', imageFormat);
      if (quality !== 85) {
        url.searchParams.set('quality', quality.toString());
      }
      setCurrentSrc(url.toString());
    } else {
      setCurrentSrc(src);
    }
  }, [src, imageFormat, quality]);

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  const defaultBlurDataURL = blurDataURL || 
    'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

  const optimizedProps = getOptimizedImageProps(
    currentSrc,
    alt,
    priority,
    sizes
  );

  return (
    <Image
      {...optimizedProps}
      width={width}
      height={height}
      quality={quality}
      className={className}
      placeholder={placeholder}
      blurDataURL={defaultBlurDataURL}
      onLoad={onLoad}
      onError={handleError}
      style={{
        objectFit: 'cover',
        objectPosition: 'center',
      }}
    />
  );
}