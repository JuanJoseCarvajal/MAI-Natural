import { bancolombiaConfig, formatWhatsappLink } from "@/lib/bank-transfer";
import { sendTransactionalEmail } from "@/lib/email";

export type CheckoutOrderItem = {
  id: string;
  name: string;
  quantity: number;
  amountInCents: number;
  price: string;
};

export const orderStatusLabels: Record<string, string> = {
  pending_confirmation: "Pendiente de confirmacion",
  confirmed: "Confirmada",
  preparing_order: "Preparando tu orden",
  order_sent: "Pedido enviado",
  order_in_route: "Pedido en ruta",
  delivered: "Entregado",
};

export const paymentStatusLabels: Record<string, string> = {
  pending_confirmation: "Pendiente de confirmacion",
  proof_submitted: "Comprobante recibido",
  confirmed: "Pago confirmado",
  rejected: "Comprobante rechazado",
};

export function formatCOP(valueInCents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valueInCents / 100);
}

export async function sendOrderPendingConfirmationEmail(input: {
  customerEmail: string;
  customerName: string;
  orderId: string;
  totalInCents: number;
  items: CheckoutOrderItem[];
}) {
  const steps = ["Espera nuestra confirmación de disponibilidad, costo de envío y valor final.", "Acepta el total final antes de transferir.", "Comparte el comprobante para validar tu pago."];
  const proofWhatsappUrl = formatWhatsappLink(
    bancolombiaConfig.proofWhatsapp,
    `Hola MAI, ya hice la consignacion del pedido ${input.orderId} y quiero enviar el comprobante.`
  );

  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]!));
  const itemsHtml = input.items
    .map(
      (item) =>
        `<li>${escapeHtml(item.name)} x${item.quantity} - ${formatCOP(item.amountInCents * item.quantity)}</li>`
    )
    .join("");

  const itemsText = input.items
    .map((item) => `- ${item.name} x${item.quantity}: ${formatCOP(item.amountInCents * item.quantity)}`)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #163528; line-height: 1.6;">
      <h1 style="margin-bottom: 8px;">Tu orden fue creada</h1>
      <p>Hola ${escapeHtml(input.customerName)}, tu pedido <strong>${input.orderId}</strong> fue creado con estado <strong>Pendiente de confirmacion</strong>.</p>
      <p><strong>Importante:</strong> esto confirma la creacion de la orden, pero el pago aun no esta confirmado.</p>
      <p>Subtotal de productos (envío por confirmar): <strong>${formatCOP(input.totalInCents)}</strong></p>
      <h2 style="margin-top: 24px;">Productos</h2>
      <ul>${itemsHtml}</ul>
      <h2 style="margin-top: 24px;">Como completar tu compra</h2>
      <ol>${steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      <p>Antes de transferir, espera la confirmación del envío y el valor final. Te compartiremos los datos de pago junto con esa confirmación.</p>
      <h2 style="margin-top: 24px;">Enviar comprobante</h2>
      <p>Cuando realices la consignacion, envia el comprobante por alguno de estos canales:</p>
      <p><strong>Correo:</strong> ${bancolombiaConfig.proofEmail}</p>
      <p><strong>WhatsApp:</strong> ${bancolombiaConfig.proofWhatsapp}</p>
      <p><a href="${proofWhatsappUrl}">Enviar comprobante por WhatsApp</a></p>
    </div>
  `;

  const text = [
    `Hola ${input.customerName}, tu pedido ${input.orderId} fue creado con estado Pendiente de confirmacion.`,
    "Esto confirma la creacion de la orden, pero el pago aun no esta confirmado.",
    `Subtotal de productos, envío por confirmar: ${formatCOP(input.totalInCents)}`,
    "",
    "Productos:",
    itemsText,
    "",
    "Como completar tu compra:",
    ...steps,
    "",
    "Espera la confirmación del envío, valor final y datos de pago antes de transferir.",
    "",
    "Enviar comprobante:",
    `Correo: ${bancolombiaConfig.proofEmail}`,
    `WhatsApp: ${bancolombiaConfig.proofWhatsapp}`,
    `Link WhatsApp: ${proofWhatsappUrl}`,
  ]
    .filter(Boolean)
    .join("\n");

  return sendTransactionalEmail({
    to: input.customerEmail,
    subject: `Pedido ${input.orderId} recibido - envío por confirmar`,
    html,
    text,
  });
}
