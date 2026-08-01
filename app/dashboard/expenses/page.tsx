'use client';

import React, { useEffect, useState } from 'react';
import { Expense } from '@/types';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await fetch('/api/expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          date,
          category,
        }),
      });
      if (res.ok) {
        setDescription('');
        setAmount('');
        setDate('');
        setCategory('');
        fetchExpenses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta despesa?')) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (res.ok) fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Despesas</h1>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-lg border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Categoria</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-100"
          />
        </div>
        <div className="md:col-span-2 flex justify-end">
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded font-medium">
            Adicionar Despesa
          </button>
        </div>
      </form>

      <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="p-4">Data</th>
              <th className="p-4">Descrição</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Valor</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">Carregando...</td></tr>
            ) : expenses.length === 0 ? (
              <tr><td colSpan={5} className="p-4 text-center text-slate-500">Nenhuma despesa cadastrada.</td></tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                  <td className="p-4 text-slate-400">{new Date(expense.date).toLocaleDateString()}</td>
                  <td className="p-4 font-medium">{expense.description}</td>
                  <td className="p-4 text-slate-400">{expense.category || '-'}</td>
                  <td className="p-4 text-rose-400 font-semibold">R$ {expense.amount.toFixed(2)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(expense.id)}
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
