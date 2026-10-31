export const photos = {
  mateo:
    "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?auto=format&fit=crop&w=1200&q=88",
  lucas:
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=1200&q=88",
  nico:
    "https://images.unsplash.com/photo-1647140655214-e4a2d914971f?auto=format&fit=crop&w=1200&q=88",
  marco:
    "https://images.unsplash.com/photo-1635273051839-003bf06a8751?auto=format&fit=crop&w=1200&q=88",
  cuts: [
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1657105052497-f996284ffff8?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1593702275687-f8b402bf1fb5?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1635273051839-003bf06a8751?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1514336937476-a5b961020a5c?auto=format&fit=crop&w=900&q=88",
    "https://images.unsplash.com/photo-1589985494639-69e60c82cab2?auto=format&fit=crop&w=900&q=88",
  ],
  shop:
    "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1600&q=88",
  interior:
    "https://images.unsplash.com/photo-1536520002442-39764a41e987?auto=format&fit=crop&w=1200&q=88",
  chair:
    "https://images.unsplash.com/photo-1621645582931-d1d3e6564943?auto=format&fit=crop&w=1000&q=88",
};

export interface Barber {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  short: string;
  role: string;
  since: string;
  specialty: string;
  experience: string;
  yearsNumber: string;
  cutsCount: string;
  rating: string;
  reviews: string;
  quote: string;
  bio: string;
  image: string;
}

export const barbers: Barber[] = [
  {
    id: "mateo",
    name: "Mateo Cruz",
    firstName: "Mateo",
    lastName: "Cruz",
    short: "Mateo",
    role: "Barbero residente · Fundador",
    since: "Desde 2016",
    specialty: "Fades precisos y diseño",
    experience: "8 años de experiencia",
    yearsNumber: "8",
    cutsCount: "1.8k",
    rating: "4.9",
    reviews: "230 reseñas",
    quote: "“Un buen corte no cambia quién eres. Hace que se note.”",
    bio: "Especialista en fades precisos y diseños que se adaptan a la estructura del rostro. Mi trabajo empieza escuchando y termina cuando cada línea tiene intención.",
    image: photos.mateo,
  },
  {
    id: "lucas",
    name: "Lucas Herrera",
    firstName: "Lucas",
    lastName: "Herrera",
    short: "Lucas",
    role: "Maestro barbero",
    since: "Desde 2017",
    specialty: "Barba clásica y tijera",
    experience: "11 años de experiencia",
    yearsNumber: "11",
    cutsCount: "2.4k",
    rating: "4.8",
    reviews: "186 reseñas",
    quote: "“La tijera bien llevada respeta la caída natural de cada cabello.”",
    bio: "Formado en sastrería capilar clásica. Domina el corte íntegro a tijera, volúmenes controlados y perfilados de barba que envejecen con elegancia semana tras semana.",
    image: photos.lucas,
  },
  {
    id: "nico",
    name: "Nico Vidal",
    firstName: "Nico",
    lastName: "Vidal",
    short: "Nico",
    role: "Barbero residente",
    since: "Desde 2020",
    specialty: "Texturas y estilo urbano",
    experience: "6 años de experiencia",
    yearsNumber: "6",
    cutsCount: "1.3k",
    rating: "4.9",
    reviews: "154 reseñas",
    quote: "“El movimiento y la textura logran que el peinado trabaje a tu favor.”",
    bio: "Referente en crops contemporáneos, tapers limpios y texturas dinámicas de bajo mantenimiento pensadas para verse impecables dentro y fuera del club.",
    image: photos.nico,
  },
  {
    id: "marco",
    name: "Marco León",
    firstName: "Marco",
    lastName: "León",
    short: "Marco",
    role: "Especialista en afeitado",
    since: "Desde 2018",
    specialty: "Ritual de barba y afeitado",
    experience: "9 años de experiencia",
    yearsNumber: "9",
    cutsCount: "1.9k",
    rating: "4.7",
    reviews: "121 reseñas",
    quote: "“La toalla caliente y la navaja son una pausa necesaria en la semana.”",
    bio: "Dedicado al ritual tradicional de barbería: compresas aromáticas a vapor, afeitado preciso a navaja libre e hidratación botánica para pieles exigentes.",
    image: photos.marco,
  },
];

