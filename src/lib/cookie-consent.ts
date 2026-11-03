/**
 * Elección de cookies del visitante. Se guarda en una cookie propia (no en
 * localStorage, que algunos navegadores bloquean con la prevención de rastreo).
 * - "necessary": solo las imprescindibles (sesión con Google, esta elección).
 * - "all": además las de terceros opcionales (mapa de Google Maps).
 */
export type CookieConsent = "necessary" | "all";

export const CONSENT_COOKIE = "cobre_cookie_consent";
const CONSENT_MAX_AGE_SECONDS = 180 * 24 * 60 * 60;
const CHANGE_EVENT = "cobre:cookie-consent";
const OPEN_EVENT = "cobre:cookie-settings";

export function readConsent(): CookieConsent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)cobre_cookie_consent=(necessary|all)(?:;|$)/);
  return match ? (match[1] as CookieConsent) : null;
}

export function saveConsent(value: CookieConsent): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

/** Vuelve a mostrar el aviso para cambiar la elección (enlace del pie de página). */
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function subscribeOpenSettings(onOpen: () => void): () => void {
  window.addEventListener(OPEN_EVENT, onOpen);
  return () => window.removeEventListener(OPEN_EVENT, onOpen);
}
