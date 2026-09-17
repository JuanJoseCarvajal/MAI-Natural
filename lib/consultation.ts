export const initialConsultation = {
  name: "Encuentro inicial con Nadia",
  durationMinutes: 30,
  amountInCents: 5000000,
  priceLabel: "$50.000 COP",
  timezone: "America/Bogota",
};

export const consultationTopics = [
  { id: "piel", title: "Mi piel y cómo la cuido", description: "Quiero revisar mi rutina y encontrar un punto de partida.", response: "Podemos empezar por tu piel y darle espacio a lo que quieres contar." },
  { id: "cabello", title: "Mi cabello y su historia", description: "Quiero entender mis hábitos y elegir un cuidado más mío.", response: "Tu historia con el cabello también merece una conversación propia." },
  { id: "cuidado", title: "Mi relación con el cuidado", description: "Quiero mirar más allá de los productos y de la rutina.", response: "Podemos abrir preguntas sobre el lugar que le das al cuidado en tu vida." },
  { id: "explorar", title: "Todavía no sé cómo nombrarlo", description: "Hay algo que quiero conversar. Prefiero empezar por ahí.", response: "No necesitas llegar con una respuesta. Una pregunta es suficiente para empezar." },
] as const;

export const consultationIntentions = [
  { id: "orientacion", title: "Salir con una orientación concreta", description: "Un primer plan de cuidado que pueda empezar a poner en práctica." },
  { id: "escucha", title: "Tener un espacio para ser escuchada/o", description: "Ordenar mis preguntas y mirar mi situación con otra perspectiva." },
  { id: "proceso", title: "Explorar un proceso más profundo", description: "Conocer cómo podría continuar el trabajo después del encuentro." },
] as const;

export const consultationSlots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

export function colombiaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = (type: string) => parts.find(part => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

export function appointmentInstant(date: string, time: string) {
  return new Date(`${date}T${time.slice(0, 5)}:00-05:00`).getTime();
}

type AppointmentSlot = { date: string; time: string; service: string; status: string; createdAt: Date };

export function holdsAppointmentSlot(appointment: AppointmentSlot, now = Date.now()) {
  if (["cancelled", "expired_payment_window", "rejected"].includes(appointment.status)) return false;
  if (appointment.status === "pending_payment" && now - new Date(appointment.createdAt).getTime() >= 86400000) return false;
  return true;
}

export function appointmentDuration(service: string) {
  return ({ "Tratamiento facial": 60, "Tratamiento capilar": 45, "Package premium": 90 } as Record<string, number>)[service] ?? initialConsultation.durationMinutes;
}

export function appointmentsOverlap(date: string, time: string, service: string, existing: AppointmentSlot) {
  const start = appointmentInstant(date, time);
  const otherStart = appointmentInstant(existing.date, existing.time);
  return start < otherStart + appointmentDuration(existing.service) * 60000 && start + appointmentDuration(service) * 60000 > otherStart;
}
