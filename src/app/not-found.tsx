import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-screen">
      <span className="brand-mark">
        <b>C</b>
      </span>
      <p className="eyebrow">Error 404</p>
      <h1>
        Página no <em>encontrada.</em>
      </h1>
      <p>La ruta que buscas no existe dentro de Cobre Barber Club.</p>
      <Link href="/" className="btn btn-primary">
        Volver al inicio
      </Link>
    </main>
  );
}
