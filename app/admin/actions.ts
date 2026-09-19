'use server';

import { fetchWompiTransaction } from '@/lib/wompi-server';
import { isPaidOrder, validateOrderPatch } from '@/lib/admin-order';
import { revalidatePath } from 'next/cache';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import {
  createDiscount,
  deleteDiscount,
  getAllDiscountsForAdmin,
  updateDiscount,
  type AdminDiscountInput,
} from '@/lib/discounts.server';
import {
  createProduct,
  deleteProduct,
  getAllProductsForAdmin,
  updateProduct,
  type AdminProductInput,
} from '@/lib/products.server';

async function ensureAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user || role !== 'admin') {
    throw new Error('No autorizado');
  }
}

export async function isUserAdmin(email: string) {
  try {
    await ensureAdmin();
    const user = await db.user.findUnique({ where: { email } });
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function getAllAppointments() {
  try {
    await ensureAdmin();
    const appointments = await db.appointment.findMany();
    return { appointments };
  } catch (error) {
    return { error: 'Error al obtener citas', appointments: [] };
  }
}

export async function getAllOrders() {
  try {
    await ensureAdmin();
    const orders = await db.order.findMany();
    return { orders };
  } catch (error) {
    return { error: 'Error al obtener órdenes', orders: [] };
  }
}

export async function getAllUsers() {
  try {
    await ensureAdmin();
    const users = await db.user.findMany();
    return { users: users.map(({ password, ...user }) => user) };
  } catch (error) {
    return { error: 'Error al obtener usuarios', users: [] };
  }
}

export async function getAllAdminProducts() {
  try {
    await ensureAdmin();
    const products = await getAllProductsForAdmin();
    return { products };
  } catch (error) {
    return { error: 'Error al obtener productos', products: [] };
  }
}

export async function getAllAdminDiscounts() {
  try {
    await ensureAdmin();
    const discounts = await getAllDiscountsForAdmin();
    return { discounts };
  } catch (error) {
    return { error: 'Error al obtener descuentos', discounts: [] };
  }
}

export async function getAdminOverview() {
  try {
    await ensureAdmin();
    const [appointments, orders, users, products] = await Promise.all([
      db.appointment.findMany(),
      db.order.findMany(),
      db.user.findMany(),
      getAllProductsForAdmin(),
    ]);

    const pendingPayments = appointments.filter((appointment) =>
      ['pending_payment', 'payment_initiated', 'payment_pending_verification'].includes(
        appointment.status
      )
    ).length;

    const lowStockProducts = products.filter((product) => (product.stock ?? 0) <= 5).length;
    const activeProducts = products.filter((product) => product.active !== false).length;
    const totalRevenue = orders.filter(isPaidOrder).reduce((sum, order) => sum + order.total, 0);
    const paidOrders = orders.filter(isPaidOrder).length;
    const shipmentsInProgress = orders.filter((order) =>
      ['confirmed', 'preparing_order', 'order_sent', 'order_in_route'].includes(
        order.shippingStatus ?? order.status
      )
    ).length;

    return {
      metrics: {
        appointmentsCount: appointments.length,
        ordersCount: orders.length,
        usersCount: users.length,
        productsCount: products.length,
        activeProducts,
        pendingPayments,
        lowStockProducts,
        totalRevenue,
        paidOrders,
        shipmentsInProgress,
      },
      appointments,
      orders,
      users,
      products,
    };
  } catch (error) {
    return {
      metrics: {
        appointmentsCount: 0,
        ordersCount: 0,
        usersCount: 0,
        productsCount: 0,
        activeProducts: 0,
        pendingPayments: 0,
        lowStockProducts: 0,
        totalRevenue: 0,
        paidOrders: 0,
        shipmentsInProgress: 0,
      },
      appointments: [],
      orders: [],
      users: [],
      products: [],
    };
  }
}

function normalizeProductInput(input: AdminProductInput): AdminProductInput {
  return {
    ...input,
    image: input.image.trim(),
    name: input.name.trim(),
    price: input.price.trim(),
    description: input.description.trim(),
    badge: input.badge?.trim() || undefined,
    benefits: input.benefits?.map((benefit) => benefit.trim()).filter(Boolean) ?? [],
    sku: input.sku?.trim() || undefined,
    amountInCents: Number(input.amountInCents),
    stock: Number(input.stock ?? 0),
    rating: Number(input.rating ?? 4.8),
    reviewsCount: Number(input.reviewsCount ?? 0),
  };
}

export async function createAdminProduct(input: AdminProductInput) {
  await ensureAdmin();
  const product = await createProduct(normalizeProductInput(input));
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
  revalidatePath('/admin/products');
  return { success: true, product };
}

export async function updateAdminProduct(id: string, input: AdminProductInput) {
  await ensureAdmin();
  const product = await updateProduct(id, normalizeProductInput(input));
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath(`/products/${id}`);
  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');
  return { success: true, product };
}

export async function deleteAdminProduct(id: string) {
  await ensureAdmin();
  await deleteProduct(id);
  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/admin');
  revalidatePath('/admin/products');
  revalidatePath('/admin/inventory');
  return { success: true };
}

export async function updateAdminAppointmentStatus(id: string, status: string) {
  await ensureAdmin();
  if (!['pending_payment', 'payment_pending_verification', 'confirmed', 'cancelled', 'expired_payment_window'].includes(status)) throw new Error('Estado de cita inválido');
  const appointment = await db.appointment.update({ where: { id }, data: { status } });
  if (!appointment) throw new Error('Cita no encontrada');
  revalidatePath('/admin');
  revalidatePath('/admin/appointments');
  return { success: true, appointment };
}

export async function updateAdminOrder(
  id: string,
  input: {
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    shippingStatus?: string;
    trackingNumber?: string;
    notes?: string;
  }
) {
  await ensureAdmin();
  const current = await db.order.findUnique({ where: { id } });
  if (!current) throw new Error('Pedido no encontrado. Actualiza la página.');
  const patch = validateOrderPatch(current, input);
  const order = await db.order.update({ where: { id }, data: patch });
  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath('/admin/payments');
  revalidatePath('/admin/shipping');
  revalidatePath('/admin/sales');
  return { success: true, order };
}

export async function updateAdminUserRole(id: string, role: string) {
  await ensureAdmin();
  if (!['user', 'admin'].includes(role)) throw new Error('Rol inválido');
  const session = await auth();
  if (session?.user?.id === id && role !== 'admin') throw new Error('No puedes retirar tu propio acceso administrativo.');
  const user = await db.user.update({ where: { id }, data: { role } });
  revalidatePath('/admin');
  revalidatePath('/admin/users');
  if (!user) throw new Error("Usuario no encontrado");
  const { password: _password, ...safeUser } = user;
  return { success: true, user: safeUser };
}

export async function createAdminDiscount(input: AdminDiscountInput) {
  await ensureAdmin();
  const discount = await createDiscount(input);
  revalidatePath('/admin/discounts');
  revalidatePath('/checkout');
  return { success: true, discount };
}

export async function updateAdminDiscount(id: string, input: AdminDiscountInput) {
  await ensureAdmin();
  const discount = await updateDiscount(id, input);
  revalidatePath('/admin/discounts');
  revalidatePath('/checkout');
  return { success: true, discount };
}

export async function deleteAdminDiscount(id: string) {
  await ensureAdmin();
  await deleteDiscount(id);
  revalidatePath('/admin/discounts');
  revalidatePath('/checkout');
  return { success: true };
}

export async function verifyAdminWompiOrder(orderId: string, transactionId: string) {
  await ensureAdmin();
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Pedido no encontrado.');
  const transaction = await fetchWompiTransaction(transactionId.trim());
  if (transaction.reference !== `mai-${order.id}` || transaction.amount_in_cents !== order.total) throw new Error('La referencia o el importe de Wompi no coincide con este pedido.');
  if (order.wompiTransactionId && order.wompiTransactionId !== transaction.id) throw new Error('Este pedido ya tiene otra transacción asociada.');
  if (order.wompiStatus === 'APPROVED' && transaction.status !== 'APPROVED') throw new Error('El proveedor devolvió un cambio que requiere revisión manual.');
  const updated = await db.order.update({ where: { id: orderId }, data: { paymentMethod: 'wompi_sandbox', wompiTransactionId: transaction.id, wompiStatus: transaction.status, paymentStatus: `sandbox_${transaction.status.toLowerCase()}` } });
  revalidatePath('/admin'); revalidatePath('/admin/orders'); revalidatePath('/admin/payments'); revalidatePath('/admin/sales'); revalidatePath('/checkout/result');
  return { order: updated };
}
