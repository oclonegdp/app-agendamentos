'use client';

import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function DashboardAssistantPage() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      text: message.trim(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'dev-company-id-01',
          clientPhone: '+5511000000000',
          messageType: 'text',
          textContent: newMessage.text,
        }),
      });

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        text: data.reply || data.error || 'Falha ao obter resposta do assistente.',
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-assistant`, role: 'assistant', text: 'Erro de rede ao conectar com o assistente.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-xl shadow-black/20">
        <h1 className="text-3xl font-bold tracking-tight">Assistente de IA</h1>
        <p className="mt-3 text-slate-400">Faça perguntas ao assistente para responder sobre serviços, agendamentos e gestão do estabelecimento.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950 p-6">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900 p-6 text-slate-400">
                Inicie a conversa com o assistente para obter suporte imediato.
              </div>
            ) : (
              messages.map((messageItem) => (
                <div
                  key={messageItem.id}
                  className={`rounded-3xl p-4 ${
                    messageItem.role === 'user'
                      ? 'bg-slate-900 text-slate-100 self-end'
                      : 'bg-emerald-500/10 text-emerald-100'
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{messageItem.role}</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{messageItem.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">Pergunta</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 p-4 text-slate-100 outline-none focus:border-emerald-500"
              placeholder="Pergunte ao assistente sobre agendamentos, preços ou disponibilidade..."
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Enviar para o assistente'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
