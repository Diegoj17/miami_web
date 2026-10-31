import { cookies } from "next/headers";
import CobreApp from "@/components/CobreApp";
import { verifyGoogleSessionCookie } from "@/lib/session-cookie";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const googleOAuthConfigured = Boolean(
    process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET &&
      process.env.AUTH_SECRET,
  );

  let serverGoogleUser = null;
  if (googleOAuthConfigured) {
    const cookieStore = await cookies();
    const rawCookie = cookieStore.get("cobre_google_user")?.value;
    serverGoogleUser = verifyGoogleSessionCookie(
      rawCookie,
      process.env.AUTH_SECRET,
    );
  }

  return (
    <CobreApp
      googleOAuthConfigured={googleOAuthConfigured}
      serverGoogleUser={serverGoogleUser}
    />
  );
}
