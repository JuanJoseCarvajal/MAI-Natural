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
  proof_submitted: 'Comprobante recibido',
  confirmed: 'Pago confirmado',
  rejected: 'Comprobante rechazado',
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
    db.appointment.findMany({ where: { email } }),
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
        <h1 className="text-2xl font-bold text-brand-900">Historial de pedidos y citas</h1>
        <p className="mt-2 max-w-3xl text-slate-700">
          Desde aquí puedes seguir el estado de tus pedidos de productos y revisar el estado de
          tus citas agendadas.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-brand-900">Pedidos de productos</h2>
            <p className="text-sm text-slate-600">
              Estados disponibles: preparando orden, pedido enviado, pedido en ruta y entregado.
            </p>
          </div>
          <Link
            href="/products"
            className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Comprar productos
          </Link>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-brand-100">
            <p className="text-slate-700">Aún no tienes pedidos de productos registrados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order) => {
              const status = order.shippingStatus ?? order.status;
              return (
                <article key={order.id} className="rounded-2xl bg-white p-5 shadow ring-1 ring-brand-100">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-semibold text-brand-900">Pedido {order.id}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        Creado el {new Date(order.createdAt).toLocaleDateString('es-CO')}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">
                        Total: <strong>{formatCOP(order.total)}</strong>
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Pago: <strong>Consignacion Bancolombia</strong>
                      </p>
                      {order.trackingNumber ? (
                        <p className="mt-1 text-sm text-slate-600">
                          Guía: <strong>{order.trackingNumber}</strong>
                        </p>
                      ) : null}
                      {order.proofInstructions ? (
                        <p className="mt-2 text-sm text-slate-600">{order.proofInstructions}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-900">
                        {orderStatusLabels[status] ?? status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                        Pago: {paymentStatusLabels[order.paymentStatus ?? 'pending_confirmation'] ?? order.paymentStatus ?? 'pendiente'}
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
            <h2 className="text-xl font-bold text-brand-900">Historial de citas</h2>
            <p className="text-sm text-slate-600">
              Aquí ves el estado de tus agendamientos y su validación de pago.
            </p>
          </div>
          <Link
            href="/services"
            className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Agendar cita
          </Link>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow ring-1 ring-brand-100">
            <p className="text-slate-700">Aún no tienes citas registradas.</p>
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
