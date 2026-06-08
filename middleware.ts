import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

const PROTECTED = ['/dashboard'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isAuthenticated = token
    ? await verifyToken(token)
        .then(() => true)
        .catch(() => false)
    : false;

  if (PROTECTED.some((p) => pathname.startsWith(p)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  if (pathname === '/auth' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth'],
};
