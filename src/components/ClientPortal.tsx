"use client";

import { FormEvent, useMemo, useState } from "react";
import { BOOKING_ENABLED, CLUB_INFO, PHONE_COOLDOWN_DAYS } from "@/lib/config";
import {
  AppointmentRating,
  barbers,
  PastAppointment,
  RATING_HIGHLIGHT_TAGS,
  RATING_LABELS,
  ScheduledAppointment,
  UserProfileData,
} from "@/lib/data";
import {
  computeFutureLockDateFormatted,
  COUNTRY_DIAL_OPTIONS,
  evaluatePhonePolicy,
  formatSpanishDate,
  validatePhoneInput,
} from "@/lib/phone-policy";
import { PortalTab } from "./Header";
import { GoogleLogo, Icon, WhatsAppLogo } from "./Icons";
import { BookingButton, Button, Eyebrow } from "./UIPrimitives";

export function GuestPortalScreen({
  guestName,
  lookupQuery,
  appointments,
  onSwitchToGoogleLogin,
  onExitGuest,
}: {
  guestName: string;
  lookupQuery: string;
  appointments: ScheduledAppointment[];
  onSwitchToGoogleLogin: () => void;
  onExitGuest: () => void;
}) {
  return (
    <main className="portal-page page-shell">
      <div className="portal-guest-banner">
        <div>
          <span className="guest-pill">
            <Icon name="user" size={13} /> Modo invitado · Consulta puntual
          </span>
          <h1>
            Citas programadas de <em>{guestName}</em>
          </h1>
          <p>
            Resultado para la búsqueda <strong>{lookupQuery}</strong>.
          </p>
        </div>
        <div className="guest-banner-actions">
          <Button variant="outline" onClick={onExitGuest}>
            Nueva consulta / Salir
          </Button>
          <button
            type="button"
            className="google-upgrade-btn"
            onClick={onSwitchToGoogleLogin}
          >
            <GoogleLogo />
            <span>Vincular con Google</span>
          </button>
        </div>
      </div>

      <section className="portal-section">
        <div className="scheduled-grid">
          {appointments.map((apt) => (
            <ScheduledCard key={apt.id} apt={apt} />
          ))}
        </div>
      </section>

      <section className="guest-locked-showcase">
        <div className="guest-locked-header">
          <Eyebrow>Cuenta completa Cobre</Eyebrow>
          <h2>
            Desbloquea tu experiencia <em>completa con Google.</em>
          </h2>
          <p>
            Por privacidad y seguridad, las siguientes funciones están
            reservadas para clientes que inician sesión con su cuenta verificada
            de Google:
          </p>
        </div>
        <div className="guest-locked-cards">
          <article>
            <span>
              <Icon name="lock" size={16} />
            </span>
            <h3>Historial de citas</h3>
            <p>
              Consulta cada corte anterior, fotografías de referencia y las
              notas técnicas guardadas por tu barbero.
            </p>
          </article>
          <article>
            <span>
              <Icon name="star" size={16} />
            </span>
            <h3>Calificar visitas</h3>
            <p>
              Evalúa la atención recibida de 1 a 5 estrellas, destaca aspectos
              del servicio y deja tus reseñas.
            </p>
          </article>
          <article>
            <span>
              <Icon name="shield" size={16} />
            </span>
            <h3>Perfil y teléfono seguro</h3>
            <p>
              Personaliza tus preferencias y actualiza tu número de contacto
              bajo política de protección de {PHONE_COOLDOWN_DAYS} días.
            </p>
          </article>
        </div>
        <div className="guest-locked-cta">
          <button
            type="button"
            className="google-button"
            onClick={onSwitchToGoogleLogin}
          >
            <GoogleLogo />
            <span>Iniciar sesión con Google ahora</span>
          </button>
        </div>
      </section>
    </main>
  );
}

