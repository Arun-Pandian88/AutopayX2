import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const userRole = request.cookies.get('user_role')?.value;
  const path = request.nextUrl.pathname;

  // ─── Protected Routes: Dashboard (merchant) ───
  if (path.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If superadmin tries to access merchant dashboard, redirect to superadmin dashboard
    if (userRole === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
    }
  }

  // ─── Protected Routes: Superadmin dashboard ───
  if (path.startsWith('/superadmin/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }
    // If merchant tries to access superadmin dashboard, redirect to merchant dashboard
    if (userRole && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ─── Login/Register pages: redirect if already logged in ───
  if (path === '/login' || path === '/register') {
    if (token) {
      if (userRole === 'superadmin') {
        return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ─── Superadmin login page: redirect if already logged in as superadmin ───
  if (path === '/superadmin/login') {
    if (token && userRole === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/superadmin/:path*', '/login', '/register'],
};
