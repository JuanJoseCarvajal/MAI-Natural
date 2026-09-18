import { NextResponse } from "next/server";

// Fail closed: no enrollment until verified payments and persistent memberships exist.
// Do not read or retain personal data while enrollment is unavailable.
export async function POST() {
  return NextResponse.json({
    ok: false,
    code: "ENROLLMENT_CLOSED",
    error: "Las inscripciones al Círculo MAI aún no están abiertas. Puedes conocer la propuesta en /subscriptions.",
  }, { status: 403, headers: { "Cache-Control": "no-store" } });
}
