'use server';

import { db } from '@/lib/db';

export async function isUserAdmin(email: string) {
  try {
    const user = await db.user.findUnique({ where: { email } });
    return user?.role === 'admin';
  } catch (error) {
    return false;
  }
}

export async function getAllAppointments() {
  try {
    const appointments = await db.appointment.findMany();
    return { appointments };
  } catch (error) {
    return { error: 'Error al obtener citas', appointments: [] };
  }
}

export async function getAllOrders() {
  try {
    const orders = await db.order.findMany();
    return { orders };
  } catch (error) {
    return { error: 'Error al obtener órdenes', orders: [] };
  }
}

export async function getAllUsers() {
  try {
    const users = await db.user.findMany();
    return { users };
  } catch (error) {
    return { error: 'Error al obtener usuarios', users: [] };
  }
}
