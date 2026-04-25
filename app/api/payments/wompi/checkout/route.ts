import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "El checkout de productos con Wompi esta desactivado. Usa el flujo de consignacion Bancolombia para crear la orden.",
    },
    { status: 410 }
  );
}
