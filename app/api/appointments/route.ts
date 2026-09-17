import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (email) {
      // Un usuario solo puede ver sus propias citas
      if (!session?.user || session.user.email !== email) {
        const role = (session?.user as { role?: string })?.role;
        if (role !== 'admin') {
          return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
      }
      const userAppointments = await db.appointment.findMany({ where: { email } });
      return NextResponse.json({ appointments: userAppointments });
    }

    // Obtener todas las citas: solo admin
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || role !== 'admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    const allAppointments = await db.appointment.findMany();
    return NextResponse.json({ appointments: allAppointments });
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { createAppointment } = await import('@/app/(public)/services/actions');
    const result = await createAppointment(body.name, body.email, body.phone, body.date, body.time, body.service ?? '', body.notes ?? '');
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear la cita' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const role = (session.user as { role?: string }).role;
    const sessionUserId = (session.user as { id?: string }).id;
    const sessionEmail = session.user.email;

    const { searchParams } = new URL(request.url);
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'ID de cita requerido' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.findUnique({ where: { id: appointmentId } });

    if (!appointment) {
      return NextResponse.json({ error: 'Cita no encontrada' }, { status: 404 });
    }

    const canManageAppointment =
      role === 'admin' ||
      (sessionUserId && appointment.userId === sessionUserId) ||
      (sessionEmail && appointment.email === sessionEmail);

    if (!canManageAppointment) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const updatedAppointment = await db.appointment.update({
      where: { id: appointmentId },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({
      success: true,
      message: 'Cita cancelada',
      appointment: updatedAppointment,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al cancelar la cita' },
      { status: 500 }
    );
  }
}
