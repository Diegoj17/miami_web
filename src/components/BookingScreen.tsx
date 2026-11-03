"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AgendaApiError,
  agendaApiEnabled,
  createBooking,
  formatBogotaDate,
  formatBogotaTime,
  getAvailableDays,
  getBookingQuestions,
  getCatalog,
  getSlots,
  type AgendaAppointment,
  type AgendaCatalog,
  type AgendaDay,
  type AgendaProfessional,
  type AgendaQuestion,
  type AgendaService,
  type AgendaSlot,
} from "@/lib/agenda-api";
import { manageUrlFor } from "@/lib/agenda-mapping";
import { CLUB_INFO, EXTERNAL_BOOKING_URL } from "@/lib/config";
import { barbers, photos, UserProfileData } from "@/lib/data";
import { formatCOP } from "@/lib/format";
import { Icon } from "./Icons";
import { Button, Eyebrow, SectionHeading } from "./UIPrimitives";

const steps = ["Servicio", "Fecha", "Estilo", "Datos", "Listo"];
const NOTES_MAX = 180;

function BookingStepper({ step }: { step: number }) {
  return (
    <div className="stepper">
      {steps.map((label, index) => (
        <div
          className={`step ${index < step ? "complete" : ""} ${
            index === step ? "current" : ""
          }`}
          key={label}
        >
          <span>
            {index < step ? <Icon name="check" size={13} /> : index + 1}
          </span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

/** Foto del barbero de la landing (por su ID en la agenda) o la del backend. */
function barberImage(pro: AgendaProfessional | undefined): string {
  const local = barbers.find((b) => b.agendaId === pro?.id);
  return local?.image ?? pro?.avatarUrl ?? photos.chair;
}

const shortName = (pro?: AgendaProfessional) => pro?.name.split(" ")[0] ?? "";

/** Política de datos publicada en la agenda (misma empresa, mismo tratamiento). */
function privacyUrl(): string | undefined {
  try {
    return EXTERNAL_BOOKING_URL
      ? `${new URL(EXTERNAL_BOOKING_URL).origin}/legal/privacidad`
      : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Reserva desde la landing contra el backend de la agenda: catálogo, días y
 * horarios libres reales, y la cita queda creada en el mismo sistema que ve
 * miami_agenda. No se guarda nada de la reserva en el navegador.
 */
export function BookingScreen({
  initialBarberIndex = 0,
  currentUser,
  onBack,
  onAppointmentCreated,
  onNavigateHome,
  onNavigatePortal,
}: {
  initialBarberIndex?: number;
  initialServiceId?: string;
  currentUser?: UserProfileData | null;
  onBack: () => void;
  onAppointmentCreated?: () => void;
  onNavigateHome: () => void;
  onNavigatePortal: () => void;
}) {
  const [catalog, setCatalog] = useState<AgendaCatalog | null>(null);
  const [loadError, setLoadError] = useState("");

  const [step, setStep] = useState(0);
  const [proId, setProId] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<AgendaSlot | null>(null);
  const [notes, setNotes] = useState("");

  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [privacy, setPrivacy] = useState(false);
  const [questions, setQuestions] = useState<AgendaQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [booked, setBooked] = useState<AgendaAppointment | null>(null);

  useEffect(() => {
    if (!agendaApiEnabled) {
      setLoadError("El agendamiento en línea no está disponible en este momento.");
      return;
    }
    getBookingQuestions()
      .then(setQuestions)
      .catch(() => setQuestions([]));
    getCatalog()
      .then((data) => {
        setCatalog(data);
        const preferred = barbers[initialBarberIndex]?.agendaId;
        const pro =
          data.professionals.find((p) => p.id === preferred) ?? data.professionals[0];
        setProId(pro?.id ?? "");
      })
      .catch(() =>
        setLoadError("No pudimos cargar los servicios. Revisa tu conexión e inténtalo de nuevo."),
      );
  }, [initialBarberIndex]);

  const professional = catalog?.professionals.find((p) => p.id === proId);
  const offered = useMemo(
    () =>
      catalog?.services.filter((s) => professional?.serviceIds.includes(s.id)) ?? [],
    [catalog, professional],
  );
  const selected = offered.filter((s) => serviceIds.includes(s.id));
  const total = selected.reduce((sum, s) => sum + s.price, 0);
  const duration = selected.reduce((sum, s) => sum + s.durationMin, 0);
  const categories = [...new Set(offered.map((s) => s.category))];

  // Un servicio por categoría (p. ej. un corte + barba + cejas), como en la agenda.
  const toggleService = (service: AgendaService) => {
    setSlot(null);
    setServiceIds((current) => {
      if (current.includes(service.id)) return current.filter((id) => id !== service.id);
      const sameCategory = new Set(
        offered.filter((s) => s.category === service.category).map((s) => s.id),
      );
      return [...current.filter((id) => !sameCategory.has(id)), service.id];
    });
  };

  const chooseBarber = (id: string) => {
    if (id === proId) return;
    setProId(id);
    setSlot(null);
    setDate("");
    const pro = catalog?.professionals.find((p) => p.id === id);
    setServiceIds((current) => current.filter((sid) => pro?.serviceIds.includes(sid)));
  };

  const canContinue =
    step === 0 ? selected.length > 0 && Boolean(professional) : step === 1 ? Boolean(slot) : true;

  const handleConfirmAppointment = async () => {
    setFormError("");
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    if (cleanName.length < 3) {
      setFormError("Por favor ingresa tu nombre completo.");
      return;
    }
    if (cleanPhone.replace(/\D/g, "").length < 7) {
      setFormError("Por favor ingresa un número de teléfono de contacto válido.");
      return;
    }
    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError("Revisa el correo electrónico.");
      return;
    }
    const missing = questions.find((q) => q.required && !answers[q.id]?.trim());
    if (missing) {
      setFormError(`Responde: ${missing.label}`);
      return;
    }
    if (!privacy) {
      setFormError("Debes aceptar la política de datos para reservar.");
      return;
    }
    if (!slot || !selected.length) {
      setStep(1);
      return;
    }
    setSubmitting(true);
    try {
      const appointment = await createBooking({
        serviceIds: selected.map((s) => s.id),
        professionalId: slot.professionalId,
        start: slot.start,
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail || undefined,
        note: notes,
        privacyAccepted: true,
        answers: questions.map((q) => ({ question: q.label, answer: answers[q.id] ?? "" })),
      });
      setBooked(appointment);
      setStep(4);
      onAppointmentCreated?.();
    } catch (error) {
      if (error instanceof AgendaApiError && error.code === "slot_taken") {
        setSlot(null);
        setStep(1);
        setFormError("Ese horario se acaba de ocupar. Elige otra hora disponible.");
      } else {
        setFormError(
          error instanceof AgendaApiError ? error.message : "No pudimos crear tu cita. Inténtalo de nuevo.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => {
    if (!canContinue) return;
    if (step === 3) void handleConfirmAppointment();
    else setStep((current) => Math.min(4, current + 1));
  };

  const handleBackStep = () => {
    setFormError("");
    if (step === 0) onBack();
    else setStep((current) => current - 1);
  };

  if (loadError || !catalog) {
    return (
      <main className="booking-page page-shell">
        <div className="booking-top">
          <Button variant="ghost" className="back-link" onClick={onBack}>
            <Icon name="back" /> Volver
          </Button>
        </div>
        <p className={loadError ? "login-message is-error" : ""} role={loadError ? "alert" : "status"}>
          {loadError || "Cargando servicios…"}
        </p>
      </main>
    );
  }

  const manageUrl = booked ? manageUrlFor(booked.token) : undefined;
  const policyUrl = privacyUrl();

  return (
    <main className="booking-page page-shell">
      <div className="booking-top">
        <Button variant="ghost" className="back-link" onClick={handleBackStep}>
          <Icon name="back" /> {step === 0 ? "Volver" : "Paso anterior"}
        </Button>
        <BookingStepper step={step} />
      </div>

      <div className="booking-layout">
        <section className="booking-main">
          {step === 0 && (
            <>
              <SectionHeading
                eyebrow="Paso 1 de 5"
                title={
                  <>
                    Elige tu <em>ritual.</em>
                  </>
                }
                copy="Más que un servicio: el tiempo y la atención que tu estilo merece."
              />

              <div className="booking-barber-selector">
                <small className="booking-subheading">Barbero asignado:</small>
                <div className="booking-barber-chips">
                  {catalog.professionals.map((pro) => (
                    <button
                      key={pro.id}
                      type="button"
                      className={`booking-barber-chip ${proId === pro.id ? "active" : ""}`}
                      onClick={() => chooseBarber(pro.id)}
                    >
                      <img src={barberImage(pro)} alt={pro.name} />
                      <span>{shortName(pro)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {categories.map((category) => (
                <div key={category} className="service-list">
                  <small className="booking-subheading">{category} · elige uno</small>
                  {offered
                    .filter((s) => s.category === category)
                    .map((item, index) => {
                      const isSelected = serviceIds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`service-option ${isSelected ? "selected" : ""}`}
                          onClick={() => toggleService(item)}
                        >
                          <span className="service-index">0{index + 1}</span>
                          <span className="service-copy">
                            <strong>{item.name}</strong>
                            {item.description && <small>{item.description}</small>}
                          </span>
                          <span className="service-time">
                            <Icon name="clock" size={15} />
                            {item.durationMin} min
                          </span>
                          <span className="service-price">{formatCOP(item.price)}</span>
                          <span className="selector">
                            {isSelected && <Icon name="check" size={14} />}
                          </span>
                        </button>
                      );
                    })}
                </div>
              ))}
            </>
          )}

          {step === 1 && professional && (
            <DateStep
              serviceIds={selected.map((s) => s.id)}
              professional={professional}
              date={date}
              setDate={(value) => {
                setDate(value);
                setSlot(null);
              }}
              slot={slot}
              setSlot={(value) => {
                setSlot(value);
                setFormError("");
              }}
              notice={formError}
            />
          )}

          {step === 2 && (
            <>
              <SectionHeading
                eyebrow="Paso 3 de 5"
                title={
                  <>
                    Cuéntanos <em>tu idea.</em>
                  </>
                }
                copy="Tus indicaciones llegan con tu reserva para que tu barbero se prepare."
              />
              <div className="style-notes">
                <div className="privacy-note">
                  <span>
                    <Icon name="check" />
                  </span>
                  <p>
                    <strong>{shortName(professional)} las verá antes de tu llegada.</strong>
                    <br />
                    Escribe solo lo necesario sobre tu corte; no incluyas datos personales.
                  </p>
                </div>
                <label htmlFor="booking-notes">
                  Algo que debamos saber <small>Opcional</small>
                </label>
                <textarea
                  id="booking-notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value.slice(0, NOTES_MAX))}
                  rows={5}
                  placeholder="Ej. no muy corto a los lados; mantener textura arriba…"
                />
                <span className="character-count">
                  {notes.length}/{NOTES_MAX}
                </span>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <SectionHeading
                eyebrow="Paso 4 de 5"
                title={
                  <>
                    Últimos <em>detalles.</em>
                  </>
                }
                copy="¿Cómo te contactamos para confirmar tu cita?"
              />
              <form
                className="contact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  void handleConfirmAppointment();
                }}
              >
                <label>
                  Nombre completo <span>*</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value.slice(0, 160))}
                    required
                    autoComplete="name"
                    placeholder="Ej. Santiago Márquez"
                  />
                </label>
                <label>
                  Celular <span>*</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.slice(0, 40))}
                    required
                    type="tel"
                    autoComplete="tel"
                    placeholder="Ej. 300 123 4567"
                  />
                </label>
                <label>
                  Correo electrónico <small>Opcional</small>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value.slice(0, 160))}
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    readOnly={Boolean(currentUser?.email)}
                  />
                </label>
                {questions.map((q) => (
                  <fieldset key={q.id} className="booking-question">
                    <legend>
                      {q.label} {q.required ? <span>*</span> : <small>Opcional</small>}
                    </legend>
                    {q.type === "text" ? (
                      <input
                        value={answers[q.id] ?? ""}
                        onChange={(event) =>
                          setAnswers((a) => ({ ...a, [q.id]: event.target.value.slice(0, 500) }))
                        }
                      />
                    ) : (
                      <div className="booking-question-options">
                        {(q.type === "yesno" ? ["Sí", "No"] : q.options).map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`btn btn-outline ${answers[q.id] === option ? "is-selected" : ""}`}
                            aria-pressed={answers[q.id] === option}
                            onClick={() => setAnswers((a) => ({ ...a, [q.id]: option }))}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </fieldset>
                ))}

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={privacy}
                    onChange={(event) => setPrivacy(event.target.checked)}
                  />
                  <span>
                    Acepto el tratamiento de mis datos para gestionar mi cita
                    {policyUrl && (
                      <>
                        {" "}según la{" "}
                        <a href={policyUrl} target="_blank" rel="noopener noreferrer">
                          política de datos
                        </a>
                      </>
                    )}
                    .
                  </span>
                </label>

                {formError && (
                  <p className="login-message is-error" role="alert">
                    {formError}
                  </p>
                )}

                <Button type="submit" className="desktop-submit" disabled={submitting}>
                  {submitting ? "Reservando…" : "Confirmar cita"} <Icon name="arrow" />
                </Button>
              </form>
            </>
          )}

          {step === 4 && booked && (
            <div className="confirmation">
              <div className="confirmation-mark">
                <Icon name="check" size={32} />
              </div>
              <Eyebrow>Cita confirmada</Eyebrow>
              <h1>
                Tu momento está
                <br />
                <em>reservado.</em>
              </h1>
              <p>
                Código #{booked.id.replace(/^apt_/i, "").toUpperCase()} ·{" "}
                {formatBogotaDate(booked.start)} · {formatBogotaTime(booked.start)} hrs
                <br />
                {CLUB_INFO.name}, {CLUB_INFO.addressLine1}
              </p>
              <div className="confirmation-card">
                <div className="confirmation-barber">
                  <img src={barberImage(professional)} alt={booked.professionalName} />
                  <div>
                    <small>Tu barbero asignado</small>
                    <strong>{booked.professionalName}</strong>
                  </div>
                </div>
                <div className="confirmation-details">
                  <div>
                    <span>Servicio</span>
                    <strong>{selected.map((s) => s.name).join(" + ")}</strong>
                  </div>
                  <div>
                    <span>Duración</span>
                    <strong>{duration} min</strong>
                  </div>
                  <div>
                    <span>Total estimado</span>
                    <strong className="gold">{formatCOP(total)}</strong>
                  </div>
                </div>
              </div>

              {!currentUser && (
                <div className="confirmation-guest-note">
                  <Icon name="info" size={16} />
                  <p>
                    <strong>Guarda el enlace de tu cita:</strong> con él puedes
                    reprogramarla o cancelarla. Es personal; no lo compartas. Si
                    inicias sesión con Google verás tu historial y podrás calificar
                    tus cortes.
                  </p>
                </div>
              )}

              <div className="confirmation-actions">
                {currentUser ? (
                  <Button onClick={onNavigatePortal}>Ver en mis citas programadas</Button>
                ) : (
                  manageUrl && (
                    <a className="btn btn-primary" href={manageUrl} rel="noopener noreferrer">
                      Gestionar mi cita
                    </a>
                  )
                )}
                <Button variant="ghost" onClick={onNavigateHome}>
                  Volver al inicio <Icon name="arrow" />
                </Button>
              </div>
            </div>
          )}
        </section>

        {step < 4 && (
          <BookingSummary
            total={total}
            services={selected}
            duration={duration}
            slot={slot}
            professional={professional}
          />
        )}
      </div>

      {step < 3 && (
        <div className="mobile-next">
          <div>
            <small>Total estimado</small>
            <strong>{formatCOP(total)}</strong>
          </div>
          <Button onClick={next} disabled={!canContinue}>
            Continuar <Icon name="arrow" />
          </Button>
        </div>
      )}

      {step === 3 && (
        <div className="mobile-next">
          <div>
            <small>Todo listo</small>
            <strong>{formatCOP(total)}</strong>
          </div>
          <Button onClick={() => void handleConfirmAppointment()} disabled={submitting}>
            {submitting ? "Reservando…" : "Confirmar cita"} <Icon name="arrow" />
          </Button>
        </div>
      )}
    </main>
  );
}

const WEEKDAYS = ["L", "M", "X", "J", "V", "S", "D"];

/** Fecha 'YYYY-MM-DD' a mediodía UTC: el día no cambia con la zona horaria del visitante. */
const atNoon = (key: string) => new Date(`${key}T12:00:00Z`);

function DateStep({
  serviceIds,
  professional,
  date,
  setDate,
  slot,
  setSlot,
  notice,
}: {
  serviceIds: string[];
  professional: AgendaProfessional;
  date: string;
  setDate: (date: string) => void;
  slot: AgendaSlot | null;
  setSlot: (slot: AgendaSlot) => void;
  notice: string;
}) {
  const [days, setDays] = useState<AgendaDay[] | null>(null);
  const [slots, setSlots] = useState<AgendaSlot[] | null>(null);
  const [error, setError] = useState("");
  const [monthIndex, setMonthIndex] = useState(0);
  const serviceKey = serviceIds.join(",");

  useEffect(() => {
    setDays(null);
    setError("");
    getAvailableDays(serviceKey.split(","), professional.id)
      .then((list) => {
        setDays(list);
        if (!date) {
          const first = list.find((d) => d.available);
          if (first) setDate(first.date);
        }
      })
      .catch(() => setError("No pudimos consultar la disponibilidad. Inténtalo de nuevo."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceKey, professional.id]);

  useEffect(() => {
    if (!date) return;
    setSlots(null);
    getSlots(serviceKey.split(","), professional.id, date)
      .then(setSlots)
      .catch(() => setError("No pudimos consultar los horarios. Inténtalo de nuevo."));
  }, [date, serviceKey, professional.id]);

  const months = useMemo(() => {
    const keys = [...new Set((days ?? []).map((d) => d.date.slice(0, 7)))];
    return keys;
  }, [days]);
  const month = months[Math.min(monthIndex, Math.max(0, months.length - 1))];
  const monthDays = (days ?? []).filter((d) => d.date.startsWith(month ?? ""));
  const leading = monthDays.length ? (atNoon(monthDays[0].date).getUTCDay() + 6) % 7 : 0;
  const availableCount = slots?.length ?? 0;

  return (
    <>
      <SectionHeading
        eyebrow="Paso 2 de 5"
        title={
          <>
            Reserva tu <em>momento.</em>
          </>
        }
        copy={`Disponibilidad real de ${professional.name}. Horas en hora de Bogotá.`}
      />
      {(notice || error) && (
        <p className="login-message is-error" role="alert">
          {notice || error}
        </p>
      )}
      <div className="date-time-grid">
        <div className="calendar-panel">
          <div className="calendar-header">
            <button
              type="button"
              aria-label="Mes anterior"
              disabled={monthIndex === 0}
              onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
            >
              <Icon name="back" />
            </button>
            <strong>
              {month
                ? new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(
                    atNoon(`${month}-01`),
                  )
                : "Cargando…"}
            </strong>
            <button
              type="button"
              aria-label="Mes siguiente"
              disabled={monthIndex >= months.length - 1}
              onClick={() => setMonthIndex((i) => Math.min(months.length - 1, i + 1))}
            >
              <Icon name="chevron" />
            </button>
          </div>
          <div className="weekdays">
            {WEEKDAYS.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="calendar-days">
            {Array.from({ length: leading }, (_, i) => (
              <span key={`pad-${i}`} className="muted" />
            ))}
            {monthDays.map((item) => (
              <button
                key={item.date}
                type="button"
                disabled={!item.available}
                className={date === item.date ? "selected" : ""}
                onClick={() => setDate(item.date)}
                aria-label={formatBogotaDate(`${item.date}T17:00:00Z`)}
              >
                {Number(item.date.slice(8))}
              </button>
            ))}
          </div>
          <div className="calendar-legend">
            <span>
              <i className="available" />
              Disponible
            </span>
            <span>
              <i />
              No disponible
            </span>
          </div>
        </div>
        <div className="time-panel">
          <div className="time-heading">
            <div>
              <strong>{date ? formatBogotaDate(`${date}T17:00:00Z`) : "Elige un día"}</strong>
              <span>
                {slots === null && date
                  ? "Consultando horarios…"
                  : `Hora de Bogotá · ${availableCount} horario${availableCount === 1 ? "" : "s"} disponible${availableCount === 1 ? "" : "s"}`}
              </span>
            </div>
            <Icon name="clock" />
          </div>
          <div className="time-slots">
            {(slots ?? []).map((item) => {
              const isSelected = slot?.start === item.start;
              return (
                <button
                  key={item.start}
                  type="button"
                  className={isSelected ? "selected" : ""}
                  onClick={() => setSlot(item)}
                >
                  {formatBogotaTime(item.start)}
                  {isSelected && <Icon name="check" />}
                </button>
              );
            })}
          </div>
          {slots && slots.length === 0 && <p>No quedan horarios este día. Prueba con otra fecha.</p>}
          <p>El horario se confirma al terminar tu reserva.</p>
        </div>
      </div>
    </>
  );
}

function BookingSummary({
  total,
  services,
  duration,
  slot,
  professional,
}: {
  total: number;
  services: AgendaService[];
  duration: number;
  slot: AgendaSlot | null;
  professional?: AgendaProfessional;
}) {
  return (
    <aside className="booking-summary">
      <Eyebrow>Tu cita</Eyebrow>
      {professional && (
        <div className="summary-barber">
          <img src={barberImage(professional)} alt={professional.name} />
          <div>
            <strong>{professional.name}</strong>
            <span>{professional.specialty}</span>
          </div>
        </div>
      )}
      <div className="summary-lines">
        <div>
          <span>Servicio</span>
          <strong>{services.length ? services.map((s) => s.name).join(" + ") : "Por elegir"}</strong>
        </div>
        {duration > 0 && (
          <div>
            <span>Duración</span>
            <strong>{duration} min</strong>
          </div>
        )}
        <div>
          <span>Fecha</span>
          <strong>{slot ? formatBogotaDate(slot.start) : "Por elegir"}</strong>
        </div>
        <div>
          <span>Hora</span>
          <strong>{slot ? formatBogotaTime(slot.start) : "Por elegir"}</strong>
        </div>
      </div>
      <div className="summary-total">
        <span>Total estimado</span>
        <strong>{formatCOP(total)}</strong>
      </div>
      <p>Pago directamente en el local.</p>
    </aside>
  );
}
