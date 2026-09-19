export function getShippingInCents(city: string): number | null {
  const normalized = city.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ");
  if (normalized.length < 2) return null;
  // Only Medellín itself receives the local rate, not other municipalities.
  return /^medellin(?:\s*[,\-]\s*antioquia|\s+antioquia)?$/.test(normalized) ? 1500000 : 2500000;
}
