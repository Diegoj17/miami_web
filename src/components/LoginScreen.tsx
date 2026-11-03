"use client";

import { useEffect, useRef, useState } from "react";
import { backendGoogleLoginUrl, backendSessionEnabled } from "@/lib/client-session";
import { photos } from "@/lib/data";
import { GoogleLogo, Icon } from "./Icons";
import { Button, Eyebrow } from "./UIPrimitives";

/** Con backend, Google se inicia en él (por el mismo dominio); si no, en la ruta propia de la landing. */
const GOOGLE_LOGIN_HREF = backendSessionEnabled ? backendGoogleLoginUrl("/") : "/api/auth/google";

export function LoginScreen({
  onBack,
  googleOAuthConfigured,
  authErrorReason,
  onStartBookingAsGuest,
}: {
  onBack: () => void;
  googleOAuthConfigured: boolean;
  authErrorReason?: string | null;
  onStartBookingAsGuest: () => void;
}) {
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
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
        window.location.assign(GOOGLE_LOGIN_HREF);
      }, 1600);
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
                <a href={GOOGLE_LOGIN_HREF} className="google-redirect-link">
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

              <div className="login-divider">
                <span>o si solo vienes a reservar</span>
              </div>

              <div className="guest-booking-intro-card">
                <div className="guest-intro-head">
                  <Icon name="scissors" size={16} />
                  <div>
                    <strong>Reserva sin crear una cuenta</strong>
                    <small>Ideal si solo vienes a agendar hoy</small>
                  </div>
                </div>
                <p className="guest-note">
                  Elige tu servicio y horario. Al confirmar te pediremos
                  únicamente tu nombre y teléfono para dejar registrada la
                  cita.
                </p>
                <div className="guest-access-grid">
                  <div>
                    <span className="guest-access-label">Como invitado</span>
                    <strong>Agendas tu próxima cita</strong>
                  </div>
                  <div>
                    <span className="guest-access-label">Sin iniciar sesión</span>
                    <strong>No verás tu historial ni tus citas guardadas</strong>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="guest-button"
                  onClick={onStartBookingAsGuest}
                >
                  Agendar cita como invitado <Icon name="arrow" />
                </Button>
              </div>

              <div className="login-benefits">
                <strong>Lo que desbloqueas con tu cuenta</strong>
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
                  modificación de nombre y teléfono cada 15 días
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

    </main>
  );
}
