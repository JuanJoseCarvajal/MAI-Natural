import Link from "next/link";
import { bancolombiaConfig, formatWhatsappLink, getOrderPaymentSteps } from "@/lib/bank-transfer";
import { orderStatusLabels } from "@/lib/orders";

type ResultPageProps = {
  searchParams: {
    orderId?: string;
    status?: string;
  };
};

export default function CheckoutResultPage({ searchParams }: ResultPageProps) {
  const status = searchParams.status || "pending_confirmation";
  const orderId = searchParams.orderId || "pendiente";
  const proofWhatsappUrl = formatWhatsappLink(
    bancolombiaConfig.proofWhatsapp,
    `Hola MAI, ya hice la consignacion del pedido ${orderId} y quiero enviar mi comprobante.`
  );
  const steps = getOrderPaymentSteps();

  return (
    <main className="mx-auto max-w-3xl px-4 py-14">
      <section className="rounded-2xl bg-white p-8 shadow ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-700">
          Orden creada
        </p>
        <h1 className="mt-2 text-3xl font-bold text-brand-900">Tu pedido ya existe, ahora falta pagar la consignacion</h1>
        <p className="mt-3 text-slate-700">
          La orden fue creada correctamente y quedo en estado{" "}
          <strong>{orderStatusLabels[status] ?? status}</strong>. Esto no significa que el pago ya
          este confirmado.
        </p>

        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <p>
            <strong>Pedido:</strong> {orderId}
          </p>
          <p className="mt-2">
            <strong>Estado actual:</strong> {orderStatusLabels[status] ?? status}
          </p>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <div key={step} className="rounded-2xl border border-brand-100 bg-brand-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
                Paso {index + 1}
              </p>
              <p className="mt-2 text-sm font-semibold text-brand-900">
                {step.replace(/^Paso \d:\s*/, "")}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-brand-100 p-5">
            <h2 className="text-lg font-bold text-brand-900">Realizar consignacion</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>Banco:</strong> {bancolombiaConfig.bankName}</p>
              <p><strong>Tipo de cuenta:</strong> {bancolombiaConfig.accountType}</p>
              <p><strong>Numero:</strong> {bancolombiaConfig.accountNumber || "Por configurar"}</p>
              <p><strong>Titular:</strong> {bancolombiaConfig.accountHolder || "Por configurar"}</p>
            </div>
            {bancolombiaConfig.qrUrl ? (
              <a
                href={bancolombiaConfig.qrUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-brand-700 hover:underline"
              >
                Abrir QR Bancolombia
              </a>
            ) : null}
          </div>

          <div className="rounded-2xl border border-brand-100 p-5">
            <h2 className="text-lg font-bold text-brand-900">Enviar comprobante</h2>
            <p className="mt-3 text-sm text-slate-600">
              Cuando termines la consignacion, comparte el comprobante por cualquiera de estos
              canales.
            </p>
            <div className="mt-3 space-y-2 text-sm text-slate-700">
              <p><strong>Correo:</strong> {bancolombiaConfig.proofEmail}</p>
              <p><strong>WhatsApp:</strong> {bancolombiaConfig.proofWhatsapp}</p>
            </div>
            <a
              href={proofWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex rounded-full border border-[#1f9d58] px-5 py-2.5 text-sm font-bold text-[#1f9d58] transition hover:bg-[#1f9d58] hover:text-white"
            >
              Enviar comprobante por WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-8 text-sm text-slate-600">
          Tiempo estimado de entrega: 5 a 7 dias habiles. Cada producto se elabora de forma
          personalizada y artesanal, uno a uno y nunca en masa.
        </p>

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
