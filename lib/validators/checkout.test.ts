import { describe, expect, it } from "vitest";
import { checkoutSchema } from "./checkout";

const valid = { customerName: "Ana María", customerEmail: "ANA@example.com", customerPhone: "3001234567", city: "Bogotá, D.C.", address: "Calle 10 # 20-30", items: [{ id: "shampoo", quantity: 2 }] };
describe("checkout trust boundary", () => {
  it("rejects retired payment methods", () => { expect(checkoutSchema.safeParse({ ...valid, paymentMethod: "bank_transfer_bancolombia" }).success).toBe(false); expect(checkoutSchema.parse(valid).paymentMethod).toBe("wompi"); });
  it("accepts guest details and normalizes email", () => {
    expect(checkoutSchema.parse(valid).customerEmail).toBe("ana@example.com");
    expect(checkoutSchema.safeParse({ ...valid, customerPhone: "+573001234567" }).success).toBe(true);
  });
  it.each([0, -1, 1.5, 21, Infinity, "2"])("rejects invalid quantity %s", quantity => {
    expect(checkoutSchema.safeParse({ ...valid, items: [{ id: "shampoo", quantity }] }).success).toBe(false);
  });
  it("rejects duplicates rather than bypassing limits", () => {
    expect(checkoutSchema.safeParse({ ...valid, items: [valid.items[0], valid.items[0]] }).success).toBe(false);
  });
  it("rejects malformed contact and missing delivery details", () => {
    expect(checkoutSchema.safeParse({ ...valid, customerEmail: "incorrecto" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, customerPhone: "123" }).success).toBe(false);
    expect(checkoutSchema.safeParse({ ...valid, address: "" }).success).toBe(false);
  });
  it("discards client totals", () => {
    expect(checkoutSchema.parse({ ...valid, amountInCents: 1 })).not.toHaveProperty("amountInCents");
  });
});
