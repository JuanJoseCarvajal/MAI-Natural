import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const parsed = z.object({ appointmentId: z.string().uuid(), transferReference: z.string().trim().min(4).max(100) }).safeParse(await request.json().catch(() => null));
    if (!parsed.success) return NextResponse.json({ error: "Revisa la referencia de la solicitud y del comprobante" }, { status: 400 });
    const body = parsed.data;

    const appointment = await db.appointment.findUnique({
      where: { id: body.appointmentId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }

    if (appointment.status === "payment_pending_verification") return NextResponse.json({ success: true });
    if (appointment.status !== "pending_payment") return NextResponse.json({ error: "Esta solicitud ya no admite referencias de pago" }, { status: 409 });

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
