import { POST as appointmentCheckout } from "@/app/api/payments/wompi/appointments/checkout/route";
import { initialConsultation } from "./consultation";
import { afterEach, describe, it, expect, vi } from "vitest";
import { createHash } from "crypto";
import { getWompiConfiguration, verifyWompiEvent } from "./wompi-server";
import { db } from "./db";
import { POST as webhook } from "@/app/api/webhooks/wompi/route";
import { POST as checkout } from "@/app/api/payments/wompi/checkout/route";
import { NextRequest } from "next/server";

const secret = "test_events_fixture";
function config() { vi.stubEnv("WOMPI_SANDBOX_ENABLED", "true"); vi.stubEnv("WOMPI_PUBLIC_KEY", "pub_test_fixture"); vi.stubEnv("WOMPI_INTEGRITY_SECRET", "test_integrity_fixture"); vi.stubEnv("WOMPI_EVENTS_SECRET", secret); }
function event() {
 const timestamp=1700000000;
 return { event:"transaction.updated", environment:"test", timestamp, data:{transaction:{id:"test-123",status:"APPROVED",amount_in_cents:50000}}, signature:{properties:["transaction.id","transaction.status","transaction.amount_in_cents"],checksum:createHash("sha256").update(`test-123APPROVED50000${timestamp}${secret}`).digest("hex")} };
}
function request(path:string, body:unknown) { return new NextRequest(`http://localhost:3000${path}`,{method:"POST",body:JSON.stringify(body)}); }
async function order() { return db.order.create({data:{userId:"guest-fixture",customerName:"Prueba",customerEmail:"test@example.com",customerPhone:"3001234567",items:[],total:50000,status:"pending_confirmation",paymentStatus:"pending_confirmation",paymentMethod:"wompi_sandbox"}}); }
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe("Wompi sandbox",()=>{
 it("requires all test secrets and never enables production credentials",()=>{config();expect(getWompiConfiguration().configured).toBe(true);vi.stubEnv("WOMPI_PUBLIC_KEY","pub_prod_fixture");expect(getWompiConfiguration().configured).toBe(false);});
 it("validates signatures and rejects tampered values and unsafe paths",()=>{const input=event();expect(verifyWompiEvent(input,secret)).not.toBeNull();input.data.transaction.status="DECLINED";expect(verifyWompiEvent(input,secret)).toBeNull();input.signature.properties=["__proto__.polluted"];expect(verifyWompiEvent(input,secret)).toBeNull();});
 it("creates signed checkout from the server total, ignoring client amounts",async()=>{config();const o=await order();const result=await checkout(request("/api/payments/wompi/checkout",{orderId:o.id,amountInCents:1}));expect(result.status).toBe(200);const url=new URL((await result.json()).checkoutUrl);expect(url.searchParams.get("amount-in-cents")).toBe("50000");expect(url.searchParams.get("reference")).toBe(`mai-${o.id}`);expect(url.origin).toBe("https://checkout.wompi.co");});
 it("rejects forged webhook before making provider calls",async()=>{config();const fetch=vi.fn();vi.stubGlobal("fetch",fetch);const input=event();input.signature.checksum="0".repeat(64);expect((await webhook(request("/api/webhooks/wompi",input))).status).toBe(401);expect(fetch).not.toHaveBeenCalled();});
 it("verifies provider amount and handles repeated approvals without marking real payment",async()=>{config();const o=await order();const tx={id:"test-123",reference:`mai-${o.id}`,amount_in_cents:50000,currency:"COP",status:"APPROVED"};vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({data:tx}),{status:200})));expect((await webhook(request("/api/webhooks/wompi",event()))).status).toBe(200);expect((await webhook(request("/api/webhooks/wompi",event()))).status).toBe(200);const saved=await db.order.findUnique({where:{id:o.id}});expect(saved?.paymentStatus).toBe("sandbox_approved");expect(saved?.status).toBe("pending_confirmation");expect((await checkout(request("/api/payments/wompi/checkout",{orderId:o.id}))).status).toBe(409);});
 it("rejects mismatched amounts and temporary provider errors",async()=>{config();const o=await order();vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({data:{id:"test-123",reference:`mai-${o.id}`,amount_in_cents:1,currency:"COP",status:"APPROVED"}}),{status:200})));expect((await webhook(request("/api/webhooks/wompi",event()))).status).toBe(409);vi.stubGlobal("fetch",vi.fn(async()=>new Response('',{status:503})));expect((await webhook(request("/api/webhooks/wompi",event()))).status).toBe(503);});
});

describe("Wompi asesorías",()=>{
 it("uses server price, verifies appointment webhook, and never confirms a real appointment",async()=>{
  config();
  const a=await db.appointment.create({data:{userId:"test-guest",name:"Prueba",email:"test@example.com",phone:"3001234567",date:"2026-12-20",time:"10:00",service:initialConsultation.name,status:"pending_payment"}});
  const response=await appointmentCheckout(request("/api/payments/wompi/appointments/checkout",{appointmentId:a.id,amountInCents:1}));
  expect(response.status).toBe(200);
  const url=new URL((await response.json()).checkoutUrl);
  expect(url.searchParams.get("amount-in-cents")).toBe(String(initialConsultation.amountInCents));
  expect(url.searchParams.get("reference")).toBe(`mai-appointment-${a.id}`);
  const tx={id:"test-123",reference:`mai-appointment-${a.id}`,amount_in_cents:1,currency:"COP",status:"APPROVED"};
  vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({data:tx}),{status:200})));
  expect((await webhook(request("/api/webhooks/wompi",event()))).status).toBe(409);
  tx.amount_in_cents=initialConsultation.amountInCents;
  expect((await webhook(request("/api/webhooks/wompi",event()))).status).toBe(200);
  expect((await webhook(request("/api/webhooks/wompi",event()))).status).toBe(200);
  const saved=await db.appointment.findUnique({where:{id:a.id}});
  expect(saved?.status).toBe("pending_payment");expect(saved?.wompiStatus).toBe("APPROVED");
  expect((await appointmentCheckout(request("/api/payments/wompi/appointments/checkout",{appointmentId:a.id}))).status).toBe(409);
 });
 it("rejects malformed requests and unavailable configuration",async()=>{
  config();expect((await appointmentCheckout(request("/api/payments/wompi/appointments/checkout",{appointmentId:"invalid"}))).status).toBe(400);
  vi.stubEnv("WOMPI_SANDBOX_ENABLED","false");expect((await appointmentCheckout(request("/api/payments/wompi/appointments/checkout",{}))).status).toBe(503);
 });
});
