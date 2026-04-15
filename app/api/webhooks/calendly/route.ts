import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { db } from "@/lib/db";

// Valida firma HMAC-SHA256 del webhook de Calendly
function isValidSignature(rawBody: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  return expected === signature;
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("Calendly-Webhook-Signature") ?? "";
  const webhookSecret = process.env.CALENDLY_WEBHOOK_SECRET ?? "";

  if (webhookSecret && !isValidSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const event = payload.event as string | undefined;

  // Solo procesamos cuando se crea un agendamiento
  if (event !== "invitee.created") {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const data = payload.payload as Record<string, unknown>;
    const inviteeData = data.invitee as Record<string, unknown>;
    const eventData = data.event as Record<string, unknown>;
    const questionsAnswers = (inviteeData?.questions_and_answers ?? []) as Array<{
      question: string;
      answer: string;
    }>;

    const name = String(inviteeData?.name ?? "");
    const email = String(inviteeData?.email ?? "");
    // La primera pregunta customizada lleva el tipo de servicio (a1 de prefill)
    const service =
      questionsAnswers.find((qa) => qa.question.toLowerCase().includes("servicio"))?.answer ??
      "Consulta general";

    // start_time viene como ISO 8601 desde Calendly
    const startTimeIso = String(
      (eventData?.start_time as string | undefined) ?? new Date().toISOString()
    );
    const startDate = new Date(startTimeIso);
    const date = startDate.toISOString().split("T")[0];
    const time = startDate.toTimeString().slice(0, 5);

    const existingUser = await db.user.findUnique({ where: { email } });
    const user = existingUser
      ? await db.user.update({ where: { email }, data: { name } })
      : await db.user.create({ data: { email, name, phone: "", password: "" } });

    if (!user) {
      return NextResponse.json({ error: "No se pudo crear usuario" }, { status: 500 });
    }

    await db.appointment.create({
      data: {
        userId: user.id,
        name,
        email,
        phone: "",
        date,
        time,
        service,
        notes: `Agendado vía Calendly. URI: ${String(eventData?.uri ?? "")}`,
        status: "pending_payment",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al procesar webhook";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
