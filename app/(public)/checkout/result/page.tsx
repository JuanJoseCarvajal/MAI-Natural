import WompiPaymentButton from "@/components/features/payments/WompiPaymentButton";
import { fetchWompiTransaction } from "@/lib/wompi-server";
import Link from "next/link";
import { db } from "@/lib/db";
import { bancolombiaConfig, formatWhatsappLink } from "@/lib/bank-transfer";
import { formatCOP, orderStatusLabels } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estado de tu pedido | MAI Natural", robots: { index: false, follow: false } };

export default async function CheckoutResultPage({ searchParams }: { searchParams: Promise<{ orderId?: string; id?: string }> }) {
  const query = await searchParams;
  const order = query.orderId && /^[a-f0-9-]{36}$/.test(query.orderId) ? await db.order.findUnique({ where: { id: query.orderId } }) : null;
  const wompiOrder = order?.paymentMethod === "wompi_sandbox";
  // Never infer a successful payment from URL status or a redirect alone.
  let sandboxStatus: string | null = null;
  if (order && wompiOrder && query.id && /^[a-zA-Z0-9-]{1,100}$/.test(query.id) && process.env.WOMPI_SANDBOX_ENABLED === "true" && process.env.WOMPI_PUBLIC_KEY?.startsWith("pub_test_")) {
    try {
      const data = await fetchWompiTransaction(query.id);
      if (data.reference === `mai-${order.id}` && data.amount_in_cents === order.total && data.currency === "COP") {
        sandboxStatus = ({ APPROVED: "Prueba aprobada", PENDING: "Prueba pendiente", DECLINED: "Prueba rechazada", ERROR: "Error en la prueba", VOIDED: "Prueba anulada" } as Record<string, string>)[data.status] || "Estado de prueba desconocido";
      } else { sandboxStatus = "La transacción no coincide con este pedido. Contacta al equipo antes de repetirla."; }
    } catch { sandboxStatus = "No pudimos consultar la prueba. No vuelvas a pagar mientras verificas el estado."; }
  }
  const whatsapp = formatWhatsappLink(bancolombiaConfig.proofWhatsapp, order ? `Hola MAI, quiero confirmar el envío y el total de mi pedido ${order.id}.` : "Hola MAI, necesito ayuda para verificar mi pedido.");
  return <section className="mx-auto max-w-2xl px-5 py-16 md:py-24"><div className="rounded-3xl border border-brand-100 bg-white p-7 md:p-12">
    <p className="text-xs uppercase tracking-[.2em] text-brand-700">{order ? "Pedido recibido" : "Consulta de pedido"}</p><h1 className="mt-4 text-4xl text-brand-900">{order ? "Gracias por elegir cuidarte." : "Verifiquemos tu pedido."}</h1>
    <p className="mt-5 leading-relaxed text-slate-600">{wompiOrder ? "Tu pedido está listo para una simulación con Wompi. No confirma un pago real ni activa la preparación del envío." : order ? "Recibimos tu selección. Te contactaremos para confirmar disponibilidad, envío y el valor final antes de la transferencia." : "No pudimos recuperar este pedido. Si ya lo enviaste o realizaste un pago, contacta al equipo antes de repetirlo."}</p>
    {order && <div className="mt-7 space-y-3 rounded-2xl bg-brand-50 p-5 text-sm"><p className="break-all"><strong>Pedido:</strong> {order.id}</p><p><strong>Estado:</strong> {orderStatusLabels[order.status] || "En revisión"}</p><p><strong>Subtotal de productos:</strong> {formatCOP(order.total)}</p><p>Envío por confirmar. Conserva tu número de pedido.</p></div>}
    {sandboxStatus && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm" role="status">Sandbox · {sandboxStatus}. Es una simulación, no confirma un pago real.</p>}
    {order && wompiOrder && !query.id && !order.wompiStatus && <WompiPaymentButton orderId={order.id} />}
    {wompiOrder && order?.wompiStatus && <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm">Estado de prueba verificado: {({ APPROVED: "aprobado", DECLINED: "rechazado", PENDING: "pendiente", ERROR: "error", VOIDED: "anulado" } as Record<string,string>)[order.wompiStatus] || "en revisión"}. No confirma un cobro real.</p>}
    {!wompiOrder && <ol className="mt-8 space-y-5 text-sm text-slate-600"><li><strong className="text-brand-900">1. Confirmamos tu entrega.</strong><br />Revisa el costo de envío y acepta el total final.</li><li><strong className="text-brand-900">2. Te compartimos los datos de pago.</strong><br />Transfiere solo cuando tengas el valor final confirmado.</li><li><strong className="text-brand-900">3. Validamos tu comprobante.</strong><br />Te informaremos cuando el pago esté confirmado y preparemos tu pedido.</li></ol>}
    <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-full justify-center rounded-full bg-brand-900 px-5 py-4 text-center font-semibold text-white">Consultar mi pedido por WhatsApp ↗</a><Link href="/products" className="mt-5 block text-center text-sm text-brand-700 underline">Volver a la tienda</Link>
  </div></section>;
}
