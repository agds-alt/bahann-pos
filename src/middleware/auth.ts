import { type NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Middleware untuk proteksi route yang butuh autentikasi
 * Dipakai di: /app/api/* atau /app/dashboard/*
 */
export async function authMiddleware(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Jika tidak ada session, redirect ke login
  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirectedFrom', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Opsional: Validasi role/user di sini
  // const user = session.user;
  // if (user.email !== 'admin@boston.com') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  // }

  return NextResponse.next();
}
