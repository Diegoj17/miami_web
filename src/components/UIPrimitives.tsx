import { ReactNode } from "react";
import { BOOKING_DISABLED_MESSAGE, buildBookingUrl } from "@/lib/config";
import { Icon } from "./Icons";

export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
  disabled = false,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      title={title}
      className={`btn btn-${variant} ${className}`}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
}

/**
 * Botón de agendamiento centralizado.
 * Con la agenda configurada (miami_agenda) es un enlace al flujo de reserva;
 * si no, permanece deshabilitado de forma elegante.
 */
export function BookingButton({
  label = "Agendar cita",
  variant = "primary",
  className = "",
  compact = false,
  serviceId,
  barberId,
}: {
  label?: string;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  compact?: boolean;
  /** ID del servicio en la agenda, para llegar con el servicio preseleccionado. */
  serviceId?: string;
  /** ID del barbero en la agenda, para llegar con el barbero preseleccionado. */
  barberId?: string;
}) {
  const href = buildBookingUrl({ serviceId, barberId });

  if (href) {
    return (
      <span className={`booking-disabled-wrap ${compact ? "is-compact" : ""}`}>
        <a
          href={href}
          rel="noopener noreferrer"
          referrerPolicy="no-referrer"
          className={`btn btn-${variant} btn-booking-cta ${className}`}
        >
          <Icon name="calendar" size={14} />
          <span>{label}</span>
        </a>
      </span>
    );
  }

  return (
    <span
      className={`booking-disabled-wrap ${compact ? "is-compact" : ""}`}
      title={BOOKING_DISABLED_MESSAGE}
    >
      <button
        type="button"
        disabled
        aria-disabled
        className={`btn btn-${variant} btn-booking-cta ${className}`}
      >
        <Icon name="lock" size={14} />
        <span>{label}</span>
        {!compact && <em className="booking-pill">Próximamente</em>}
      </button>
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="eyebrow">
      <span />
      {children}
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  copy,
}: {
  eyebrow: string;
  title: ReactNode;
  copy: string;
}) {
  return (
    <div className="section-heading">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
  );
}
