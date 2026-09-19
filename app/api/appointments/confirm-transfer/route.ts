import { NextResponse } from "next/server";
// Retired endpoint: stale clients cannot submit manual payment confirmations.
export async function POST() {
  return NextResponse.json({ error: "Este método de pago ya no está disponible. Usa Wompi." }, { status: 410 });
}