function ScheduledCard({ apt }: { apt: ScheduledAppointment }) {
  const whatsappUrl = `https://wa.me/${CLUB_INFO.whatsappNumber}?text=${encodeURIComponent(
    `Hola Cobre Barber Club, escribo respecto a mi cita programada con folio ${apt.folio} (${apt.dateLabel} a las ${apt.time}).`,
  )}`;

  return (
    <article className="scheduled-card">
      <div className="scheduled-card-top">
        <div className="scheduled-badges">
          <span className="status-pill confirmed">
            <i /> {apt.status}
          </span>
          <span className="days-pill">{apt.daysAwayLabel}</span>
        </div>
        <span className="folio-tag">Folio #{apt.folio}</span>
      </div>

      <div className="scheduled-card-main">
        <div className="scheduled-when">
          <Eyebrow>Fecha y horario</Eyebrow>
          <h3>{apt.dateLabel}</h3>
          <div className="scheduled-time-row">
            <strong>
              <Icon name="clock" size={16} /> {apt.time} hrs
            </strong>
            <span>· Duración estimada {apt.duration}</span>
          </div>
          <p className="scheduled-location">
            <Icon name="pin" size={14} /> {CLUB_INFO.addressLine1},{" "}
            {CLUB_INFO.addressLine2}
          </p>
        </div>

        <div className="scheduled-barber-box">
          <img src={apt.barberImage} alt={apt.barberName} />
          <div>
            <small>Tu barbero asignado</small>
            <strong>{apt.barberName}</strong>
            <span>{apt.barberSpecialty}</span>
          </div>
        </div>
      </div>

      <div className="scheduled-breakdown">
        <div>
          <span>Servicio principal</span>
          <strong>{apt.serviceName}</strong>
        </div>
        <div>
          <span>Extras incluidos</span>
          <strong>
            {apt.extras.length > 0 ? apt.extras.join(", ") : "Sin adicionales"}
          </strong>
        </div>
        <div>
          <span>Modalidad de pago</span>
          <strong>Pago directo en el club</strong>
        </div>
        <div>
          <span>Total estimado</span>
          <strong className="gold-price">${apt.total}</strong>
        </div>
      </div>

      {(apt.clientNotes || apt.referenceImage) && (
        <div className="scheduled-notes-row">
          {apt.referenceImage && (
            <img src={apt.referenceImage} alt="Referencia de estilo adjunta" />
          )}
          <div>
            <small>Notas para tu barbero</small>
            <p>{apt.clientNotes}</p>
          </div>
        </div>
      )}

      <div className="scheduled-actions">
        <Button
          variant="outline"
          onClick={() => window.open(CLUB_INFO.mapsExternalUrl, "_blank")}
        >
          <Icon name="pin" size={15} /> Cómo llegar
        </Button>
        <Button
          variant="ghost"
          onClick={() => window.open(whatsappUrl, "_blank")}
        >
          <WhatsAppLogo size={15} /> Dudas por WhatsApp
        </Button>
      </div>
    </article>
  );
}

