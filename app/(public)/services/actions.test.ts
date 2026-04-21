import { beforeEach, describe, it, expect } from "vitest";
import { db } from "@/lib/db";
import { createAppointment } from "./actions";

async function clearAppointments() {
  const all = await db.appointment.findMany();
  for (const appt of all) {
    await db.appointment.delete({ where: { id: appt.id } });
  }
}

function futureDate(daysAhead = 30) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

beforeEach(async () => {
  await clearAppointments();
});

describe("createAppointment", () => {
  it("crea la cita con inputs válidos y la deja en pending_payment", async () => {
    const date = futureDate();
    const result = await createAppointment(
      "Cliente Test",
      "cliente@example.com",
      "+573001234567",
      date,
      "10:00",
      "Masaje",
      ""
    );

    expect(result.success).toBe(true);
    expect(result.appointment?.date).toBe(date);
    expect(result.appointment?.status).toBe("pending_payment");
  });

  it("usa 'Consulta general' si no se pasa service", async () => {
    const result = await createAppointment(
      "Cliente Test",
      "servicio-vacio@example.com",
      "+573001234567",
      futureDate(),
      "11:00",
      "",
      ""
    );
    expect(result.success).toBe(true);
    expect(result.appointment?.service).toBe("Consulta general");
  });

  it("rechaza inputs inválidos con error y fieldErrors por campo", async () => {
    const result = await createAppointment(
      "A", // nombre muy corto
      "no-es-email",
      "123", // phone corto
      "31/12/2026", // fecha con formato malo
      "10:00",
      "",
      ""
    );

    expect(result.error).toBeDefined();
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.name).toBeTruthy();
    expect(result.fieldErrors?.email).toBeTruthy();
    expect(result.fieldErrors?.phone).toBeTruthy();
    expect(result.fieldErrors?.date).toBeTruthy();
  });

  it("rechaza fechas y horas en el pasado", async () => {
    const result = await createAppointment(
      "Cliente Test",
      "pasado@example.com",
      "+573001234567",
      "2020-01-01",
      "10:00",
      "Masaje",
      ""
    );
    expect(result.error).toBe("La fecha y hora deben ser en el futuro");
  });

  it("bloquea la tercera cita del mismo día (máximo 2/día)", async () => {
    const date = futureDate();

    const first = await createAppointment(
      "Cliente 1",
      "cliente1@example.com",
      "+573001111111",
      date,
      "09:00",
      "Masaje",
      ""
    );
    expect(first.success).toBe(true);

    const second = await createAppointment(
      "Cliente 2",
      "cliente2@example.com",
      "+573002222222",
      date,
      "11:00",
      "Masaje",
      ""
    );
    expect(second.success).toBe(true);

    const third = await createAppointment(
      "Cliente 3",
      "cliente3@example.com",
      "+573003333333",
      date,
      "13:00",
      "Masaje",
      ""
    );
    expect(third.success).toBeUndefined();
    expect(third.error).toContain("máximo de 2 citas");
  });

  it("permite citas en días distintos aunque ya haya 2 en otro día", async () => {
    const dayA = futureDate(10);
    const dayB = futureDate(11);

    await createAppointment("C1", "c1@example.com", "+573001111111", dayA, "09:00", "X", "");
    await createAppointment("C2", "c2@example.com", "+573002222222", dayA, "11:00", "X", "");

    const onOtherDay = await createAppointment(
      "C3",
      "c3@example.com",
      "+573003333333",
      dayB,
      "09:00",
      "X",
      ""
    );
    expect(onOtherDay.success).toBe(true);
  });
});
