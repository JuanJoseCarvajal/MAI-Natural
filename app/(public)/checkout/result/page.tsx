import WompiPaymentButton from "@/components/features/payments/WompiPaymentButton";
import { fetchWompiTransaction, getWompiConfiguration } from "@/lib/wompi-server";
import Link from "next/link";
import { db } from "@/lib/db";
import { supportWhatsapp, formatWhatsappLink } from "@/lib/contact";
import { formatCOP, orderStatusLabels } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const metadata = { title: "Estado de tu pedido | MAI Natural", robots: { index: false, follow: false } };

export default async function CheckoutResultPage({ searchParams }: { searchParams: Promise<{ orderId?: string; id?: string }> }) {
  const query = await searchParams;
  const order = query.orderId && /^[a-f0-9-]{36}$/.test(query.orderId) ? await db.order.findUnique({ where: { id: query.orderId } }) : null;
  const sandbox = order?.paymentMethod === "wompi_sandbox";
  const wompiOrder = sandbox || order?.paymentMethod === "wompi";
  // Never infer a successful payment from URL status or a redirect alone.
  let sandboxStatus: string | null = null;
  if (order && wompiOrder && query.id && /^[a-zA-Z0-9-]{1,100}$/.test(query.id) && getWompiConfiguration().mode === (sandbox ? "sandbox" : "production")) {
    try {
      const data = await fetchWompiTransaction(query.id);
      if (data.reference === `mai-${order.id}` && data.amount_in_cents === order.total && data.currency === "COP") {
        sandboxStatus = ({ APPROVED: "Prueba aprobada", PENDING: "Prueba pendiente", DECLINED: "Prueba rechazada", ERROR: "Error en la prueba", VOIDED: "Prueba anulada" } as Record<string, string>)[data.status] || "Estado desconocido";
        if (!sandbox) sandboxStatus = sandboxStatus.replace("Prueba", "Transacción").replace("prueba", "transacción");
      } else { sandboxStatus = "La transacción no coincide con este pedido. Contacta al equipo antes de repetirla."; }
    } catch { sandboxStatus = "No pudimos consultar el pago. No vuelvas a pagar mientras verificas el estado."; }
  }
  const whatsapp = formatWhatsappLink(supportWhatsapp, order ? `Hola MAI, quiero confirmar el envío y el total de mi pedido ${order.id}.` : "Hola MAI, necesito ayuda para verificar mi pedido.");
  return <section className="mx-auto max-w-2xl px-5 py-16 md:py-24"><div className="rounded-3xl border border-brand-100 bg-white p-7 md:p-12">
    <p className="text-xs uppercase tracking-[.2em] text-brand-700">{order ? "Pedido recibido" : "Consulta de pedido"}</p><h1 className="mt-4 text-4xl text-brand-900">{order ? "Gracias por elegir cuidarte." : "Verifiquemos tu pedido."}</h1>
    <p className="mt-5 leading-relaxed text-slate-600">{sandbox ? "Tu pedido está listo para una simulación con Wompi. No confirma un pago real ni activa la preparación del envío." : wompiOrder ? (order?.paymentStatus === "confirmed" ? "Tu pago fue confirmado por Wompi. Aquí puedes consultar el estado de tu pedido." : order?.quoteVersion ? "Tu total incluye el envío. Puedes consultar el estado o retomar tu pago con Wompi desde esta página." : "Consulta con el equipo el total de este pedido para completar el pago con Wompi.") : order ? "Este pedido no está disponible para iniciar un pago. Contacta al equipo para revisar su estado." : "No pudimos recuperar este pedido. Si ya lo enviaste o realizaste un pago, contacta al equipo antes de repetirlo."}</p>
    {order && <div className="mt-7 space-y-3 rounded-2xl bg-brand-50 p-5 text-sm"><p className="break-all"><strong>Pedido:</strong> {order.id}</p><p><strong>Estado:</strong> {orderStatusLabels[order.status] || "En revisión"}</p><p><strong>Subtotal de productos:</strong> {formatCOP(order.subtotalInCents ?? order.total)}</p>{order.shippingInCents !== undefined && <><p><strong>Envío:</strong> {formatCOP(order.shippingInCents)}</p><p><strong>Total final:</strong> {formatCOP(order.total)}</p></>}<p>{order.shippingInCents === undefined ? "Envío por confirmar. " : ""} Conserva tu número de pedido.</p></div>}
    {sandboxStatus && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm" role="status">{sandboxStatus}. {sandbox ? "Es una simulación, no confirma un pago real." : "La confirmación definitiva se registra al recibir el evento verificado de Wompi."}</p>}
    {order && wompiOrder && order.status !== "cancelled" && order.paymentStatus !== "confirmed" && !query.id && !order.wompiStatus && (sandbox || order.quoteVersion) && <WompiPaymentButton mode={sandbox ? "sandbox" : "production"} quoteVersion={order.quoteVersion} orderId={order.id} />}
    {wompiOrder && order?.wompiStatus && <p className="mt-5 rounded-xl bg-brand-50 p-4 text-sm">{sandbox ? "Estado de prueba verificado:" : "Estado del pago verificado:"} {({ APPROVED: "aprobado", DECLINED: "rechazado", PENDING: "pendiente", ERROR: "error", VOIDED: "anulado" } as Record<string,string>)[order.wompiStatus] || "en revisión"}. {sandbox ? "No confirma un cobro real." : order.paymentStatus === "paid_needs_review" ? "Recibimos el pago de un pedido cancelado. Contacta al equipo para resolverlo." : "Conserva la referencia de tu pedido."}</p>}
    <a href={whatsapp} target="_blank" rel="noreferrer" className="mt-8 inline-flex w-full justify-center rounded-full bg-brand-900 px-5 py-4 text-center font-semibold text-white">Consultar mi pedido por WhatsApp ↗</a><Link href="/products" className="mt-5 block text-center text-sm text-brand-700 underline">Volver a la tienda</Link>
  </div></section>;
}
