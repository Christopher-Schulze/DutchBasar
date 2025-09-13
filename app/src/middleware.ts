import { NextResponse } from 'next/server';

export function middleware() {
  const response = NextResponse.next();

  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  const isDev = process.env.NODE_ENV !== 'production';
  if (!isDev) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy (relaxed frame-ancestors in development for IDE previews)
  const frameAncestors = isDev
    ? "frame-ancestors 'self' http://localhost:* http://127.0.0.1:*"
    : "frame-ancestors 'none'";

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' blob:",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' http: https: wss: ws:",
    frameAncestors,
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  return response;
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
