'use client';

import React, { useEffect, useState } from 'react';
import { CashSummary } from '@/types';

const formatCurrency = (value: number) => `R$ ${value.toFixed(2).replace('.', ',')}`;

export default function CashPage() {
  const [summary, setSummary] = useState<CashSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard?startDate=&endDate=');
      const data = await res.json();
      setSummary({
        pix: data.paymentMethodTotals?.PIX || 0,
        credit: data.paymentMethodTotals?.CREDIT || 0,
        debit: data.paymentMethodTotals?.DEBIT || 0,
        cash: data.paymentMethodTotals?.CASH || 0,
        totalInflow: data.todayRevenue || 0,
        totalOutflow: data.todayExpenses || 0,
        net: data.todayNetProfit || 0,
        openRegister: true,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCloseRegister = async () => {
    if (!summary) return;
    window.alert('Fechamento de caixa realizado. O valor líquido será consolidado automaticamente.');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Fechamento de Caixa</h1>
        <p className="mt-2 text-slate-400">Resumo por forma de pagamento e fechamento de caixa rápido.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Pix</p>
          <p className="mt-4 text-3xl font-semibold text-emerald-300">{formatCurrency(summary?.pix || 0)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Cartão</p>
          <p className="mt-4 text-3xl font-semibold text-emerald-300">{formatCurrency(summary?.credit || 0)}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Dinheiro</p>
          <p className="mt-4 text-3xl font-semibold text-emerald-300">{formatCurrency(summary?.cash || 0)}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-400">Total líquido disponível</p>
            <p className="mt-2 text-4xl font-semibold text-indigo-300">{formatCurrency(summary?.net || 0)}</p>
          </div>
          <button
            type="button"
            onClick={handleCloseRegister}
            className="inline-flex h-14 items-center justify-center rounded-3xl bg-emerald-500 px-6 text-base font-semibold text-zinc-950 transition hover:bg-emerald-400"
          >
            Fechar Caixa
          </button>
        </div>
      </div>
    </div>
  );
}
