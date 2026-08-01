'use client';

import React, { useEffect, useState } from 'react';

type DashboardMetrics = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalAppointments: number;
  clientsCount: number;
  stockCount: number;
  todayRevenue: number;
  todayExpenses: number;
  todayNetProfit: number;
  todayAppointments: number;
  paymentMethodTotals: Record<'PIX' | 'CREDIT' | 'DEBIT' | 'CASH', number>;
  todayAppointmentList: Array<{
    id: string;
    date: string;
    status: string;
    client?: { name: string };
    service?: { name: string };
  }>;
};

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchMetrics = async (start?: string, end?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set('startDate', start);
    if (end) params.set('endDate', end);

    try {
      const res = await fetch(`/api/dashboard?${params.toString()}`);
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date();
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    setStartDate(start.toISOString());
    setEndDate(end.toISOString());
    fetchMetrics(start.toISOString(), end.toISOString());
  }, []);

  const handleFilter = () => {
    if (!startDate || !endDate) return;
    fetchMetrics(startDate, endDate);
  };

  if (loading) {
    return <div className="text-slate-400">Carregando métricas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">Painel Diário Inteligente</p>
            <h1 className="text-3xl font-bold tracking-tight mt-2">Resumo do Dia</h1>
            <p className="mt-2 text-slate-400 max-w-2xl">Visão imediata dos seus horários, faturamento e fechamento de caixa de um toque.</p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <a
              href="/dashboard/financial-ai"
              className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Abrir IA Financeira
            </a>
            <a
              href="/admin/subscriptions"
              className="inline-flex items-center justify-center rounded-3xl border border-slate-700 bg-slate-950 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-900"
            >
              Gestão de Assinaturas
            </a>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 w-full max-w-2xl">
          {['PIX', 'CREDIT', 'DEBIT', 'CASH'].map((method) => (
            <div key={method} className="rounded-3xl border border-slate-800 bg-slate-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{method}</p>
              <p className="mt-3 text-xl font-semibold text-emerald-300">{formatCurrency(metrics?.paymentMethodTotals[method as keyof DashboardMetrics['paymentMethodTotals']] || 0)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Linha do Tempo de Hoje</h2>
                <p className="text-sm text-slate-500">Acompanhe os agendamentos confirmados e pendentes sem rolagem excessiva.</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {metrics?.todayAppointmentList.length ? (
              metrics.todayAppointmentList.map((item) => (
                <article key={item.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-sm shadow-black/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-slate-400">{new Date(item.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {item.client?.name || 'Cliente'}</p>
                      <h3 className="text-lg font-semibold text-zinc-100">{item.service?.name || 'Serviço'}</h3>
                    </div>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-300' :
                      item.status === 'CONFIRMED' ? 'bg-indigo-500/10 text-indigo-300' :
                      item.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-300' :
                      'bg-amber-500/10 text-amber-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5 text-slate-400">
                Nenhum agendamento agendado para hoje.
              </div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Fechamento de Caixa</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">1 clique para fechar o dia</h2>
            <div className="mt-5 grid gap-3">
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Faturamento Hoje</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-300">{formatCurrency(metrics?.todayRevenue || 0)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Despesas Hoje</p>
                <p className="mt-2 text-3xl font-semibold text-rose-300">{formatCurrency(metrics?.todayExpenses || 0)}</p>
              </div>
              <div className="rounded-3xl bg-slate-950 p-4">
                <p className="text-sm text-slate-400">Lucro Hoje</p>
                <p className={`mt-2 text-3xl font-semibold ${((metrics?.todayNetProfit ?? 0) >= 0 ? 'text-indigo-300' : 'text-rose-300')}`}>
                  {formatCurrency(metrics?.todayNetProfit ?? 0)}
                </p>
              </div>
            </div>
            <a
              href="/dashboard/cash"
              className="mt-6 inline-flex w-full justify-center rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400"
            >
              Abrir fechamento de caixa
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
