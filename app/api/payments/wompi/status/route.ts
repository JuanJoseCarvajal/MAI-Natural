import { NextResponse } from "next/server";
import { getWompiConfiguration, wompiReady } from "@/lib/wompi-server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ available: await wompiReady(), mode: getWompiConfiguration().mode }, { headers: { "Cache-Control": "no-store" } });
}
