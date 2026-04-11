import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
      <section className="rounded-2xl border bg-white p-4 shadow-sm">
        <h2 className="text-lg font-bold text-brand-900">Mi cuenta</h2>
        <p className="mt-1 text-sm text-slate-600">Gestiona tu perfil, pedidos y citas.</p>
        <nav className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account">Resumen</Link>
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account/orders">Pedidos</Link>
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account/appointments">Citas</Link>
          <Link className="rounded-full border border-brand-200 px-4 py-2 hover:bg-brand-50" href="/account/profile">Perfil</Link>
        </nav>
      </section>
      <section>{children}</section>
    </div>
  );
}
