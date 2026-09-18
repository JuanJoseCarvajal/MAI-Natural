import { describe, it, expect } from "vitest";
import { appointmentInstant, colombiaDate, holdsAppointmentSlot } from "./consultation";
import { consultationInputSchema } from "./validators/consultation";

describe("consultation boundaries", () => {
  it("uses Colombian dates and hours regardless of the server timezone", () => {
    expect(colombiaDate(new Date("2026-09-18T02:00:00Z"))).toBe("2026-09-17");
    expect(appointmentInstant("2026-09-17", "09:00")).toBe(Date.parse("2026-09-17T14:00:00Z"));
  });
  it("releases cancelled and expired unpaid holds but keeps payments under review", () => {
    const now = Date.now();
    const base = { date: "2026-10-01", time: "09:00", service: "Encuentro inicial con Melina", createdAt: new Date(now - 86400001) };
    expect(holdsAppointmentSlot({ ...base, status: "cancelled" }, now)).toBe(false);
    expect(holdsAppointmentSlot({ ...base, status: "pending_payment" }, now)).toBe(false);
    expect(holdsAppointmentSlot({ ...base, status: "payment_pending_verification" }, now)).toBe(true);
  });
  it("requires explicit contact consent and rejects impossible calendar dates", () => {
    const input = { name: "Prueba MAI", email: "test@example.com", phone: "+573001234567", date: "2027-02-28", time: "09:00", topic: "piel", intention: "escucha", consent: true };
    expect(consultationInputSchema.safeParse(input).success).toBe(true);
    expect(consultationInputSchema.safeParse({ ...input, consent: false }).success).toBe(false);
    expect(consultationInputSchema.safeParse({ ...input, date: "2027-02-30" }).success).toBe(false);
  });
});
