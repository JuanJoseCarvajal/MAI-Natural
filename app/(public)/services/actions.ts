'use server';

import { randomUUID } from 'crypto';
import { db } from '@/lib/db';
import { appointmentInputSchema } from '@/lib/validators/appointment';
import { consultationInputSchema } from '@/lib/validators/consultation';
import { appointmentInstant, appointmentsOverlap, consultationIntentions, consultationSlots, consultationTopics, holdsAppointmentSlot, initialConsultation } from '@/lib/consultation';

export async function createAppointment(name: string, email: string, phone: string, date: string, time: string, service: string, notes: string) {
  const parsed = appointmentInputSchema.safeParse({ name, email, phone, date, time, service, notes });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos', fieldErrors: parsed.error.flatten().fieldErrors };
  const input = parsed.data;
  if (appointmentInstant(input.date, input.time) <= Date.now()) return { error: 'La fecha y hora deben ser en el futuro' };
  if (!consultationSlots.includes(input.time.slice(0, 5)) || (input.time.length > 5 && !input.time.endsWith(':00'))) return { error: 'Selecciona uno de los horarios disponibles' };
  try {
    const appointment = await db.appointment.createIfAvailable({ data: {
      ...input,
      time: input.time.slice(0, 5),
      userId: `guest:${randomUUID()}`,
      service: input.service || 'Consulta general',
      status: 'pending_payment',
    } });
    return { success: true, message: 'Solicitud recibida, pendiente de confirmación y pago', appointment };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'No fue posible guardar tu solicitud. Inténtalo de nuevo.' };
  }
}

export async function requestConsultation(values: unknown) {
  const parsed = consultationInputSchema.safeParse(values);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisa tus respuestas', fieldErrors: parsed.error.flatten().fieldErrors };
  const input = parsed.data;
  const topic = consultationTopics.find(option => option.id === input.topic)!;
  const intention = consultationIntentions.find(option => option.id === input.intention)!;
  const notes = [
    `Motivo: ${topic.title}`,
    `Intención: ${intention.title}`,
    input.notes ? `Quiere compartir: ${input.notes}` : 'Prefiere conversar los detalles durante el encuentro.',
    `Interés en conocer Círculo MAI: ${input.continuityInterest ? 'sí, sin suscripción ni cobro' : 'no solicitado'}`,
    `Autoriza contacto para esta solicitud: ${new Date().toISOString()}`,
  ].join('\n');
  return createAppointment(input.name, input.email, input.phone, input.date, input.time, initialConsultation.name, notes);
}

export async function getDayAvailability(date: string) {
  try {
    const parsed = appointmentInputSchema.shape.date.safeParse(date);
    if (!parsed.success) return { count: 0, remaining: 0, isFull: true, slots: [] as string[], error: 'Elige una fecha válida' };
    const active = (await db.appointment.findMany()).filter(appointment => appointment.date === date && holdsAppointmentSlot(appointment));
    const slots = active.length >= 2 ? [] : consultationSlots.filter(time => appointmentInstant(date, time) > Date.now() && !active.some(appointment => appointmentsOverlap(date, time, initialConsultation.name, appointment)));
    return { count: active.length, remaining: Math.max(0, 2 - active.length), isFull: slots.length === 0, slots };
  } catch {
    return { count: 0, remaining: 0, isFull: true, slots: [] as string[], error: 'No pudimos consultar los horarios. Intenta otra vez.' };
  }
}

export async function getUserAppointments(email: string) {
  const { auth } = await import('@/lib/auth');
  const session = await auth();
  if (!session?.user || (session.user.email !== email && (session.user as { role?: string }).role !== 'admin')) return { error: 'No autorizado' };
  return { appointments: await db.appointment.findMany({ where: { email } }) };
}

export async function getAllAppointments() {
  const { auth } = await import('@/lib/auth');
  const session = await auth();
  if ((session?.user as { role?: string } | undefined)?.role !== 'admin') return { error: 'No autorizado' };
  return { appointments: await db.appointment.findMany() };
}

export async function cancelAppointment(appointmentId: string) {
  const { auth } = await import('@/lib/auth');
  const session = await auth();
  const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });
  if (!session?.user || !appointment || (session.user.email !== appointment.email && (session.user as { role?: string }).role !== 'admin')) return { error: 'No autorizado' };
  await db.appointment.update({ where: { id: appointmentId }, data: { status: 'cancelled' } });
  return { success: true, message: 'Cita cancelada' };
}
