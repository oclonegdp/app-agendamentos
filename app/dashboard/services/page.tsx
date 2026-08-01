'use client';

import React, { useEffect, useState } from 'react';
import { Service } from '@/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  const fetchServices = async () => {
    try {
      const res = await fetch('/api/services');
      const data = await res.json();
      setServices(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    try {
      const res = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          price: parseFloat(price),
          duration: duration ? parseInt(duration) : undefined,
        }),
      });
      if (res.ok) {
        setName('');
        setPrice('');
        setDuration('');
        fetchServices();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este serviço?')) return;
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
      if (res.ok) fetchServices();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Serviços</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Serviço</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Duração (minutos)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div className="md:col-span-3 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium">
            Adicionar Serviço
          </button>
        </div>
      </form>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="p-4">Nome</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Duração</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Carregando...</td></tr>
            ) : services.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-slate-500">Nenhum serviço cadastrado.</td></tr>
            ) : (
              services.map((service) => (
                <tr key={service.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 font-medium">{service.name}</td>
                  <td className="p-4 text-emerald-400 font-semibold">R$ {service.price.toFixed(2)}</td>
                  <td className="p-4 text-slate-400">{service.duration ? `${service.duration} min` : '-'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(service.id)}
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
