// Performance monitoring and optimization utilities

// Web Vitals measurement
export function measureWebVitals(metric: any) {
  if (typeof window === 'undefined') return;
  
  console.log(metric);
  
  // Send to analytics service
  if (process.env.NODE_ENV === 'production') {
    // Replace with your analytics service
    gtag?.('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

// Resource preloading
export function preloadResource(href: string, as: string, crossOrigin?: string) {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossOrigin) link.crossOrigin = crossOrigin;
  document.head.appendChild(link);
}

// Critical CSS inlining
export function inlineCriticalCSS(css: string) {
  if (typeof window === 'undefined') return;
  
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
}

// Font preloading
export function preloadFonts(fonts: { href: string; as?: string }[]) {
  if (typeof window === 'undefined') return;
  
  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font.href;
    link.as = font.as || 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// Script loading optimization
export function loadScriptAsync(src: string, onLoad?: () => void, onError?: () => void) {
  if (typeof window === 'undefined') return;
  
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  if (onLoad) script.onload = onLoad;
  if (onError) script.onerror = onError;
  document.head.appendChild(script);
}

// Memory usage monitoring
export function monitorMemoryUsage() {
  if (typeof window === 'undefined' || !('memory' in performance)) return;
  
  const memory = (performance as any).memory;
  return {
    usedJSHeapSize: memory.usedJSHeapSize,
    totalJSHeapSize: memory.totalJSHeapSize,
    jsHeapSizeLimit: memory.jsHeapSizeLimit,
    usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
  };
}

// Bundle size tracking
export function trackBundleSize() {
  if (typeof window === 'undefined') return;
  
  const scripts = document.querySelectorAll('script[src]');
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  
  let totalSize = 0;
  const resources: { url: string; size: number; type: string }[] = [];
  
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name.includes('/_next/static/')) {
        const resource = {
          url: entry.name,
          size: (entry as any).transferSize || 0,
          type: entry.name.includes('.js') ? 'script' : 'stylesheet'
        };
        resources.push(resource);
        totalSize += resource.size;
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.table(resources);
      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }
  });
  
  observer.observe({ entryTypes: ['resource'] });
}

// Component render time tracking
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceTrackedComponent(props: P) {
    React.useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`${componentName} render time: ${renderTime.toFixed(2)}ms`);
        }
        
        // Track slow components
        if (renderTime > 16) { // 16ms = 60fps threshold
          console.warn(`Slow component detected: ${componentName} took ${renderTime.toFixed(2)}ms`);
        }
      };
    });
    
    return React.createElement(Component, props);
  };
}

// Intersection Observer for performance
export function createPerformanceObserver(callback: (entries: PerformanceEntry[]) => void) {
  if (typeof window === 'undefined') return null;
  
  return new PerformanceObserver((list, observer) => {
    callback(list.getEntries());
  });
}

// Network connection monitoring
export function getNetworkInfo() {
  if (typeof window === 'undefined' || !('connection' in navigator)) return null;
  
  const connection = (navigator as any).connection;
  return {
    effectiveType: connection.effectiveType,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
}

// Adaptive loading based on network conditions
export function shouldLoadHeavyResources() {
  const networkInfo = getNetworkInfo();
  if (!networkInfo) return true; // Default to loading if info unavailable
  
  // Don't load heavy resources on slow connections or data saver mode
  return !networkInfo.saveData && 
         networkInfo.effectiveType !== 'slow-2g' && 
         networkInfo.effectiveType !== '2g';
}

import React from 'react';

function gtag(arg0: string, name: any, arg2: { event_category: string; value: number; event_label: any; non_interaction: boolean; }) {
  throw new Error('Function not implemented.');
}
