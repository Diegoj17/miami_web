import {
  AppointmentRating,
  createSeedAccounts,
  ScheduledAppointment,
  UserProfileData,
  photos,
} from "./data";
import { maskPhoneForAudit, normalizeDigits } from "./phone-policy";

const ACCOUNTS_KEY = "cobre_club_accounts_v1";
const ACTIVE_SESSION_KEY = "cobre_club_session_v1";

export type ActiveSession =
  | {
      mode: "google";
      email: string;
    }
  | {
      mode: "guest";
      guestName: string;
      lookupQuery: string;
      matchedAppointments: ScheduledAppointment[];
    }
  | null;

export function loadAccountsStore(): Record<string, UserProfileData> {
  if (typeof window === "undefined") {
    return createSeedAccounts();
  }
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      const seeded = createSeedAccounts();
      window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const parsed = JSON.parse(raw) as Record<string, UserProfileData>;
    const defaults = createSeedAccounts();
    return { ...defaults, ...parsed };
  } catch {
    return createSeedAccounts();
  }
}

export function saveAccountsStore(store: Record<string, UserProfileData>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(store));
  } catch {
    // Ignore storage quota issues
  }
}

export function loadActiveSession(): ActiveSession {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ActiveSession;
  } catch {
    return null;
  }
}

export function saveActiveSession(session: ActiveSession): void {
  if (typeof window === "undefined") return;
  try {
    if (!session) {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    } else {
      window.localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    }
  } catch {
    // Ignore storage errors
  }
}

export function getOrCreateGoogleUser(params: {
  email: string;
  name: string;
  avatarUrl?: string;
}): UserProfileData {
  const normalizedEmail = params.email.trim().toLowerCase();
  const store = loadAccountsStore();

  if (store[normalizedEmail]) {
    const existing = store[normalizedEmail];
    const updated: UserProfileData = {
      ...existing,
      name: existing.name || params.name,
      avatarUrl: params.avatarUrl || existing.avatarUrl,
    };
    store[normalizedEmail] = updated;
    saveAccountsStore(store);
    return updated;
  }

  const randomCode = Math.floor(1000 + Math.random() * 9000);
  const newUser: UserProfileData = {
    id: `usr_${Date.now()}`,
    email: normalizedEmail,
    name: params.name.trim() || "Cliente Cobre",
    avatarUrl: params.avatarUrl,
    provider: "google",
    memberCode: `SOCIO COBRE #${randomCode}`,
    memberSince: "Octubre 2026",
    phone: "+52 55 3410 8821",
    lastPhoneChangeAt: null,
    phoneHistory: [],
    preferredBarberId: "mateo",
    styleNotes: "",
    whatsappReminders: true,
    emailReminders: true,
    scheduledAppointments: [
      {
        id: `sch_${Date.now()}`,
        folio: "CB-8704",
        dateLabel: "Miércoles, 11 de noviembre de 2026",
        isoDate: "2026-11-11T17:00:00-06:00",
        time: "17:00",
        duration: "50 min",
        barberId: "mateo",
        barberName: "Mateo Cruz",
        barberSpecialty: "Fades precisos y diseño",
        barberImage: photos.mateo,
        serviceName: "Corte Signature",
        extras: [],
        total: 42,
        status: "Confirmada",
        daysAwayLabel: "Próxima cita confirmada",
        clientNotes: "Diagnóstico personalizado en primera sesión con cuenta vinculada.",
        guestPhoneNormalized: "525534108821",
      },
    ],
    pastAppointments: [
      {
        id: `past_${Date.now()}`,
        folio: "CB-8092",
        date: "15 OCT 2026",
        lookTitle: "Corte Signature clásico",
        barberId: "mateo",
        barberName: "Mateo Cruz",
        barberImage: photos.mateo,
        serviceName: "Corte Signature",
        extras: [],
        total: 42,
        image: photos.cuts[0],
        barberNotes:
          "Laterales limpios con tijera y transición suave en nuca. Acabado natural.",
        rating: null,
      },
    ],
  };

  store[normalizedEmail] = newUser;
  saveAccountsStore(store);
  return newUser;
}

export function saveAppointmentRating(
  email: string,
  appointmentId: string,
  rating: AppointmentRating,
): UserProfileData | null {
  const key = email.trim().toLowerCase();
  const store = loadAccountsStore();
  const account = store[key];
  if (!account) return null;

  const updated: UserProfileData = {
    ...account,
    pastAppointments: account.pastAppointments.map((apt) =>
      apt.id === appointmentId ? { ...apt, rating } : apt,
    ),
  };

  store[key] = updated;
  saveAccountsStore(store);
  return updated;
}

