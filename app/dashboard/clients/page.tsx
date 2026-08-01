'use client';

import React, { useEffect, useState } from 'react';
import { Client } from '@/types';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email }),
      });
      if (res.ok) {
        setName('');
        setPhone('');
        setEmail('');
        fetchClients();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este cliente?')) return;
    try {
      const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
      if (res.ok) fetchClients();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nome</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium">
            Adicionar Cliente
          </button>
        </div>
      </form>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="p-4">Nome</th>
              <th className="p-4">Telefone</th>
              <th className="p-4">E-mail</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Carregando...</td></tr>
            ) : clients.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Nenhum cliente cadastrado.</td></tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 font-medium">{client.name}</td>
                  <td className="p-4 text-slate-400">{client.phone || '-'}</td>
                  <td className="p-4 text-slate-400">{client.email || '-'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-rose-400 hover:text-rose-300 text-sm font-medium"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
