import { cookies } from "next/headers";
import CobreApp from "@/components/CobreApp";
import {
  getAuthSecret,
  isGoogleOAuthConfigured,
  verifyGoogleSessionCookie,
} from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const googleOAuthConfigured = isGoogleOAuthConfigured();
  // El selector de cuentas de demostración solo existe en desarrollo y sin OAuth real.
  const demoLoginAllowed =
    !googleOAuthConfigured && process.env.NODE_ENV !== "production";

  let serverGoogleUser = null;
  if (googleOAuthConfigured) {
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
