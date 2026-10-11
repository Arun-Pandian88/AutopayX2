import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  const API_BASE_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Sign out Supabase auth session
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch (sbErr) {}

  // 2. Notify the backend API to record the logout audit log
  try {
    await fetch(`${API_BASE_URL}/api/dashboard/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'cookie': request.headers.get('cookie') || '',
      },
    }).catch(() => { });
  } catch (err) {
    // Continue even if backend is temporarily unreachable
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // Clear authentication cookies directly in Next.js response
  response.cookies.set('token', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
  });

  response.cookies.set('user_role', '', {
    path: '/',
    expires: new Date(0),
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}

export async function GET(request: Request) {
  return POST(request);
}
