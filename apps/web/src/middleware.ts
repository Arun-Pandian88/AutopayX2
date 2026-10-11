import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { updateSession } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user: supabaseUser } = await updateSession(request);
  const token = request.cookies.get('token')?.value || (supabaseUser ? 'sb-session' : null);
  const userRole = request.cookies.get('user_role')?.value || supabaseUser?.user_metadata?.role;
  const path = request.nextUrl.pathname;

  // ─── Protected Routes: Dashboard (merchant) ───
  if (path.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === 'superadmin') {
      return NextResponse.redirect(new URL('/superadmin/dashboard', request.url));
    }
  }

  // ─── Protected Routes: Superadmin dashboard ───
  if (path.startsWith('/superadmin/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/superadmin/login', request.url));
    }
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

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/superadmin/:path*', '/login', '/register'],
};
