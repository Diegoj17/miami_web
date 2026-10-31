import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAuthSecret,
  SESSION_MAX_AGE_SECONDS,
  signGoogleSessionCookie,
} from "@/lib/session-cookie";

/** Redirige con un código de error y descarta el `state` de un solo uso. */
function fail(reason: string, origin: string) {
  const response = NextResponse.redirect(new URL(`/?auth=${reason}`, origin));
  response.cookies.delete({ name: "cobre_oauth_state", path: "/api/auth/google" });
  return response;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  const authSecret = getAuthSecret();

  const cookieStore = await cookies();
  const savedState = cookieStore.get("cobre_oauth_state")?.value;

  if (
    !code ||
    !clientId ||
    !clientSecret ||
    !authSecret ||
    !state ||
    state !== savedState
  ) {
    return fail("oauth_error", origin);
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      return fail("token_error", origin);
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return fail("no_token", origin);
    }

    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      },
    );

    if (!userRes.ok) {
      return fail("userinfo_error", origin);
    }

    const userInfo = (await userRes.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    // Solo correos que Google confirma como verificados.
    if (!userInfo.email || userInfo.email_verified !== true) {
      return fail("missing_email", origin);
    }

    const signedValue = signGoogleSessionCookie(
      {
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split("@")[0],
        picture: userInfo.picture,
      },
      authSecret,
    );

    const response = NextResponse.redirect(new URL("/", origin));
    response.cookies.delete({ name: "cobre_oauth_state", path: "/api/auth/google" });
    response.cookies.set("cobre_google_user", signedValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch {
    return fail("server_error", origin);
  }
}
