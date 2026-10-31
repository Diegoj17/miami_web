import { createHmac, timingSafeEqual } from "node:crypto";

export interface ServerGoogleUser {
  email: string;
  name: string;
  picture?: string;
}

/** Duración de la sesión firmada (también es el maxAge de la cookie). */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

/** Longitud mínima de AUTH_SECRET para firmar sesiones (≈ 256 bits en base64/hex). */
const MIN_SECRET_LENGTH = 32;

/** AUTH_SECRET solo si es lo bastante largo; un secreto débil equivale a no configurado. */
export function getAuthSecret(): string | null {
  const secret = process.env.AUTH_SECRET;
  return secret && secret.length >= MIN_SECRET_LENGTH ? secret : null;
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(
    process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET &&
      getAuthSecret(),
  );
}

/** Solo se aceptan fotos de perfil por HTTPS. */
function safePicture(picture: string | undefined): string | undefined {
  if (!picture) return undefined;
  try {
    return new URL(picture).protocol === "https:" ? picture : undefined;
  } catch {
    return undefined;
  }
}

interface SessionPayload extends ServerGoogleUser {
  /** Expiración (segundos Unix): la firma deja de valer aunque roben la cookie. */
  exp: number;
}

export function signGoogleSessionCookie(
  user: ServerGoogleUser,
  secret: string,
): string {
  const data: SessionPayload = {
    email: user.email,
    name: user.name,
    picture: safePicture(user.picture),
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(data), "utf-8").toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyGoogleSessionCookie(
  cookieValue: string | undefined,
  secret: string | null | undefined,
): ServerGoogleUser | null {
  if (!cookieValue || !secret) return null;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;

  const expected = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8"),
    ) as Partial<SessionPayload>;
    if (typeof parsed?.email !== "string" || !parsed.email) return null;
    if (typeof parsed.exp !== "number" || parsed.exp * 1000 < Date.now()) {
      return null;
    }
    return {
      email: parsed.email,
      name: typeof parsed.name === "string" ? parsed.name : parsed.email,
      picture: safePicture(parsed.picture),
    };
  } catch {
    return null;
  }
}
