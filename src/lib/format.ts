/** Zona horaria del negocio: todas las fechas y horas se muestran en hora de Bogotá. */
export const BUSINESS_TIME_ZONE = "America/Bogota";

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

/** Precio en pesos colombianos: 45000 → "$ 45.000". */
export function formatCOP(value: number): string {
  return copFormatter.format(value);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Día de la semana (0 = domingo) en Bogotá, sin importar la zona horaria del visitante. */
export function bogotaWeekday(date: Date = new Date()): number {
  const short = new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "short",
  }).format(date);
  return WEEKDAYS.indexOf(short);
}
