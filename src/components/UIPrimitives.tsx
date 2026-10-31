import { ReactNode } from "react";
import {
  BOOKING_DISABLED_MESSAGE,
  BOOKING_ENABLED,
  EXTERNAL_BOOKING_URL,
} from "@/lib/config";
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
 * Permanece deshabilitado de forma elegante mientras se conecta con el otro aplicativo.
 */
export function BookingButton({
  label = "Agendar cita",
  variant = "primary",
  className = "",
  compact = false,
}: {
  label?: string;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  compact?: boolean;
}) {
  const isEnabled = BOOKING_ENABLED && Boolean(EXTERNAL_BOOKING_URL);

  return (
    <span
      className={`booking-disabled-wrap ${compact ? "is-compact" : ""}`}
      title={!isEnabled ? BOOKING_DISABLED_MESSAGE : undefined}
    >
      <button
        type="button"
        disabled={!isEnabled}
        aria-disabled={!isEnabled}
        className={`btn btn-${variant} btn-booking-cta ${className}`}
        onClick={() => {
          if (isEnabled && EXTERNAL_BOOKING_URL) {
            window.location.href = EXTERNAL_BOOKING_URL;
          }
        }}
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
