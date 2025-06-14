// src/lib/url-utils.ts
/**
 * Utility functions for handling manga series and chapter URL validation and redirection
 */
import { getBaseUrl } from './utils';

export interface SeriesUrlInfo {
  baseUrl: string;
  urlCode: string | null;
  isValid: boolean;
}

export interface ChapterUrlInfo extends SeriesUrlInfo {
  chapterNumber: string | null;
  chapterExists: boolean;
}

/**
 * Parse a series URL parameter to extract base URL and URL code
 */
export function parseSeriesUrl(seriesParam: string): SeriesUrlInfo {
  const urlCodeRegex = /-(\d{6})$/;
  const match = seriesParam.match(urlCodeRegex);
  
  if (match) {
    return {
      baseUrl: seriesParam.replace(urlCodeRegex, ''),
      urlCode: match[1],
      isValid: true
    };
  }
  
  return {
    baseUrl: seriesParam,
    urlCode: null,
    isValid: false
  };
}

/**
 * Parse a chapter URL parameter to extract chapter number
 */
export function parseChapterUrl(chapterParam: string): string | null {
  const chapterRegex = /^chapter-(.+)$/i;
  const match = chapterParam.match(chapterRegex);
  return match ? match[1] : null;
}

/**
 * Generate the correct series URL with URL code
 */
export function generateSeriesUrl(baseUrl: string, urlCode: string): string {
  return `${baseUrl}-${urlCode || '000000'}`;
}

/**
 * Generate the correct chapter URL
 */
export function generateChapterUrl(baseUrl: string, urlCode: string, chapterNumber: string): string {
  const seriesUrl = generateSeriesUrl(baseUrl, urlCode);
  return `/series/${seriesUrl}/chapter-${chapterNumber}`;
}

/**
 * Validate if a series URL has the correct format and URL code
 */
export async function validateSeriesUrl(seriesParam: string): Promise<{
  isValid: boolean;
  correctUrl?: string;
  seriesData?: any;
}> {
  const parsed = parseSeriesUrl(seriesParam);
  
  try {
    // Fetch series data using the base URL
    const response = await fetch(`${getBaseUrl()}/api/title?url=${parsed.baseUrl}`);
    
    if (!response.ok) {
      return { isValid: false };
    }
    
    const seriesData = await response.json();
    const expectedUrlCode = seriesData.url_code || '000000';
    
    if (!parsed.urlCode) {
      // No URL code provided, need to redirect
      return {
        isValid: false,
        correctUrl: generateSeriesUrl(parsed.baseUrl, expectedUrlCode),
        seriesData
      };
    }
    
    if (parsed.urlCode !== expectedUrlCode) {
      // Wrong URL code, need to redirect
      return {
        isValid: false,
        correctUrl: generateSeriesUrl(parsed.baseUrl, expectedUrlCode),
        seriesData
      };
    }
    
    // URL is valid
    return {
      isValid: true,
      seriesData
    };
    
  } catch (error) {
    console.error('Error validating series URL:', error);
    return { isValid: false };
  }
}

/**
 * Validate if a chapter URL has the correct format and exists
 */
export async function validateChapterUrl(seriesParam: string, chapterParam: string): Promise<{
  isValid: boolean;
  correctSeriesUrl?: string;
  correctChapterUrl?: string;
  seriesData?: any;
  chapterExists?: boolean;
}> {
  const seriesValidation = await validateSeriesUrl(seriesParam);
  
  if (!seriesValidation.isValid && !seriesValidation.seriesData) {
    return { isValid: false };
  }
  
  const seriesData = seriesValidation.seriesData;
  const chapterNumber = parseChapterUrl(chapterParam);
  
  if (!chapterNumber) {
    return { isValid: false };
  }
  
  // Check if chapter exists by fetching chapter data
  try {
    const parsed = parseSeriesUrl(seriesParam);
    const response = await fetch(`${getBaseUrl()}/api/chapter?series=${parsed.baseUrl}`);
    
    if (!response.ok) {
      return { isValid: false };
    }
    
    const chapterData = await response.json();
    const chapterExists = chapterData.chapters?.some((ch: any) => 
      ch.chapter_number.toString() === chapterNumber
    );
    
    if (!chapterExists) {
      // Chapter doesn't exist, should redirect to series page
      const correctSeriesUrl = seriesValidation.correctUrl || generateSeriesUrl(parsed.baseUrl, seriesData.url_code || '000000');
      return {
        isValid: false,
        correctSeriesUrl,
        chapterExists: false,
        seriesData
      };
    }
    
    if (!seriesValidation.isValid) {
      // Series URL needs correction but chapter exists
      const correctSeriesUrl = seriesValidation.correctUrl!;
      return {
        isValid: false,
        correctChapterUrl: generateChapterUrl(parsed.baseUrl, seriesData.url_code || '000000', chapterNumber),
        seriesData,
        chapterExists: true
      };
    }
    
    // Both series and chapter URLs are valid
    return {
      isValid: true,
      seriesData,
      chapterExists: true
    };
    
  } catch (error) {
    console.error('Error validating chapter URL:', error);
    return { isValid: false };
  }
}

/**
 * Cache for URL validations to improve performance
 */
class UrlValidationCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 5 * 60 * 1000; // 5 minutes
  
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }
    return null;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const urlValidationCache = new UrlValidationCache();

// Clean up cache every 5 minutes
if (typeof window === 'undefined') { // Only run on server
  setInterval(() => {
    urlValidationCache.cleanup();
  }, 5 * 60 * 1000);
}