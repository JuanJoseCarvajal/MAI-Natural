'use server';

import { db } from '@/lib/db';

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
    if (!name || !email || !phone || !date || !time) {
      return { error: 'Completa todos los campos requeridos' };
    }

    const appointmentDateTime = new Date(`${date}T${time}`);
    if (appointmentDateTime < new Date()) {
      return { error: 'La fecha y hora deben ser en el futuro' };
    }

    const sameDayAppointments = (await db.appointment.findMany()).filter(
      (appointment) => appointment.date === date
    );

    if (sameDayAppointments.length >= 2) {
      return { error: 'Este día ya alcanzó el máximo de 2 citas disponibles.' };
    }

    const appointment = await db.appointment.create({
      data: {
        userId: '',
        name,
        email,
        phone,
        date,
        time,
        service: service || 'Consulta general',
        notes,
        status: 'pending',
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
