import { z } from "zod";
import type { Order } from "./db";
export const adminStatusLabels: Record<string, string> = {
 paid_needs_review: "Pago recibido · revisar cancelación", pending: "Pendiente", pending_confirmation: "Por confirmar", confirmed: "Confirmado", paid: "Pagado", preparing_order: "En preparación", order_sent: "Enviado", order_in_route: "En tránsito", delivered: "Entregado", cancelled: "Cancelado", rejected: "Rechazado", proof_submitted: "Comprobante recibido", pending_payment: "Pago pendiente", payment_initiated: "Pago iniciado", payment_pending_verification: "Comprobante por verificar", expired_payment_window: "Plazo de pago vencido", sandbox_approved: "Prueba aprobada", sandbox_pending: "Prueba pendiente", sandbox_declined: "Prueba rechazada", sandbox_error: "Error de prueba", sandbox_voided: "Prueba anulada",
};
export const isSandboxOrder = (order: Pick<Order, "paymentMethod" | "paymentStatus" | "wompiStatus">) => order.paymentMethod === "wompi_sandbox" || (order.paymentMethod !== "wompi" && Boolean(order.wompiStatus)) || Boolean(order.paymentStatus?.startsWith("sandbox_"));
export const isPaidOrder = (order: Order) => !isSandboxOrder(order) && order.paymentStatus === "confirmed";
export const orderPatchSchema = z.object({
 status: z.enum(["pending_confirmation", "confirmed", "preparing_order", "order_sent", "order_in_route", "delivered", "cancelled"]).optional(),
 paymentStatus: z.enum(["pending_confirmation", "proof_submitted", "confirmed", "rejected"]).optional(),
 shippingStatus: z.enum(["pending_confirmation", "confirmed", "preparing_order", "order_sent", "order_in_route", "delivered"]).optional(),
 trackingNumber: z.string().trim().max(100).optional(),
 notes: z.string().trim().max(2000).optional(),
}).strict();
export function validateOrderPatch(order: Order, input: unknown) {
 const result = orderPatchSchema.safeParse(input);
 if (!result.success) throw new Error("Revisa los estados y la longitud de la guía. El método de pago solo cambia mediante una verificación del proveedor.");
 const parsed = result.data;
 const patch = Object.fromEntries(Object.entries(parsed).filter(([,value]) => value !== undefined));
 if (!Object.keys(patch).length) throw new Error("No hay cambios para guardar.");
 if (isSandboxOrder(order) && (patch.paymentStatus || patch.shippingStatus || patch.trackingNumber || (patch.status && patch.status !== "cancelled"))) throw new Error("Wompi de pruebas no confirma pagos reales ni autoriza envíos.");
 if (order.paymentMethod === "wompi" && patch.paymentStatus) throw new Error("El pago Wompi se confirma exclusivamente con el proveedor.");
 const fulfillment = ["preparing_order", "order_sent", "order_in_route", "delivered"];
 if ((fulfillment.includes(String(patch.status)) || fulfillment.includes(String(patch.shippingStatus))) && (patch.paymentStatus ?? order.paymentStatus) !== "confirmed") throw new Error("Confirma primero la recepción del pago real antes de preparar o enviar.");
 return patch;
}

export function formatAdminDate(value: Date | string) {
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return "Fecha no disponible";
 const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
 const get = (type: string) => parts.find(part=>part.type===type)?.value ?? "";
 return `${get("day")}/${get("month")}/${get("year")} ${get("hour")}:${get("minute")}`;
}
