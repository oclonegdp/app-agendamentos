"use client";

import React, { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, CheckCircle2, Scissors, User, Phone } from "lucide-react";

export default function ClientBookingPage() {
  const [selectedDate, setSelectedDate] = useState("2026-06-19");
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [selectedService, setSelectedService] = useState("Corte Degradê + Barba");
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Horários carregados da API pública
  const [timeSlots, setTimeSlots] = useState<Array<{ time: string; available: boolean }>>([]);
  const COMPANY_ID = process.env.NEXT_PUBLIC_COMPANY_ID || '';
  const [services, setServices] = useState<Array<any>>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/services');
        if (res.ok) {
          const data = await res.json();
          if (mounted && Array.isArray(data)) {
            setServices(data);
            if (!selectedService && data.length > 0) setSelectedService(data[0].id);
          }
        }
      } catch (e) {
        // ignore, services may be loaded later or fallback used
      }
    })();
    (async () => {
      try {
        const res = await fetch(`/api/public/availability?companyId=${encodeURIComponent(COMPANY_ID)}&date=${selectedDate}`);
        if (!res.ok) throw new Error('Erro ao buscar disponibilidade');
        const data = await res.json();
        if (mounted && Array.isArray(data.slots)) setTimeSlots(data.slots);
      } catch (err) {
        if (mounted) setTimeSlots([
          { time: '09:00', available: true },
          { time: '10:00', available: false },
          { time: '11:00', available: true },
          { time: '13:00', available: true },
          { time: '14:00', available: true },
        ]);
      }
    })();
    return () => { mounted = false; };
  }, [selectedDate]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || !clientName || !clientPhone) return;

    const dateTime = new Date(`${selectedDate}T${selectedTime}`);

      try {
      const res = await fetch('/api/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: COMPANY_ID,
          serviceId: selectedService,
          date: dateTime.toISOString(),
          name: clientName,
          phone: clientPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Erro ao confirmar agendamento');
        return;
      }

      setIsConfirmed(true);
    } catch (err) {
      alert('Erro de rede ao confirmar agendamento');
    }
  };

  if (isConfirmed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Agendamento Confirmado!</h2>
          <p className="text-sm text-zinc-400">
            Tudo certo, <strong className="text-white">{clientName}</strong>. Seu horário para <strong className="text-emerald-400">{selectedTime}</strong> foi reservado com sucesso. A IA já notificou a barbearia.
          </p>
          <button 
            onClick={() => setIsConfirmed(false)}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 rounded-xl text-sm transition-all mt-4"
          >
            Fazer Novo Agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold">
            <Scissors className="w-3.5 h-3.5" />
            Barbearia Profissional • Agendamento Rápido
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Escolha seu Horário</h1>
          <p className="text-xs text-zinc-400">Selecione o dia e o horário livre na tabela abaixo.</p>
        </div>

        <form onSubmit={handleBooking} className="bg-zinc-900/80 border border-zinc-800 p-6 rounded-2xl space-y-6">
          
          {/* Seleção de Serviço */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Serviço Desejado</label>
            <select 
              value={selectedService} 
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 text-white text-sm rounded-xl px-4 py-3 focus:outline-none focus:border-emerald-500"
            >
              {services.length > 0 ? (
                services.map((s: any) => (
                  <option key={s.id} value={s.id}>{`${s.name} • R$ ${Number(s.price || 0).toFixed(2)}`}</option>
                ))
              ) : (
                <>
                  <option value="Corte Degradê + Barba">Corte Degradê + Barba • R$ 75,00</option>
                  <option value="Corte Social / Moderno">Corte Social / Moderno • R$ 50,00</option>
                  <option value="Barba Completa">Barba Completa • R$ 35,00</option>
                </>
              )}
            </select>
          </div>

          {/* Escolha do Dia */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Data do Atendimento</label>
            <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-4 py-3 rounded-xl">
              <CalendarIcon className="w-4 h-4 text-emerald-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-sm focus:outline-none w-full"
              />
            </div>
          </div>

          {/* Grade de Horários Livres (Visual em Tabela) */}
          <div>
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">Horários Disponíveis (Clique para escolher)</label>
            <div className="grid grid-cols-3 gap-2.5">
              {timeSlots.map((slot, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border ${
                    !slot.available 
                      ? 'bg-zinc-950/40 text-zinc-600 border-zinc-900 cursor-not-allowed line-through'
                      : selectedTime === slot.time
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-900/40'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {slot.time}
                  </div>
                  <span className="text-[10px] font-normal block mt-1 opacity-80">
                    {slot.available ? (selectedTime === slot.time ? 'Selecionado' : 'Disponível') : 'Ocupado'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="space-y-4 pt-2 border-t border-zinc-800">
            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Seu Nome</label>
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl">
                <User className="w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  required
                  placeholder="Ex: João da Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-1">Seu WhatsApp / Telefone</label>
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-4 py-2.5 rounded-xl">
                <Phone className="w-4 h-4 text-zinc-500" />
                <input 
                  type="tel" 
                  required
                  placeholder="(21) 99999-9999"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="bg-transparent text-white text-sm focus:outline-none w-full"
                />
              </div>
            </div>
          </div>

          {/* Botão de Confirmação Final */}
          <button
            type="submit"
            disabled={!selectedTime}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              selectedTime 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {selectedTime ? `Confirmar Agendamento às ${selectedTime}` : 'Selecione um Horário Acima'}
          </button>

        </form>

      </div>
    </div>
  );
}
