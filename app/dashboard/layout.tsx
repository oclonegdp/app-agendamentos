import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { COOKIE_NAME, verifyAuthToken } from '@/lib/auth';
import { getDevSessionOrThrow } from '@/lib/auth-bypass';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const isValidToken = verifyAuthToken(token);

  if (!isValidToken) {
    try {
      await getDevSessionOrThrow();
    } catch {
      redirect('/login');
    }
  }

  return <AppLayout>{children}</AppLayout>;
}
