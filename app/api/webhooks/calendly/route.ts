import { NextResponse } from "next/server";

// Integration paused: the old handler could mutate accounts without verified events.
// Restore only with provider signature/timestamp checks, replay protection and persistence.
export async function POST() {
  return NextResponse.json({ error: "Integración de agenda no disponible" }, { status: 503 });
}
