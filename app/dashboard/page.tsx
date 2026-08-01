'use client';

import { useState, useEffect } from 'react';
import {
  Calendar,
  DollarSign,
  Users,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const [metrics] = useState({
    todayRevenue: 1250.0,
    todayAppointments: 8,
    pendingConfirmations: 2,
    activeClients: 142,
  });

  const [aiInsights, setAiInsights] = useState('Carregando insights de IA...');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/ai/insights');
        if (!res.ok) throw new Error('Falha ao buscar insights');
        const data = await res.json();
        if (mounted && data?.insights) setAiInsights(data.insights);
      } catch (e) {
        if (mounted) setAiInsights('Não foi possível carregar insights de IA.');
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-6 text-zinc-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Sistema Operacional Ativo & Seguro
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Painel Inteligente</h1>
          <p className="text-sm text-zinc-400">Resumo operacional e automações em tempo real.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 active:scale-95">
            <Zap className="w-4 h-4" />
            Novo Agendamento Rápido
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Faturamento Hoje</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              R$ {metrics.todayRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Caixa fechado e sincronizado</span>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Agendamentos</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{metrics.todayAppointments}</div>
            <div className="text-xs text-zinc-400 mt-1">{metrics.pendingConfirmations} pendentes de confirmação</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Base de Clientes</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{metrics.activeClients}</div>
            <div className="text-xs text-zinc-400 mt-1">Cadastrados no sistema</div>
          </div>
        </div>

        <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Blindagem & IA</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Proteção Ativa
            </div>
            <div className="text-xs text-zinc-400 mt-1">Transações atômicas OK</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Agenda de Hoje (Modo Direto)
            </h2>
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg">Atualizado agora</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-xl hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-center px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Horário</span>
                  <span className="text-sm font-bold text-white">09:00</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Carlos Eduardo</h4>
                  <p className="text-xs text-zinc-400">Corte + Barba • R$ 75,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg font-medium">
                  Confirmado WhatsApp
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-zinc-950/50 border border-zinc-800/60 rounded-xl hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-center px-3 py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                  <span className="text-xs text-zinc-400 block">Horário</span>
                  <span className="text-sm font-bold text-white">10:30</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Marcos Vinicius</h4>
                  <p className="text-xs text-zinc-400">Corte Degradê • R$ 50,00</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg font-medium">
                  Pendente IA
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-3">
              <Sparkles className="w-4 h-4" />
              Cérebro de Automação IA
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 whitespace-pre-wrap">
              {aiInsights}
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all border border-zinc-700/50">
              Disparar Reativação WhatsApp
            </button>
            <button className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition-all border border-zinc-800">
              Ver Fechamento de Caixa
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
