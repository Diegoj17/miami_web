import { NextResponse } from "next/server";
import { backendGoogleLoginUrl, backendSessionEnabled } from "@/lib/client-session";
import { isGoogleOAuthConfigured } from "@/lib/session-cookie";

export async function GET(request: Request) {
  // Una sola identidad: con el backend configurado, el login de Google es el suyo.
  if (backendSessionEnabled) {
    return NextResponse.redirect(backendGoogleLoginUrl("/"));
  }
  const clientId = process.env.AUTH_GOOGLE_ID;
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  const requestOrigin = new URL(request.url).origin;
  const origin = configuredOrigin || requestOrigin;

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
  const flowCookie = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth/google",
    maxAge: 600,
  };
  response.cookies.set("cobre_oauth_state", state, flowCookie);
  response.cookies.delete({ name: "cobre_oauth_popup", path: "/api/auth/google" });

  return response;
}
