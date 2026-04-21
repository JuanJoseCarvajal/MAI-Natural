import { describe, it, expect } from "vitest";
import { appointmentInputSchema } from "./appointment";

const validInput = {
  name: "Ana Pérez",
  email: "ana@example.com",
  phone: "+573001234567",
  date: "2026-12-31",
  time: "10:30",
  service: "Masaje",
  notes: "",
};

describe("appointmentInputSchema", () => {
  it("acepta un input válido", () => {
    const parsed = appointmentInputSchema.parse(validInput);
    expect(parsed).toMatchObject({
      name: "Ana Pérez",
      email: "ana@example.com",
      phone: "+573001234567",
      date: "2026-12-31",
      time: "10:30",
    });
  });

  it("normaliza el email a minúsculas y recorta espacios", () => {
    const parsed = appointmentInputSchema.parse({
      ...validInput,
      name: "  Ana Pérez  ",
      email: "  Ana@Example.COM  ",
    });
    expect(parsed.email).toBe("ana@example.com");
    expect(parsed.name).toBe("Ana Pérez");
  });

  it("rechaza nombres con menos de 2 caracteres", () => {
    const result = appointmentInputSchema.safeParse({ ...validInput, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.name?.[0]).toMatch(/nombre/i);
    }
  });

  it("rechaza emails mal formados", () => {
    const result = appointmentInputSchema.safeParse({
      ...validInput,
      email: "no-es-un-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toMatch(/correo/i);
    }
  });

  it("rechaza teléfonos muy cortos", () => {
    const result = appointmentInputSchema.safeParse({ ...validInput, phone: "123" });
    expect(result.success).toBe(false);
  });

  it("rechaza fechas con formato distinto a YYYY-MM-DD", () => {
    const cases = ["31/12/2026", "2026-1-1", "2026-13-01", "hoy"];
    for (const date of cases) {
      const result = appointmentInputSchema.safeParse({ ...validInput, date });
      expect(result.success, `esperaba fallo para "${date}"`).toBe(false);
    }
  });

  it("acepta HH:MM y HH:MM:SS", () => {
    expect(
      appointmentInputSchema.safeParse({ ...validInput, time: "09:00" }).success
    ).toBe(true);
    expect(
      appointmentInputSchema.safeParse({ ...validInput, time: "09:00:00" }).success
    ).toBe(true);
  });

  it("rechaza horas en formato libre", () => {
    const cases = ["9:00", "25:00", "mañana", "09-00"];
    for (const time of cases) {
      const result = appointmentInputSchema.safeParse({ ...validInput, time });
      expect(result.success, `esperaba fallo para "${time}"`).toBe(false);
    }
  });

  it("permite service y notes vacíos", () => {
    const parsed = appointmentInputSchema.parse({
      ...validInput,
      service: "",
      notes: "",
    });
    expect(parsed.service).toBe("");
    expect(parsed.notes).toBe("");
  });
});
