"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { photos } from "@/lib/data";
import { GoogleLogo, Icon } from "./Icons";
import { Button, Eyebrow } from "./UIPrimitives";

export function LoginScreen({
  onBack,
  googleOAuthConfigured,
  demoLoginAllowed,
  authErrorReason,
  onGoogleLoginSuccess,
  onStartBookingAsGuest,
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
  onStartBookingAsGuest: () => void;
}) {
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [showGoogleChooser, setShowGoogleChooser] = useState(false);
  const [showCustomGoogle, setShowCustomGoogle] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customError, setCustomError] = useState("");
  const [googleError, setGoogleError] = useState<string | null>(null);

  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Reacciona a errores devueltos por el callback de OAuth en la URL
  useEffect(() => {
    if (!authErrorReason) return;
    if (authErrorReason === "cancelled") {
      setGoogleError(
        "Se canceló el acceso con Google. Puedes intentar nuevamente o agendar como invitado.",
      );
    } else if (authErrorReason === "missing_config") {
      setGoogleError(
        "Faltan credenciales de Google OAuth en el archivo .env.local.",
      );
    } else {
      setGoogleError(
        "No se pudo completar el inicio de sesión con Google. Puedes volver a intentarlo o agendar como invitado.",
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

    // Si Google OAuth está configurado, mostramos la animación en la misma pantalla
    // y luego redirigimos en la misma pestaña (sin abrir ninguna otra ventana).
    if (googleOAuthConfigured) {
      setIsConnectingGoogle(true);
      redirectTimerRef.current = setTimeout(() => {
        window.location.assign("/api/auth/google");
      }, 1600);
      return;
    }

    // Si estamos en desarrollo sin OAuth real configurado
    if (demoLoginAllowed) {
      setShowGoogleChooser(true);
      return;
    }

    setGoogleError(
      "El acceso con Google no está disponible en este momento. Puedes agendar tu cita como invitado.",
    );
  };

  const handleCancelGoogleConnecting = () => {
    if (redirectTimerRef.current) {
      clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = null;
    }
    setIsConnectingGoogle(false);
    onStartBookingAsGuest();
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
            <em>Citas programadas</em>
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

          {isConnectingGoogle ? (
            /* Estado visual "Conectando con Google" en la misma pantalla (sin ventanas emergentes) */
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
                Te estamos dirigiendo a Google para que selecciones tu cuenta. No
                necesitas abrir ninguna otra ventana.
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
                  <span>Regresar / Continuar como invitado</span>
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
                Inicia sesión con tu cuenta de Google para consultar tus citas
                programadas, calificar visitas anteriores, ver tu perfil y
                administrar tu historial de looks.
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
                    onClick={onStartBookingAsGuest}
                  >
                    Agendar como invitado →
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
                <span>o si solo vienes a reservar</span>
              </div>

              <div className="guest-booking-intro-card">
                <div className="guest-intro-head">
                  <Icon name="scissors" size={16} />
                  <strong>Continuar como invitado</strong>
                </div>
                <p className="guest-note">
                  El invitado no requiere cuenta ni puede revisar citas previas;
                  solo genera su cita directamente. Te solicitaremos tus datos
                  (nombre y teléfono) al confirmar tu cita.
                </p>
                <Button
                  variant="outline"
                  className="guest-button"
                  onClick={onStartBookingAsGuest}
                >
                  Agendar cita como invitado <Icon name="arrow" />
                </Button>
              </div>

              <div className="login-benefits">
                <strong>Con tu cuenta de Google puedes</strong>
                <span>
                  <Icon name="check" size={14} /> Ver tus citas programadas y
                  añadirlas al calendario
                </span>
                <span>
                  <Icon name="check" size={14} /> Historial completo de looks y
                  notas técnicas
                </span>
                <span>
                  <Icon name="check" size={14} /> Calificar con estrellas y
                  reseñas cada visita
                </span>
                <span>
                  <Icon name="check" size={14} /> Perfil personal y
                  modificación de teléfono con plazos de 30 días
                </span>
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
