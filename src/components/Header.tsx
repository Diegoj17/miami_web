"use client";

import { useState } from "react";
import { Icon } from "./Icons";
import { BookingButton } from "./UIPrimitives";

export type Screen = "landing" | "portfolio" | "portal" | "login";
export type PortalTab = "scheduled" | "history" | "profile";

export function Header({
  screen,
  portalTab,
  navigate,
  openPortalTab,
  sessionMode,
  userName,
  unratedCount,
}: {
  screen: Screen;
  portalTab: PortalTab;
  navigate: (screen: Screen) => void;
  openPortalTab: (tab: PortalTab) => void;
  sessionMode: "google" | "guest" | null;
  userName?: string;
  unratedCount: number;
}) {
  const [open, setOpen] = useState(false);

  const scrollHome = (id: string) => {
    if (screen !== "landing") {
      navigate("landing");
      window.setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        60,
      );
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  const firstName = userName ? userName.split(" ")[0] : "";

  return (
    <header
      className={`site-header ${screen === "landing" ? "home-header" : ""}`}
    >
      <button
        className="brand"
        onClick={() => {
          navigate("landing");
          setOpen(false);
        }}
        aria-label="Ir al inicio de Cobre Barber Club"
      >
        <span className="brand-mark">
          <b>C</b>
        </span>
        <span className="brand-name">
          Cobre <i>Barber Club</i>
        </span>
      </button>

      <nav className={open ? "nav-open" : ""}>
        {screen === "landing" ? (
          <>
            <button onClick={() => scrollHome("servicios")}>Servicios</button>
            <button onClick={() => scrollHome("barberos")}>Barberos</button>
            <button onClick={() => scrollHome("galeria")}>Galería</button>
            <button onClick={() => scrollHome("ubicacion")}>Ubicación</button>
            {sessionMode && (
              <button
                className="nav-portal-highlight"
                onClick={() => {
                  openPortalTab("scheduled");
                  setOpen(false);
                }}
              >
                Mis citas
                {sessionMode === "google" && unratedCount > 0 && (
                  <small className="nav-badge">{unratedCount}</small>
                )}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                navigate("landing");
                setOpen(false);
              }}
            >
              Inicio
            </button>
            {sessionMode && (
              <>
                <button
                  className={
                    screen === "portal" && portalTab === "scheduled"
                      ? "active"
                      : ""
                  }
                  onClick={() => {
                    openPortalTab("scheduled");
                    setOpen(false);
                  }}
                >
                  Citas programadas
                </button>
                {sessionMode === "google" && (
                  <>
                    <button
                      className={
                        screen === "portal" && portalTab === "history"
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        openPortalTab("history");
                        setOpen(false);
                      }}
                    >
                      Historial y calificar
                      {unratedCount > 0 && (
                        <small className="nav-badge">{unratedCount}</small>
                      )}
                    </button>
                    <button
                      className={
                        screen === "portal" && portalTab === "profile"
                          ? "active"
                          : ""
                      }
                      onClick={() => {
                        openPortalTab("profile");
                        setOpen(false);
                      }}
                    >
                      Mi perfil
                    </button>
                  </>
                )}
              </>
            )}
          </>
        )}
      </nav>

      {screen === "landing" && (
        <div className="header-book-slot">
          <BookingButton label="Agendar cita" compact className="header-book" />
        </div>
      )}

      <button
        className={`profile-button ${sessionMode ? "is-logged" : ""}`}
        onClick={() => {
          setOpen(false);
          if (sessionMode) {
            openPortalTab("scheduled");
          } else {
            navigate("login");
          }
        }}
        aria-label={
          sessionMode === "google"
            ? "Ir a mi cuenta"
            : sessionMode === "guest"
              ? "Ver consulta de invitado"
              : "Iniciar sesión"
        }
      >
        {sessionMode === "google" && firstName ? (
          <span className="profile-avatar-chip">{firstName.charAt(0)}</span>
        ) : (
          <Icon name="user" size={16} />
        )}
        <span>
          {sessionMode === "google"
            ? firstName || "Mi cuenta"
            : sessionMode === "guest"
              ? "Invitado"
              : "Iniciar sesión"}
        </span>
      </button>

      <button
        className="menu-button"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
      >
        <Icon name={open ? "close" : "menu"} />
      </button>
    </header>
  );
}
