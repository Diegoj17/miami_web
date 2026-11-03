"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppointmentRating, barbers, UserProfileData } from "@/lib/data";
import {
  ActiveSession,
  commitPhoneChangeWithCooldown,
  getOrCreateGoogleUser,
  loadActiveSession,
  saveActiveSession,
  saveAppointmentRating,
  updateProfilePreferences,
} from "@/lib/storage";
import {
  backendLogout,
  backendSessionEnabled,
  fetchBackendClient,
} from "@/lib/client-session";
import {
  agendaApiEnabled,
  getCatalog,
  getClientProfile,
  rateAppointment,
} from "@/lib/agenda-api";
import { toPast, toScheduled } from "@/lib/agenda-mapping";
import { BookingScreen } from "./BookingScreen";
import { ClientPortal } from "./ClientPortal";
import { Footer } from "./Footer";
import { Header, PortalTab, Screen } from "./Header";
import { LandingScreen } from "./LandingScreen";
import { LoginScreen } from "./LoginScreen";
import { PortfolioScreen } from "./PortfolioScreen";

export interface ServerGoogleUser {
  email: string;
  name: string;
  picture?: string;
}

export default function CobreApp({
  googleOAuthConfigured = false,
  serverGoogleUser = null,
}: {
  googleOAuthConfigured?: boolean;
  serverGoogleUser?: ServerGoogleUser | null;
}) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [portalTab, setPortalTab] = useState<PortalTab>("scheduled");
  const [portfolioBarberIndex, setPortfolioBarberIndex] = useState<number>(0);
  const [bookingBarberIndex, setBookingBarberIndex] = useState<number>(0);
  const [bookingServiceId, setBookingServiceId] = useState<string>("signature");

  const [session, setSession] = useState<ActiveSession>(null);
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [authErrorReason, setAuthErrorReason] = useState<string | null>(null);
  const [appointmentsError, setAppointmentsError] = useState("");

  /**
   * Citas del cliente desde el backend: las mismas que ve la agenda. Reemplaza
   * por completo las citas locales (de ejemplo) del perfil en memoria.
   */
  const loadBackendAppointments = useCallback(async (base: UserProfileData) => {
    try {
      const [catalog, profile] = await Promise.all([getCatalog(), getClientProfile()]);
      if (!profile) return;
      setAppointmentsError("");
      setCurrentUser({
        ...base,
        phone: profile.phone || base.phone,
        scheduledAppointments: profile.scheduled.map((apt) => toScheduled(apt, catalog)),
        pastAppointments: profile.history
          .filter((apt) => apt.status !== "cancelled" && apt.status !== "no_show")
          .map((apt) => toPast(apt, catalog)),
      });
    } catch {
      setAppointmentsError("No pudimos cargar tus citas. Revisa tu conexión e inténtalo de nuevo.");
    }
  }, []);

  // Detecta si se regresó con un error o cancelación desde el flujo de autenticación
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth) {
      setAuthErrorReason(auth);
      setScreen("login");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Sesión compartida con la agenda: la valida el backend con su cookie HttpOnly.
  // Nada de la identidad se guarda en el navegador; se pregunta en cada carga.
  useEffect(() => {
    if (!backendSessionEnabled) return;
    let cancelled = false;
    const params = new URLSearchParams(window.location.search);
    const googleResult = params.get("google");
    if (googleResult) {
      window.history.replaceState({}, "", window.location.pathname);
    }
    void fetchBackendClient().then((client) => {
      if (cancelled) return;
      if (client) {
        const base = getOrCreateGoogleUser(client);
        // Hasta que respondan las citas reales no se muestran las de ejemplo.
        const profile = { ...base, scheduledAppointments: [], pastAppointments: [] };
        setSession({ mode: "google", email: profile.email });
        setCurrentUser(profile);
        if (agendaApiEnabled) void loadBackendAppointments(profile);
        if (googleResult === "ok") setScreen("portal");
      } else {
        // Sin sesión en el backend no hay sesión de Google en la landing.
        const saved = loadActiveSession();
        if (saved?.mode === "google") saveActiveSession(null);
        setSession(null);
        setCurrentUser(null);
        if (googleResult === "error") {
          setAuthErrorReason("oauth_error");
          setScreen("login");
        }
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hydrate persisted client session or real Google OAuth server cookie
  useEffect(() => {
    if (backendSessionEnabled) {
      return;
    }
    if (serverGoogleUser?.email) {
      const profile = getOrCreateGoogleUser({
        email: serverGoogleUser.email,
        name: serverGoogleUser.name,
        avatarUrl: serverGoogleUser.picture,
      });
      const nextSession: ActiveSession = {
        mode: "google",
        email: profile.email,
      };
      saveActiveSession(nextSession);
      setSession(nextSession);
      setCurrentUser(profile);
      setScreen("portal");
      setHydrated(true);
      return;
    }

    // Una sesión local no prueba una autenticación real; solo el servidor puede
    // establecer la sesión de Google.
    const savedSession = loadActiveSession();
    if (savedSession) saveActiveSession(null);

    setHydrated(true);
  }, [serverGoogleUser]);

  const navigate = (next: Screen) => {
    if (next === "portal" && !session) {
      setScreen("login");
    } else {
      setScreen(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPortalTab = (tab: PortalTab) => {
    if (!session) {
      setScreen("login");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPortalTab(tab);
    setScreen("portal");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = async () => {
    saveActiveSession(null);
    setSession(null);
    setCurrentUser(null);
    setScreen("landing");
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network error if no server cookie
    }
    // Cierra la sesión compartida: también queda cerrada en la agenda.
    await backendLogout();
  };

  const unratedCount = useMemo(() => {
    if (!currentUser) return 0;
    return currentUser.pastAppointments.filter((item) => !item.rating).length;
  }, [currentUser]);

  const sessionMode = hydrated && session ? session.mode : null;

  return (
    <div className="app">
      {screen !== "login" && (
        <Header
          screen={screen}
          portalTab={portalTab}
          navigate={navigate}
          openPortalTab={openPortalTab}
          sessionMode={sessionMode}
          userName={session?.mode === "google" ? currentUser?.name : undefined}
          unratedCount={unratedCount}
        />
      )}

      {screen === "landing" && (
        <LandingScreen
          hasSession={Boolean(sessionMode)}
          onOpenPortfolio={(barberIndex) => {
            setPortfolioBarberIndex(barberIndex);
            navigate("portfolio");
          }}
          onOpenAccount={() => {
            if (sessionMode) {
              openPortalTab("scheduled");
            } else {
              navigate("login");
            }
          }}
        />
      )}

      {screen === "portfolio" && (
        <PortfolioScreen
          barber={barbers[portfolioBarberIndex] || barbers[0]}
          onBack={() => navigate("landing")}
        />
      )}

      {screen === "booking" && (
        <BookingScreen
          initialBarberIndex={bookingBarberIndex}
          initialServiceId={bookingServiceId}
          currentUser={currentUser}
          onBack={() => navigate("landing")}
          onAppointmentCreated={() => {
            // La cita ya está en el backend: se vuelven a leer las del cliente.
            if (currentUser) void loadBackendAppointments(currentUser);
          }}
          onNavigateHome={() => navigate("landing")}
          onNavigatePortal={() => openPortalTab("scheduled")}
        />
      )}

      {screen === "login" && (
        <LoginScreen
          onBack={() => navigate("landing")}
          googleOAuthConfigured={googleOAuthConfigured}
          authErrorReason={authErrorReason}
          onStartBookingAsGuest={() => {
            setBookingBarberIndex(0);
            setBookingServiceId("signature");
            setScreen("booking");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {screen === "portal" && appointmentsError && (
        <p className="login-message is-error page-shell" role="alert">
          {appointmentsError}
        </p>
      )}

      {screen === "portal" && session?.mode === "google" && currentUser && (
        <ClientPortal
          user={currentUser}
          activeTab={portalTab}
          onChangeTab={(tab) => setPortalTab(tab)}
          onSaveRating={(appointmentId: string, rating: AppointmentRating) => {
            if (agendaApiEnabled) {
              const comment = [
                rating.comment.trim(),
                rating.tags.length ? `Destacado: ${rating.tags.join(", ")}` : "",
              ]
                .filter(Boolean)
                .join(" · ");
              void rateAppointment(appointmentId, rating.stars, comment)
                .then(() => loadBackendAppointments(currentUser))
                .catch(() =>
                  setAppointmentsError("No se pudo guardar tu calificación. Inténtalo de nuevo."),
                );
              return;
            }
            const updated = saveAppointmentRating(
              currentUser.email,
              appointmentId,
              rating,
            );
            if (updated) setCurrentUser(updated);
          }}
          onSaveProfile={(updates) => {
            const updated = updateProfilePreferences(currentUser.email, updates);
            if (updated) setCurrentUser(updated);
          }}
          onCommitPhoneChange={(newFormattedPhone) => {
            const updated = commitPhoneChangeWithCooldown(
              currentUser.email,
              newFormattedPhone,
            );
            if (updated) setCurrentUser(updated);
          }}
          onLogout={handleLogout}
        />
      )}

      <Footer screen={screen} />
    </div>
  );
}
