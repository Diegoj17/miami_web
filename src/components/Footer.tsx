"use client";

import { CLUB_INFO } from "@/lib/config";
import { openCookieSettings } from "@/lib/cookie-consent";
import { Screen } from "./Header";
import {
  FacebookLogo,
  Icon,
  InstagramLogo,
  TikTokLogo,
  WhatsAppLogo,
} from "./Icons";

export function Footer({
  screen,
}: {
  screen: Screen;
}) {
  if (screen === "login") return null;

  if (screen === "landing") {
    return (
      <>
        <WhatsAppFloatingButton />
        <footer className="landing-footer">
          <div className="page-shell">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="footer-logo">
                  <span className="brand-mark">
                    <b>C</b>
                  </span>
                  <div>
                    <strong>Cobre</strong>
                    <small>Barber Club</small>
                  </div>
                </div>
                <p>
                  Barbería de autor en Roma Norte. Oficio, conversación honesta y
                  un corte que se siente tuyo.
                </p>
                <div className="footer-social">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                  >
                    <InstagramLogo size={17} />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                  >
                    <FacebookLogo size={17} />
                  </a>
                  <a
                    href="https://tiktok.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                  >
                    <TikTokLogo size={16} />
                  </a>
                </div>
              </div>

              <div className="footer-col">
                <h4>Contacto</h4>
                <a href={CLUB_INFO.phoneHref}>
                  <Icon name="phone" size={14} /> {CLUB_INFO.phoneDisplay}
                </a>
                <a href={CLUB_INFO.whatsappHref} target="_blank" rel="noreferrer">
                  <WhatsAppLogo size={14} /> WhatsApp
                </a>
                <a href={`mailto:${CLUB_INFO.email}`}>{CLUB_INFO.email}</a>
              </div>
            </div>

            <div className="footer-legal">
              <span>© 2026 Cobre Barber Club. Todos los derechos reservados.</span>
              <CookieLinks />
            </div>
          </div>
        </footer>
      </>
    );
  }

  return (
    <>
      <WhatsAppFloatingButton />
      <footer className="site-footer">
        <span>CB</span>
        <p>Cobre Barber Club · Oficio desde 2016</p>
        <small>Roma Norte · Ciudad de México</small>
        <CookieLinks />
      </footer>
    </>
  );
}

function CookieLinks() {
  return (
    <nav className="footer-cookie-links" aria-label="Cookies">
      <a href="/cookies">Política de cookies</a>
      <button type="button" onClick={openCookieSettings}>
        Configurar cookies
      </button>
    </nav>
  );
}

function WhatsAppFloatingButton() {
  const whatsappUrl = `${CLUB_INFO.whatsappHref}?text=${encodeURIComponent(
    "Hola Cobre Barber Club, quisiera recibir información sobre una cita.",
  )}`;

  return (
    <a
      className="whatsapp-floating"
      href={whatsappUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp"
      title="Escríbenos por WhatsApp"
    >
      <WhatsAppLogo size={20} />
    </a>
  );
}
