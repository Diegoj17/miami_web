"use client";

import { CLUB_INFO } from "@/lib/config";
import { PortalTab, Screen } from "./Header";

export function Footer({
  screen,
  hasSession,
  openPortalTab,
}: {
  screen: Screen;
  hasSession: boolean;
  openPortalTab: (tab: PortalTab) => void;
}) {
  if (screen === "login") return null;

  if (screen === "landing") {
    return (
      <footer className="landing-footer">
        <div className="page-shell">
          <div className="footer-brand">
            <span className="brand-mark">
              <b>C</b>
            </span>
            <div>
              <strong>Cobre</strong>
              <small>Barber Club</small>
            </div>
          </div>
          <div className="footer-contact">
            <strong>{CLUB_INFO.addressLine1}</strong>
            <span>{CLUB_INFO.phoneDisplay}</span>
            <span>{CLUB_INFO.email}</span>
          </div>
          <div className="footer-links">
            <button
              onClick={() =>
                document
                  .getElementById("servicios")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Servicios
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("barberos")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Barberos
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("ubicacion")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ubicación
            </button>
            {hasSession && (
              <button onClick={() => openPortalTab("scheduled")}>
                Mis citas
              </button>
            )}
          </div>
          <div className="footer-social">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noreferrer">
              TikTok
            </a>
          </div>
          <div className="footer-legal">
            <span>
              © 2026 Cobre Barber Club. Todos los derechos reservados.
            </span>
            <span>Hecho en el barrio · Oficio desde 2016.</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="site-footer">
      <span>CB</span>
      <p>Cobre Barber Club · Oficio desde 2016</p>
      <small>Roma Norte · Ciudad de México</small>
    </footer>
  );
}
