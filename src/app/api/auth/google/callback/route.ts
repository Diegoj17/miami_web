import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  getAuthSecret,
  SESSION_MAX_AGE_SECONDS,
  signGoogleSessionCookie,
} from "@/lib/session-cookie";

const FLOW_PATH = "/api/auth/google";

/**
 * Página mínima que cierra la ventana emergente de Google y avisa a la landing
 * por un canal del mismo origen. `ok` y `reason` son valores fijos del servidor.
 */
function popupPage(ok: boolean, reason: string): NextResponse {
  const message = JSON.stringify({ type: "cobre-google", ok, reason });
  const html = `<!doctype html><html lang="es-CO"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cobre Barber Club</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#0b0b0a;color:#eee9dc;font-family:system-ui,sans-serif;text-align:center">
<p>${ok ? "Sesión iniciada. Ya puedes cerrar esta ventana." : "No se pudo iniciar sesión. Ya puedes cerrar esta ventana."}</p>
<script>
(function(){var m=${message};
try{var c=new BroadcastChannel("cobre-google");c.postMessage(m);c.close();}catch(e){}
try{localStorage.setItem("cobre_google_result",JSON.stringify({ok:m.ok,reason:m.reason,at:Date.now()}));}catch(e){}
window.close();setTimeout(function(){location.replace(m.ok?"/":"/?auth="+m.reason);},600);})();
</script></body></html>`;
  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

/** Termina el flujo: redirección normal o cierre de la ventana emergente. */
function finish(origin: string, popup: boolean, ok: boolean, reason = "") {
  const response = popup
    ? popupPage(ok, reason)
    : NextResponse.redirect(new URL(ok ? "/" : `/?auth=${reason}`, origin));
  // `state` y la marca de ventana emergente son de un solo uso.
  response.cookies.delete({ name: "cobre_oauth_state", path: FLOW_PATH });
  response.cookies.delete({ name: "cobre_oauth_popup", path: FLOW_PATH });
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
  const popup = cookieStore.get("cobre_oauth_popup")?.value === "1";

  if (url.searchParams.get("error")) {
    return finish(origin, popup, false, "cancelled");
  }

  if (
    !code ||
    !clientId ||
    !clientSecret ||
    !authSecret ||
    !state ||
    state !== savedState
  ) {
    return finish(origin, popup, false, "oauth_error");
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
      return finish(origin, popup, false, "token_error");
    }

    const tokenJson = (await tokenRes.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return finish(origin, popup, false, "no_token");
    }

    const userRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenJson.access_token}` },
      },
    );

    if (!userRes.ok) {
      return finish(origin, popup, false, "userinfo_error");
    }

    const userInfo = (await userRes.json()) as {
      email?: string;
      email_verified?: boolean;
      name?: string;
      picture?: string;
    };

    // Solo correos que Google confirma como verificados.
    if (!userInfo.email || userInfo.email_verified !== true) {
      return finish(origin, popup, false, "missing_email");
    }

    const signedValue = signGoogleSessionCookie(
      {
        email: userInfo.email,
        name: userInfo.name || userInfo.email.split("@")[0],
        picture: userInfo.picture,
      },
      authSecret,
    );

    const response = finish(origin, popup, true);
    response.cookies.set("cobre_google_user", signedValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch {
    return finish(origin, popup, false, "server_error");
  }
}
