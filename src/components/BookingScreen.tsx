"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { formatCOP } from "@/lib/format";
import {
  addons,
  barbers,
  Barber,
  photos,
  ScheduledAppointment,
  services,
  UserProfileData,
} from "@/lib/data";
import { Icon } from "./Icons";
import { Button, Eyebrow, SectionHeading } from "./UIPrimitives";

const steps = ["Servicio", "Fecha", "Estilo", "Datos", "Listo"];

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

export function BookingScreen({
  initialBarberIndex = 0,
  initialServiceId = "signature",
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
  onAppointmentCreated?: (appointment: ScheduledAppointment) => void;
  onNavigateHome: () => void;
  onNavigatePortal: () => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedBarberIndex, setSelectedBarberIndex] =
    useState(initialBarberIndex);
  const [serviceId, setServiceId] = useState(initialServiceId);
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["treatment"]);
  const [day, setDay] = useState(17);
  const [time, setTime] = useState("16:30");
  const [image, setImage] = useState<string | null>(photos.cuts[1]);
  const [notes, setNotes] = useState(
    "No muy corto a los lados; mantener textura arriba.",
  );

  // Datos del cliente / invitado
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [dataError, setDataError] = useState("");

  const [generatedFolio, setGeneratedFolio] = useState<string>("");

  const fileRef = useRef<HTMLInputElement>(null);

  const barber: Barber = barbers[selectedBarberIndex] || barbers[0];
  const service =
    services.find((item) => item.id === serviceId) || services[0];

  const total = useMemo(() => {
    const addonsTotal = addons
      .filter((item) => selectedAddons.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);
    return service.price + addonsTotal;
  }, [service, selectedAddons]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImage(URL.createObjectURL(file));
  };

  const handleConfirmAppointment = () => {
    setDataError("");
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanName || cleanName.length < 2) {
      setDataError("Por favor ingresa tu nombre completo.");
      return;
    }
    if (!cleanPhone || cleanPhone.length < 7) {
      setDataError("Por favor ingresa un número de teléfono de contacto válido.");
      return;
    }

    const folioNum = Math.floor(8000 + Math.random() * 1999);
    const folio = `CB-${folioNum}`;
    setGeneratedFolio(folio);

    const newAppointment: ScheduledAppointment = {
      id: `sch_${Date.now()}`,
      folio,
      dateLabel: `${day} de noviembre de 2026`,
      isoDate: `2026-11-${String(day).padStart(2, "0")}T${time}:00-05:00`,
      time,
      duration: service.duration,
      barberId: barber.id,
      barberName: barber.name,
      barberSpecialty: barber.specialty,
      barberImage: barber.image,
      serviceName: service.name,
      extras: addons
        .filter((a) => selectedAddons.includes(a.id))
        .map((a) => a.name),
      total,
      status: "Confirmada",
      daysAwayLabel: "Próxima cita reservada",
      clientNotes: notes.trim(),
      referenceImage: image || undefined,
      guestPhoneNormalized: cleanPhone.replace(/\D/g, ""),
    };

    if (onAppointmentCreated) {
      onAppointmentCreated(newAppointment);
    }

    setStep(4);
  };

  const next = () => {
    if (step === 3) {
      handleConfirmAppointment();
    } else {
      setStep((current) => Math.min(4, current + 1));
    }
  };

  const handleBackStep = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep((current) => current - 1);
    }
  };

  return (
    <main className="booking-page page-shell">
      <div className="booking-top">
        <Button variant="ghost" className="back-link" onClick={handleBackStep}>
          <Icon name="back" />{" "}
          {step === 0 ? "Volver" : "Paso anterior"}
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
                  {barbers.map((b, idx) => (
                    <button
                      key={b.id}
                      type="button"
                      className={`booking-barber-chip ${
                        selectedBarberIndex === idx ? "active" : ""
                      }`}
                      onClick={() => setSelectedBarberIndex(idx)}
                    >
                      <img src={b.image} alt={b.name} />
                      <span>{b.short}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="service-list">
                {services.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`service-option ${
                      serviceId === item.id ? "selected" : ""
                    }`}
                    onClick={() => setServiceId(item.id)}
                  >
                    <span className="service-index">0{index + 1}</span>
                    <span className="service-copy">
                      <strong>{item.name}</strong>
                      <small>{item.detail}</small>
                    </span>
                    <span className="service-time">
                      <Icon name="clock" size={15} />
                      {item.duration}
                    </span>
                    <span className="service-price">
                      {formatCOP(item.price)}
                    </span>
                    <span className="selector">
                      {serviceId === item.id && (
                        <Icon name="check" size={14} />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <div className="addons-section">
                <div className="addons-title">
                  <div>
                    <Eyebrow>Un toque más</Eyebrow>
                    <h2>Mejora tu cita</h2>
                  </div>
                  <p>Opcional, pero difícil de lamentar.</p>
                </div>
                <div className="addons-grid">
                  {addons.map((addon) => {
                    const selected = selectedAddons.includes(addon.id);
                    return (
                      <button
                        key={addon.id}
                        type="button"
                        className={`addon-card ${selected ? "selected" : ""}`}
                        onClick={() => toggleAddon(addon.id)}
                      >
                        <span className="addon-toggle">
                          {selected ? (
                            <Icon name="minus" />
                          ) : (
                            <Icon name="plus" />
                          )}
                        </span>
                        <strong>{addon.name}</strong>
                        <small>{addon.detail}</small>
                        <span>+{formatCOP(addon.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {step === 1 && (
            <DateStep
              day={day}
              setDay={setDay}
              time={time}
              setTime={setTime}
              barber={barber}
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
                copy="Una imagen vale más que mil indicaciones frente al espejo."
              />
              <div className="inspiration-layout">
                <div
                  className="upload-area"
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileRef.current?.click();
                    }
                  }}
                >
                  {image ? (
                    <img
                      src={image}
                      alt="Foto de inspiración seleccionada"
                    />
                  ) : (
                    <div>
                      <Icon name="camera" size={28} />
                      <strong>Sube tu referencia</strong>
                      <span>JPG o PNG · máx. 10 MB</span>
                    </div>
                  )}
                  {image && (
                    <div className="image-overlay">
                      <Icon name="camera" /> Cambiar foto
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFile}
                    aria-label="Cargar foto de inspiración"
                  />
                </div>
                <div className="style-notes">
                  <div className="privacy-note">
                    <span>
                      <Icon name="check" />
                    </span>
                    <p>
                      <strong>
                        {barber.short} la verá antes de tu llegada.
                      </strong>
                      <br />
                      Así podrá preparar una recomendación pensada para ti.
                    </p>
                  </div>
                  <label htmlFor="booking-notes">
                    Algo que debamos saber <small>Opcional</small>
                  </label>
                  <textarea
                    id="booking-notes"
                    value={notes}
                    onChange={(event) =>
                      setNotes(event.target.value.slice(0, 180))
                    }
                    rows={5}
                    placeholder="Ej. no muy corto a los lados; mantener textura arriba…"
                  />
                  <span className="character-count">{notes.length}/180</span>
                </div>
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
                copy="¿Dónde te enviamos la confirmación de tu cita?"
              />
              <form
                className="contact-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleConfirmAppointment();
                }}
              >
                <label>
                  Nombre completo <span>*</span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    placeholder="Ej. Santiago Márquez"
                  />
                </label>
                <label>
                  Teléfono <span>*</span>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    type="tel"
                    placeholder="Ej. +52 55 4821 0934"
                  />
                </label>
                <label>
                  Correo electrónico <small>Opcional</small>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    placeholder="tu@email.com"
                  />
                </label>

                {dataError && (
                  <p className="login-message is-error" role="alert">
                    {dataError}
                  </p>
                )}

                <p>
                  <Icon name="check" /> Te enviaremos un recordatorio 24 horas
                  antes. Sin promociones innecesarias.
                </p>
                <Button type="submit" className="desktop-submit">
                  Confirmar cita <Icon name="arrow" />
                </Button>
              </form>
            </>
          )}

          {step === 4 && (
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
                Folio #{generatedFolio || "CB-8492"} · {day} de noviembre de 2026 · {time} hrs
                <br />
                Cobre Barber Club, Roma Norte
              </p>
              <div className="confirmation-card">
                <div className="confirmation-barber">
                  <img src={barber.image} alt={barber.name} />
                  <div>
                    <small>Tu barbero asignado</small>
                    <strong>{barber.name}</strong>
                  </div>
                </div>
                <div className="confirmation-details">
                  <div>
                    <span>Servicio</span>
                    <strong>{service.name}</strong>
                  </div>
                  <div>
                    <span>Duración</span>
                    <strong>{service.duration}</strong>
                  </div>
                  <div>
                    <span>Extras</span>
                    <strong>
                      {selectedAddons.length
                        ? addons
                            .filter((a) => selectedAddons.includes(a.id))
                            .map((a) => a.name)
                            .join(", ")
                        : "Ninguno"}
                    </strong>
                  </div>
                  <div>
                    <span>Total estimado</span>
                    <strong className="gold">{formatCOP(total)}</strong>
                  </div>
                </div>
                {image && (
                  <div className="confirmation-inspiration">
                    <img src={image} alt="Inspiración adjunta" />
                    <div>
                      <Icon name="check" />
                      <span>
                        Inspiración adjunta
                        <br />
                        <small>{barber.short} la revisará antes</small>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!currentUser && (
                <div className="confirmation-guest-note">
                  <Icon name="info" size={16} />
                  <p>
                    <strong>Cita generada como invitado:</strong> guarda tu
                    folio #{generatedFolio}. Como invitado solo generas tu
                    reserva; para consultar historial o calificar tus cortes,
                    puedes iniciar sesión con Google cuando gustes.
                  </p>
                </div>
              )}

              <div className="confirmation-actions">
                {currentUser && (
                  <Button onClick={onNavigatePortal}>
                    Ver en mis citas programadas
                  </Button>
                )}
                <Button
                  variant={currentUser ? "ghost" : "primary"}
                  onClick={onNavigateHome}
                >
                  Volver al inicio <Icon name="arrow" />
                </Button>
              </div>
            </div>
          )}
        </section>

        {step < 4 && (
          <BookingSummary
            total={total}
            service={service}
            day={day}
            time={time}
            selectedAddons={selectedAddons}
            barber={barber}
          />
        )}
      </div>

      {step < 3 && (
        <div className="mobile-next">
          <div>
            <small>Total estimado</small>
            <strong>{formatCOP(total)}</strong>
          </div>
          <Button onClick={next}>
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
          <Button onClick={handleConfirmAppointment}>
            Confirmar cita <Icon name="arrow" />
          </Button>
        </div>
      )}
    </main>
  );
}

function DateStep({
  day,
  setDay,
  time,
  setTime,
  barber,
}: {
  day: number;
  setDay: (day: number) => void;
  time: string;
  setTime: (time: string) => void;
  barber: Barber;
}) {
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const times = [
    "09:00",
    "10:30",
    "11:30",
    "13:00",
    "14:30",
    "16:30",
    "17:30",
    "19:00",
  ];
  const unavailable = ["10:30", "14:30", "19:00"];

  return (
    <>
      <SectionHeading
        eyebrow="Paso 2 de 5"
        title={
          <>
            Reserva tu <em>momento.</em>
          </>
        }
        copy={`Disponibilidad de ${barber.name}. Sin esperas, sin prisas.`}
      />
      <div className="date-time-grid">
        <div className="calendar-panel">
          <div className="calendar-header">
            <button type="button" aria-label="Mes anterior">
              <Icon name="back" />
            </button>
            <strong>Noviembre 2026</strong>
            <button type="button" aria-label="Mes siguiente">
              <Icon name="chevron" />
            </button>
          </div>
          <div className="weekdays">
            {["L", "M", "X", "J", "V", "S", "D"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <div className="calendar-days">
            <span className="muted">26</span>
            <span className="muted">27</span>
            <span className="muted">28</span>
            <span className="muted">29</span>
            <span className="muted">30</span>
            <span className="muted">31</span>
            {days.map((item) => (
              <button
                key={item}
                type="button"
                disabled={[3, 9, 14, 22, 29].includes(item)}
                className={day === item ? "selected" : ""}
                onClick={() => setDay(item)}
              >
                {item}
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
              <strong>Martes, {day} de noviembre</strong>
              <span>Hora local · 8 horarios disponibles</span>
            </div>
            <Icon name="clock" />
          </div>
          <div className="time-slots">
            {times.map((item) => (
              <button
                key={item}
                type="button"
                disabled={unavailable.includes(item)}
                className={time === item ? "selected" : ""}
                onClick={() => setTime(item)}
              >
                {item}
                {time === item && <Icon name="check" />}
              </button>
            ))}
          </div>
          <p>
            Los horarios se reservan temporalmente mientras completas tus
            datos.
          </p>
        </div>
      </div>
    </>
  );
}

function BookingSummary({
  total,
  service,
  day,
  time,
  selectedAddons,
  barber,
}: {
  total: number;
  service: typeof services[number];
  day: number;
  time: string;
  selectedAddons: string[];
  barber: Barber;
}) {
  return (
    <aside className="booking-summary">
      <Eyebrow>Tu cita</Eyebrow>
      <div className="summary-barber">
        <img src={barber.image} alt={barber.name} />
        <div>
          <strong>{barber.name}</strong>
          <span>{barber.specialty}</span>
        </div>
        <span>{barber.rating} ★</span>
      </div>
      <div className="summary-lines">
        <div>
          <span>Servicio</span>
          <strong>{service.name}</strong>
        </div>
        <div>
          <span>Fecha</span>
          <strong>{day ? `${day} Nov` : "Por elegir"}</strong>
        </div>
        <div>
          <span>Hora</span>
          <strong>{time || "Por elegir"}</strong>
        </div>
        {selectedAddons.length > 0 && (
          <div>
            <span>Extras</span>
            <strong>{selectedAddons.length} añadidos</strong>
          </div>
        )}
      </div>
      <div className="summary-total">
        <span>Total estimado</span>
        <strong>{formatCOP(total)}</strong>
      </div>
      <p>Pago directamente en el local.</p>
    </aside>
  );
}
