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

export function lookupGuestAppointments(query: string): {
  found: boolean;
  guestName: string;
  appointments: ScheduledAppointment[];
} {
  const trimmed = query.trim().toUpperCase();
  const digits = normalizeDigits(query);
  const store = loadAccountsStore();

  for (const account of Object.values(store)) {
    const accountDigits = normalizeDigits(account.phone);
    const phoneMatch =
      digits.length >= 8 &&
      (accountDigits.endsWith(digits.slice(-8)) ||
        digits.endsWith(accountDigits.slice(-8)));

    const folioMatches = account.scheduledAppointments.filter(
      (apt) => apt.folio.toUpperCase() === trimmed,
    );

    if (folioMatches.length > 0) {
      return {
        found: true,
        guestName: account.name,
        appointments: folioMatches,
      };
    }

    if (phoneMatch && account.scheduledAppointments.length > 0) {
      return {
        found: true,
        guestName: account.name,
        appointments: account.scheduledAppointments,
      };
    }
  }

  return {
    found: false,
    guestName: "",
    appointments: [],
  };
}
