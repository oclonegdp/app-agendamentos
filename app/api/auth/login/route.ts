import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createAuthToken, authCookieOptions, COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
    }

    const token = createAuthToken(user.id, user.role, user.companyId || null);
    const response = NextResponse.json({ success: true, userId: user.id, role: user.role, companyId: user.companyId });
    response.cookies.set(COOKIE_NAME, token, authCookieOptions());
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
