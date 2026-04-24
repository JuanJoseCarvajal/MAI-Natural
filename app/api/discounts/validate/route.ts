import { NextRequest, NextResponse } from "next/server";
import { evaluateDiscountCode } from "@/lib/discounts.server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      code?: string;
      items?: { id: string; quantity: number }[];
    };

    if (!body.code || !body.items?.length) {
      return NextResponse.json(
        { valid: false, message: "Código e items son requeridos." },
        { status: 400 }
      );
    }

    const result = await evaluateDiscountCode(body.code, body.items);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { valid: false, message: "No fue posible validar el descuento." },
      { status: 500 }
    );
  }
}
