# Cobre Barber Club — Landing Page & Portal de Clientes

Aplicación web editorial en **Next.js (App Router) + TypeScript** diseñada con estética cálida de lujo (*Cobre Barber Club*), portal de clientes con Google / Invitado, historial calificable y control de plazos para cambio de teléfono.

## Funcionalidades principales

1. **Landing Page Editorial Completa**:
   - Hero con estado dinámico de horario según el día actual, historia de *La Casa*, equipo de barberos con **portafolios individuales interactivos**, catálogo de servicios, galería mosaico con *lightbox*, reseñas verificadas y ubicación con mapa integrado.
   - **Botones de Agendar deshabilitados intencionalmente**: todos los botones de reserva (`Agendar cita`, `Agendar con barbero`, `Agendar servicio`, `Repetir look`) muestran estado bloqueado (`Próximamente`) listos para conectarse con tu otro aplicativo.
2. **Inicio de sesión mejorado (Google + Invitado)**:
   - **Cuenta con Google**: incluye rutas listas para Google OAuth 2.0 real (`/api/auth/google` y `/api/auth/google/callback` con cookie firmada HMAC) y selector interactivo de demostración **solo en desarrollo** cuando aún no se configuran credenciales en `.env.local` (en producción sin credenciales, el acceso con Google queda deshabilitado).
   - **Modo Invitado**: consulta con el código de la cita **y** el teléfono de la reservación (ej. `CB-8492` + `+52 55 4821 0934`), con bloqueo de 5 minutos tras 5 intentos fallidos, para consultar citas programadas sin cuenta, reservando historial completo, calificaciones y perfil para cuentas vinculadas con Google.
3. **Citas programadas**:
   - Detalle de fecha, hora, barbero asignado, desglose de servicio/extras, ubicación y enlace directo a WhatsApp.
4. **Historial de citas y calificaciones**:
   - Filtros (`Todas`, `Por calificar`, `Calificadas`), indicadores resumen, notas técnicas del barbero y modal interactivo de calificación (1 a 5 estrellas, etiquetas destacables y reseña escrita).
5. **Perfil de cliente y cambio de teléfono con plazo de 30 días**:
   - Edición de nombre y preferencias de corte/notificaciones.
   - Módulo de seguridad telefónica con validación por país, paso obligatorio de confirmación, bloqueo automático de **30 días naturales** tras cada modificación, barra de progreso, fecha exacta de habilitación e historial de auditoría.

## Ejecución local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Conexión futura con el aplicativo de reservas y Google OAuth

Copia `.env.example` a `.env.local`:

```env
# Habilitar botones de agendar cuando tu otro aplicativo esté listo
NEXT_PUBLIC_BOOKING_ENABLED=true
NEXT_PUBLIC_EXTERNAL_BOOKING_URL=https://tu-aplicativo-reservas.com

# Credenciales reales de Google Cloud Console (OAuth 2.0)
# Redirect URI autorizada: http://localhost:3000/api/auth/google/callback
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
AUTH_SECRET=...   # mínimo 32 caracteres; genera uno con: openssl rand -base64 48
```
