import { PHONE_COOLDOWN_DAYS } from "./config";

export interface PhonePolicyStatus {
  canChange: boolean;
  cooldownDays: number;
  daysElapsed: number;
  daysRemaining: number;
  hoursRemaining: number;
  progressPercent: number;
  lastChangedAt: string | null;
  lastChangedFormatted: string | null;
  nextAvailableDate: Date | null;
  nextAvailableFormatted: string | null;
}

export interface CountryDialOption {
  code: string;
  country: string;
  label: string;
  minDigits: number;
  maxDigits: number;
  placeholder: string;
}

export const COUNTRY_DIAL_OPTIONS: CountryDialOption[] = [
  {
    code: "+52",
    country: "MX",
    label: "México (+52)",
    minDigits: 10,
    maxDigits: 10,
    placeholder: "55 4821 0934",
  },
  {
    code: "+1",
    country: "US",
    label: "EE. UU. / Canadá (+1)",
    minDigits: 10,
    maxDigits: 10,
    placeholder: "305 555 0198",
  },
  {
    code: "+57",
    country: "CO",
    label: "Colombia (+57)",
    minDigits: 10,
    maxDigits: 10,
    placeholder: "300 412 8890",
  },
  {
    code: "+34",
    country: "ES",
    label: "España (+34)",
    minDigits: 9,
    maxDigits: 9,
    placeholder: "612 345 678",
  },
  {
    code: "+54",
    country: "AR",
    label: "Argentina (+54)",
    minDigits: 10,
    maxDigits: 11,
    placeholder: "11 4589 2201",
  },
];

const MS_PER_HOUR = 1000 * 60 * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

export function formatSpanishDate(date: Date, includeTime = false): string {
  const options: Intl.DateTimeFormatOptions = includeTime
    ? {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    : {
        day: "numeric",
        month: "long",
        year: "numeric",
      };

  return new Intl.DateTimeFormat("es-MX", options).format(date);
}

export function evaluatePhonePolicy(
  lastChangedAt: string | null | undefined,
  now: Date = new Date(),
): PhonePolicyStatus {
  const cooldownMs = PHONE_COOLDOWN_DAYS * MS_PER_DAY;

  if (!lastChangedAt) {
    return {
      canChange: true,
      cooldownDays: PHONE_COOLDOWN_DAYS,
      daysElapsed: PHONE_COOLDOWN_DAYS,
      daysRemaining: 0,
      hoursRemaining: 0,
      progressPercent: 100,
      lastChangedAt: null,
      lastChangedFormatted: null,
      nextAvailableDate: null,
      nextAvailableFormatted: null,
    };
  }

  const lastDate = new Date(lastChangedAt);
  if (Number.isNaN(lastDate.getTime())) {
    return {
      canChange: true,
      cooldownDays: PHONE_COOLDOWN_DAYS,
      daysElapsed: PHONE_COOLDOWN_DAYS,
      daysRemaining: 0,
      hoursRemaining: 0,
      progressPercent: 100,
      lastChangedAt: null,
      lastChangedFormatted: null,
      nextAvailableDate: null,
      nextAvailableFormatted: null,
    };
  }

  const nextAvailableDate = new Date(lastDate.getTime() + cooldownMs);
  const diffMs = nextAvailableDate.getTime() - now.getTime();
  const elapsedMs = Math.max(0, now.getTime() - lastDate.getTime());

  if (diffMs <= 0) {
    return {
      canChange: true,
      cooldownDays: PHONE_COOLDOWN_DAYS,
      daysElapsed: Math.floor(elapsedMs / MS_PER_DAY),
      daysRemaining: 0,
      hoursRemaining: 0,
      progressPercent: 100,
      lastChangedAt,
      lastChangedFormatted: formatSpanishDate(lastDate),
      nextAvailableDate,
      nextAvailableFormatted: formatSpanishDate(nextAvailableDate),
    };
  }

  const daysRemaining = Math.ceil(diffMs / MS_PER_DAY);
  const hoursRemaining = Math.max(1, Math.ceil(diffMs / MS_PER_HOUR));
  const daysElapsed = Math.min(
    PHONE_COOLDOWN_DAYS,
    Math.floor(elapsedMs / MS_PER_DAY),
  );
  const progressPercent = Math.min(
    99,
    Math.max(3, Math.round((elapsedMs / cooldownMs) * 100)),
  );

  return {
    canChange: false,
    cooldownDays: PHONE_COOLDOWN_DAYS,
    daysElapsed,
    daysRemaining,
    hoursRemaining,
    progressPercent,
    lastChangedAt,
    lastChangedFormatted: formatSpanishDate(lastDate),
    nextAvailableDate,
    nextAvailableFormatted: formatSpanishDate(nextAvailableDate),
  };
}

export function normalizeDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function formatLocalDigits(digits: string): string {
  const clean = normalizeDigits(digits);
  if (clean.length === 10) {
    return `${clean.slice(0, 2)} ${clean.slice(2, 6)} ${clean.slice(6, 10)}`;
  }
  if (clean.length === 9) {
    return `${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6, 9)}`;
  }
  return clean.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

export function buildFormattedPhone(countryCode: string, localInput: string): string {
  const formattedLocal = formatLocalDigits(localInput);
  return `${countryCode} ${formattedLocal}`.trim();
}

export function validatePhoneInput(
  countryCode: string,
  localInput: string,
  currentPhone: string,
): { valid: boolean; error?: string; formatted?: string } {
  const option =
    COUNTRY_DIAL_OPTIONS.find((item) => item.code === countryCode) ||
    COUNTRY_DIAL_OPTIONS[0];
  const digits = normalizeDigits(localInput);

  if (!digits) {
    return { valid: false, error: "Ingresa el nuevo número telefónico." };
  }

  if (digits.length < option.minDigits || digits.length > option.maxDigits) {
    const expected =
      option.minDigits === option.maxDigits
        ? `${option.minDigits} dígitos`
        : `entre ${option.minDigits} y ${option.maxDigits} dígitos`;
    return {
      valid: false,
      error: `Para ${option.label} ingresa ${expected} (actualmente ${digits.length}).`,
    };
  }

  if (/^(\d)\1+$/.test(digits)) {
    return {
      valid: false,
      error: "Ingresa un número telefónico válido y verificable.",
    };
  }

  const formatted = buildFormattedPhone(countryCode, digits);
  if (normalizeDigits(formatted) === normalizeDigits(currentPhone)) {
    return {
      valid: false,
      error: "El número ingresado es idéntico a tu teléfono actual.",
    };
  }

  return { valid: true, formatted };
}

export function computeFutureLockDateFormatted(now: Date = new Date()): string {
  const unlock = new Date(now.getTime() + PHONE_COOLDOWN_DAYS * MS_PER_DAY);
  return formatSpanishDate(unlock);
}

export function maskPhoneForAudit(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 6) return trimmed;
  const lastFour = normalizeDigits(trimmed).slice(-4);
  const prefixMatch = trimmed.match(/^\+\d{1,3}/);
  const prefix = prefixMatch ? prefixMatch[0] : "";
  return `${prefix} •• •••• ${lastFour}`.trim();
}
