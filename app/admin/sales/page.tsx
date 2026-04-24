import { getAllOrders, getAllAdminProducts } from "@/app/admin/actions";

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value / 100);
}

export default async function AdminSalesPage() {
  const [{ orders }, { products }] = await Promise.all([getAllOrders(), getAllAdminProducts()]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const paidOrders = orders.filter((order) => order.status === "paid").length;
  const averageTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const averageProductValue =
    products.length > 0
      ? products.reduce((sum, product) => sum + product.amountInCents, 0) / products.length
      : 0;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Análisis
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Ventas</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          Lectura ejecutiva del desempeño comercial para tomar decisiones de catálogo, pricing y
          operación.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Facturación</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{formatCOP(totalRevenue)}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Órdenes pagadas</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{paidOrders}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ticket promedio</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{formatCOP(averageTicket)}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Precio promedio catálogo</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">
            {formatCOP(averageProductValue)}
          </p>
        </div>
      </section>

      <section className="rounded-3xl border border-brand-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-brand-900">Recomendaciones operativas</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <article className="rounded-2xl bg-brand-50 p-4">
            <p className="font-semibold text-brand-900">Ventas + catálogo</p>
            <p className="mt-2 text-sm text-slate-700">
              Revisa semanalmente qué productos tienen stock bajo y mejor margen antes de activar
              campañas.
            </p>
          </article>
          <article className="rounded-2xl bg-brand-50 p-4">
            <p className="font-semibold text-brand-900">Pagos</p>
            <p className="mt-2 text-sm text-slate-700">
              Centraliza la validación manual de transferencias para no frenar confirmaciones de
              citas ni envíos.
            </p>
          </article>
          <article className="rounded-2xl bg-brand-50 p-4">
            <p className="font-semibold text-brand-900">Producción artesanal</p>
            <p className="mt-2 text-sm text-slate-700">
              Usa el panel para sostener la promesa de 5 a 7 días hábiles y evitar sobreventa por
              inventario.
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
