import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const statuses = ['TRIAL', 'ACTIVE', 'SUSPENDED', 'CANCELLED'] as const;

type SubscriptionStatus = (typeof statuses)[number];

async function changeSubscriptionStatus(formData: FormData) {
  'use server';

  const companyId = formData.get('companyId')?.toString();
  const status = formData.get('status')?.toString() as SubscriptionStatus | undefined;

  if (!companyId || !status || !statuses.includes(status as SubscriptionStatus)) {
    throw new Error('Dados de assinatura inválidos.');
  }

  await prisma.companySubscription.upsert({
    where: { companyId },
    create: {
      companyId,
      status,
      planName: 'PRO',
      expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    },
    update: {
      status,
      updatedAt: new Date(),
    },
  });
}

export default async function AdminSubscriptionsPage() {
  const companies = await prisma.company.findMany({
    include: {
      subscription: true,
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Admin</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Gestão de Assinaturas</h1>
        <p className="mt-3 text-slate-400">Atualize o status de assinatura de qualquer empresa com um clique.</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/20">
        <table className="min-w-full divide-y divide-slate-800">
          <thead className="bg-slate-950">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Empresa</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Plano</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Expira em</th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950">
            {companies.map((company: any) => {
              const subscription = company.subscription;
              return (
                <tr key={company.id} className="hover:bg-slate-900/70">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-100">
                    <div className="font-semibold">{company.name}</div>
                    <div className="text-slate-500">{company.email || company.slug}</div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-100">{subscription?.planName ?? 'PRO'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm">
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      subscription?.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-300' :
                      subscription?.status === 'TRIAL' ? 'bg-indigo-500/15 text-indigo-300' :
                      subscription?.status === 'SUSPENDED' ? 'bg-amber-500/15 text-amber-300' :
                      'bg-rose-500/15 text-rose-300'
                    }`}>
                      {subscription?.status ?? 'TRIAL'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-400">
                    {subscription?.expiresAt ? new Date(subscription.expiresAt).toLocaleDateString('pt-BR') : 'Sem expiração'}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-slate-100">
                    <div className="flex flex-wrap justify-end gap-2">
                      {statuses.map((status) => (
                        <form key={status} action={changeSubscriptionStatus} className="inline">
                          <input type="hidden" name="companyId" value={company.id} />
                          <input type="hidden" name="status" value={status} />
                          <button
                            type="submit"
                            disabled={subscription?.status === status}
                            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                              subscription?.status === status ? 'cursor-not-allowed bg-slate-700 text-slate-400' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'
                            }`}
                          >
                            {status}
                          </button>
                        </form>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
