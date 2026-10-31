"use client";

import { FormEvent, useState } from "react";
import { photos, ScheduledAppointment } from "@/lib/data";
import {
  guestLookupLockedMinutes,
  lookupGuestAppointments,
} from "@/lib/storage";
import { GoogleLogo, Icon } from "./Icons";
import { Button, Eyebrow } from "./UIPrimitives";

type AuthTab = "google" | "guest";

export function LoginScreen({
  onBack,
  googleOAuthConfigured,
  demoLoginAllowed,
  onGoogleLoginSuccess,
  onGuestLookupSuccess,
}: {
  onBack: () => void;
  googleOAuthConfigured: boolean;
  /** Selector de cuentas de demostración: solo en desarrollo y sin OAuth real. */
  demoLoginAllowed: boolean;
  onGoogleLoginSuccess: (params: {
    email: string;
    name: string;
    avatarUrl?: string;
  }) => void;
  onGuestLookupSuccess: (params: {
    guestName: string;
    lookupQuery: string;
    appointments: ScheduledAppointment[];
  }) => void;
}) {
  const [activeTab, setActiveTab] = useState<AuthTab>("google");
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [googleError, setGoogleError] = useState("");

  // Guest lookup state
  const [guestFolio, setGuestFolio] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestError, setGuestError] = useState("");

  const handleGoogleClick = () => {
    if (googleOAuthConfigured) {
      setIsRedirecting(true);
      window.location.href = "/api/auth/google";
      return;
    }
    if (demoLoginAllowed) {
      setShowGoogleChooser(true);
      return;
    }
    setGoogleError(
      "El acceso con Google no está disponible en este momento. Puedes consultar tu cita como invitado.",
    );
  };

  const handleCustomGoogleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!demoLoginAllowed) return;
    setCustomError("");
    const cleanEmail = customEmail.trim().toLowerCase();
    const cleanName = customName.trim();
    if (!cleanName || cleanName.length < 2) {
      setCustomError("Ingresa tu nombre completo.");
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setCustomError("Ingresa un correo electrónico válido.");
      return;
    }
    setShowGoogleChooser(false);
    onGoogleLoginSuccess({
      email: cleanEmail,
      name: cleanName,
    });
  };

  const handleGuestSubmit = (e: FormEvent) => {
    e.preventDefault();
    setGuestError("");
    if (!guestFolio.trim() || !guestPhone.trim()) {
      setGuestError(
        "Ingresa el código de tu cita (ej. CB-8492) y el teléfono de la reservación.",
      );
      return;
    }

    const lockedBefore = guestLookupLockedMinutes();
    if (lockedBefore > 0) {
      setGuestError(
        `Demasiados intentos. Vuelve a intentarlo en ${lockedBefore} min o inicia sesión con Google.`,
      );
      return;
    }

    const result = lookupGuestAppointments(guestFolio, guestPhone);
    if (!result.found) {
      const locked = guestLookupLockedMinutes();
      setGuestError(
        locked > 0
          ? `Demasiados intentos. Vuelve a intentarlo en ${locked} min o inicia sesión con Google.`
          : "No encontramos una cita con ese código y teléfono. Revisa los datos de tu confirmación.",
      );
      return;
    }

    onGuestLookupSuccess({
      guestName: result.guestName,
      lookupQuery: guestFolio.trim().toUpperCase(),
      appointments: result.appointments,
    });
  };

  return (
    <main className="login-page">
      <div className="login-art" aria-hidden="true">
        <img src={photos.chair} alt="" />
        <div className="login-art-top">
          <span className="brand-mark">
            <b>C</b>
          </span>
          <div>
            <strong>Cobre Barber Club</strong>
            <small>Roma Norte · Desde 2016</small>
          </div>
        </div>
        <div className="login-art-copy">
          <span>Experiencia de socios</span>
          <p>Tu estilo, tus citas programadas y tu historia en un solo lugar.</p>
          <div className="login-art-pills">
            <em>Citas activas</em>
            <em>Calificaciones verificadas</em>
            <em>Perfil protegido</em>
          </div>
        </div>
      </div>

      <section className="login-panel">
        <Button variant="ghost" className="back-link" onClick={onBack}>
          <Icon name="back" /> Volver al inicio
        </Button>

        <div className="login-card">
          <div className="login-monogram">
            <b>C</b>
          </div>

          <div className="auth-mode-tabs" role="tablist" aria-label="Tipo de acceso">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "google"}
              className={activeTab === "google" ? "active" : ""}
              onClick={() => {
                setActiveTab("google");
                setGuestError("");
              }}
            >
              <Icon name="user" size={14} />
              Cuenta Google
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "guest"}
              className={activeTab === "guest" ? "active" : ""}
              onClick={() => setActiveTab("guest")}
            >
              <Icon name="search" size={14} />
              Como invitado
            </button>
          </div>

          {activeTab === "google" ? (
            <div className="auth-pane">
              <Eyebrow>Tu cuenta Cobre</Eyebrow>
              <h1>
                Qué gusto
                <br />
                <em>verte de nuevo.</em>
              </h1>
              <p className="login-intro">
                Accede con tu cuenta de Google para gestionar tus próximas citas,
                revisar y calificar tus visitas anteriores y administrar tu
                perfil.
              </p>

              <button
                className="google-button"
                type="button"
                disabled={isRedirecting}
                onClick={handleGoogleClick}
              >
                <GoogleLogo />
                <span>
                  {isRedirecting
                    ? "Conectando con Google…"
                    : "Continuar con Google"}
                </span>
              </button>

              {googleError && (
                <p className="login-message is-error" role="alert">
                  {googleError}
                </p>
              )}

              <div className="login-security-badge">
                <Icon name="shield" size={14} />
                <span>
                  Acceso seguro sin contraseñas · Sincronizado con tu correo
                  verificado
                </span>
              </div>

              <div className="login-divider">
                <span>o acceso puntual</span>
              </div>

              <Button
                variant="outline"
                className="guest-button"
                onClick={() => setActiveTab("guest")}
              >
                Consultar cita como invitado <Icon name="arrow" />
              </Button>

              <div className="login-benefits">
                <strong>Tu cuenta con Google incluye</strong>
                <span>
                  <Icon name="check" size={14} /> Consulta detallada de citas
                  programadas
                </span>
                <span>
                  <Icon name="check" size={14} /> Historial completo de cortes y
                  notas del barbero
                </span>
                <span>
                  <Icon name="check" size={14} /> Calificación con estrellas y
                  reseñas de cada visita
                </span>
                <span>
                  <Icon name="check" size={14} /> Perfil personal y actualización
                  protegida de teléfono
                </span>
              </div>
            </div>
          ) : (
            <div className="auth-pane">
              <Eyebrow>Consulta rápida</Eyebrow>
              <h1>
                Revisa tu cita
                <br />
                <em>como invitado.</em>
              </h1>
              <p className="login-intro">
                Ingresa el código de tu cita y el teléfono de la reservación para
                consultar fecha, horario y barbero sin crear cuenta.
              </p>

              <form className="guest-lookup-form" onSubmit={handleGuestSubmit}>
                <label htmlFor="guest-folio-input">Código de la cita</label>
                <div className="guest-input-row">
                  <input
                    id="guest-folio-input"
                    type="text"
                    value={guestFolio}
                    onChange={(e) => {
                      setGuestFolio(e.target.value);
                      if (guestError) setGuestError("");
                    }}
                    placeholder="Ej. CB-8492"
                    autoComplete="off"
                    maxLength={12}
                  />
                </div>
                <label htmlFor="guest-phone-input">Teléfono de la reservación</label>
                <div className="guest-input-row">
                  <input
                    id="guest-phone-input"
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => {
                      setGuestPhone(e.target.value);
                      if (guestError) setGuestError("");
                    }}
                    placeholder="Ej. +52 55 4821 0934"
                    autoComplete="tel"
                    maxLength={20}
                  />
                </div>

                {demoLoginAllowed && (
                  <div className="guest-quick-demos">
                    <small>Ejemplo de demostración:</small>
                    <button
                      type="button"
                      onClick={() => {
                        setGuestFolio("CB-8492");
                        setGuestPhone("+52 55 4821 0934");
                        setGuestError("");
                      }}
                    >
                      CB-8492 · +52 55 4821 0934
                    </button>
                  </div>
                )}

                {guestError && (
                  <p className="login-message is-error" role="alert">
                    {guestError}
                  </p>
                )}

                <Button type="submit" className="guest-submit-btn">
                  Consultar citas programadas <Icon name="arrow" />
                </Button>
              </form>

              <div className="guest-scope-box">
                <Icon name="lock" size={15} />
                <p>
                  <strong>Alcance del modo invitado:</strong> permite visualizar
                  únicamente tus citas programadas. Para acceder a tu{" "}
                  <em>historial de cortes</em>, <em>calificar visitas</em> y{" "}
                  <em>editar tu perfil o teléfono</em>,{" "}
                  <button
                    type="button"
                    className="inline-link-btn"
                    onClick={() => setActiveTab("google")}
                  >
                    inicia sesión con Google
                  </button>
                  .
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {demoLoginAllowed && showGoogleChooser && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Seleccionar cuenta de Google"
          onClick={() => setShowGoogleChooser(false)}
        >
          <div
            className="google-chooser-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="google-chooser-head">
              <div className="google-chooser-brand">
                <GoogleLogo />
                <span>Acceder con Google</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowGoogleChooser(false)}
                aria-label="Cerrar selector"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className="google-chooser-body">
              <h2>Elige una cuenta</h2>
              <p>para continuar a <strong>Cobre Barber Club</strong></p>

              <div className="google-account-list">
                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => {
                    setShowGoogleChooser(false);
                    onGoogleLoginSuccess({
                      email: "santiago.marquez@gmail.com",
                      name: "Santiago Márquez",
                    });
                  }}
                >
                  <span className="account-avatar">S</span>
                  <span className="account-meta">
                    <strong>Santiago Márquez</strong>
                    <small>santiago.marquez@gmail.com</small>
                    <em>
                      2 citas programadas · 2 por calificar · Teléfono habilitado
                    </em>
                  </span>
                  <Icon name="chevron" size={16} />
                </button>

                <button
                  type="button"
                  className="google-account-item"
                  onClick={() => {
                    setShowGoogleChooser(false);
                    onGoogleLoginSuccess({
                      email: "andres.morales@gmail.com",
                      name: "Andrés Morales",
                    });
                  }}
                >
                  <span className="account-avatar alt">A</span>
                  <span className="account-meta">
                    <strong>Andrés Morales</strong>
                    <small>andres.morales@gmail.com</small>
                    <em>
                      1 cita programada · Teléfono en plazo de bloqueo (18 días)
                    </em>
                  </span>
                  <Icon name="chevron" size={16} />
                </button>

                {!showCustomGoogle ? (
                  <button
                    type="button"
                    className="google-account-other"
                    onClick={() => setShowCustomGoogle(true)}
                  >
                    <Icon name="user" size={16} />
                    <span>Usar otra cuenta de Google</span>
                  </button>
                ) : (
                  <form
                    className="custom-google-form"
                    onSubmit={handleCustomGoogleSubmit}
                  >
                    <label>
                      Nombre y apellido
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="Ej. Mateo Valencia"
                      />
                    </label>
                    <label>
                      Correo de Google
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="tu.correo@gmail.com"
                      />
                    </label>
                    {customError && (
                      <span className="field-error">{customError}</span>
                    )}
                    <div className="custom-google-actions">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setShowCustomGoogle(false);
                          setCustomError("");
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">Continuar</Button>
                    </div>
                  </form>
                )}
              </div>

              <p className="google-chooser-footnote">
                Al configurar <code>AUTH_GOOGLE_ID</code> y{" "}
                <code>AUTH_GOOGLE_SECRET</code> en tu entorno, este botón redirige
                directamente a Google OAuth 2.0.
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