export interface ServiceItem {
  id: string;
  name: string;
  detail: string;
  duration: string;
  price: number;
}

export const services: ServiceItem[] = [
  {
    id: "signature",
    name: "Corte Signature",
    detail: "Diagnóstico, lavado y acabado",
    duration: "50 min",
    price: 42,
  },
  {
    id: "fade",
    name: "Fade de autor",
    detail: "Degradado a medida y styling",
    duration: "60 min",
    price: 48,
  },
  {
    id: "beard",
    name: "Ritual de barba",
    detail: "Toalla caliente, perfilado e hidratación",
    duration: "35 min",
    price: 32,
  },
  {
    id: "combo",
    name: "Corte + barba",
    detail: "La experiencia completa de la casa",
    duration: "80 min",
    price: 68,
  },
];

export const testimonials = [
  {
    name: "Andrés M.",
    quote:
      "Llegué por recomendación y ya no cambio de lugar. Escuchan lo que quieres y lo mejoran.",
    rating: "5.0",
  },
  {
    name: "Valeria R.",
    quote:
      "El ambiente es cercano, el servicio impecable y siempre salgo sintiéndome yo.",
    rating: "5.0",
  },
  {
    name: "Diego L.",
    quote:
      "Puntuales, atentos y con mucho oficio. Mateo entendió mi corte desde la primera visita.",
    rating: "4.9",
  },
];

export const RATING_HIGHLIGHT_TAGS = [
  "Puntualidad",
  "Precisión en el corte",
  "Escucha y asesoría",
  "Ritual y confort",
  "Ambiente del club",
  "Acabado duradero",
] as const;

export const RATING_LABELS: Record<number, string> = {
  1: "Necesita mejorar",
  2: "Experiencia regular",
  3: "Buena atención",
  4: "Muy buena experiencia",
  5: "Oficio excepcional",
};

export interface AppointmentRating {
  stars: number;
  tags: string[];
  comment: string;
  createdAt: string;
}

export interface ScheduledAppointment {
  id: string;
  folio: string;
  dateLabel: string;
  isoDate: string;
  time: string;
  duration: string;
  barberId: string;
  barberName: string;
  barberSpecialty: string;
  barberImage: string;
  serviceName: string;
  extras: string[];
  total: number;
  status: "Confirmada" | "Próxima visita";
  daysAwayLabel: string;
  clientNotes: string;
  referenceImage?: string;
  guestPhoneNormalized: string;
}

export interface PastAppointment {
  id: string;
  folio: string;
  date: string;
  lookTitle: string;
  barberId: string;
  barberName: string;
  barberImage: string;
  serviceName: string;
  extras: string[];
  total: number;
  image: string;
  barberNotes: string;
  rating: AppointmentRating | null;
}

export interface PhoneAuditEntry {
  id: string;
  previousPhoneMasked: string;
  newPhone: string;
  changedAt: string;
}

export interface UserProfileData {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  provider: "google";
  memberCode: string;
  memberSince: string;
  phone: string;
  lastPhoneChangeAt: string | null;
  phoneHistory: PhoneAuditEntry[];
  preferredBarberId: string;
  styleNotes: string;
  whatsappReminders: boolean;
  emailReminders: boolean;
  scheduledAppointments: ScheduledAppointment[];
  pastAppointments: PastAppointment[];
}

