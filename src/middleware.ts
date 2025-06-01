// src/middleware.ts (Alternative approach using middleware)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { userAgent } from 'next/server';

// Common bot patterns to detect crawlers
const BOT_PATTERNS = [
  /bot/i, 
  /crawler/i, 
  /spider/i, 
  /googlebot/i, 
  /bingbot/i, 
  /yahoo/i,
  /baidu/i,
  /duckduckbot/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /slurp/i,
  /yandex/i,
  /lighthouse/i
];

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://www.manhwacall.com',
  'https://manhwacall.com',
  'http://localhost:3000'
];

// Cache for URL validation (simple in-memory cache)
const urlCache = new Map<string, { url_code: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Function to fetch series data and validate URL
async function validateSeriesUrl(baseUrl: string): Promise<string | null> {
  // Check cache first
  const cached = urlCache.get(baseUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.url_code;
  }

  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://www.manhwacall.com'}/api/title?url=${baseUrl}`);
    if (response.ok) {
      const data = await response.json();
      const urlCode = data.url_code || '000000';
      
      // Cache the result
      urlCache.set(baseUrl, { url_code: urlCode, timestamp: Date.now() });
      
      return urlCode;
    }
  } catch (error) {
    console.error('Error validating series URL:', error);
  }
  
  return null;
}

// Clean up cache periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of urlCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      urlCache.delete(key);
    }
  }
}, CACHE_TTL);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Create a response object from the incoming request
  const response = NextResponse.next();
  
  // Apply CORS middleware for API routes
  if (pathname.startsWith('/api/')) {
    // Get the origin header from the request
    const origin = request.headers.get('origin');
    
    // If the origin is allowed, set it as the value for the Access-Control-Allow-Origin header
    if (origin && ALLOWED_ORIGINS.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
      response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    }
  }
  
  // Handle series and chapter URL redirects
  if (pathname.startsWith('/series/')) {
    const pathParts = pathname.split('/');
    
    if (pathParts.length >= 3) {
      const seriesParam = pathParts[2];
      const chapterParam = pathParts[3];
      
      // Check if this is a series page or chapter page
      const isChapterPage = pathParts.length === 4 && chapterParam?.startsWith('chapter-');
      
      // Extract URL code pattern
      const urlCodeRegex = /-(\d{6})$/;
      const match = seriesParam.match(urlCodeRegex);
      
      if (!match) {
        // No URL code found, need to redirect to correct URL
        const baseUrl = seriesParam;
        const correctUrlCode = await validateSeriesUrl(baseUrl);
        
        if (correctUrlCode) {
          const correctUrl = `${baseUrl}-${correctUrlCode}`;
          const redirectPath = isChapterPage 
            ? `/series/${correctUrl}/${chapterParam}`
            : `/series/${correctUrl}`;
          
          return NextResponse.redirect(new URL(redirectPath, request.url), 301);
        }
      } else {
        // URL code exists, verify it's correct
        const baseUrl = seriesParam.replace(urlCodeRegex, '');
        const providedCode = match[1];
        const correctUrlCode = await validateSeriesUrl(baseUrl);
        
        if (correctUrlCode && providedCode !== correctUrlCode) {
          // Wrong URL code, redirect to correct one
          const correctUrl = `${baseUrl}-${correctUrlCode}`;
          const redirectPath = isChapterPage 
            ? `/series/${correctUrl}/${chapterParam}`
            : `/series/${correctUrl}`;
          
          return NextResponse.redirect(new URL(redirectPath, request.url), 301);
        }
      }
    }
  }
  
  // Apply bot detection middleware for all routes
  const { ua } = userAgent(request);
  const userAgentString = ua || '';
  
  // Check if it's a bot
  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgentString));
  
  // Set a cookie to indicate if it's a bot (non-HttpOnly so it's readable client-side)
  response.cookies.set('is-bot', isBot ? 'true' : 'false', {
    path: '/',      
    sameSite: 'strict',
    httpOnly: false
  });
  
  return response;
}

// Combine the matchers from both middlewares
export const config = {
  matcher: [
    '/api/:path*', // For CORS middleware
    '/series/:path*', // For URL redirect middleware
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)' // For bot detection middleware
  ]
};