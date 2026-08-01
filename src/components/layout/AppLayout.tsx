"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Scissors,
  Wallet,
  Package,
  Settings,
  Menu,
  X,
  LogOut,
  Zap,
  Cpu,
} from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/dashboard/appointments", icon: CalendarDays },
  { name: "Clientes", href: "/dashboard/clients", icon: Users },
  { name: "Serviços", href: "/dashboard/services", icon: Scissors },
  { name: "Caixa", href: "/dashboard/cash", icon: Wallet },
  { name: "Assistente IA", href: "/dashboard/assistant", icon: Zap },
  { name: "Empresa", href: "/dashboard/company", icon: Settings },
];

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const logout = () => {
    window.location.href = "/logout";
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-zinc-950">
      <aside className="hidden md:flex md:w-64 flex-col fixed inset-y-0 z-30 border-r border-zinc-800/80 bg-zinc-900/50 backdrop-blur-xl">
        <div className="flex h-16 items-center px-6 border-b border-zinc-800/80">
          <span className="text-lg font-bold tracking-tight text-emerald-400 flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span>
            SaaS Manager
          </span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800/80">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3.5 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors active:scale-95"
          >
            <LogOut className="h-5 w-5" />
            Sair da Conta
          </button>
        </div>
      </aside>

      <header className="md:hidden flex h-16 items-center justify-between px-4 border-b border-zinc-800/80 bg-zinc-900/80 backdrop-blur-md sticky top-0 z-30">
        <span className="text-base font-bold tracking-tight text-emerald-400 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
          SaaS Manager
        </span>

        <button
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 active:scale-95 transition-transform"
          aria-label="Menu"
        >
          {mobileDrawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 right-0 z-50 w-72 bg-zinc-900 border-l border-zinc-800 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out md:hidden ${mobileDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div>
          <div className="flex items-center justify-between mb-8">
            <span className="text-base font-bold text-emerald-400">Menu Principal</span>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="h-11 w-11 flex items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 active:scale-95"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-rose-400 bg-rose-500/10 active:scale-95"
        >
          <LogOut className="h-5 w-5" />
          Sair da Conta
        </button>
      </div>

      <main className="flex-1 md:pl-64 flex flex-col min-w-0 pb-24 md:pb-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</div>
      </main>

      <nav aria-label="Navegação inferior" className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-zinc-900/90 backdrop-blur-xl border-t border-zinc-800/80 px-2 py-1.5 flex justify-around items-center">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center h-12 w-14 rounded-xl transition-all active:scale-95 ${
                isActive ? "text-emerald-400 bg-emerald-500/10" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
