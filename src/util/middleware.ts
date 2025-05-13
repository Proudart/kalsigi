import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
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

export function middleware(request: NextRequest) {
  // Get user agent information
  const { ua } = userAgent(request);
  const userAgentString = ua || '';
  
  // Check if it's a bot
  const isBot = BOT_PATTERNS.some(pattern => pattern.test(userAgentString));
  
  // Create the response
  const response = NextResponse.next();
  
  // Set a cookie to indicate if it's a bot (non-HttpOnly so it's readable client-side)
  response.cookies.set('is-bot', isBot ? 'true' : 'false', {
    path: '/',      
    sameSite: 'strict',
    httpOnly: false
  });
  
  return response;
}

// Configure which paths middleware runs on - adjust as needed for your app
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)']
};