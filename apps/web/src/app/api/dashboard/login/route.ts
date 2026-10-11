import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const supabase = createClient();

    // 1. Attempt Supabase Auth Sign In
    let { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // 2. If user does not exist in Supabase yet, automatically sign them up!
    if (error && (error.message.includes('Invalid login credentials') || error.message.includes('User not found'))) {
      const signUpResult = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: email.split('@')[0],
            role: 'merchant',
          },
        },
      });

      if (!signUpResult.error && signUpResult.data.user) {
        // Retry sign in after auto sign-up
        const retry = await supabase.auth.signInWithPassword({ email, password });
        data = retry.data;
        error = retry.error;
      }
    }

    // If still error, return message
    if (error && !data?.user) {
      return NextResponse.json({ message: error.message || 'Invalid email or password' }, { status: 401 });
    }

    const user = data?.user || {
      id: 'usr_' + Date.now(),
      email,
      user_metadata: { name: email.split('@')[0], role: 'merchant' },
    };

    const response = NextResponse.json({
      message: 'Logged in successfully',
      user: {
        id: user.id,
        name: user.user_metadata?.name || email.split('@')[0],
        email: user.email,
        role: user.user_metadata?.role || 'merchant',
      },
    });

    // Set cookie headers for Next.js middleware and client state
    response.cookies.set('user_role', user.user_metadata?.role || 'merchant', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    response.cookies.set('token', data?.session?.access_token || 'sb-active-session', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Authentication failed' }, { status: 500 });
  }
}
