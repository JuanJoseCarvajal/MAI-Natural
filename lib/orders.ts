import { bancolombiaConfig, formatWhatsappLink, getOrderPaymentSteps } from "@/lib/bank-transfer";
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
  const steps = getOrderPaymentSteps();
  const proofWhatsappUrl = formatWhatsappLink(
    bancolombiaConfig.proofWhatsapp,
    `Hola MAI, ya hice la consignacion del pedido ${input.orderId} y quiero enviar el comprobante.`
  );

  const itemsHtml = input.items
    .map(
      (item) =>
        `<li>${item.name} x${item.quantity} - ${formatCOP(item.amountInCents * item.quantity)}</li>`
    )
    .join("");

  const itemsText = input.items
    .map((item) => `- ${item.name} x${item.quantity}: ${formatCOP(item.amountInCents * item.quantity)}`)
    .join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; color: #163528; line-height: 1.6;">
      <h1 style="margin-bottom: 8px;">Tu orden fue creada</h1>
      <p>Hola ${input.customerName}, tu pedido <strong>${input.orderId}</strong> fue creado con estado <strong>Pendiente de confirmacion</strong>.</p>
      <p><strong>Importante:</strong> esto confirma la creacion de la orden, pero el pago aun no esta confirmado.</p>
      <p>Total de la orden: <strong>${formatCOP(input.totalInCents)}</strong></p>
      <h2 style="margin-top: 24px;">Productos</h2>
      <ul>${itemsHtml}</ul>
      <h2 style="margin-top: 24px;">Como completar tu compra</h2>
      <ol>${steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      <h2 style="margin-top: 24px;">Datos Bancolombia</h2>
      <p><strong>Banco:</strong> ${bancolombiaConfig.bankName}</p>
      <p><strong>Tipo de cuenta:</strong> ${bancolombiaConfig.accountType}</p>
      <p><strong>Numero de cuenta:</strong> ${bancolombiaConfig.accountNumber || "Pendiente por configurar"}</p>
      <p><strong>Titular:</strong> ${bancolombiaConfig.accountHolder || "Pendiente por configurar"}</p>
      ${
        bancolombiaConfig.qrUrl
          ? `<p><a href="${bancolombiaConfig.qrUrl}">Pagar con QR Bancolombia</a></p>`
          : ""
      }
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
    `Total: ${formatCOP(input.totalInCents)}`,
    "",
    "Productos:",
    itemsText,
    "",
    "Como completar tu compra:",
    ...steps,
    "",
    "Datos Bancolombia:",
    `Banco: ${bancolombiaConfig.bankName}`,
    `Tipo de cuenta: ${bancolombiaConfig.accountType}`,
    `Numero de cuenta: ${bancolombiaConfig.accountNumber || "Pendiente por configurar"}`,
    `Titular: ${bancolombiaConfig.accountHolder || "Pendiente por configurar"}`,
    bancolombiaConfig.qrUrl ? `QR: ${bancolombiaConfig.qrUrl}` : "",
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
    subject: `Orden ${input.orderId} creada - pendiente de consignacion`,
    html,
    text,
  });
}
