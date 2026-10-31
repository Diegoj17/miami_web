import { NextResponse } from "next/server";
import { isGoogleOAuthConfigured } from "@/lib/session-cookie";

export async function GET(request: Request) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  if (!clientId || !isGoogleOAuthConfigured()) {
    return NextResponse.redirect(new URL("/?auth=missing_config", origin));
  }

  const redirectUri = `${origin}/api/auth/google/callback`;
  const state = crypto.randomUUID();

  const googleAuthUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth",
  );
  googleAuthUrl.searchParams.set("client_id", clientId);
  googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(googleAuthUrl.toString());
  response.cookies.set("cobre_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  });

  return response;
}
