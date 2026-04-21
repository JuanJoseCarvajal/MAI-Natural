'use server';

import { db } from '@/lib/db';
import { appointmentInputSchema } from '@/lib/validators/appointment';

export async function createAppointment(
  name: string,
  email: string,
  phone: string,
  date: string,
  time: string,
  service: string,
  notes: string
) {
  try {
    const parsed = appointmentInputSchema.safeParse({
      name,
      email,
      phone,
      date,
      time,
      service,
      notes,
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        error: firstIssue?.message ?? 'Datos inválidos',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const input = parsed.data;

    const existingUser = await db.user.findUnique({ where: { email: input.email } });
    const user = existingUser
      ? await db.user.update({
          where: { email: input.email },
          data: {
            name: input.name,
            phone: input.phone,
          },
        })
      : await db.user.create({
          data: {
            email: input.email,
            name: input.name,
            phone: input.phone,
            password: '',
          },
        });

    if (!user) {
      return { error: 'No fue posible preparar el usuario para la cita' };
    }

    const appointmentDateTime = new Date(`${input.date}T${input.time}`);
    if (appointmentDateTime < new Date()) {
      return { error: 'La fecha y hora deben ser en el futuro' };
    }

    const sameDayAppointments = (await db.appointment.findMany()).filter(
      (appointment) => appointment.date === input.date
    );

    if (sameDayAppointments.length >= 2) {
      return { error: 'Este día ya alcanzó el máximo de 2 citas disponibles.' };
    }

    const appointment = await db.appointment.create({
      data: {
        userId: user.id,
        name: input.name,
        email: input.email,
        phone: input.phone,
        date: input.date,
        time: input.time,
        service: input.service || 'Consulta general',
        notes: input.notes,
        status: 'pending_payment',
      },
    });

    return {
      success: true,
      message: 'Cita reservada exitosamente',
      appointment,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Error al reservar la cita',
    };
  }
}

export async function getDayAvailability(date: string) {
  try {
    if (!date) {
      return { count: 0, remaining: 2, isFull: false };
    }

    const sameDayAppointments = (await db.appointment.findMany()).filter(
      (appointment) => appointment.date === date
    );

    const count = sameDayAppointments.length;
    const remaining = Math.max(0, 2 - count);

    return {
      count,
      remaining,
      isFull: count >= 2,
    };
  } catch (error) {
    return {
      count: 0,
      remaining: 2,
      isFull: false,
      error: 'No fue posible validar disponibilidad',
    };
  }
}

export async function getUserAppointments(email: string) {
  try {
    const appointments = await db.appointment.findMany({ where: { email } });
    return { appointments };
  } catch (error) {
    return { error: 'Error al obtener citas' };
  }
}

export async function getAllAppointments() {
  try {
    const appointments = await db.appointment.findMany();
    return { appointments };
  } catch (error) {
    return { error: 'Error al obtener citas' };
  }
}

export async function cancelAppointment(appointmentId: string) {
  try {
    await db.appointment.delete({ where: { id: appointmentId } });
    return { success: true, message: 'Cita cancelada' };
  } catch (error) {
    return { error: 'Error al cancelar la cita' };
  }
}
