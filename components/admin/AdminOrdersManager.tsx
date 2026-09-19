"use client";
import { useMemo, useState, useTransition } from "react";
import { updateAdminOrder, verifyAdminWompiOrder } from "@/app/admin/actions";
import type { Order } from "@/lib/db";
import { adminStatusLabels as labels, isPaidOrder, isSandboxOrder, formatAdminDate } from "@/lib/admin-order";
const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value / 100);
const operations = ["pending_confirmation", "confirmed", "preparing_order", "order_sent", "order_in_route", "delivered", "cancelled"];
const payments = ["pending_confirmation", "proof_submitted", "confirmed", "rejected"];
function OrderEditor({ order, onSaved }: { order: Order; onSaved: (order: Order) => void }) {
 const sandbox = isSandboxOrder(order);
 const [draft, setDraft] = useState({ status: order.status, paymentStatus: order.paymentStatus ?? "pending_confirmation", shippingStatus: order.shippingStatus ?? "pending_confirmation", trackingNumber: order.trackingNumber ?? "" });
 const [message, setMessage] = useState("");
 const [error, setError] = useState(false);
 const [pending, startTransition] = useTransition();
 const original = { status: order.status, paymentStatus: order.paymentStatus ?? "pending_confirmation", shippingStatus: order.shippingStatus ?? "pending_confirmation", trackingNumber: order.trackingNumber ?? "" };
 const changed = Object.keys(draft).some(key => draft[key as keyof typeof draft] !== original[key as keyof typeof draft]);
 const select = (field: "status" | "paymentStatus" | "shippingStatus", title: string, values: string[]) => <label className="grid gap-2 text-sm font-medium">{title}<select value={draft[field]} onChange={e => setDraft({ ...draft, [field]: e.target.value })} disabled={pending || sandbox} className="rounded-xl border border-slate-300 bg-white p-3">{!values.includes(draft[field]) && <option value={draft[field]}>{labels[draft[field]] ?? "Estado anterior · revisar"}</option>}{values.map(value => <option key={value} value={value}>{labels[value]}</option>)}</select></label>;
 return <form onSubmit={event => { event.preventDefault(); setMessage(""); setError(false); startTransition(async()=>{try { const patch = Object.fromEntries(Object.entries(draft).filter(([key,value]) => value !== original[key as keyof typeof original])); const result = await updateAdminOrder(order.id, patch); if (!result.order) throw new Error("No se pudo recuperar el pedido."); onSaved(result.order); setMessage("Cambios guardados."); } catch(e) { setError(true); setMessage(e instanceof Error ? e.message : "No pudimos guardar. Tus cambios siguen aquí."); } }); }} className="mt-5 border-t border-slate-200 pt-5">
  {sandbox && <p className="mb-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-950">Simulación Wompi: no representa dinero recibido y no debe despacharse. El estado del proveedor se recibe por webhook.</p>}
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{select("status", "Estado del pedido", operations)}{select("paymentStatus", "Pago real · validación manual", payments)}{select("shippingStatus", "Estado del envío", operations.filter(x=>x!=="cancelled"))}<label className="grid gap-2 text-sm font-medium">Número de guía<input value={draft.trackingNumber} onChange={e=>setDraft({...draft,trackingNumber:e.target.value})} maxLength={100} disabled={pending || sandbox} className="rounded-xl border border-slate-300 p-3" placeholder="Sin guía asignada" /></label></div>
  {!sandbox && <p className="mt-3 text-sm text-slate-600">Confirma el pago solo después de verificar su recepción. Cambiar el pedido no confirma el pago ni el envío. Los cambios se aplican al guardar.</p>}
  <div className="mt-4 flex flex-wrap items-center gap-3"><button disabled={!changed || pending || sandbox} className="rounded-full bg-brand-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{pending ? "Guardando…" : "Guardar cambios"}</button><button type="button" disabled={!changed || pending} onClick={()=>{setDraft(original);setMessage("");}} className="rounded-full border border-slate-300 px-5 py-3 disabled:opacity-50">Descartar cambios</button><p role={error ? "alert" : "status"} className={error ? "text-red-700" : "text-brand-900"}>{message}</p></div>
 </form>;
}
function WompiReview({ order, onSaved }: { order: Order; onSaved: (order: Order) => void }) {
 const [id, setId] = useState(order.wompiTransactionId ?? "");
 const [message, setMessage] = useState("");
 const [pending, startTransition] = useTransition();
 return <form className="mt-6 rounded-xl bg-slate-50 p-4" onSubmit={e=>{e.preventDefault();startTransition(async()=>{try{const result=await verifyAdminWompiOrder(order.id,id);if(result.order)onSaved(result.order);setMessage("Estado consultado y guardado desde Wompi. Es una prueba, sin cobro real.");}catch(error){setMessage(error instanceof Error?error.message:"No pudimos verificar. Intenta nuevamente.");}});}}><label className="grid gap-2 text-sm font-medium">Verificar transacción de Wompi · pruebas<input value={id} onChange={e=>setId(e.target.value)} required maxLength={100} pattern="[a-zA-Z0-9-]+" placeholder="ID de transacción de Wompi" className="rounded-xl border border-slate-300 p-3" /></label><p className="mt-2 text-sm text-slate-600">Consulta el estado y comprueba importe y referencia. No genera cobros; permite recuperar una confirmación que no llegó por webhook.</p><button disabled={pending} className="mt-3 rounded-full border border-brand-900 px-5 py-3 font-semibold">{pending?"Consultando…":"Consultar y guardar estado"}</button><p role="status" className="mt-3 text-sm">{message}</p></form>;
}
export default function AdminOrdersManager({ initialOrders, mode = "orders" }: { initialOrders: Order[]; mode?: "orders" | "payments" | "shipping" | "sales" }) {
 const [orders, setOrders] = useState(initialOrders);
 const [query, setQuery] = useState("");
 const [limit, setLimit] = useState(20);
 const [filter, setFilter] = useState(mode === "payments" ? "pending" : mode === "shipping" ? "shipping" : "all");
 const filtered = useMemo(()=>orders.filter(order=>{
  const text = [order.id,order.customerName,order.customerEmail,order.customerPhone,order.wompiTransactionId,order.trackingNumber].join(" ").toLocaleLowerCase("es");
  if (!text.includes(query.trim().toLocaleLowerCase("es"))) return false;
  if (filter === "sandbox") return isSandboxOrder(order);
  if (filter === "paid") return isPaidOrder(order);
  if (filter === "pending") return !isSandboxOrder(order) && !isPaidOrder(order) && order.status !== "cancelled";
  if (filter === "shipping") return isPaidOrder(order) && order.shippingStatus !== "delivered" && order.status !== "cancelled";
  return true;
 }).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()),[orders,query,filter]);
 const revenue = orders.filter(isPaidOrder).reduce((sum,order)=>sum+order.total,0);
 return <div className="space-y-6">
  <section aria-label="Resumen de pedidos" className="grid gap-4 sm:grid-cols-3">{[["Pedidos registrados",orders.length],["Cobros reales confirmados",money(revenue)],["Simulaciones Wompi",orders.filter(isSandboxOrder).length]].map(([label,value])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-600">{label}</p><p className="mt-2 text-3xl font-bold text-brand-900">{value}</p></div>)}</section>
  <section aria-label="Buscar y filtrar pedidos" className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 md:grid-cols-[2fr_1fr_auto]"><label className="grid gap-2 text-sm font-medium">Buscar pedido<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Referencia, cliente, correo, transacción o guía" className="min-w-0 rounded-xl border border-slate-300 p-3" /></label><label className="grid gap-2 text-sm font-medium">Mostrar<select value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white p-3"><option value="all">Todos los pedidos</option><option value="pending">Pagos reales por verificar</option><option value="paid">Pagos reales confirmados</option><option value="sandbox">Wompi · solo pruebas</option><option value="shipping">Pagados · envío pendiente</option></select></label><button type="button" onClick={()=>{setQuery("");setFilter("all");}} className="self-end rounded-full border border-slate-300 px-5 py-3">Limpiar filtros</button></section>
  <p role="status" className="text-sm text-slate-600">{filtered.length} de {orders.length} pedidos · más recientes primero</p>
  {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-lg font-semibold">No hay pedidos en esta vista</h2><p className="mt-2 text-slate-600">Prueba otro filtro o busca una referencia distinta. Las simulaciones están en «Wompi · solo pruebas».</p></div>}
  {filtered.slice(0,limit).map(order=><article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="break-all font-bold text-brand-900">Pedido {order.id}</h2><p className="mt-1 text-sm text-slate-600">{formatAdminDate(order.createdAt)} · Colombia</p></div><strong className="text-xl">{money(order.total)}</strong></div>
  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4"><div><dt className="text-slate-500">Cliente</dt><dd className="break-words font-medium">{order.customerName}</dd><dd className="break-all">{order.customerEmail}</dd><dd>{order.customerPhone}</dd></div><div><dt className="text-slate-500">Método</dt><dd className="font-semibold">{isSandboxOrder(order) ? "Wompi · pruebas" : order.paymentMethod === "bank_transfer_bancolombia" ? "Transferencia Bancolombia" : "No registrado · requiere revisión"}</dd></div><div><dt className="text-slate-500">Pago</dt><dd className="font-semibold">{isSandboxOrder(order) ? (labels[`sandbox_${order.wompiStatus?.toLowerCase()}`] ?? labels[order.paymentStatus ?? ""] ?? "Sin confirmación de Wompi") : labels[order.paymentStatus ?? "pending_confirmation"] ?? "Estado por revisar"}</dd>{isSandboxOrder(order) && <dd className="text-amber-800">No es un cobro real</dd>}</div><div><dt className="text-slate-500">Operación / envío</dt><dd>{labels[order.status] ?? "Por revisar"} / {labels[order.shippingStatus ?? "pending_confirmation"] ?? "Por revisar"}</dd></div></dl>
  {order.wompiTransactionId && <p className="mt-4 break-all rounded-xl bg-slate-50 p-3 text-sm">Transacción Wompi: {order.wompiTransactionId}</p>}
  <details className="mt-4"><summary className="cursor-pointer rounded-lg py-3 font-semibold text-brand-900">Revisar y gestionar pedido</summary><WompiReview order={order} onSaved={updated=>setOrders(current=>current.map(item=>item.id===updated.id?updated:item))} /><OrderEditor order={order} onSaved={updated=>setOrders(current=>current.map(item=>item.id===updated.id?updated:item))} /></details>
  </article>)}
 {filtered.length > limit && <button type="button" className="rounded-full border border-brand-900 px-6 py-3 font-semibold" onClick={()=>setLimit(value=>value+20)}>Mostrar 20 pedidos más</button>}
 </div>;
}
