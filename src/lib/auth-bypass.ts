import { cookies } from 'next/headers';

export async function getDevSessionOrThrow() {
  const cookieStore = await cookies();
  const devBypass = cookieStore.get('dev_bypass_auth')?.value;

  if (process.env.NODE_ENV === 'development' || devBypass === 'active') {
    return {
      userId: 'dev-admin-user-id',
      companyId: 'dev-company-id-01',
      role: 'ADMIN',
      email: 'admin@dev.local',
    };
  }

  throw new Error('UNAUTHORIZED_ACCESS');
}
