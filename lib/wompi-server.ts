import { databaseReady } from "./postgres-store";
import { createHash, timingSafeEqual } from "crypto";
import { z } from "zod";

export function getWompiConfiguration() {
  const publicKey = process.env.WOMPI_PUBLIC_KEY || "";
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET || "";
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET || "";
  const production = process.env.WOMPI_MODE === "production";
  const mode = production ? "production" : "sandbox";
  const prefix = production ? "prod" : "test";
  let secureOrigin = false;
  try { const url = new URL(process.env.NEXT_PUBLIC_APP_URL || ""); secureOrigin = url.protocol === "https:" && !url.username && !url.password; } catch {}
  const credentialsConfigured = publicKey.startsWith(`pub_${prefix}_`) && integritySecret.startsWith(`${prefix}_integrity_`) && eventsSecret.startsWith(`${prefix}_events_`) &&
    (production ? process.env.DATABASE_DRIVER === "postgres" && secureOrigin : process.env.WOMPI_SANDBOX_ENABLED === "true");
  const configured = credentialsConfigured && (!production || process.env.WOMPI_PRODUCTION_ENABLED === "true");
  return { configured, credentialsConfigured, mode, publicKey, integritySecret, eventsSecret, apiUrl: production ? "https://production.wompi.co/v1" : "https://sandbox.wompi.co/v1" };
}

export async function wompiReady() {
  const config = getWompiConfiguration();
  return config.configured && (config.mode === "sandbox" || await databaseReady());
}

export const wompiEventSchema = z.object({
  event: z.literal("transaction.updated"),
  environment: z.enum(["test", "prod"]),
  timestamp: z.number().int().positive(),
  data: z.object({ transaction: z.object({ id: z.string().regex(/^[a-zA-Z0-9-]{1,100}$/) }).passthrough() }),
  signature: z.object({ properties: z.array(z.string().min(1).max(100)).min(1).max(30), checksum: z.string().regex(/^[a-fA-F0-9]{64}$/) }),
});

export function verifyWompiEvent(input: unknown, secret: string, environment: "test" | "prod" = "test") {
  const result = wompiEventSchema.safeParse(input);
  if (!result.success || !secret || result.data.environment !== environment) return null;
  const event = result.data;
  if (!event.signature.properties.includes("transaction.id")) return null;
  const values: string[] = [];
  for (const path of event.signature.properties) {
    let value: unknown = event.data;
    for (const part of path.split(".")) {
      if (["__proto__", "prototype", "constructor"].includes(part) || !value || typeof value !== "object" || !Object.prototype.hasOwnProperty.call(value, part)) return null;
      value = (value as Record<string, unknown>)[part];
    }
    if (typeof value !== "string" && typeof value !== "number" && typeof value !== "boolean") return null;
    values.push(String(value));
  }
  const checksum = createHash("sha256").update(values.join("") + event.timestamp + secret).digest();
  if (!timingSafeEqual(checksum, Buffer.from(event.signature.checksum, "hex"))) return null;
  return event;
}

export const wompiTransactionSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]{1,100}$/),
  reference: z.string().min(1).max(150),
  amount_in_cents: z.number().int().positive().safe(),
  currency: z.literal("COP"),
  status: z.enum(["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"]),
});

export async function fetchWompiTransaction(id: string) {
  if (!/^[a-zA-Z0-9-]{1,100}$/.test(id)) throw new Error("Transacción inválida");
  const config = getWompiConfiguration();
  if (!config.credentialsConfigured) throw new Error("Wompi no configurado");
  const response = await fetch(`${config.apiUrl}/transactions/${encodeURIComponent(id)}`, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("No se pudo verificar la transacción");
  const result = wompiTransactionSchema.parse((await response.json()).data);
  if (result.id !== id) throw new Error("Transacción no coincide");
  return result;
}
