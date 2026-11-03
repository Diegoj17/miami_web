"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import {
  type CookieConsent,
  readConsent,
  saveConsent,
  subscribeConsent,
  subscribeOpenSettings,
} from "@/lib/cookie-consent";

/** Elección actual; null hasta que el visitante decide (y siempre en el servidor). */
export function useCookieConsent(): CookieConsent | null {
  return useSyncExternalStore(subscribeConsent, readConsent, () => null);
}

/**
 * Aviso de cookies: aparece hasta que el visitante elige y se puede reabrir
 * desde el pie de página. Las imprescindibles mantienen la sesión con Google;
 * las opcionales solo cargan el mapa de Google Maps.
 */
export function CookieNotice() {
  const consent = useCookieConsent();
  const [mounted, setMounted] = useState(false);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    setMounted(true);
    return subscribeOpenSettings(() => setReopened(true));
  }, []);

  if (!mounted || (consent && !reopened)) return null;

  const choose = (value: CookieConsent) => {
    saveConsent(value);
    setReopened(false);
  };

  return (
    <section className="cookie-notice" role="region" aria-label="Aviso de cookies">
      <div className="cookie-notice-copy">
        <strong>Usamos cookies</strong>
        <p>
          Las imprescindibles mantienen tu sesión cuando inicias sesión con Google y recuerdan
          esta elección. Con tu permiso, también cargamos el mapa de Google Maps, que usa
          cookies de Google.{" "}
          <a href="/cookies">Política de cookies</a>
        </p>
      </div>
      <div className="cookie-notice-actions">
        <button type="button" className="btn btn-outline" onClick={() => choose("necessary")}>
          Solo necesarias
        </button>
        <button type="button" className="btn btn-primary" onClick={() => choose("all")}>
          Aceptar todas
        </button>
      </div>
    </section>
  );
}