export function createSeedAccounts(): Record<string, UserProfileData> {
  const twelveDaysAgoIso = new Date(
    Date.now() - 12 * 24 * 60 * 60 * 1000,
  ).toISOString();

  return {
    "santiago.marquez@gmail.com": {
      id: "usr_santiago_01",
      email: "santiago.marquez@gmail.com",
      name: "Santiago Márquez",
      provider: "google",
      memberCode: "SOCIO COBRE #0418",
      memberSince: "Diciembre 2024",
      phone: "+52 55 4821 0934",
      // Más de 30 días desde el último cambio: disponible para actualizar y probar el bloqueo en vivo
      lastPhoneChangeAt: "2026-08-14T16:30:00.000Z",
      phoneHistory: [
        {
          id: "ph_init_1",
          previousPhoneMasked: "+52 •• •••• 3109",
          newPhone: "+52 55 4821 0934",
          changedAt: "2026-08-14T16:30:00.000Z",
        },
      ],
      preferredBarberId: "mateo",
      styleNotes:
        "No muy corto a los lados; mantener textura natural arriba y acabado mate sin brillo.",
      whatsappReminders: true,
      emailReminders: true,
      scheduledAppointments: [
        {
          id: "sch_01",
          folio: "CB-8492",
          dateLabel: "Jueves, 5 de noviembre de 2026",
          isoDate: "2026-11-05T16:30:00-06:00",
          time: "16:30",
          duration: "50 min",
          barberId: "mateo",
          barberName: "Mateo Cruz",
          barberSpecialty: "Fades precisos y diseño",
          barberImage: photos.mateo,
          serviceName: "Corte Signature",
          extras: ["Tratamiento de barba"],
          total: 57,
          status: "Confirmada",
          daysAwayLabel: "Próxima cita · En 5 días",
          clientNotes:
            "Mantener largo superior para peinar con textura y limpiar contornos bajos.",
          referenceImage: photos.cuts[1],
          guestPhoneNormalized: "525548210934",
        },
        {
          id: "sch_02",
          folio: "CB-8610",
          dateLabel: "Viernes, 27 de noviembre de 2026",
          isoDate: "2026-11-27T18:00:00-06:00",
          time: "18:00",
          duration: "35 min",
          barberId: "marco",
          barberName: "Marco León",
          barberSpecialty: "Ritual de barba y afeitado",
          barberImage: photos.marco,
          serviceName: "Ritual de barba",
          extras: [],
          total: 32,
          status: "Próxima visita",
          daysAwayLabel: "Programada · Fin de mes",
          clientNotes:
            "Ritual con toalla caliente e hidratación previa a evento formal.",
          guestPhoneNormalized: "525548210934",
        },
      ],
      pastAppointments: [
        {
          id: "past_01",
          folio: "CB-8104",
          date: "18 OCT 2026",
          lookTitle: "Fade texturizado medio",
          barberId: "mateo",
          barberName: "Mateo Cruz",
          barberImage: photos.mateo,
          serviceName: "Corte Signature",
          extras: ["Styling wax"],
          total: 54,
          image: photos.cuts[0],
          barberNotes:
            "Textura natural trabajada a tijera en coronilla, transición baja a 0.5 y acabado con cera mate ligera.",
          rating: null,
        },
        {
          id: "past_02",
          folio: "CB-7840",
          date: "20 SEP 2026",
          lookTitle: "Perfilado clásico & compresa",
          barberId: "marco",
          barberName: "Marco León",
          barberImage: photos.marco,
          serviceName: "Ritual de barba",
          extras: ["Tratamiento de barba"],
          total: 47,
          image: photos.cuts[4],
          barberNotes:
            "Afeitado de pómulos y cuello a navaja con doble toalla caliente y aceite esencial de cedro.",
          rating: null,
        },
        {
          id: "past_03",
          folio: "CB-7412",
          date: "09 AGO 2026",
          lookTitle: "Crop clásico estructurado",
          barberId: "mateo",
          barberName: "Mateo Cruz",
          barberImage: photos.mateo,
          serviceName: "Corte + barba",
          extras: [],
          total: 68,
          image: photos.cuts[3],
          barberNotes:
            "Flequillo ligeramente desfilado, laterales conectados a tijera sobre peine y barba rebajada en degradado.",
          rating: {
            stars: 5,
            tags: [
              "Precisión en el corte",
              "Puntualidad",
              "Escucha y asesoría",
            ],
            comment:
              "Impecable como siempre. Mateo entendió exactamente la caída que buscaba y el corte mantuvo su forma todo el mes.",
            createdAt: "2026-08-10T15:20:00.000Z",
          },
        },
        {
          id: "past_04",
          folio: "CB-6921",
          date: "14 JUN 2026",
          lookTitle: "Low fade de autor",
          barberId: "lucas",
          barberName: "Lucas Herrera",
          barberImage: photos.lucas,
          serviceName: "Fade de autor",
          extras: ["Diseño adicional"],
          total: 58,
          image: photos.cuts[6],
          barberNotes:
            "Degradado bajo comprimido con caída limpia en nuca y acabado natural con secador tibio.",
          rating: {
            stars: 5,
            tags: ["Ritual y confort", "Ambiente del club"],
            comment:
              "Gran atención, sin prisas y con excelente conversación. El lavado final relaja muchísimo.",
            createdAt: "2026-06-15T19:00:00.000Z",
          },
        },
      ],
    },
    "andres.morales@gmail.com": {
      id: "usr_andres_02",
      email: "andres.morales@gmail.com",
      name: "Andrés Morales",
      provider: "google",
      memberCode: "SOCIO COBRE #0192",
      memberSince: "Marzo 2023",
      phone: "+52 55 9103 7742",
      // Modificado hace 12 días: muestra el bloqueo activo (18 días restantes)
      lastPhoneChangeAt: twelveDaysAgoIso,
      phoneHistory: [
        {
          id: "ph_init_2",
          previousPhoneMasked: "+52 •• •••• 6420",
          newPhone: "+52 55 9103 7742",
          changedAt: twelveDaysAgoIso,
        },
      ],
      preferredBarberId: "lucas",
      styleNotes: "Corte íntegro a tijera en laterales, raya lateral natural.",
      whatsappReminders: true,
      emailReminders: false,
      scheduledAppointments: [
        {
          id: "sch_03",
          folio: "CB-8519",
          dateLabel: "Sábado, 7 de noviembre de 2026",
          isoDate: "2026-11-07T11:30:00-06:00",
          time: "11:30",
          duration: "80 min",
          barberId: "lucas",
          barberName: "Lucas Herrera",
          barberSpecialty: "Barba clásica y tijera",
          barberImage: photos.lucas,
          serviceName: "Corte + barba",
          extras: ["Tratamiento de barba"],
          total: 83,
          status: "Confirmada",
          daysAwayLabel: "Próxima cita · Este sábado",
          clientNotes:
            "Rebajar volumen lateral con tijera manteniendo largo clásico.",
          guestPhoneNormalized: "525591037742",
        },
      ],
      pastAppointments: [
        {
          id: "past_05",
          folio: "CB-8011",
          date: "04 OCT 2026",
          lookTitle: "Clásico a tijera & barba",
          barberId: "lucas",
          barberName: "Lucas Herrera",
          barberImage: photos.lucas,
          serviceName: "Corte + barba",
          extras: [],
          total: 68,
          image: photos.cuts[2],
          barberNotes:
            "Estructura clásica a peine y tijera, patillas desvanecidas suavemente y perfilado con navaja.",
          rating: null,
        },
        {
          id: "past_06",
          folio: "CB-7590",
          date: "22 AGO 2026",
          lookTitle: "Taper clásico",
          barberId: "nico",
          barberName: "Nico Vidal",
          barberImage: photos.nico,
          serviceName: "Corte Signature",
          extras: [],
          total: 42,
          image: photos.cuts[7],
          barberNotes:
            "Contornos limpios con taper bajo en sienes y nuca, textura ligera en la parte frontal.",
          rating: {
            stars: 5,
            tags: ["Acabado duradero", "Puntualidad"],
            comment: "Muy puntual y atento a cada detalle del remolino.",
            createdAt: "2026-08-23T12:10:00.000Z",
          },
        },
      ],
    },
  };
}
