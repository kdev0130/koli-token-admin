import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Always handle CORS for K-Kash endpoints (used cross-origin).
  if (path.startsWith('/api/kash')) {
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }

    const response = NextResponse.next();
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Only handle API routes that need auth check via headers
  // Client-side auth is handled in each page component
  if (path.startsWith('/api/finance') && path !== '/api/finance') {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/finance/:path*',
    '/api/kash/:path*',
  ],
};
