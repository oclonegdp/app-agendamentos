import './globals.css';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'App Agendamentos',
  description: 'Sistema de agendamentos',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen bg-slate-100">
          <Sidebar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
