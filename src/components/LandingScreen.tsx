"use client";

import { useEffect, useState } from "react";
import { BOOKING_ENABLED, CLUB_INFO } from "@/lib/config";
import { barbers, photos, services, testimonials } from "@/lib/data";
import { Icon } from "./Icons";
import { BookingButton, Button } from "./UIPrimitives";

export function LandingScreen({
  onOpenPortfolio,
  onOpenAccount,
  hasSession,
}: {
  onOpenPortfolio: (barberIndex: number) => void;
  onOpenAccount: () => void;
  hasSession: boolean;
}) {
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [todayJsDay, setTodayJsDay] = useState<number>(2);

  useEffect(() => {
    setTodayJsDay(new Date().getDay());
  }, []);

  const goToLocation = () =>
    document.getElementById("ubicacion")?.scrollIntoView({ behavior: "smooth" });

  const todaySchedule =
    CLUB_INFO.hours.find((item) => item.jsDay === todayJsDay) ||
    CLUB_INFO.hours[0];
  const isClosedToday = todaySchedule.hours.toLowerCase() === "cerrado";

  const mosaicItems = [
    photos.cuts[0],
    photos.cuts[2],
    photos.interior,
    photos.cuts[4],
    photos.cuts[5],
    photos.cuts[7],
  ];

  return (
    <main className="landing">
      <section className="landing-hero">
        <div className="landing-hero-photo">
          <img src={photos.shop} alt="Interior cálido de Cobre Barber Club" />
        </div>
        <div className="landing-hero-content page-shell">
          <p className="hero-kicker">{CLUB_INFO.neighborhood}</p>
          <h1>
            Cobre
            <br />
            <em>Barber Club</em>
          </h1>
          <p className="hero-promise">
            Buen oficio, conversación honesta
            <br />y un corte que se siente tuyo.
          </p>
          <div className={`open-status ${isClosedToday ? "is-closed" : ""}`}>
            <i />
            <span>
              <strong>
                {isClosedToday ? "Cerrado hoy" : "Abierto en horario habitual"}
              </strong>{" "}
              ·{" "}
              {isClosedToday
                ? "abrimos lunes a las 10:00"
                : `atención ${todaySchedule.hours}`}
            </span>
            <small>
              Hoy ({todaySchedule.day}), {todaySchedule.hours}
            </small>
          </div>
          <div className="hero-actions">
            <BookingButton label="Agendar cita" />
            <Button variant="outline" onClick={goToLocation}>
              <Icon name="pin" /> Cómo llegar
            </Button>
            <Button
              variant="ghost"
              className="hero-account-cta"
              onClick={onOpenAccount}
            >
              <Icon name="user" size={16} />
              {hasSession
                ? "Ver mis citas y perfil"
                : "Consultar mis citas / Acceso"}
              <Icon name="arrow" size={16} />
            </Button>
          </div>
          <p className="booking-integration-note">
            <Icon name="info" size={14} />{" "}
            {BOOKING_ENABLED
              ? "Reserva en línea en menos de un minuto."
              : "El módulo para nuevas reservas se habilitará al conectar nuestro aplicativo de agendamiento."}{" "}
            ¿Ya tienes cita? Consúltala desde tu cuenta o como invitado.
          </p>
        </div>
      </section>

      <section className="landing-about page-shell">
        <div className="about-story">
          <span>La casa</span>
          <h2>
            Un lugar de barrio,
            <br />
            <em>hecho con oficio.</em>
          </h2>
          <p>
            Cobre nació en 2016 con una idea sencilla: recuperar el tiempo y el
            cuidado de una buena barbería de barrio. Aquí cada visita empieza
            escuchando y termina cuando todo se siente en su sitio.
          </p>
          <p>
            No seguimos fórmulas. Conocemos a nuestros clientes, respetamos su
            estilo y hacemos bien el trabajo, corte tras corte.
          </p>
        </div>
        <div className="about-images">
          <img
            className="about-main-image"
            src={photos.interior}
            alt="El equipo trabajando en Cobre Barber Club"
          />
          <img
            className="about-detail-image"
            src={photos.chair}
            alt="Sillón clásico de la barbería"
          />
          <span>Desde 2016</span>
        </div>
        <div className="about-stats">
          <div>
            <strong>9</strong>
            <span>
              años cuidando
              <br />
              tu estilo
            </span>
          </div>
          <div>
            <strong>+4.800</strong>
            <span>
              clientes
              <br />
              atendidos
            </span>
          </div>
          <div>
            <strong>4</strong>
            <span>
              barberos
              <br />
              residentes
            </span>
          </div>
        </div>
      </section>

      <section className="landing-barbers page-shell" id="barberos">
        <div className="landing-heading">
          <span>El equipo</span>
          <h2>
            Cuatro formas de
            <br />
            <em>entender tu estilo.</em>
          </h2>
          <p>
            Conoce su especialidad, explora su portafolio y descubre el oficio
            detrás de cada silla.
          </p>
        </div>
        <div className="landing-barber-grid">
          {barbers.map((barber, index) => (
            <article className="landing-barber" key={barber.id}>
              <div
                className="landing-barber-photo is-interactive"
                onClick={() => onOpenPortfolio(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpenPortfolio(index);
                  }
                }}
                aria-label={`Ver portafolio de ${barber.name}`}
              >
                <img
                  src={barber.image}
                  alt={`${barber.name}, barbero de Cobre`}
                />
                <div className="barber-rating-pill">
                  <Icon name="star" size={12} filled />
                  <span>{barber.rating}</span>
                </div>
                <span>0{index + 1}</span>
              </div>
              <div className="landing-barber-info">
                <h3>{barber.name}</h3>
                <p>{barber.specialty}</p>
                <small>
                  {barber.experience} · {barber.reviews}
                </small>
                <div className="barber-card-links">
                  <Button
                    variant="ghost"
                    className="portfolio-trigger"
                    onClick={() => onOpenPortfolio(index)}
                  >
                    Ver portafolio <Icon name="arrow" size={15} />
                  </Button>
                  <BookingButton
                    variant="ghost"
                    label={`Agendar con ${barber.short}`}
                    barberId={barber.agendaId}
                    compact
                    className="barber-book-disabled"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-services" id="servicios">
        <div className="page-shell">
          <div className="landing-heading services-heading">
            <span>Lo que hacemos</span>
            <h2>
              Servicios con
              <br />
              <em>tiempo y atención.</em>
            </h2>
          </div>
          <div className="landing-service-list">
            {services.map((service, index) => (
              <article className="landing-service" key={service.id}>
                <span className="service-symbol">
                  <Icon name={index === 2 ? "star" : "scissors"} size={23} />
                </span>
                <div>
                  <h3>{service.name}</h3>
                  <p>
                    {service.detail}. Una experiencia pensada sin prisas y
                    adaptada a ti.
                  </p>
                </div>
                <div className="landing-service-meta">
                  <span>
                    <Icon name="clock" size={14} /> {service.duration}
                  </span>
                  <strong>${service.price}</strong>
                </div>
                <BookingButton
                  variant="ghost"
                  label="Agendar servicio"
                  serviceId={service.agendaId}
                  compact
                  className="service-book-disabled"
                />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-gallery page-shell" id="galeria">
        <div className="landing-heading">
          <span>Trabajo reciente</span>
          <h2>
            Hecho aquí.
            <br />
            <em>Llevado por ti.</em>
          </h2>
          <p>Toca cualquier fotografía para inspeccionar el acabado en detalle.</p>
        </div>
        <div className="landing-mosaic">
          {mosaicItems.map((photo, index) => (
            <figure
              key={photo}
              onClick={() => setLightboxPhoto(photo)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setLightboxPhoto(photo);
                }
              }}
              aria-label={`Ampliar fotografía ${index + 1}`}
            >
              <img
                src={photo}
                alt={
                  index === 2
                    ? "Interior de Cobre Barber Club"
                    : `Trabajo reciente de barbería ${index + 1}`
                }
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="trust-section">
        <div className="page-shell">
          <div className="trust-intro">
            <span>La voz del barrio</span>
            <h2>
              La confianza se gana
              <br />
              <em>corte a corte.</em>
            </h2>
          </div>
          <div className="trust-score">
            <strong>4.9</strong>
            <div>
              <span>★★★★★</span>
              <p>
                Calificación promedio
                <br />
                en 691 reseñas verificadas
              </p>
            </div>
          </div>
          <div className="testimonials">
            {testimonials.map((item, index) => (
              <blockquote key={item.name}>
                <span>“</span>
                <p>{item.quote}</p>
                <footer>
                  <strong>{item.name}</strong>
                  <small>{item.rating} ★</small>
                </footer>
                <i>0{index + 1}</i>
              </blockquote>
            ))}
          </div>
          <div className="trust-numbers">
            <div>
              <strong>+7.200</strong>
              <span>citas agendadas</span>
            </div>
            <div>
              <strong>86%</strong>
              <span>vuelve a visitarnos</span>
            </div>
            <div>
              <strong>9 años</strong>
              <span>en el mismo barrio</span>
            </div>
          </div>
        </div>
      </section>

      <section className="location-section page-shell" id="ubicacion">
        <div className="landing-heading location-heading">
          <span>Ven a vernos</span>
          <h2>
            Estamos cerca.
            <br />
            <em>Te esperamos.</em>
          </h2>
        </div>
        <div className="location-layout">
          <div className="map-wrap">
            <iframe
              title="Mapa de Cobre Barber Club"
              src={CLUB_INFO.mapsEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <Button
              onClick={() => window.open(CLUB_INFO.mapsExternalUrl, "_blank")}
            >
              Abrir en Google Maps <Icon name="arrow" />
            </Button>
          </div>
          <div className="location-panel">
            <div className="address-block">
              <Icon name="pin" />
              <div>
                <small>Dirección</small>
                <strong>
                  {CLUB_INFO.addressLine1}
                  <br />
                  {CLUB_INFO.addressLine2}
                </strong>
                <p>{CLUB_INFO.reference}</p>
              </div>
            </div>
            <div className="hours-block">
              <h3>Horarios</h3>
              {CLUB_INFO.hours.map((entry) => {
                const isToday = entry.jsDay === todayJsDay;
                return (
                  <div className={isToday ? "today" : ""} key={entry.day}>
                    <span>
                      {entry.day}
                      {isToday && <small>Hoy</small>}
                    </span>
                    <strong>{entry.hours}</strong>
                  </div>
                );
              })}
            </div>
            <div className="useful-info">
              <div>
                <strong>Pagos</strong>
                <span>Efectivo · Tarjeta · Transferencia</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {lightboxPhoto && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
          onClick={() => setLightboxPhoto(null)}
        >
          <button
            onClick={() => setLightboxPhoto(null)}
            aria-label="Cerrar imagen ampliada"
          >
            <Icon name="close" size={24} />
          </button>
          <img
            src={lightboxPhoto}
            alt="Trabajo de Cobre Barber Club ampliado"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