export function ClientPortal({
  user,
  activeTab,
  onChangeTab,
  onSaveRating,
  onSaveProfile,
  onCommitPhoneChange,
  onLogout,
}: {
  user: UserProfileData;
  activeTab: PortalTab;
  onChangeTab: (tab: PortalTab) => void;
  onSaveRating: (appointmentId: string, rating: AppointmentRating) => void;
  onSaveProfile: (updates: {
    name: string;
    preferredBarberId: string;
    styleNotes: string;
    whatsappReminders: boolean;
    emailReminders: boolean;
  }) => void;
  onCommitPhoneChange: (newFormattedPhone: string) => void;
  onLogout: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<
    "all" | "unrated" | "rated"
  >("all");
  const [ratingTarget, setRatingTarget] = useState<PastAppointment | null>(
    null,
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => {
      setToast((current) => (current === msg ? null : current));
    }, 4200);
  };

  const unratedCount = useMemo(
    () => user.pastAppointments.filter((a) => !a.rating).length,
    [user.pastAppointments],
  );

  const ratedAppointments = useMemo(
    () => user.pastAppointments.filter((a) => Boolean(a.rating)),
    [user.pastAppointments],
  );

  const averageStars = useMemo(() => {
    if (ratedAppointments.length === 0) return "—";
    const sum = ratedAppointments.reduce(
      (acc, item) => acc + (item.rating?.stars || 0),
      0,
    );
    return (sum / ratedAppointments.length).toFixed(1);
  }, [ratedAppointments]);

  const filteredHistory = useMemo(() => {
    if (historyFilter === "unrated") {
      return user.pastAppointments.filter((a) => !a.rating);
    }
    if (historyFilter === "rated") {
      return user.pastAppointments.filter((a) => Boolean(a.rating));
    }
    return user.pastAppointments;
  }, [user.pastAppointments, historyFilter]);

  const preferredBarberName =
    barbers.find((b) => b.id === user.preferredBarberId)?.name || "Mateo Cruz";

  return (
    <main className="portal-page page-shell">
      {toast && (
        <div className="portal-toast" role="status">
          <Icon name="check" size={16} />
          <span>{toast}</span>
        </div>
      )}

      <header className="portal-hero-header">
        <div className="portal-member-top">
          <div className="member-badges">
            <span className="member-code">{user.memberCode}</span>
            <span className="google-verified-pill">
              <GoogleLogo />
              {user.email}
            </span>
          </div>
          <Button variant="ghost" className="logout-btn" onClick={onLogout}>
            <Icon name="logout" size={15} /> Cerrar sesión
          </Button>
        </div>

        <div className="portal-welcome-row">
          <div>
            <Eyebrow>Miembro desde {user.memberSince}</Eyebrow>
            <h1>
              Hola, <em>{user.name.split(" ")[0]}.</em>
            </h1>
            <p>
              Consulta tus próximas visitas, califica la atención de tus cortes
              anteriores y gestiona tus datos personales.
            </p>
          </div>
          <div className="portal-booking-slot">
            <BookingButton label="Nueva cita" />
            <small>
              {BOOKING_ENABLED
                ? "Reserva en línea al instante"
                : "Integración con sistema de turnos en curso"}
            </small>
          </div>
        </div>

        <div className="portal-tabs" role="tablist" aria-label="Secciones de mi cuenta">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "scheduled"}
            className={activeTab === "scheduled" ? "active" : ""}
            onClick={() => onChangeTab("scheduled")}
          >
            <Icon name="calendar" size={15} />
            <span>Citas programadas</span>
            <em className="tab-count">{user.scheduledAppointments.length}</em>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "history"}
            className={activeTab === "history" ? "active" : ""}
            onClick={() => onChangeTab("history")}
          >
            <Icon name="star" size={15} />
            <span>Historial y calificaciones</span>
            {unratedCount > 0 ? (
              <em className="tab-count highlight">{unratedCount} por calificar</em>
            ) : (
              <em className="tab-count">{user.pastAppointments.length}</em>
            )}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => onChangeTab("profile")}
          >
            <Icon name="user" size={15} />
            <span>Mi perfil y teléfono</span>
          </button>
        </div>
      </header>

      {activeTab === "scheduled" && (
        <section className="portal-section" aria-label="Citas programadas">
          <div className="portal-section-intro">
            <div>
              <h2>
                Tus próximas <em>visitas al club.</em>
              </h2>
              <p>
                Recuerda llegar 5 minutos antes para comenzar tu diagnóstico con
                calma y bebida de cortesía.
              </p>
            </div>
          </div>

          {user.scheduledAppointments.length === 0 ? (
            <div className="empty-portal-state">
              <Icon name="calendar" size={28} />
              <h3>No tienes citas programadas en este momento</h3>
              <p>
                {BOOKING_ENABLED
                  ? "Reserva tu próxima visita en línea en menos de un minuto."
                  : "Muy pronto podrás reservar directamente desde aquí cuando finalice la conexión con nuestro sistema de citas."}
              </p>
              <BookingButton label="Agendar cita" />
            </div>
          ) : (
            <div className="scheduled-grid">
              {user.scheduledAppointments.map((apt) => (
                <ScheduledCard key={apt.id} apt={apt} />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "history" && (
        <section
          className="portal-section"
          aria-label="Historial de citas y calificaciones"
        >
          <div className="history-kpi-bar">
            <div>
              <strong>0{user.pastAppointments.length}</strong>
              <span>Visitas completadas</span>
            </div>
            <div>
              <strong className={unratedCount > 0 ? "bronze-accent" : ""}>
                0{unratedCount}
              </strong>
              <span>Pendientes por calificar</span>
            </div>
            <div>
              <strong>{averageStars} ★</strong>
              <span>Calificación promedio dada</span>
            </div>
            <div>
              <strong className="serif-name">{preferredBarberName}</strong>
              <span>Barbero de preferencia</span>
            </div>
          </div>

          <div className="history-filter-row">
            <div className="filter-pills">
              <button
                type="button"
                className={historyFilter === "all" ? "active" : ""}
                onClick={() => setHistoryFilter("all")}
              >
                Todas ({user.pastAppointments.length})
              </button>
              <button
                type="button"
                className={historyFilter === "unrated" ? "active" : ""}
                onClick={() => setHistoryFilter("unrated")}
              >
                Por calificar ({unratedCount})
              </button>
              <button
                type="button"
                className={historyFilter === "rated" ? "active" : ""}
                onClick={() => setHistoryFilter("rated")}
              >
                Calificadas ({ratedAppointments.length})
              </button>
            </div>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="empty-portal-state">
              <Icon name="check" size={26} />
              <h3>No hay citas en este filtro</h3>
              <p>Cambia el filtro superior para ver todo tu archivo de visitas.</p>
            </div>
          ) : (
            <div className="timeline portal-timeline">
              {filteredHistory.map((entry, index) => (
                <HistoryAppointmentItem
                  key={entry.id}
                  entry={entry}
                  index={index}
                  onOpenRate={() => setRatingTarget(entry)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {activeTab === "profile" && (
        <ProfileAndPhoneSection
          user={user}
          onSaveProfile={(updates) => {
            onSaveProfile(updates);
            showToast("Preferencias de perfil guardadas correctamente.");
          }}
          onCommitPhoneChange={(newPhone) => {
            onCommitPhoneChange(newPhone);
            showToast(
              `Teléfono actualizado a ${newPhone}. Próximo cambio habilitado en ${PHONE_COOLDOWN_DAYS} días.`,
            );
          }}
        />
      )}

      {ratingTarget && (
        <RatingModal
          appointment={ratingTarget}
          onClose={() => setRatingTarget(null)}
          onSubmit={(rating) => {
            onSaveRating(ratingTarget.id, rating);
            setRatingTarget(null);
            showToast(
              `¡Gracias! Tu calificación de ${rating.stars} ★ para ${ratingTarget.barberName} fue registrada.`,
            );
          }}
        />
      )}
    </main>
  );
}

function HistoryAppointmentItem({
  entry,
  index,
  onOpenRate,
}: {
  entry: PastAppointment;
  index: number;
  onOpenRate: () => void;
}) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <article className={`timeline-entry ${expanded ? "expanded" : ""}`}>
      <div className="timeline-date">
        <span>
          {entry.date} · FOLIO #{entry.folio}
        </span>
        <i />
      </div>

      <div className="history-rich-card">
        <div className="timeline-card-grid">
          <div className="timeline-image">
            <img src={entry.image} alt={entry.lookTitle} />
            <span>0{index + 1}</span>
          </div>

          <div className="timeline-content">
            <div className="history-card-top-meta">
              <small>
                {entry.serviceName}
                {entry.extras.length > 0 && ` + ${entry.extras.join(", ")}`}
              </small>
              <strong className="history-price">${entry.total}</strong>
            </div>

            <h2>{entry.lookTitle}</h2>

            <div className="history-barber-line">
              <img src={entry.barberImage} alt={entry.barberName} />
              <span>
                Atendido por <strong>{entry.barberName}</strong>
              </span>
            </div>

            {!entry.rating ? (
              <div className="unrated-callout">
                <div>
                  <span className="pending-dot" />
                  <p>¿Cómo fue tu experiencia en esta visita?</p>
                </div>
                <Button onClick={onOpenRate} className="rate-now-btn">
                  <Icon name="star" size={15} /> Calificar cita
                </Button>
              </div>
            ) : (
              <div className="rated-summary-box">
                <div className="rated-stars-head">
                  <span className="stars-row" aria-label={`${entry.rating.stars} de 5 estrellas`}>
                    {"★".repeat(entry.rating.stars)}
                    {"☆".repeat(5 - entry.rating.stars)}
                  </span>
                  <strong>{entry.rating.stars}.0 · Calificada</strong>
                  <button
                    type="button"
                    className="edit-rating-link"
                    onClick={onOpenRate}
                  >
                    <Icon name="edit" size={12} /> Editar
                  </button>
                </div>
                {entry.rating.tags.length > 0 && (
                  <div className="rated-tags">
                    {entry.rating.tags.map((tag) => (
                      <em key={tag}>{tag}</em>
                    ))}
                  </div>
                )}
                {entry.rating.comment && <p>“{entry.rating.comment}”</p>}
              </div>
            )}

            <button
              type="button"
              className="detail-link-btn"
              onClick={() => setExpanded(!expanded)}
            >
              <span>
                {expanded
                  ? "Ocultar ficha técnica del barbero"
                  : "Ver ficha técnica del barbero"}
              </span>
              <Icon name="chevron" size={15} />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="look-detail">
            <p>
              <strong>Notas técnicas guardadas en tu expediente</strong>
              {entry.barberNotes}
            </p>
            <BookingButton
              variant="outline"
              label="Repetir este mismo look"
              compact
            />
          </div>
        )}
      </div>
    </article>
  );
}

function RatingModal({
  appointment,
  onClose,
  onSubmit,
}: {
  appointment: PastAppointment;
  onClose: () => void;
  onSubmit: (rating: AppointmentRating) => void;
}) {
  const [stars, setStars] = useState<number>(appointment.rating?.stars || 5);
  const [hoverStars, setHoverStars] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(
    appointment.rating?.tags || ["Precisión en el corte", "Puntualidad"],
  );
  const [comment, setComment] = useState<string>(
    appointment.rating?.comment || "",
  );

  const displayStars = hoverStars || stars;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      stars,
      tags: selectedTags,
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={`Calificar cita ${appointment.folio}`}
      onClick={onClose}
    >
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-head">
          <div>
            <Eyebrow>Calificar visita · #{appointment.folio}</Eyebrow>
            <h2>{appointment.lookTitle}</h2>
            <p>
              {appointment.serviceName} con{" "}
              <strong>{appointment.barberName}</strong> · {appointment.date}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Cerrar ventana de calificación"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="rating-modal-form">
          <div className="star-picker-block">
            <span className="star-picker-label">Tu calificación general</span>
            <div className="star-buttons" role="radiogroup" aria-label="Estrellas">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className={`star-btn ${value <= displayStars ? "lit" : ""}`}
                  onMouseEnter={() => setHoverStars(value)}
                  onMouseLeave={() => setHoverStars(0)}
                  onClick={() => setStars(value)}
                  aria-label={`${value} estrellas`}
                >
                  ★
                </button>
              ))}
            </div>
            <strong className="star-meaning">
              {displayStars}.0 — {RATING_LABELS[displayStars]}
            </strong>
          </div>

          <div className="rating-tags-block">
            <span className="field-caption">
              ¿Qué destacarías de esta sesión? <small>Opcional</small>
            </span>
            <div className="rating-tag-pills">
              {RATING_HIGHLIGHT_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    className={active ? "active" : ""}
                    onClick={() => toggleTag(tag)}
                  >
                    {active && <Icon name="check" size={12} />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rating-comment-block">
            <label htmlFor="rating-comment">
              Tu reseña para el club y tu barbero <small>Opcional</small>
            </label>
            <textarea
              id="rating-comment"
              rows={4}
              maxLength={280}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ej. Excelente atención al detalle y puntualidad…"
            />
            <span className="char-counter">{comment.length}/280</span>
          </div>

          <div className="rating-modal-actions">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar calificación <Icon name="check" size={15} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProfileAndPhoneSection({
  user,
  onSaveProfile,
  onCommitPhoneChange,
}: {
  user: UserProfileData;
  onSaveProfile: (updates: {
    name: string;
    preferredBarberId: string;
    styleNotes: string;
    whatsappReminders: boolean;
    emailReminders: boolean;
  }) => void;
  onCommitPhoneChange: (newFormattedPhone: string) => void;
}) {
  const [name, setName] = useState(user.name);
  const [preferredBarberId, setPreferredBarberId] = useState(
    user.preferredBarberId,
  );
  const [styleNotes, setStyleNotes] = useState(user.styleNotes);
  const [whatsappReminders, setWhatsappReminders] = useState(
    user.whatsappReminders,
  );
  const [emailReminders, setEmailReminders] = useState(user.emailReminders);

  // Phone cooldown policy & editor state
  const policy = useMemo(
    () => evaluatePhonePolicy(user.lastPhoneChangeAt),
    [user.lastPhoneChangeAt],
  );

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [countryCode, setCountryCode] = useState("+52");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [pendingConfirmedPhone, setPendingConfirmedPhone] = useState<
    string | null
  >(null);

  const selectedDialOption =
    COUNTRY_DIAL_OPTIONS.find((item) => item.code === countryCode) ||
    COUNTRY_DIAL_OPTIONS[0];

  const handleProfileFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name,
      preferredBarberId,
      styleNotes,
      whatsappReminders,
      emailReminders,
    });
  };

  const handleReviewPhoneChange = (e: FormEvent) => {
    e.preventDefault();
    setPhoneError("");

    if (!policy.canChange) {
      setPhoneError(
        `Debes esperar hasta el ${policy.nextAvailableFormatted} para modificar tu número.`,
      );
      return;
    }

    const validation = validatePhoneInput(countryCode, localPhone, user.phone);
    if (!validation.valid || !validation.formatted) {
      setPhoneError(validation.error || "Número inválido.");
      return;
    }

    setPendingConfirmedPhone(validation.formatted);
  };

  const handleFinalizePhoneChange = () => {
    if (!pendingConfirmedPhone || !policy.canChange) return;
    onCommitPhoneChange(pendingConfirmedPhone);
    setPendingConfirmedPhone(null);
    setIsEditingPhone(false);
    setLocalPhone("");
    setPhoneError("");
  };

  return (
    <section className="portal-section profile-grid" aria-label="Mi perfil">
      <div className="profile-card">
        <div className="profile-card-head">
          <div className="profile-avatar-large">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <Eyebrow>Identidad de socio</Eyebrow>
            <h2>Datos y preferencias</h2>
            <p className="verified-email-line">
              <Icon name="shield" size={14} /> {user.email} ·{" "}
              <em>Verificado con Google</em>
            </p>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleProfileFormSubmit}>
          <label>
            <span>Nombre en tus reservaciones</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <label>
            <span>
              Correo electrónico vinculado <small>Gestionado por Google</small>
            </span>
            <input type="email" value={user.email} disabled readOnly />
          </label>

          <label>
            <span>Barbero habitual de preferencia</span>
            <select
              value={preferredBarberId}
              onChange={(e) => setPreferredBarberId(e.target.value)}
            >
              {barbers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.specialty}
                </option>
              ))}
              <option value="any">Sin preferencia (primer disponible)</option>
            </select>
          </label>

          <label>
            <span>
              Preferencias permanentes de corte{" "}
              <small>{styleNotes.length}/220</small>
            </span>
            <textarea
              rows={3}
              maxLength={220}
              value={styleNotes}
              onChange={(e) => setStyleNotes(e.target.value)}
              placeholder="Ej. Piel sensible en cuello, acabado mate, conservar remolino natural…"
            />
          </label>

          <div className="profile-toggles">
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={whatsappReminders}
                onChange={(e) => setWhatsappReminders(e.target.checked)}
              />
              <WhatsAppLogo size={15} />
              <span>Recibir recordatorio de cita por WhatsApp (24 h antes)</span>
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
              />
              <span>Recibir comprobantes y resumen en mi correo Google</span>
            </label>
          </div>

          <Button type="submit">
            Guardar preferencias <Icon name="check" size={15} />
          </Button>
        </form>
      </div>

      <div className="phone-security-card">
        <div className="phone-card-header">
          <div>
            <Eyebrow>Seguridad y contacto</Eyebrow>
            <h2>Número telefónico</h2>
          </div>
          <span
            className={`phone-status-badge ${
              policy.canChange ? "unlocked" : "locked"
            }`}
          >
            <Icon name={policy.canChange ? "check" : "lock"} size={13} />
            {policy.canChange
              ? "Cambio disponible"
              : `Bloqueado · ${policy.daysRemaining}d restantes`}
          </span>
        </div>

        <div className="current-phone-box">
          <small>Teléfono activo para tus citas</small>
          <div className="current-phone-value">
            <Icon name="phone" size={20} />
            <strong>{user.phone}</strong>
          </div>
          <span>
            {policy.lastChangedFormatted
              ? `Última modificación: ${policy.lastChangedFormatted}`
              : "Sin modificaciones recientes registradas"}
          </span>
        </div>

        <div className="phone-policy-explainer">
          <Icon name="info" size={16} />
          <p>
            <strong>Política de plazos ({PHONE_COOLDOWN_DAYS} días):</strong>{" "}
            para evitar cambios constantes y proteger el vínculo con tus citas
            programadas, el número de teléfono solo puede actualizarse{" "}
            <em>una vez cada {PHONE_COOLDOWN_DAYS} días naturales</em>.
          </p>
        </div>

        {!policy.canChange ? (
          <div className="phone-cooldown-lockbox" role="region" aria-label="Plazo activo de teléfono">
            <div className="cooldown-headline">
              <div>
                <strong>{policy.daysRemaining}</strong>
                <span>
                  {policy.daysRemaining === 1
                    ? "día restante de espera"
                    : "días restantes de espera"}
                </span>
              </div>
              <small>
                Día {policy.daysElapsed} de {policy.cooldownDays}
              </small>
            </div>

            <div
              className="cooldown-progress-track"
              role="progressbar"
              aria-valuenow={policy.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="cooldown-progress-fill"
                style={{ width: `${policy.progressPercent}%` }}
              />
            </div>

            <div className="cooldown-dates-grid">
              <div>
                <small>Último cambio aplicado</small>
                <strong>{policy.lastChangedFormatted}</strong>
              </div>
              <div>
                <small>Próxima edición habilitada</small>
                <strong className="bronze-text">
                  {policy.nextAvailableFormatted}
                </strong>
              </div>
            </div>

            <Button variant="outline" disabled className="locked-phone-btn">
              <Icon name="lock" size={14} /> Modificación bloqueada hasta el{" "}
              {policy.nextAvailableFormatted}
            </Button>

            <p className="cooldown-emergency-note">
              ¿Extraviaste tu línea telefónica antes del plazo? Acude a
              recepción en el club para validación presencial.
            </p>
          </div>
        ) : !isEditingPhone ? (
          <div className="phone-unlocked-cta">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingPhone(true);
                setPendingConfirmedPhone(null);
                setPhoneError("");
              }}
            >
              <Icon name="edit" size={15} /> Modificar número de teléfono
            </Button>
          </div>
        ) : !pendingConfirmedPhone ? (
          <form className="phone-edit-form" onSubmit={handleReviewPhoneChange}>
            <span className="phone-edit-title">Nuevo número de contacto</span>
            <div className="phone-input-split">
              <select
                aria-label="Prefijo de país"
                value={countryCode}
                onChange={(e) => {
                  setCountryCode(e.target.value);
                  setPhoneError("");
                }}
              >
                {COUNTRY_DIAL_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.country} {opt.code}
                  </option>
                ))}
              </select>
              <input
                type="tel"
                value={localPhone}
                onChange={(e) => {
                  setLocalPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder={selectedDialOption.placeholder}
                autoFocus
              />
            </div>

            {phoneError && (
              <p className="field-error" role="alert">
                {phoneError}
              </p>
            )}

            <div className="phone-edit-actions">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditingPhone(false);
                  setLocalPhone("");
                  setPhoneError("");
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Continuar a confirmación <Icon name="arrow" size={15} />
              </Button>
            </div>
          </form>
        ) : (
          <div className="phone-confirm-step">
            <Eyebrow>Confirmación obligatoria</Eyebrow>
            <h3>¿Confirmas actualizar tu teléfono?</h3>
            <div className="phone-transition-preview">
              <div>
                <small>Actual</small>
                <span>{user.phone}</span>
              </div>
              <Icon name="arrow" size={16} />
              <div>
                <small>Nuevo</small>
                <strong>{pendingConfirmedPhone}</strong>
              </div>
            </div>
            <p className="confirm-lock-warning">
              Al guardar este cambio hoy, tu número no podrá volver a
              modificarse hasta el{" "}
              <strong>{computeFutureLockDateFormatted()}</strong> (plazo de{" "}
              {PHONE_COOLDOWN_DAYS} días).
            </p>
            <div className="phone-edit-actions">
              <Button
                variant="ghost"
                onClick={() => setPendingConfirmedPhone(null)}
              >
                Corregir número
              </Button>
              <Button onClick={handleFinalizePhoneChange}>
                Confirmar y aplicar plazo <Icon name="lock" size={14} />
              </Button>
            </div>
          </div>
        )}

        {user.phoneHistory.length > 0 && (
          <div className="phone-audit-log">
            <h4>Historial de actualizaciones</h4>
            <ul>
              {user.phoneHistory.map((item) => (
                <li key={item.id}>
                  <span>
                    {item.previousPhoneMasked} → <strong>{item.newPhone}</strong>
                  </span>
                  <small>
                    {formatSpanishDate(new Date(item.changedAt))}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
