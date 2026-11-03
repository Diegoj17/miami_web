import { BACKEND_API_ORIGIN } from "./config";

/**
 * Sesión del cliente compartida con la agenda: la cookie HttpOnly la pone y la
 * valida el backend. La landing nunca ve el token; solo pregunta quién es el
 * cliente y sin guardar nada en el navegador.
 * Las rutas son relativas: `/api/` se reenvía al backend desde este mismo dominio
 * (ver `rewrites` en next.config.mjs), así la cookie es de la propia landing.
 */
export interface BackendClient {
  email: string;
  name: string;
  avatarUrl?: string;
}

export const backendSessionEnabled = Boolean(BACKEND_API_ORIGIN);

/** Ruta de inicio con Google en el backend; al terminar vuelve a esta landing (`next`). */
export function backendGoogleLoginUrl(next = "/"): string {
  return `/api/auth/google/start/?${new URLSearchParams({ app: "landing", next })}`;
}

function safeAvatar(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    return new URL(value).protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Cliente con sesión en el backend, o null. Valida cada campo de la respuesta. */
export async function fetchBackendClient(): Promise<BackendClient | null> {
  if (!backendSessionEnabled) return null;
  try {
    const res = await fetch("/api/auth/client/session/", {
      credentials: "same-origin",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { client?: Record<string, unknown> };
    const client = data?.client;
    const email = typeof client?.email === "string" ? client.email.trim() : "";
    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return null;
    }
    const name =
      typeof client?.name === "string" && client.name.trim()
        ? client.name.trim().slice(0, 120)
        : email.split("@")[0];
    return { email, name, avatarUrl: safeAvatar(client?.avatarUrl) };
  } catch {
    return null;
  }
}

/** Cierra la sesión en el backend: también queda cerrada en la agenda. */
export async function backendLogout(): Promise<void> {
  if (!backendSessionEnabled) return;
  try {
    await fetch("/api/auth/client/logout/", {
      method: "POST",
      credentials: "same-origin",
      headers: { Accept: "application/json" },
    });
  } catch {
    // Sin conexión: la cookie igual vence en el servidor.
  }
}
