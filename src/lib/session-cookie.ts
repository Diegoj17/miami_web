import { createHmac, timingSafeEqual } from "node:crypto";

export interface ServerGoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export function signGoogleSessionCookie(
  user: ServerGoogleUser,
  secret: string,
): string {
  const payload = Buffer.from(JSON.stringify(user), "utf-8").toString(
    "base64url",
  );
  const signature = createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyGoogleSessionCookie(
  cookieValue: string | undefined,
  secret: string | undefined,
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
    ) as ServerGoogleUser;
    if (!parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}
