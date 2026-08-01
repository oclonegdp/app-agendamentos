import { NextResponse } from 'next/server';

function createBypassCookie(response: NextResponse) {
  response.cookies.set('dev_bypass_auth', 'active', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  createBypassCookie(response);
  return response;
}

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL('/dashboard', request.url));
  createBypassCookie(response);
  return response;
}
