// Image optimization utilities
export const imageFormats = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png'
} as const;

export const imageSizes = {
  thumbnail: 150,
  small: 300,
  medium: 600,
  large: 1200,
  xlarge: 1920
} as const;

// Generate responsive image sources
export function generateImageSrcSet(baseUrl: string, sizes: number[] = [300, 600, 1200]) {
  return sizes.map(size => `${baseUrl}?w=${size} ${size}w`).join(', ');
}

// Generate optimized image props for Next.js Image component
export function getOptimizedImageProps(
  src: string,
  alt: string,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
) {
  return {
    src,
    alt,
    priority,
    sizes,
    quality: 85,
    format: 'webp' as const,
    placeholder: 'blur' as const,
    blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
  };
}

// Image preloading for critical images
export function preloadImage(src: string, priority = false) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = priority ? 'preload' : 'prefetch';
  link.as = 'image';
  link.href = src;
  link.type = 'image/webp';
  document.head.appendChild(link);
}

// Intersection Observer for lazy loading
export function createImageObserver(callback: (entries: IntersectionObserverEntry[]) => void) {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
}

// Progressive image loading
export class ProgressiveImage {
  private img: HTMLImageElement;
  private loaded = false;
  
  constructor(
    private lowQualitySrc: string,
    private highQualitySrc: string,
    private onLoad?: () => void
  ) {
    this.img = new Image();
  }
  
  load() {
    if (this.loaded) return Promise.resolve();
    
    return new Promise<void>((resolve, reject) => {
      // Load low quality first
      const lowQualityImg = new Image();
      lowQualityImg.onload = () => {
        // Start loading high quality
        this.img.onload = () => {
          this.loaded = true;
          this.onLoad?.();
          resolve();
        };
        this.img.onerror = reject;
        this.img.src = this.highQualitySrc;
      };
      lowQualityImg.onerror = reject;
      lowQualityImg.src = this.lowQualitySrc;
    });
  }
  
  getElement() {
    return this.img;
  }
}

// Image format detection
export function supportsWebP(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  return new Promise(resolve => {
    const webP = new Image();
    webP.onload = webP.onerror = () => resolve(webP.height === 2);
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

export function supportsAVIF(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  
  return new Promise(resolve => {
    const avif = new Image();
    avif.onload = avif.onerror = () => resolve(avif.height === 2);
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}