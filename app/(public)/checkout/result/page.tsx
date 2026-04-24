import Link from "next/link";

type ResultPageProps = {
  searchParams: {
    id?: string;
    status?: string;
    reference?: string;
    product?: string;
  };
};

const statusMap: Record<string, { title: string; message: string }> = {
  APPROVED: {
    title: "Pago aprobado",
    message: "Tu pago fue aprobado exitosamente. Te enviaremos la confirmacion de tu pedido y entraremos en produccion artesanal.",
  },
  DECLINED: {
    title: "Pago rechazado",
    message: "El pago fue rechazado. Puedes intentar nuevamente con otro medio de pago.",
  },
  ERROR: {
    title: "Pago con error",
    message: "Hubo un problema procesando el pago. Intenta nuevamente en unos minutos.",
  },
  PENDING: {
    title: "Pago en validacion",
    message: "Estamos validando tu pago. Te notificaremos cuando se confirme.",
  },
};

export default function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const status = searchParams.status || "PENDING";
  const view = statusMap[status] || statusMap.PENDING;

  return (
    <main className="mx-auto max-w-2xl px-4 py-14">
      <section className="rounded-2xl bg-white p-8 shadow ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-brand-900">{view.title}</h1>
        <p className="mt-3 text-slate-700">{view.message}</p>
        <p className="mt-2 text-sm text-slate-600">
          Tiempo estimado de entrega: 5 a 7 dias habiles. Cada producto se elabora de forma personalizada y artesanal, uno a uno y nunca en masa.
        </p>

        <div className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <strong>Estado:</strong> {status}
          </p>
          {searchParams.reference ? (
            <p>
              <strong>Referencia:</strong> {searchParams.reference}
            </p>
          ) : null}
          {searchParams.id ? (
            <p>
              <strong>ID transaccion:</strong> {searchParams.id}
            </p>
          ) : null}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-900"
          >
            Seguir comprando
          </Link>
          <Link
            href="/account/orders"
            className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold text-brand-900 hover:bg-brand-50"
          >
            Ver mis ordenes
          </Link>
        </div>
      </section>
    </main>
  );
}
