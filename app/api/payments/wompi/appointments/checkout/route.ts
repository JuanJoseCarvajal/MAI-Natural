import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  buildWompiCheckoutUrl,
  buildWompiIntegritySignature,
  createWompiReference,
} from "@/lib/wompi";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      appointmentId?: string;
      amountInCents?: number;
      serviceName?: string;
      customerEmail?: string;
      customerName?: string;
    };

    if (!body.appointmentId || !body.amountInCents || body.amountInCents <= 0) {
      return NextResponse.json(
        { error: "appointmentId y amountInCents son requeridos" },
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
        { error: "La ventana de pago de 24 horas ya expiró para esta cita" },
        { status: 400 }
      );
    }

    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;

    if (!publicKey || !integritySecret) {
      return NextResponse.json(
        { error: "Faltan variables WOMPI_PUBLIC_KEY o WOMPI_INTEGRITY_SECRET" },
        { status: 500 }
      );
    }

    const currency = "COP";
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const reference = createWompiReference("appointment");

    const signature = buildWompiIntegritySignature(
      reference,
      body.amountInCents,
      currency,
      integritySecret
    );

    const redirectUrl = `${appUrl}/services?appointment=${encodeURIComponent(
      body.appointmentId
    )}&payment=success`;

    const checkoutUrl = buildWompiCheckoutUrl({
      publicKey,
      currency,
      amountInCents: body.amountInCents,
      reference,
      redirectUrl,
      signature,
    });

    await db.appointment.update({
      where: { id: body.appointmentId },
      data: {
        status: "payment_initiated",
      },
    });

    return NextResponse.json({ checkoutUrl });
  } catch (error) {
    return NextResponse.json(
      { error: "No fue posible iniciar el pago de la cita" },
      { status: 500 }
    );
  }
}
