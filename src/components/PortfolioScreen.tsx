"use client";

import { useState } from "react";
import { BOOKING_ENABLED } from "@/lib/config";
import { Barber, photos } from "@/lib/data";
import { Icon } from "./Icons";
import { BookingButton, Button, Eyebrow } from "./UIPrimitives";

export function PortfolioScreen({
  barber,
  onBack,
}: {
  barber: Barber;
  onBack: () => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <main className="portfolio-page">
      <section className="portfolio-profile page-shell">
        <Button variant="ghost" className="back-link" onClick={onBack}>
          <Icon name="back" /> Volver a barberos
        </Button>
        <div className="portfolio-profile-grid">
          <div className="portfolio-portrait">
            <img src={barber.image} alt={`Retrato de ${barber.name}`} />
            <span>{barber.since}</span>
          </div>
          <div className="portfolio-copy">
            <Eyebrow>{barber.role}</Eyebrow>
            <h1>
              {barber.firstName}
              <br />
              <em>{barber.lastName}</em>
            </h1>
            <p className="intro">{barber.quote}</p>
            <p>{barber.bio}</p>
            <div className="profile-stats">
              <div>
                <strong>{barber.yearsNumber}</strong>
                <span>Años de oficio</span>
              </div>
              <div>
                <strong>{barber.rating}</strong>
                <span>{barber.reviews}</span>
              </div>
              <div>
                <strong>{barber.cutsCount}</strong>
                <span>Cortes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="gallery-section page-shell">
        <div className="section-title-row">
          <div>
            <Eyebrow>Trabajo reciente</Eyebrow>
            <h2>
              El detalle es
              <br />
              <em>la diferencia.</em>
            </h2>
          </div>
          <p>
            Una selección de looks trabajados en el club. Toca una imagen para
            verla en detalle.
          </p>
        </div>
        <div className="portfolio-grid">
          {photos.cuts.map((photo, index) => (
            <button
              key={photo}
              className="gallery-image"
              onClick={() => setLightbox(photo)}
              aria-label={`Ampliar trabajo ${index + 1}`}
            >
              <img
                src={photo}
                alt={`Corte realizado por ${barber.name}, trabajo ${index + 1}`}
              />
              <span>0{index + 1}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="sticky-book">
        <div>
          <small>{BOOKING_ENABLED ? "Reserva en línea" : "Agenda en integración"}</small>
          <strong>Con {barber.name}</strong>
        </div>
        <BookingButton
          label={`Agendar con ${barber.short}`}
          barberId={barber.agendaId}
        />
      </div>

      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada"
          onClick={() => setLightbox(null)}
        >
          <button onClick={() => setLightbox(null)} aria-label="Cerrar">
            <Icon name="close" size={24} />
          </button>
          <img
            src={lightbox}
            alt={`Trabajo de ${barber.name} ampliado`}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}
