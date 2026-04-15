import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      appointmentId?: string;
      transferReference?: string;
    };

    if (!body.appointmentId || !body.transferReference) {
      return NextResponse.json(
        { error: "appointmentId y transferReference son requeridos" },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.findUnique({
      where: { id: body.appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    const paymentDeadline = new Date(appointment.createdAt);
    paymentDeadline.setDate(paymentDeadline.getDate() + 1);
    if (paymentDeadline.getTime() < Date.now()) {
      await db.appointment.update({
        where: { id: appointment.id },
        data: { status: "expired_payment_window" },
      });
      return NextResponse.json(
        { error: "La ventana de confirmación de pago de 24 horas ya expiró" },
        { status: 400 }
      );
    }

    const nextNotes = [
      appointment.notes ?? "",
      `Consignación reportada. Ref: ${body.transferReference}`,
    ]
      .filter(Boolean)
      .join(" | ");

    await db.appointment.update({
      where: { id: body.appointmentId },
      data: {
        status: "payment_pending_verification",
        notes: nextNotes,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible confirmar la consignación" },
      { status: 500 }
    );
  }
}
