"use client";

import Breadcrumbs from "@/components/common/Breadcrumbs";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Resumen", icon: "📊" },
  { href: "/admin/products", label: "Productos", icon: "🧴" },
  { href: "/admin/inventory", label: "Inventario", icon: "📦" },
  { href: "/admin/orders", label: "Pedidos", icon: "🛒" },
  { href: "/admin/discounts", label: "Descuentos", icon: "🏷️" },
  { href: "/admin/payments", label: "Pagos", icon: "💳" },
  { href: "/admin/shipping", label: "Envíos", icon: "🚚" },
  { href: "/admin/sales", label: "Ventas", icon: "📈" },
  { href: "/admin/appointments", label: "Citas", icon: "📅" },
  { href: "/admin/users", label: "Usuarios", icon: "👥" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path || (path !== "/admin" && pathname.startsWith(path + "/"));

  return (
    <div className="admin-workspace flex min-h-screen bg-slate-100">
      <a href="#admin-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:p-4">Saltar al contenido del panel</a>
      <aside className="hidden w-72 shrink-0 flex-col border-r border-brand-800 bg-brand-900 text-white lg:flex">
        <div className="border-b border-brand-700 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            Backoffice
          </p>
          <p className="mt-2 text-2xl font-bold">Admin MAI</p>
          <p className="mt-1 text-sm text-brand-100">
            Operación, catálogo, ventas y atención.
          </p>
        </div>

        <nav aria-label="Navegación del backoffice" className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-brand-700 text-white"
                  : "text-brand-100 hover:bg-brand-800"
              }`}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-brand-700 p-4">
          <Link
            href="/account"
            className="block rounded-2xl px-4 py-3 text-sm text-brand-100 transition hover:bg-brand-800"
          >
            ← Volver a mi cuenta
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
                Admin MAI
              </p>
              <p className="text-sm text-slate-600">Backoffice operativo</p>
            </div>
            <Link
              href="/account"
              className="rounded-full border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-900"
            >
              Mi cuenta
            </Link>
          </div>
          <nav aria-label="Navegación móvil del backoffice" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
                  isActive(item.href)
                    ? "bg-brand-700 text-white"
                    : "border border-brand-200 bg-white text-brand-900"
                }`}
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <main id="admin-content" tabIndex={-1} className="mx-auto max-w-7xl p-4 md:p-8"><Breadcrumbs />{children}</main>
      </div>
    </div>
  );
}
