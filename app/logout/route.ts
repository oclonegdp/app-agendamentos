import { NextResponse } from 'next/server';
import { COOKIE_NAME, authCookieOptions } from '@/lib/auth';

export async function GET() {
  const response = NextResponse.redirect('/login');
  response.cookies.set(COOKIE_NAME, '', {
    ...authCookieOptions(),
    maxAge: 0,
  });
  return response;
}
