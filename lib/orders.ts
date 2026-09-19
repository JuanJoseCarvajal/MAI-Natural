
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
  proof_submitted: "Pendiente de revisión",
  confirmed: "Pago confirmado",
  rejected: "Pago rechazado",
};

export function formatCOP(valueInCents: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(valueInCents / 100);
}
