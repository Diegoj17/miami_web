import { BOOKING_BUSINESS_SLUG } from "./config";
import { BACKEND_API_ORIGIN } from "./config";
import { BUSINESS_TIME_ZONE } from "./format";

/**
 * Citas de la landing contra el backend de la agenda: la misma fuente que usa
 * miami_agenda, así ambas apps ven exactamente las mismas citas.
 * - La sesión del cliente viaja en la cookie HttpOnly del backend, que es de este mismo
 *   dominio: `/api/` se reenvía al backend (ver `rewrites` en next.config.mjs).
 * - Cada respuesta se valida antes de usarla; nada se guarda en el navegador.
 */

export interface AgendaService {
  id: string;
  name: string;
  category: string;
  durationMin: number;
  price: number;
  description: string;
}

export interface AgendaProfessional {
  id: string;
  name: string;
  specialty: string;
  avatarUrl?: string;
  serviceIds: string[];
}

export interface AgendaCatalog {
  services: AgendaService[];
  professionals: AgendaProfessional[];
}

export interface AgendaRating {
  stars: number;
  comment: string;
  createdAt: string;
}

export interface AgendaAppointment {
  id: string;
  token: string;
  serviceIds: string[];
  serviceName: string;
  professionalId: string;
  professionalName: string;
  professionalSpecialty: string;
  professionalAvatar?: string;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "completed" | "no_show" | "cancelled";
  note: string;
  rating: AgendaRating | null;
}

export interface AgendaDay {
  date: string;
  available: boolean;
}

export interface AgendaSlot {
  start: string;
  professionalId: string;
}

/** Preguntas propias del negocio (se configuran en el panel de la agenda). */
export interface AgendaQuestion {
  id: string;
  label: string;
  type: "yesno" | "choice" | "text";
  options: string[];
  required: boolean;
}

export interface AgendaClientProfile {
  name: string;
  phone: string;
  email: string;
  scheduled: AgendaAppointment[];
  history: AgendaAppointment[];
}

export class AgendaApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export const agendaApiEnabled = Boolean(BACKEND_API_ORIGIN);

const SAFE_ID = /^[A-Za-z0-9_-]{1,96}$/;
const STATUSES = new Set(["pending", "confirmed", "completed", "no_show", "cancelled"]);

function apiUrl(path: string, params: Record<string, string | string[] | undefined> = {}) {
  const url = new URL(`/api/public/${path}`, window.location.origin);
  if (BOOKING_BUSINESS_SLUG && SAFE_ID.test(BOOKING_BUSINESS_SLUG)) {
    url.searchParams.set("negocio", BOOKING_BUSINESS_SLUG);
  }
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
    else if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

async function request<T>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; params?: Record<string, string | string[] | undefined> } = {},
): Promise<T> {
  if (!agendaApiEnabled) {
    throw new AgendaApiError("unavailable", "El agendamiento en línea no está disponible.", 0);
  }
  let res: Response;
  try {
    res = await fetch(apiUrl(path, options.params), {
      method: options.method ?? "GET",
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new AgendaApiError("network", "No hay conexión con el sistema de citas. Inténtalo de nuevo.", 0);
  }
  const data = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    const err = (data ?? {}) as { code?: unknown; message?: unknown };
    throw new AgendaApiError(
      typeof err.code === "string" ? err.code : "error",
      typeof err.message === "string" ? err.message.slice(0, 300) : "No se pudo completar la solicitud.",
      res.status,
    );
  }
  return data as T;
}

/* ---------------- validación de respuestas ---------------- */

const isObj = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === "object";
const str = (v: unknown, max = 300) => (typeof v === "string" ? v.slice(0, max) : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const httpsUrl = (v: unknown) => {
  if (typeof v !== "string") return undefined;
  try {
    return new URL(v).protocol === "https:" ? v : undefined;
  } catch {
    return undefined;
  }
};

function parseService(v: unknown): AgendaService | null {
  if (!isObj(v) || !SAFE_ID.test(str(v.id)) || v.active === false) return null;
  return {
    id: str(v.id),
    name: str(v.name, 120),
    category: str(v.category, 60) || "Servicios",
    durationMin: num(v.durationMin),
    price: num(v.price),
    description: str(v.description, 240),
  };
}

function parseProfessional(v: unknown): AgendaProfessional | null {
  if (!isObj(v) || !SAFE_ID.test(str(v.id))) return null;
  const serviceIds = Array.isArray(v.serviceIds) ? v.serviceIds.filter((s): s is string => typeof s === "string") : [];
  if (!serviceIds.length || v.active === false) return null;
  return {
    id: str(v.id),
    name: str(v.name, 120),
    specialty: str(v.specialty, 120),
    avatarUrl: httpsUrl(v.avatarUrl),
    serviceIds,
  };
}

function parseAppointment(v: unknown): AgendaAppointment | null {
  if (!isObj(v) || !SAFE_ID.test(str(v.id))) return null;
  const status = str(v.status);
  if (!STATUSES.has(status)) return null;
  const service = isObj(v.service) ? v.service : {};
  const pro = isObj(v.professional) ? v.professional : {};
  const rating = isObj(v.rating)
    ? { stars: num(v.rating.stars), comment: str(v.rating.comment, 1000), createdAt: str(v.rating.createdAt, 40) }
    : null;
  const serviceIds = Array.isArray(v.serviceIds)
    ? v.serviceIds.filter((s): s is string => typeof s === "string")
    : [str(v.serviceId)];
  return {
    id: str(v.id),
    token: SAFE_ID.test(str(v.token)) ? str(v.token) : "",
    serviceIds,
    serviceName: str(service.name, 120),
    professionalId: str(v.professionalId),
    professionalName: str(pro.name, 120),
    professionalSpecialty: str(pro.specialty, 120),
    professionalAvatar: httpsUrl(pro.avatarUrl),
    start: str(v.start, 40),
    end: str(v.end, 40),
    status: status as AgendaAppointment["status"],
    note: str(v.note, 1000),
    rating: rating && rating.stars >= 1 ? rating : null,
  };
}

const compact = <T,>(items: (T | null)[]) => items.filter((i): i is T => i !== null);

/* ---------------- endpoints ---------------- */

export async function getCatalog(): Promise<AgendaCatalog> {
  const data = await request<{ services?: unknown[]; professionals?: unknown[] }>("catalog/");
  return {
    services: compact((data.services ?? []).map(parseService)),
    professionals: compact((data.professionals ?? []).map(parseProfessional)),
  };
}

/** Preguntas de reserva del negocio, según su plan (el plan Esencial no las usa). */
export async function getBookingQuestions(): Promise<AgendaQuestion[]> {
  let business: unknown;
  if (BOOKING_BUSINESS_SLUG && SAFE_ID.test(BOOKING_BUSINESS_SLUG)) {
    business = await request<unknown>(`businesses/${encodeURIComponent(BOOKING_BUSINESS_SLUG)}/`);
  } else {
    const list = await request<unknown[]>("businesses/");
    business = Array.isArray(list) ? list[0] : null;
  }
  if (!isObj(business) || str(business.plan) === "esencial" || !Array.isArray(business.customQuestions)) {
    return [];
  }
  return business.customQuestions
    .filter(isObj)
    .map((q) => {
      const type = str(q.type);
      return {
        id: str(q.id, 64),
        label: str(q.label, 200),
        type: (type === "yesno" || type === "choice" ? type : "text") as AgendaQuestion["type"],
        options: Array.isArray(q.options) ? q.options.filter((o): o is string => typeof o === "string").map((o) => o.slice(0, 120)) : [],
        required: q.required === true,
      };
    })
    .filter((q) => q.id && q.label)
    .slice(0, 3);
}

export async function getAvailableDays(serviceIds: string[], professionalId: string): Promise<AgendaDay[]> {
  const data = await request<unknown[]>("available-days/", { params: { serviceIds, professionalId } });
  return (Array.isArray(data) ? data : [])
    .filter(isObj)
    .map((d) => ({ date: str(d.date, 10), available: d.available === true }))
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date));
}

