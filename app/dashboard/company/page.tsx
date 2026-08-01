'use client';

import React, { useEffect, useState } from 'react';

export default function CompanyPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/company')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.id) {
          setCompanyId(data.id);
          setName(data.name || '');
          setPhone(data.phone || '');
          setAddress(data.address || '');
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);

    try {
      const res = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, address }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.id) setCompanyId(data.id);
        setSuccess(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-slate-400">Carregando dados da empresa...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Dados da Empresa</h1>

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded text-sm">
          Dados salvos com sucesso!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nome da Empresa</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Telefone / WhatsApp</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Endereço</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium">
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
