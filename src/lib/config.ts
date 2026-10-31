export const BOOKING_ENABLED =
  process.env.NEXT_PUBLIC_BOOKING_ENABLED === "true";

export const EXTERNAL_BOOKING_URL =
  process.env.NEXT_PUBLIC_EXTERNAL_BOOKING_URL || "";

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
