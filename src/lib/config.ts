const BOOKING_FLAG = process.env.NEXT_PUBLIC_BOOKING_ENABLED === "true";

export const EXTERNAL_BOOKING_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_BOOKING_URL || "";

/** Slug del negocio en el aplicativo de agenda (`?negocio=`). Vacío = negocio por defecto. */
export const BOOKING_BUSINESS_SLUG =
  process.env.NEXT_PUBLIC_BOOKING_BUSINESS || "";

/** Inicio del negocio y flujo de reserva dentro de miami_agenda. */
const AGENDA_HOME_PATH = "/cliente";
const AGENDA_BOOKING_PATH = "/cliente/agendar";

/** IDs que se aceptan como parámetros hacia la agenda (servicio, barbero, negocio). */
const SAFE_ID = /^[a-z0-9_-]{1,64}$/i;

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/**
 * Valida la URL de la agenda: solo HTTPS (HTTP únicamente en localhost),
 * sin credenciales embebidas. Cualquier otro valor (p. ej. `javascript:`)
 * deja el agendamiento deshabilitado.
 */
function parseBookingOrigin(raw: string): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    const isLocal = LOCAL_HOSTS.has(url.hostname);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal)) {
      return null;
    }
    if (url.username || url.password) return null;
    return url.origin;
  } catch {
    return null;
  }
}

const BOOKING_ORIGIN = parseBookingOrigin(EXTERNAL_BOOKING_URL);

export const BOOKING_ENABLED = BOOKING_FLAG && BOOKING_ORIGIN !== null;

/**
 * Construye el enlace a la agenda: sin barbero ni servicio lleva al inicio del
 * negocio; con alguno de ellos, al flujo de reserva con esa elección hecha.
 * Los IDs se envían solo si tienen un formato seguro; la agenda vuelve a validarlos.
 */
export function buildBookingUrl({
  serviceId,
  barberId,
}: { serviceId?: string; barberId?: string } = {}): string | null {
  if (!BOOKING_ENABLED || !BOOKING_ORIGIN) return null;
  const safeService = serviceId && SAFE_ID.test(serviceId) ? serviceId : "";
  const safeBarber = barberId && SAFE_ID.test(barberId) ? barberId : "";
  const path =
    safeService || safeBarber ? AGENDA_BOOKING_PATH : AGENDA_HOME_PATH;
  const url = new URL(path, BOOKING_ORIGIN);
  if (BOOKING_BUSINESS_SLUG && SAFE_ID.test(BOOKING_BUSINESS_SLUG)) {
    url.searchParams.set("negocio", BOOKING_BUSINESS_SLUG);
  }
  if (safeService) url.searchParams.set("servicio", safeService);
  if (safeBarber) url.searchParams.set("barbero", safeBarber);
  return url.toString();
}

export const PHONE_COOLDOWN_DAYS = 30;

export const BOOKING_DISABLED_MESSAGE =
  "El agendamiento en línea se encuentra deshabilitado temporalmente mientras conectamos nuestro sistema de reservas.";

export const CLUB_INFO = {
  name: "Cobre Barber Club",
  neighborhood: "Roma Norte · Ciudad de México",
  addressLine1: "Colima 168, Roma Norte",
  addressLine2: "Cuauhtémoc, Ciudad de México",
  reference: "A media cuadra de Plaza Río de Janeiro, junto a la librería.",
  phoneDisplay: "+52 55 5512 8640",
  phoneHref: "tel:+525555128640",
  whatsappNumber: "525555128640",
  whatsappHref: "https://wa.me/525555128640",
  email: "hola@cobrebarberclub.mx",
  mapsEmbedUrl:
    "https://www.google.com/maps?q=Colima+168,+Roma+Norte,+Ciudad+de+Mexico&output=embed",
  mapsExternalUrl:
    "https://www.google.com/maps/search/?api=1&query=Colima+168+Roma+Norte+Ciudad+de+Mexico",
  hours: [
    { day: "Lunes", hours: "10:00–20:00", jsDay: 1 },
    { day: "Martes", hours: "10:00–20:00", jsDay: 2 },
    { day: "Miércoles", hours: "10:00–20:00", jsDay: 3 },
    { day: "Jueves", hours: "10:00–20:00", jsDay: 4 },
    { day: "Viernes", hours: "10:00–21:00", jsDay: 5 },
    { day: "Sábado", hours: "09:00–19:00", jsDay: 6 },
    { day: "Domingo", hours: "Cerrado", jsDay: 0 },
  ],
};
