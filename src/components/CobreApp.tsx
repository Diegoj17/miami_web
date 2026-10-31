"use client";

import { useEffect, useMemo, useState } from "react";
import { AppointmentRating, barbers, UserProfileData } from "@/lib/data";
import {
  ActiveSession,
  commitPhoneChangeWithCooldown,
  getOrCreateGoogleUser,
  loadAccountsStore,
  loadActiveSession,
  saveActiveSession,
  saveAppointmentRating,
  updateProfilePreferences,
} from "@/lib/storage";
import { ClientPortal, GuestPortalScreen } from "./ClientPortal";
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

  const [session, setSession] = useState<ActiveSession>(null);
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate persisted client session or real Google OAuth server cookie
  useEffect(() => {
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

    const savedSession = loadActiveSession();
    if (savedSession?.mode === "google") {
      const store = loadAccountsStore();
      const account = store[savedSession.email.toLowerCase()];
      if (account) {
        setSession(savedSession);
        setCurrentUser(account);
      } else {
        saveActiveSession(null);
      }
    } else if (savedSession?.mode === "guest") {
      setSession(savedSession);
    }

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
    if (session.mode === "guest") {
      setPortalTab("scheduled");
    } else {
      setPortalTab(tab);
    }
    setScreen("portal");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoogleLoginSuccess = (params: {
    email: string;
    name: string;
    avatarUrl?: string;
  }) => {
    const profile = getOrCreateGoogleUser(params);
    const nextSession: ActiveSession = {
      mode: "google",
      email: profile.email,
    };
    saveActiveSession(nextSession);
    setSession(nextSession);
    setCurrentUser(profile);
    setPortalTab("scheduled");
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
          userName={
            session?.mode === "google"
              ? currentUser?.name
              : session?.mode === "guest"
                ? session.guestName
                : undefined
          }
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

      {screen === "login" && (
        <LoginScreen
          onBack={() => navigate("landing")}
          googleOAuthConfigured={googleOAuthConfigured}
          onGoogleLoginSuccess={handleGoogleLoginSuccess}
          onGuestLookupSuccess={({ guestName, lookupQuery, appointments }) => {
            const guestSession: ActiveSession = {
              mode: "guest",
              guestName,
              lookupQuery,
              matchedAppointments: appointments,
            };
            saveActiveSession(guestSession);
            setSession(guestSession);
            setCurrentUser(null);
            setPortalTab("scheduled");
            setScreen("portal");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {screen === "portal" && session?.mode === "guest" && (
        <GuestPortalScreen
          guestName={session.guestName}
          lookupQuery={session.lookupQuery}
          appointments={session.matchedAppointments}
          onSwitchToGoogleLogin={() => navigate("login")}
          onExitGuest={() => {
            saveActiveSession(null);
            setSession(null);
            navigate("login");
          }}
        />
      )}

      {screen === "portal" && session?.mode === "google" && currentUser && (
        <ClientPortal
          user={currentUser}
          activeTab={portalTab}
          onChangeTab={(tab) => setPortalTab(tab)}
          onSaveRating={(appointmentId: string, rating: AppointmentRating) => {
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

      <Footer
        screen={screen}
        hasSession={Boolean(sessionMode)}
        openPortalTab={openPortalTab}
      />
    </div>
  );
}
