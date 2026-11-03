import { cookies } from "next/headers";
import CobreApp from "@/components/CobreApp";
import { backendSessionEnabled } from "@/lib/client-session";
import {
  getAuthSecret,
  isGoogleOAuthConfigured,
  verifyGoogleSessionCookie,
} from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Con el backend configurado, Google se maneja allí y la sesión se comparte con la agenda.
  const googleOAuthConfigured = backendSessionEnabled || isGoogleOAuthConfigured();
  // En entorno de desarrollo se permite además el selector de prueba local por conveniencia.
  const demoLoginAllowed = process.env.NODE_ENV !== "production";

  let serverGoogleUser = null;
  if (!backendSessionEnabled && isGoogleOAuthConfigured()) {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get("cobre_google_user")?.value;
    serverGoogleUser = verifyGoogleSessionCookie(rawCookie, getAuthSecret());
  }

  return (
    <CobreApp
      googleOAuthConfigured={googleOAuthConfigured}
      demoLoginAllowed={demoLoginAllowed}
      serverGoogleUser={serverGoogleUser}
    />
  );
}
