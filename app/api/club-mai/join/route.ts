import { NextResponse } from "next/server";

// Stub endpoint — integrate with Wompi recurring charges when ready
export async function POST(request: Request) {
  const body = (await request.json()) as {
    plan?: string;
    name?: string;
    email?: string;
    billing?: string;
  };

  if (!body.plan || !body.email || !body.name) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // TODO: create Wompi recurring charge
  // await createSubscription({ plan: body.plan, email: body.email, billing: body.billing });

  return NextResponse.json({ ok: true });
}
