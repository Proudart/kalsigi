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

export function middleware(request: NextRequest) {
  // Create a response object from the incoming request
  const response = NextResponse.next();
  
  // Apply CORS middleware for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)' // For bot detection middleware
  ]
};