export function updateProfilePreferences(
  email: string,
  updates: {
    name: string;
    preferredBarberId: string;
    styleNotes: string;
    whatsappReminders: boolean;
    emailReminders: boolean;
  },
): UserProfileData | null {
  const key = email.trim().toLowerCase();
  const store = loadAccountsStore();
  const account = store[key];
  if (!account) return null;

  const updated: UserProfileData = {
    ...account,
    name: updates.name.trim() || account.name,
    preferredBarberId: updates.preferredBarberId,
    styleNotes: updates.styleNotes,
    whatsappReminders: updates.whatsappReminders,
    emailReminders: updates.emailReminders,
  };

  store[key] = updated;
  saveAccountsStore(store);
  return updated;
}

export function commitPhoneChangeWithCooldown(
  email: string,
  newFormattedPhone: string,
  changedAtIso: string = new Date().toISOString(),
): UserProfileData | null {
  const key = email.trim().toLowerCase();
  const store = loadAccountsStore();
  const account = store[key];
  if (!account) return null;

  const auditEntry = {
    id: `ph_${Date.now()}`,
    previousPhoneMasked: maskPhoneForAudit(account.phone),
    newPhone: newFormattedPhone,
    changedAt: changedAtIso,
  };

  const normalizedDigits = normalizeDigits(newFormattedPhone);
  const updated: UserProfileData = {
    ...account,
    phone: newFormattedPhone,
    lastPhoneChangeAt: changedAtIso,
    phoneHistory: [auditEntry, ...account.phoneHistory].slice(0, 5),
    scheduledAppointments: account.scheduledAppointments.map((item) => ({
      ...item,
      guestPhoneNormalized: normalizedDigits,
    })),
  };

  store[key] = updated;
  saveAccountsStore(store);
  return updated;
}

const GUEST_LOCK_KEY = "cobre_guest_lookup_lock_v1";
const GUEST_MAX_ATTEMPTS = 5;
const GUEST_LOCK_MS = 5 * 60 * 1000;

/** Minutos que faltan para volver a intentar la consulta de invitado (0 = sin bloqueo). */
export function guestLookupLockedMinutes(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(GUEST_LOCK_KEY);
    const state = raw ? (JSON.parse(raw) as { until?: number }) : null;
    const left = (state?.until ?? 0) - Date.now();
    return left > 0 ? Math.ceil(left / 60000) : 0;
  } catch {
    return 0;
  }
}

function registerGuestLookupResult(success: boolean): void {
  if (typeof window === "undefined") return;
  try {
    if (success) {
      window.sessionStorage.removeItem(GUEST_LOCK_KEY);
      return;
    }
    const raw = window.sessionStorage.getItem(GUEST_LOCK_KEY);
    const state = raw
      ? (JSON.parse(raw) as { fails?: number; until?: number })
      : {};
    const fails = (state.fails ?? 0) + 1;
    window.sessionStorage.setItem(
      GUEST_LOCK_KEY,
      JSON.stringify(
        fails >= GUEST_MAX_ATTEMPTS
          ? { fails: 0, until: Date.now() + GUEST_LOCK_MS }
          : { fails },
      ),
    );
  } catch {
    // Sin almacenamiento de sesión: no se puede llevar la cuenta.
  }
}

/**
 * Consulta de invitado: exige el folio Y el teléfono de la reservación,
 * y solo devuelve esa cita. Un folio o un teléfono por separado no basta.
 */
export function lookupGuestAppointments(
  folio: string,
  phone: string,
): {
  found: boolean;
  guestName: string;
  appointments: ScheduledAppointment[];
} {
  const notFound = { found: false, guestName: "", appointments: [] };
  if (guestLookupLockedMinutes() > 0) return notFound;

  const wantedFolio = folio.trim().toUpperCase();
  const digits = normalizeDigits(phone);
  if (!/^CB-\d{4}$/.test(wantedFolio) || digits.length < 10) {
    registerGuestLookupResult(false);
    return notFound;
  }

  for (const account of Object.values(loadAccountsStore())) {
    const accountDigits = normalizeDigits(account.phone);
    const phoneMatches = accountDigits.slice(-10) === digits.slice(-10);
    const appointment = account.scheduledAppointments.find(
      (apt) => apt.folio.toUpperCase() === wantedFolio,
    );
    if (appointment && phoneMatches) {
      registerGuestLookupResult(true);
      return {
        found: true,
        guestName: account.name,
        appointments: [appointment],
      };
    }
  }

  registerGuestLookupResult(false);
  return notFound;
}
