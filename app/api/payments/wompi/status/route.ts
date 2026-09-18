import { NextResponse } from "next/server";
import { getWompiConfiguration } from "@/lib/wompi-server";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ available: getWompiConfiguration().configured, mode: "sandbox" }, { headers: { "Cache-Control": "no-store" } });
}
