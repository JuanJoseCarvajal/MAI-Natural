'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <div className="w-64 bg-brand-900 text-white flex flex-col">
        <div className="p-6 border-b border-brand-700">
          <h1 className="text-2xl font-bold">Admin MAI</h1>
          <p className="text-sm text-brand-100">Panel de administración</p>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <Link
            href="/admin"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive('/admin') && pathname === '/admin'
                ? 'bg-brand-700 text-white'
                : 'text-brand-100 hover:bg-brand-800'
            }`}
          >
            📊 Dashboard
          </Link>
          <Link
            href="/admin/appointments"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive('/admin/appointments')
                ? 'bg-brand-700 text-white'
                : 'text-brand-100 hover:bg-brand-800'
            }`}
          >
            📅 Citas
          </Link>
          <Link
            href="/admin/orders"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive('/admin/orders')
                ? 'bg-brand-700 text-white'
                : 'text-brand-100 hover:bg-brand-800'
            }`}
          >
            🛒 Órdenes
          </Link>
          <Link
            href="/admin/users"
            className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
              isActive('/admin/users')
                ? 'bg-brand-700 text-white'
                : 'text-brand-100 hover:bg-brand-800'
            }`}
          >
            👥 Usuarios
          </Link>
        </nav>

        <div className="p-6 border-t border-brand-700">
          <Link
            href="/account"
            className="block px-4 py-2 rounded-lg text-sm text-brand-100 hover:bg-brand-800"
          >
            ← Volver a mi cuenta
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8 max-w-6xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
