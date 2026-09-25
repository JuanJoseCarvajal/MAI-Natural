
import { SiteText } from "@/components/common/SiteText";
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

const orderStatusLabels: Record<string, string> = {
  pending_confirmation: 'Pendiente de confirmacion',
  confirmed: 'Confirmada',
  preparing_order: 'Preparando tu orden',
  order_sent: 'Pedido enviado',
  order_in_route: 'Pedido en ruta',
  delivered: 'Entregado',
};

const appointmentStatusLabels: Record<string, string> = {
  pending_payment: 'Pendiente de pago',
  payment_pending_verification: 'Pago en validación',
  confirmed: 'Confirmada',
  cancelled: 'Cancelada',
  expired_payment_window: 'Ventana de pago vencida',
};

const paymentStatusLabels: Record<string, string> = {
  pending_confirmation: 'Pendiente de confirmacion',
  proof_submitted: 'Pendiente de revisión',
  confirmed: 'Pago confirmado',
  rejected: 'Pago rechazado',
};

function formatCOP(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value / 100);
}

export default async function AccountOrdersPage() {
  const session = await auth();
  const email = session?.user?.email;
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!session?.user || !email || !userId) {
    redirect('/login?callbackUrl=/account/orders');
  }

  const [orders, appointments] = await Promise.all([
    db.order.findMany({ where: { userId } }),
    db.appointment.findMany({ where: { userId } }),
  ]);

  const sortedOrders = [...orders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-brand-900"><SiteText id="2340201ea790f21011c6">{"Historial de pedidos y citas"}</SiteText></h1>
        <p className="mt-2 max-w-3xl text-slate-700"><SiteText id="2d48db65ff87170a9408">{"Desde aquí puedes seguir el estado de tus pedidos de productos y revisar el estado de tus citas agendadas."}</SiteText></p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-900"><SiteText id="252eb4a745c8fc8817f2">{"Pedidos de productos"}</SiteText></h2>
            <p className="text-sm text-slate-600"><SiteText id="8ec302a2279ec3557d25">{"Estados disponibles: preparando orden, pedido enviado, pedido en ruta y entregado."}</SiteText></p>
          </div>
          <Link
            href="/products"
            className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          ><SiteText id="ff42a867555715db0c3b">{"Comprar productos"}</SiteText></Link>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-brand-100">
            <p className="text-slate-700"><SiteText id="7e76f96324e237adf7c9">{"Aún no tienes pedidos de productos registrados."}</SiteText></p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const status = order.shippingStatus ?? order.status;
              return (
                <article key={order.id} className="rounded-2xl bg-white p-5 shadow ring-1 ring-brand-100">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-brand-900"><SiteText id="27325662b26d2c2fae95">{"Pedido "}</SiteText>{order.id}</p>
                      <p className="mt-1 text-sm text-slate-600"><SiteText id="ca3ef0cd774cd3460267">{"Creado el "}</SiteText>{new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </p>
                      <p className="mt-2 text-sm text-slate-700"><SiteText id="f81effe39987cea32e38">{"Total: "}</SiteText><strong>{formatCOP(order.total)}</strong>
                      </p>
                      <p className="mt-1 text-sm text-slate-600"><SiteText id="0484a73ab58b1f566da1">{"Pago: "}</SiteText><strong>{order.paymentMethod === "wompi_sandbox" ? "Wompi · simulación sin cobro real" : order.paymentMethod === "wompi" ? "Wompi · pago real" : "Pago no disponible · consultar al equipo"}</strong>
                      </p>
                      {order.trackingNumber ? (
                        <p className="mt-1 text-sm text-slate-600"><SiteText id="bde6dc717f7aba6717af">{"Guía: "}</SiteText><strong>{order.trackingNumber}</strong>
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-900">
                        {orderStatusLabels[status] ?? status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700"><SiteText id="0484a73ab58b1f566da1">{"Pago: "}</SiteText>{paymentStatusLabels[order.paymentStatus ?? 'pending_confirmation'] ?? order.paymentStatus ?? 'pendiente'}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="historial-citas" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-900"><SiteText id="a95e291c0cd2d0c21b7d">{"Historial de citas"}</SiteText></h2>
            <p className="text-sm text-slate-600"><SiteText id="2cff25dc9af1cdbab166">{"Aquí ves el estado de tus agendamientos y su validación de pago."}</SiteText></p>
          </div>
          <Link
            href="/services"
            className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          ><SiteText id="4ac10eca86709fb8f294">{"Agendar cita"}</SiteText></Link>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-brand-100">
            <p className="text-slate-700"><SiteText id="46af679a3e333f208116">{"Aún no tienes citas registradas."}</SiteText></p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => (
              <article
                key={appointment.id}
                className="rounded-2xl bg-white p-5 shadow ring-1 ring-brand-100"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="font-semibold text-brand-900">{appointment.service}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {new Date(appointment.date).toLocaleDateString('es-CO')} · {appointment.time}
                    </p>
                    <p className="mt-2 text-sm text-slate-700">{appointment.email}</p>
                    {appointment.notes ? (
                      <p className="mt-2 text-sm text-slate-600">{appointment.notes}</p>
                    ) : null}
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-900">
                    {appointmentStatusLabels[appointment.status] ?? appointment.status}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
