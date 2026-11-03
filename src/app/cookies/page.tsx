import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { CLUB_INFO } from "@/lib/config";

export const metadata: Metadata = {
  title: "Política de cookies — Cobre Barber Club",
  description: "Qué cookies usa Cobre Barber Club, para qué sirve cada una y cómo cambiar tu elección.",
};

const COOKIES = [
  {
    name: "codexa_client_session",
    purpose: "Mantiene tu sesión cuando inicias sesión con Google, para ver y gestionar tus citas.",
    type: "Imprescindible",
    duration: "14 días",
  },
  {
    name: "codexa_google_flow",
    purpose: "Protege el inicio de sesión con Google mientras eliges tu cuenta.",
    type: "Imprescindible",
    duration: "10 minutos",
  },
  {
    name: "cobre_cookie_consent",
    purpose: "Recuerda tu elección en el aviso de cookies.",
    type: "Imprescindible",
    duration: "180 días",
  },
  {
    name: "Cookies de Google Maps",
    purpose: "Las pone Google al mostrar el mapa de la ubicación. Solo se cargan si aceptas todas.",
    type: "Opcional (terceros)",
    duration: "Según Google",
  },
];

export default function CookiesPage() {
  return (
    <main className="cookie-policy">
      <p className="eyebrow">Privacidad</p>
      <h1>
        Política de <em>cookies.</em>
      </h1>
      <p>
        Una cookie es un pequeño archivo que el sitio guarda en tu navegador. En{" "}
        {CLUB_INFO.name} las usamos sobre todo para que puedas iniciar sesión con Google: sin ellas el navegador
        olvidaría tu sesión en cada página. No usamos cookies de publicidad ni de analítica.
      </p>

      <h2>Cookies que usamos</h2>
      <div className="cookie-table-wrap">
        <table className="cookie-table">
          <thead>
            <tr>
              <th scope="col">Cookie</th>
              <th scope="col">Para qué sirve</th>
              <th scope="col">Tipo</th>
              <th scope="col">Duración</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((cookie) => (
              <tr key={cookie.name}>
                <td>
                  <code>{cookie.name}</code>
                </td>
                <td>{cookie.purpose}</td>
                <td>{cookie.type}</td>
                <td>{cookie.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Tu elección</h2>
      <p>
        Las cookies imprescindibles no se pueden desactivar desde el sitio porque sin ellas no
        funciona el inicio de sesión. Las opcionales solo se usan si eliges «Aceptar todas»; con
        «Solo necesarias» el mapa no se carga y puedes abrir la ubicación directamente en Google
        Maps. También puedes borrar las cookies desde la configuración de tu navegador.
      </p>
      <p>
        Al iniciar sesión, Google te pide permiso para compartir tu nombre, correo y foto. Ese
        paso ocurre en la página de Google y se rige por su política de privacidad.
      </p>
      <p>
        Si tienes dudas, escríbenos a <a href={`mailto:${CLUB_INFO.email}`}>{CLUB_INFO.email}</a>.
      </p>

      <div className="cookie-policy-actions">
        <CookieSettingsButton />
        <Link href="/" className="btn btn-primary">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
