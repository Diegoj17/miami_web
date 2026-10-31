import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Solo el propio sitio puede cerrar la sesión (evita CSRF desde otras páginas).
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("cobre_google_user");
  return response;
}
