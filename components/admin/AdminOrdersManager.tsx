"use client";

import { useMemo, useState, useTransition } from "react";
import { updateAdminOrder } from "@/app/admin/actions";
import type { Order } from "@/lib/db";

type AdminOrdersManagerProps = {
  initialOrders: Order[];
  mode?: "orders" | "payments" | "shipping" | "sales";
};

function formatCOP(value: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value / 100);
}

const paymentOptions = ["pending_confirmation", "proof_submitted", "confirmed", "rejected"];
const orderStatusOptions = [
  "pending_confirmation",
  "confirmed",
  "preparing_order",
  "order_sent",
  "order_in_route",
  "delivered",
];
const shippingOptions = [
  "pending_confirmation",
  "confirmed",
  "preparing_order",
  "order_sent",
  "order_in_route",
  "delivered",
];

const statusLabels: Record<string, string> = {
  pending_confirmation: "Pendiente de confirmacion",
  confirmed: "Confirmada",
  preparing_order: "Preparando tu orden",
  order_sent: "Pedido enviado",
  order_in_route: "Pedido en ruta",
  delivered: "Entregado",
  proof_submitted: "Comprobante recibido",
  rejected: "Rechazado",
};

export default function AdminOrdersManager({
  initialOrders,
  mode = "orders",
}: AdminOrdersManagerProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredOrders = useMemo(() => {
    if (mode === "payments") {
      return orders.filter((order) => (order.paymentStatus ?? "pending_confirmation") !== "confirmed");
    }
    if (mode === "shipping") {
      return orders.filter((order) => (order.shippingStatus ?? "pending") !== "delivered");
    }
    return orders;
  }, [mode, orders]);

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const handleUpdate = (
    id: string,
    field: "status" | "paymentStatus" | "shippingStatus" | "trackingNumber",
    value: string
  ) => {
    setMessage("");
    startTransition(async () => {
      try {
        const payload =
          field === "trackingNumber"
            ? { trackingNumber: value }
            : { [field]: value };
        const result = await updateAdminOrder(id, payload);
        setOrders((current) =>
          current.map((order) => (order.id === id ? (result.order as Order) : order))
        );
        setMessage("Orden actualizada.");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "No fue posible actualizar la orden.");
      }
    });
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Órdenes visibles</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{filteredOrders.length}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Ventas acumuladas</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">{formatCOP(totalRevenue)}</p>
        </div>
        <div className="rounded-3xl border border-brand-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pendientes</p>
          <p className="mt-2 text-3xl font-extrabold text-brand-900">
            {
              orders.filter((order) =>
                ["pending_confirmation", "confirmed", "preparing_order", "order_sent", "order_in_route"].includes(order.status)
              ).length
            }
          </p>
        </div>
      </section>

      {message ? (
        <p className="rounded-2xl bg-brand-50 px-4 py-3 text-sm text-brand-900">{message}</p>
      ) : null}

      <section className="overflow-hidden rounded-3xl border border-brand-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Orden</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Total</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Estado operativo</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Pago</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Envío</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-600">
                    No hay órdenes para esta vista todavía.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-900">{order.id}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString("es-CO")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-brand-900">{order.customerName}</p>
                      <p className="text-xs text-slate-500">{order.customerEmail}</p>
                      <p className="text-xs text-slate-500">{order.customerPhone}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-brand-900">
                      {formatCOP(order.total)}
                      <p className="mt-1 text-xs font-normal text-slate-500">
                        {order.paymentMethod === "bank_transfer_bancolombia"
                          ? "Consignacion Bancolombia"
                          : order.paymentMethod ?? "Sin definir"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(event) => handleUpdate(order.id, "status", event.target.value)}
                        disabled={isPending}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        {orderStatusOptions.map((option) => (
                          <option key={option} value={option}>
                            {statusLabels[option] ?? option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus ?? "pending"}
                        onChange={(event) =>
                          handleUpdate(order.id, "paymentStatus", event.target.value)
                        }
                        disabled={isPending}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        {paymentOptions.map((option) => (
                          <option key={option} value={option}>
                            {statusLabels[option] ?? option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.shippingStatus ?? "pending"}
                        onChange={(event) =>
                          handleUpdate(order.id, "shippingStatus", event.target.value)
                        }
                        disabled={isPending}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      >
                        {shippingOptions.map((option) => (
                          <option key={option} value={option}>
                            {statusLabels[option] ?? option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        value={order.trackingNumber ?? ""}
                        onChange={(event) =>
                          setOrders((current) =>
                            current.map((item) =>
                              item.id === order.id
                                ? { ...item, trackingNumber: event.target.value }
                                : item
                            )
                          )
                        }
                        onBlur={(event) =>
                          handleUpdate(order.id, "trackingNumber", event.target.value)
                        }
                        placeholder="Guía / tracking"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
