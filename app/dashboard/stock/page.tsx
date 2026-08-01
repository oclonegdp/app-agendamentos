'use client';

import React, { useEffect, useState } from 'react';
import { StockItem } from '@/types';

export default function StockPage() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minQuantity, setMinQuantity] = useState('');
  const [price, setPrice] = useState('');

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      const data = await res.json();
      setStock(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !quantity) return;

    try {
      const res = await fetch('/api/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          quantity: parseInt(quantity),
          minQuantity: minQuantity ? parseInt(minQuantity) : undefined,
          price: price ? parseFloat(price) : undefined,
        }),
      });
      if (res.ok) {
        setName('');
        setQuantity('');
        setMinQuantity('');
        setPrice('');
        fetchStock();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este item?')) return;
    try {
      const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' });
      if (res.ok) fetchStock();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Nome do Item</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Quantidade</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Qtd Mínima</label>
          <input
            type="number"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Preço Unitário (R$)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div className="md:col-span-4 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium">
            Adicionar Item
          </button>
        </div>
      </form>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="p-4">Item</th>
              <th className="p-4">Quantidade</th>
              <th className="p-4">Mínimo</th>
              <th className="p-4">Preço Unitário</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">Carregando...</td></tr>
            ) : stock.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhum item em estoque.</td></tr>
            ) : (
              stock.map((item) => (
                <tr key={item.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 font-medium">{item.name}</td>
                  <td className={`p-4 font-semibold ${item.quantity <= (item.minQuantity || 0) ? 'text-rose-400' : 'text-slate-100'}`}>
                    {item.quantity}
                  </td>
                  <td className="p-4 text-slate-400">{item.minQuantity ?? '-'}</td>
                  <td className="p-4 text-slate-300">{item.price ? `R$ ${item.price.toFixed(2)}` : '-'}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
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
