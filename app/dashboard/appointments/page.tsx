'use client';

import React, { useEffect, useState } from 'react';
import { Appointment, Client, Service } from '@/types';

type AppointmentPayload = Appointment & { client?: { name: string; phone?: string }; service?: { name: string; price?: number }; };

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<AppointmentPayload[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('PENDING');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, clientRes, servRes] = await Promise.all([
        fetch('/api/appointments'),
        fetch('/api/clients'),
        fetch('/api/services'),
      ]);
      const appData = await appRes.json();
      const clientData = await clientRes.json();
      const servData = await servRes.json();

      setAppointments(appData);
      setClients(clientData);
      setServices(servData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !serviceId || !date) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, serviceId, date, status }),
      });
      const response = await res.json();
      if (res.ok) {
        setClientId('');
        setServiceId('');
        setDate('');
        setStatus('PENDING');
        fetchData();
      } else {
        console.error(response.error || 'Erro ao criar o agendamento');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este agendamento?')) return;
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuickAction = async (id: string, action: 'COMPLETED' | 'CANCELLED' | 'DELAY') => {
    const appointment = appointments.find((item) => item.id === id);
    if (!appointment) return;

    const payload: Record<string, unknown> = {};
    if (action === 'COMPLETED') {
      payload.status = 'COMPLETED';
    }
    if (action === 'CANCELLED') {
      payload.status = 'CANCELLED';
    }
    if (action === 'DELAY') {
      const delayed = new Date(appointment.date);
      delayed.setMinutes(delayed.getMinutes() + 15);
      payload.date = delayed.toISOString();
    }

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        fetchData();
      } else {
        const response = await res.json();
        console.error(response.error || 'Erro na ação rápida');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getWhatsAppLink = (appointment: AppointmentPayload) => {
    const phone = appointment.client?.phone?.replace(/\D/g, '');
    if (!phone) return null;

    const formattedDate = new Date(appointment.date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `Olá ${appointment.client?.name || 'cliente'}, seu agendamento para ${appointment.service?.name || 'serviço'} está marcado para ${formattedDate}. Por favor, confirme.`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="mt-2 text-slate-400">Controle diário com ações rápidas e agenda mobile-friendly.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-3xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          <span className="inline-flex h-3 w-3 rounded-full bg-emerald-400" />
          Toque em um card para gerenciar facilmente.
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-sm shadow-black/10">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-400">Cliente</span>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100"
              required
            >
              <option value="">Selecione o cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-400">Serviço</span>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100"
              required
            >
              <option value="">Selecione o serviço</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} - R$ {s.price.toFixed(2)}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-400">Data e Hora</span>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-400">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100"
            >
              <option value="PENDING">Pendente</option>
              <option value="CONFIRMED">Confirmado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </label>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 items-center justify-center rounded-3xl bg-emerald-500 px-5 text-base font-semibold text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Salvando...' : 'Criar Agendamento'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">Carregando agenda...</div>
        ) : appointments.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center text-slate-400">Nenhum agendamento cadastrado ainda.</div>
        ) : (
          <div className="space-y-4">
            {appointments.map((app) => {
              const whatsappLink = getWhatsAppLink(app);
              return (
                <article key={app.id} className="rounded-3xl border border-slate-800 bg-slate-950 p-5 shadow-sm shadow-black/10">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{new Date(app.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                      <h2 className="text-xl font-semibold text-zinc-100">{app.client?.name || 'Cliente'}</h2>
                      <p className="mt-1 text-slate-400">{app.service?.name || 'Serviço'}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-300' :
                      app.status === 'CONFIRMED' ? 'bg-indigo-500/10 text-indigo-300' :
                      app.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-300' :
                      'bg-amber-500/10 text-amber-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAction(app.id, 'COMPLETED')}
                        className="inline-flex h-11 items-center justify-center rounded-3xl bg-emerald-500 px-4 text-sm font-semibold text-zinc-950 hover:bg-emerald-400"
                      >
                        Concluir
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAction(app.id, 'CANCELLED')}
                        className="inline-flex h-11 items-center justify-center rounded-3xl bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-400"
                      >
                        Faltou
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAction(app.id, 'DELAY')}
                        className="inline-flex h-11 items-center justify-center rounded-3xl bg-slate-700 px-4 text-sm font-semibold text-slate-100 hover:bg-slate-600"
                      >
                        Adiar 15 min
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {whatsappLink ? (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 items-center justify-center rounded-3xl bg-cyan-600 px-4 text-sm font-semibold text-white hover:bg-cyan-500"
                        >
                          WhatsApp
                        </a>
                      ) : (
                        <span className="inline-flex h-11 items-center justify-center rounded-3xl bg-slate-800 px-4 text-sm font-semibold text-slate-400">Sem telefone</span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(app.id)}
                        className="inline-flex h-11 items-center justify-center rounded-3xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-500"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
