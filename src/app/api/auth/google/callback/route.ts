import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { signGoogleSessionCookie } from "@/lib/session-cookie";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;

  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  const authSecret = process.env.AUTH_SECRET;

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
    return NextResponse.redirect(new URL("/?auth=oauth_error", origin));
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
      return NextResponse.redirect(new URL("/?auth=token_error", origin));
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return NextResponse.redirect(new URL("/?auth=no_token", origin));
    }

    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      },
    );

    if (!userRes.ok) {
      return NextResponse.redirect(new URL("/?auth=userinfo_error", origin));
    }

    const userInfo = (await userRes.json()) as {
      email?: string;
      name?: string;
      picture?: string;
    };

    if (!userInfo.email) {
      return NextResponse.redirect(new URL("/?auth=missing_email", origin));
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
    response.cookies.delete("cobre_oauth_state");
    response.cookies.set("cobre_google_user", signedValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL("/?auth=server_error", origin));
  }
}
