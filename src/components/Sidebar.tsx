'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/dashboard/appointments', label: 'Agendamentos' },
    { href: '/dashboard/clients', label: 'Clientes' },
    { href: '/dashboard/services', label: 'Serviços' },
    { href: '/dashboard/expenses', label: 'Despesas' },
    { href: '/dashboard/stock', label: 'Estoque' },
    { href: '/dashboard/company', label: 'Empresa' },
    { href: '/logout', label: 'Sair' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-4 flex flex-col justify-between">
      <div>
        <h1 className="text-xl font-bold mb-6 px-2 text-indigo-400">Painel de Controle</h1>
        <nav className="space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded transition-colors ${
                  isActive ? 'bg-indigo-600 text-white font-medium' : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="px-2 text-sm text-slate-500">
        Sistema v1.0
      </div>
    </aside>
  );
}