export async function getSlots(serviceIds: string[], professionalId: string, date: string): Promise<AgendaSlot[]> {
  const data = await request<unknown[]>("slots/", { params: { serviceIds, professionalId, date } });
  const groups = Array.isArray(data) ? data.filter(isObj) : [];
  return groups
    .flatMap((g) => (Array.isArray(g.slots) ? g.slots : []))
    .filter(isObj)
    .map((s) => ({ start: str(s.start, 40), professionalId: str(s.professionalId, 96) }))
    .filter((s) => s.start && SAFE_ID.test(s.professionalId));
}

export interface BookingInput {
  serviceIds: string[];
  professionalId: string;
  start: string;
  name: string;
  phone: string;
  email?: string;
  note?: string;
  privacyAccepted: boolean;
  /** Respuestas a las preguntas del negocio: texto exacto de la pregunta + respuesta. */
  answers?: { question: string; answer: string }[];
}

export async function createBooking(input: BookingInput): Promise<AgendaAppointment> {
  const data = await request<unknown>("bookings/", {
    method: "POST",
    body: {
      serviceId: input.serviceIds[0],
      serviceIds: input.serviceIds,
      professionalId: input.professionalId,
      start: input.start,
      name: input.name.trim().slice(0, 160),
      phone: input.phone.trim().slice(0, 40),
      email: input.email?.trim().slice(0, 160) || undefined,
      note: input.note?.trim().slice(0, 1000) || undefined,
      reminder: true,
      privacyAccepted: input.privacyAccepted,
      answers: (input.answers ?? [])
        .map((a) => ({ question: a.question.slice(0, 200), answer: a.answer.trim().slice(0, 500) }))
        .filter((a) => a.answer),
    },
  });
  const appointment = parseAppointment(data);
  if (!appointment) throw new AgendaApiError("invalid", "Respuesta inesperada del sistema de citas.", 200);
  return appointment;
}

/** Citas del cliente con sesión de Google; null si no hay sesión. */
export async function getClientProfile(): Promise<AgendaClientProfile | null> {
  try {
    const data = await request<{ client?: unknown; scheduled?: unknown[]; history?: unknown[] }>("client-profile/");
    const client = isObj(data.client) ? data.client : {};
    return {
      name: str(client.name, 120),
      phone: str(client.phone, 40),
      email: str(client.email, 254),
      scheduled: compact((data.scheduled ?? []).map(parseAppointment)),
      history: compact((data.history ?? []).map(parseAppointment)),
    };
  } catch (error) {
    if (error instanceof AgendaApiError && error.status === 401) return null;
    throw error;
  }
}

export async function rateAppointment(appointmentId: string, stars: number, comment: string) {
  if (!SAFE_ID.test(appointmentId)) throw new AgendaApiError("invalid", "Cita inválida.", 400);
  const data = await request<unknown>(`appointments/${encodeURIComponent(appointmentId)}/rate/`, {
    method: "POST",
    body: { stars: Math.max(1, Math.min(5, Math.round(stars))), comment: comment.trim().slice(0, 1000) },
  });
  return parseAppointment(data);
}

/* ---------------- formato en hora de Bogotá ---------------- */

export function formatBogotaDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: BUSINESS_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatBogotaTime(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: BUSINESS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export function durationMinutes(startIso: string, endIso: string): number {
  return Math.max(0, Math.round((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60000));
}
