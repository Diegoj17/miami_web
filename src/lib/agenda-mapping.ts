import type { AgendaAppointment, AgendaCatalog } from "./agenda-api";
import { durationMinutes, formatBogotaDate, formatBogotaTime } from "./agenda-api";
import { EXTERNAL_BOOKING_URL } from "./config";
import { barbers, photos, type PastAppointment, type ScheduledAppointment } from "./data";

/** Foto del barbero en la landing (por su ID en la agenda), o la del backend. */
function barberLook(apt: AgendaAppointment) {
  const local = barbers.find((b) => b.agendaId === apt.professionalId);
  return {
    barberId: local?.id ?? apt.professionalId,
    barberImage: local?.image ?? apt.professionalAvatar ?? photos.chair,
  };
}

function pricing(apt: AgendaAppointment, catalog: AgendaCatalog | null) {
  const services = apt.serviceIds
    .map((id) => catalog?.services.find((s) => s.id === id))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  return {
    total: services.reduce((sum, s) => sum + s.price, 0),
    extras: services.slice(1).map((s) => s.name),
    serviceName: services[0]?.name || apt.serviceName,
  };
}

/** Código corto y legible para el cliente a partir del ID de la cita. */
const folioOf = (apt: AgendaAppointment) => apt.id.replace(/^apt_/i, "").toUpperCase();

function daysAwayLabel(startIso: string): string {
  const day = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(d);
  const today = new Date(day(new Date())).getTime();
  const target = new Date(day(new Date(startIso))).getTime();
  const days = Math.round((target - today) / 86_400_000);
  if (days <= 0) return "Hoy";
  if (days === 1) return "Mañana";
  return `En ${days} días`;
}

/** Enlace de la agenda para gestionar la cita (reprogramar o cancelar). */
export function manageUrlFor(token: string): string | undefined {
  if (!token || !EXTERNAL_BOOKING_URL) return undefined;
  try {
    const origin = new URL(EXTERNAL_BOOKING_URL).origin;
    return `${origin}/cliente/${encodeURIComponent(token)}`;
  } catch {
    return undefined;
  }
}

export function toScheduled(apt: AgendaAppointment, catalog: AgendaCatalog | null): ScheduledAppointment {
  const { total, extras, serviceName } = pricing(apt, catalog);
  return {
    id: apt.id,
    folio: folioOf(apt),
    dateLabel: formatBogotaDate(apt.start),
    isoDate: apt.start,
    time: formatBogotaTime(apt.start),
    duration: `${durationMinutes(apt.start, apt.end)} min`,
    ...barberLook(apt),
    barberName: apt.professionalName,
    barberSpecialty: apt.professionalSpecialty,
    serviceName,
    extras,
    total,
    status: apt.status === "confirmed" ? "Confirmada" : "Próxima visita",
    daysAwayLabel: daysAwayLabel(apt.start),
    clientNotes: apt.note,
    guestPhoneNormalized: "",
    manageUrl: manageUrlFor(apt.token),
  };
}

export function toPast(apt: AgendaAppointment, catalog: AgendaCatalog | null): PastAppointment {
  const { total, extras, serviceName } = pricing(apt, catalog);
  const look = barberLook(apt);
  return {
    id: apt.id,
    folio: folioOf(apt),
    date: formatBogotaDate(apt.start),
    lookTitle: serviceName,
    barberId: look.barberId,
    barberName: apt.professionalName,
    barberImage: look.barberImage,
    serviceName,
    extras,
    total,
    image: look.barberImage,
    barberNotes: "",
    rating: apt.rating
      ? { stars: apt.rating.stars, tags: [], comment: apt.rating.comment, createdAt: apt.rating.createdAt }
      : null,
  };
}
