"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
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
  authErrorReason,
  onGoogleLoginSuccess,
  onGuestLookupSuccess,
}: {
  onBack: () => void;
  googleOAuthConfigured: boolean;
  demoLoginAllowed: boolean;
  authErrorReason?: string | null;
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
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");
  const [googleError, setGoogleError] = useState<string | null>(null);

  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Guest lookup state
  const [guestFolio, setGuestFolio] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestError, setGuestError] = useState("");

  // Reacciona a errores devueltos por el callback de OAuth en la URL
  useEffect(() => {
    if (!authErrorReason) return;
    if (authErrorReason === "cancelled") {
      setGoogleError(
        "Se canceló el acceso con Google. Puedes intentar nuevamente o consultar tu cita como invitado.",
      );
    } else if (authErrorReason === "missing_config") {
      setGoogleError(
        "Faltan credenciales de Google OAuth en el archivo .env.local.",
      );
    } else {
      setGoogleError(
        "No se pudo completar el inicio de sesión con Google. Puedes volver a intentarlo o consultar tu cita como invitado.",
      );
    }
  }, [authErrorReason]);

  // Limpieza del temporizador de redirección al desmontar
  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  const handleGoogleClick = () => {
    setGoogleError(null);

    // Si Google OAuth está configurado en .env.local, mostramos el estado de conexión
    // en la misma pantalla y luego redirigimos en la misma pestaña (sin abrir otra ventana).
    if (googleOAuthConfigured) {
      setIsConnectingGoogle(true);
      redirectTimerRef.current = setTimeout(() => {
        window.location.assign("/api/auth/google");
      }, 1600);
      return;
    }

    // Si no hay OAuth real pero está habilitado el modo demo en desarrollo
    if (demoLoginAllowed) {
      setShowGoogleChooser(true);
      return;
    }

    setGoogleError(
      "El acceso con Google no está disponible en este momento. Puedes consultar tu cita como invitado.",
    );
  };

  const handleCancelGoogleConnecting = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    setIsConnectingGoogle(false);
    setActiveTab("guest");
    setGuestError("");
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

          <div
            className="auth-mode-tabs"
            role="tablist"
            aria-label="Tipo de acceso"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "google"}
              className={activeTab === "google" ? "active" : ""}
              onClick={() => {
                if (redirectTimerRef.current) {
                  clearTimeout(redirectTimerRef.current);
                  redirectTimerRef.current = null;
                }
                setIsConnectingGoogle(false);
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
              onClick={() => {
                if (redirectTimerRef.current) {
                  clearTimeout(redirectTimerRef.current);
                  redirectTimerRef.current = null;
                }
                setIsConnectingGoogle(false);
                setActiveTab("guest");
              }}
            >
              <Icon name="search" size={14} />
              Como invitado
            </button>
          </div>

          {activeTab === "google" ? (
            isConnectingGoogle ? (
              /* Estado "Enviando para seleccionar la cuenta" en la misma pantalla (sin ventana emergente) */
              <div
                className="google-redirect-card"
                role="status"
                aria-live="polite"
              >
                <div className="google-redirect-spinner-wrap">
                  <div className="google-redirect-spinner" />
                  <div className="google-redirect-logo">
                    <GoogleLogo />
                  </div>
                </div>

                <Eyebrow>Conexión en curso</Eyebrow>
                <h2>
                  Conectando con <em>Google…</em>
                </h2>
                <p className="google-redirect-text">
                  Te estamos dirigiendo a Google para que selecciones tu cuenta.
                  No necesitas abrir ninguna otra ventana.
                </p>

                <div className="google-redirect-progress-track">
                  <div className="google-redirect-progress-bar" />
                </div>

                <div className="google-redirect-actions">
                  <Button
                    variant="outline"
                    className="google-redirect-back-btn"
                    onClick={handleCancelGoogleConnecting}
                  >
                    <Icon name="back" size={16} />
                    <span>Regresar / Entrar como invitado</span>
                  </Button>
                </div>

                <p className="google-redirect-subhint">
                  ¿Prefieres no esperar?{" "}
                  <a href="/api/auth/google" className="google-redirect-link">
                    Ir a Google ahora
                  </a>
                </p>
              </div>
            ) : (
              <div className="auth-pane">
                <Eyebrow>Tu cuenta Cobre</Eyebrow>
                <h1>
                  Qué gusto
                  <br />
                  <em>verte de nuevo.</em>
                </h1>
                <p className="login-intro">
                  Accede con tu cuenta de Google para gestionar tus próximas
                  citas, revisar y calificar tus visitas anteriores y administrar
                  tu perfil.
                </p>

                <button
                  className="google-button"
                  type="button"
                  onClick={handleGoogleClick}
                >
                  <GoogleLogo />
                  <span>Continuar con Google</span>
                </button>

                {googleError && (
                  <div className="login-message is-error" role="alert">
                    <p>{googleError}</p>
                    <button
                      type="button"
                      className="inline-link-btn"
                      onClick={() => setActiveTab("guest")}
                    >
                      Ir a consulta como invitado →
                    </button>
                  </div>
                )}

                <div className="login-security-badge">
                  <Icon name="shield" size={14} />
                  <span>
                    Acceso seguro sin contraseñas · Sincronizado en esta misma
                    página
                  </span>
                </div>

                {demoLoginAllowed && (
                  <div className="demo-login-shortcut">
                    <button
                      type="button"
                      className="demo-shortcut-btn"
                      onClick={() => setShowGoogleChooser(true)}
                    >
                      <Icon name="spark" size={14} />
                      <span>Probar cuentas demo locales (Santiago / Andrés)</span>
                    </button>
                  </div>
                )}

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
                    <Icon name="check" size={14} /> Historial completo de cortes
                    y notas del barbero
                  </span>
                  <span>
                    <Icon name="check" size={14} /> Calificación con estrellas y
                    reseñas de cada visita
                  </span>
                  <span>
                    <Icon name="check" size={14} /> Perfil personal y
                    actualización protegida de teléfono
                  </span>
                </div>
              </div>
            )
          ) : (
            <div className="auth-pane">
              <Eyebrow>Consulta rápida</Eyebrow>
              <h1>
                Revisa tu cita
                <br />
                <em>como invitado.</em>
              </h1>
              <p className="login-intro">
                Ingresa el código de tu cita y el teléfono de la reservación
                para consultar fecha, horario y barbero sin crear cuenta.
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
                <label htmlFor="guest-phone-input">
                  Teléfono de la reservación
                </label>
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
                  <strong>Alcance del modo invitado:</strong> permite
                  visualizar únicamente tus citas programadas. Para acceder a tu{" "}
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

      {/* Modal de selección de cuentas DEMO (solo en modo desarrollo) */}
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
                <span>Acceder con Google (Modo Demo)</span>
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
              <p>
                para continuar a <strong>Cobre Barber Club</strong>
              </p>

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
                      2 citas programadas · 2 por calificar · Teléfono
                      habilitado
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
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
