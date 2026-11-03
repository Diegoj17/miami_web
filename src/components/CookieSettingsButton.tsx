"use client";

import { openCookieSettings } from "@/lib/cookie-consent";

export function CookieSettingsButton() {
  return (
    <button type="button" className="btn btn-outline" onClick={openCookieSettings}>
      Cambiar mi elección
    </button>
  );
}
