import Link from "next/link";
import { getAdminOverview } from "@/app/admin/actions";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value / 100);
}

export default async function AdminPage() {
  const { metrics, appointments, orders, products } = await getAdminOverview();

  const latestAppointments = appointments.slice(-5).reverse();
  const lowStockProducts = products
    .filter((product) => (product.stock ?? 0) <= 5)
    .slice(0, 5);
  const latestOrders = orders.slice(-5).reverse();

  const statCards = [
    { label: "Productos activos", value: metrics.activeProducts, helper: `${metrics.productsCount} en catálogo`, href: "/admin/products", icon: "🧴" },
    { label: "Órdenes", value: metrics.ordersCount, helper: `${metrics.paidOrders} confirmadas`, href: "/admin/orders", icon: "🛒" },
    { label: "Citas", value: metrics.appointmentsCount, helper: `${metrics.pendingPayments} con pago pendiente`, href: "/admin/appointments", icon: "📅" },
    { label: "Usuarios", value: metrics.usersCount, helper: "Base de clientes", href: "/admin/users", icon: "👥" },
    { label: "Inventario bajo", value: metrics.lowStockProducts, helper: "Productos por reponer", href: "/admin/inventory", icon: "📦" },
    { label: "Envíos en curso", value: metrics.shipmentsInProgress, helper: "Seguimiento operativo", href: "/admin/shipping", icon: "🚚" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 p-8 text-white shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
          Panel ejecutivo
        </p>
        <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold md:text-4xl">Backoffice MAI Natural</h1>
            <p className="mt-3 text-sm text-brand-100 md:text-base">
              Controla catálogo, órdenes, pagos, envíos, citas, usuarios e inventario desde una
              sola consola operativa.
            </p>
          </div>
          <div className="rounded-3xl bg-white/12 px-5 py-4 backdrop-blur">
            <p className="text-sm text-brand-100">Ventas acumuladas</p>
            <p className="mt-1 text-3xl font-extrabold">{formatCOP(metrics.totalRevenue)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-3 text-4xl font-extrabold text-brand-900">{card.value}</p>
                <p className="mt-2 text-sm text-slate-600">{card.helper}</p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
                Operación reciente
              </p>
              <h2 className="mt-2 text-2xl font-bold text-brand-900">Últimas citas</h2>
            </div>
            <Link href="/admin/appointments" className="text-sm font-semibold text-brand-700 hover:underline">
              Ver todas
            </Link>
          </div>

          {latestAppointments.length === 0 ? (
            <p className="mt-6 text-sm text-slate-600">
              Aún no hay citas registradas. Cuando entren reservas aparecerán aquí.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {latestAppointments.map((appointment) => (
                <article
                  key={appointment.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-900">{appointment.name}</p>
                      <p className="text-sm text-slate-600">
                        {appointment.service} · {appointment.date} · {appointment.time}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-900 ring-1 ring-brand-100">
                      {appointment.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
                  Alertas
                </p>
                <h2 className="mt-2 text-2xl font-bold text-brand-900">Inventario bajo</h2>
              </div>
              <Link href="/admin/inventory" className="text-sm font-semibold text-brand-700 hover:underline">
                Gestionar
              </Link>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="mt-6 text-sm text-slate-600">
                No hay alertas de inventario. Buen momento para preparar lanzamientos o reposiciones.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50 px-4 py-3">
                    <div>
                      <p className="font-semibold text-brand-900">{product.name}</p>
                      <p className="text-xs text-slate-600">{product.sku || product.id}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                      Stock: {product.stock ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
                  Órdenes recientes
                </p>
                <h2 className="mt-2 text-2xl font-bold text-brand-900">Ventas</h2>
              </div>
              <Link href="/admin/orders" className="text-sm font-semibold text-brand-700 hover:underline">
                Ver órdenes
              </Link>
            </div>

            {latestOrders.length === 0 ? (
              <p className="mt-6 text-sm text-slate-600">
                Aún no hay órdenes registradas. Cuando entren ventas aparecerán aquí.
              </p>
            ) : (
              <div className="mt-6 space-y-3">
                {latestOrders.map((order) => (
                  <article key={order.id} className="rounded-2xl border border-slate-200 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-brand-900">Orden {order.id}</p>
                        <p className="text-sm text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString("es-CO")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-brand-900">{formatCOP(order.total)}</p>
                        <p className="text-xs text-slate-500">{order.status}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/products" className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Catálogo</p>
          <h3 className="mt-2 text-xl font-bold text-brand-900">Crear y editar productos</h3>
          <p className="mt-2 text-sm text-slate-600">Control de precio, stock, SKU y visibilidad.</p>
        </Link>
        <Link href="/admin/payments" className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Pagos</p>
          <h3 className="mt-2 text-xl font-bold text-brand-900">Validar transferencias</h3>
          <p className="mt-2 text-sm text-slate-600">Seguimiento de pagos pendientes y conciliación manual.</p>
        </Link>
        <Link href="/admin/shipping" className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">Envíos</p>
          <h3 className="mt-2 text-xl font-bold text-brand-900">Despacho y tracking</h3>
          <p className="mt-2 text-sm text-slate-600">Prepara, marca y monitorea salidas del taller.</p>
        </Link>
        <Link href="/admin/users" className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm transition hover:shadow-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">CRM</p>
          <h3 className="mt-2 text-xl font-bold text-brand-900">Usuarios y roles</h3>
          <p className="mt-2 text-sm text-slate-600">Visión rápida de clientes y accesos internos.</p>
        </Link>
      </section>
    </div>
  );
}
