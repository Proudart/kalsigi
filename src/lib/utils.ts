import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return `https://www.${process.env.site_name}.com`;
}

export function getAuthUrls() {
  const siteName = process.env.site_name;
  return {
    baseURL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : `https://www.manhwacall.com`,
    trustedOrigins: [
      'http://localhost:3000',
      `https://www.manhwacall.com`,
      `https://manhwacall.com`
    ]
  };
}

