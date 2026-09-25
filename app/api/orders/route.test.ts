import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
vi.mock("@/lib/auth", () => ({ auth: vi.fn(async () => null) }));
vi.mock("@/lib/products.server", () => ({ getAllProducts: vi.fn(async () => [{ id: "fixture", name: "Producto", price: "$ 50.000", amountInCents: 5000000, stock: 5 }]) }));
vi.mock("@/lib/discounts.server", () => ({ evaluateDiscountCode: vi.fn() }));
vi.mock("@/lib/wompi-server", () => ({ wompiReady: vi.fn(async () => true), getWompiConfiguration: () => ({ mode: "production" }) }));
import { POST } from "./route";
import { db } from "@/lib/db";
import { wompiReady } from "@/lib/wompi-server";
import { getShippingInCents } from "@/lib/shipping";
import { getAllProducts } from "@/lib/products.server";
const details = { customerName: "Prueba MAI", customerEmail: "fixture@example.com", customerPhone: "3001234567", city: "Bogotá", address: "Calle 10 # 20-30", items: [{ id: "fixture", quantity: 1 }], paymentMethod: "wompi", expectedTotalInCents: 7500000 };
const request = (changes = {}) => new NextRequest("https://mainatural.com/api/orders", { method: "POST", body: JSON.stringify({ ...details, ...changes }) });
beforeEach(() => { vi.stubEnv("DATABASE_DRIVER", "memory"); vi.mocked(wompiReady).mockResolvedValue(true); });
afterEach(() => { vi.unstubAllEnvs(); });
describe("direct Wompi checkout", () => {
  it("rejects unknown and unpriced cart entries", async () => {
    expect((await POST(request({ items: [{id:"retired",quantity:1}] }))).status).toBe(400);
    vi.mocked(getAllProducts).mockResolvedValueOnce([{id:"fixture",name:"Pending",amountInCents:0} as never]);
    expect((await POST(request())).status).toBe(400);
  });
  it("uses the chosen variant and rejects shared-stock overflow across variants", async () => {
    const product = {id:"fixture",name:"Bálsamo",price:"$50.000",amountInCents:5000000,stock:2,variants:[{id:"a",name:"Maracuyá",image:"/a.png"},{id:"b",name:"Mandarina",image:"/b.png"}]};
    vi.mocked(getAllProducts).mockResolvedValueOnce([product as never]);
    const response = await POST(request({items:[{id:"fixture~a",quantity:1}]}));
    expect(response.status).toBe(200);
    const saved = await db.order.findUnique({where:{id:(await response.json()).order.id}});
    expect(saved?.items[0]).toMatchObject({id:"fixture~a",name:"Bálsamo · Maracuyá",amountInCents:5000000});
    vi.mocked(getAllProducts).mockResolvedValueOnce([product as never]);
    expect((await POST(request({items:[{id:"fixture~a",quantity:2},{id:"fixture~b",quantity:1}]}))).status).toBe(409);
  });
  it("creates a server-priced total and shipping quote ready for Wompi", async () => {
    const response = await POST(request());
    expect(response.status).toBe(200);
    const { order } = await response.json();
    const saved = await db.order.findUnique({ where: { id: order.id } });
    expect(saved).toMatchObject({ subtotalInCents: 5000000, shippingInCents: 2500000, total: 7500000, paymentMethod: "wompi", paymentStatus: "pending_confirmation" });
    expect(order.quoteVersion).toBe(saved?.quoteVersion);
    expect(order.quoteVersion).toBeTruthy();
  });
  it("rejects a changed or manipulated total before creating an order", async () => {
    const before = (await db.order.findMany()).length;
    expect((await POST(request({ expectedTotalInCents: 1 }))).status).toBe(409);
    expect((await db.order.findMany()).length).toBe(before);
  });
  it.each(["Medellín", "MEDELLIN", " Medellín, Antioquia ", "Medellín - Antioquia", "medellin antioquia"])("charges the local tariff for %s", async city => {
    expect(getShippingInCents(city)).toBe(1500000);
    const response = await POST(request({ city, expectedTotalInCents: 6500000 }));
    expect(response.status).toBe(200);
    expect((await response.json()).order.total).toBe(6500000);
  });
  it.each(["Bello", "Envigado", "Itagüí", "Bogotá", "Cali"])("charges the outside-Medellín tariff for %s", city => {
    expect(getShippingInCents(city)).toBe(2500000);
  });
  it("requires a city and ignores an invented shipping amount", async () => {
    expect(getShippingInCents(" ")).toBeNull();
    expect((await POST(request({ city: "" }))).status).toBe(400);
    expect((await POST(request({ shippingInCents: 0, expectedTotalInCents: 5000000 }))).status).toBe(409);
  });
  it("rejects the retired method and unavailable Wompi", async () => {
    expect((await POST(request({ paymentMethod: "bank_transfer_bancolombia" }))).status).toBe(400);
    vi.mocked(wompiReady).mockResolvedValue(false);
    expect((await POST(request())).status).toBe(503);
  });
});
