import { Resend } from 'resend'

// ─── Cliente (lazy) ───────────────────────────────────────────────────────────

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface BookingEmailData {
  clientName: string
  clientEmail: string
  date: string // 'YYYY-MM-DD'
  startTime: string // 'HH:MM'
  endTime: string // 'HH:MM'
  memberNames: string[]
}

// ─── Helpers de fecha ─────────────────────────────────────────────────────────

function formatDateES(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function scheduledDayBefore(dateStr: string): string | null {
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d - 1, 12, 0, 0))
  return isValidSchedule(dt) ? dt.toISOString() : null
}

function scheduledHourBefore(dateStr: string, startTime: string): string | null {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [h, min] = startTime.split(':').map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d, h + 2, min, 0))
  return isValidSchedule(dt) ? dt.toISOString() : null
}

function isValidSchedule(dt: Date): boolean {
  const now = Date.now()
  const minMs = now + 6 * 60 * 1000
  const maxMs = now + 13 * 24 * 60 * 60 * 1000
  return dt.getTime() > minMs && dt.getTime() < maxMs
}

// ─── Design System ────────────────────────────────────────────────────────────

const VIOLET = '#7c3aed'
const VIOLET_DARK = '#5b21b6'
const VIOLET_LIGHT = '#f5f3ff'
const VIOLET_BORDER = '#ddd6fe'
const TEXT_DARK = '#18181b'
const TEXT_MID = '#52525b'
const TEXT_LIGHT = '#a1a1aa'
const BG_PAGE = '#f4f4f5'
const BG_CARD = '#ffffff'
const BG_FOOTER = '#fafafa'
const BORDER = '#e4e4e7'

// ─── Layout base ─────────────────────────────────────────────────────────────

function layout(preheader: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>AURA</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${BG_PAGE};-webkit-font-smoothing:antialiased">

  <!-- Preheader (oculto, aparece en la preview del cliente de email) -->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_PAGE}">
    <tr>
      <td align="center" style="padding:40px 16px">

        <!-- Card wrapper -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

          <!-- ── HEADER ── -->
          <tr>
            <td style="background:linear-gradient(135deg,${VIOLET_DARK} 0%,${VIOLET} 100%);border-radius:16px 16px 0 0;padding:32px 40px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <!-- Logo mark -->
                    <div style="display:inline-block;background:rgba(255,255,255,.15);border-radius:10px;padding:8px 14px;margin-bottom:16px">
                      <span style="font-size:15px;font-weight:800;letter-spacing:3px;color:#ffffff;font-family:Georgia,serif">AURA</span>
                    </div>
                    <div style="width:32px;height:2px;background:rgba(255,255,255,.4);margin-bottom:0"></div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── BODY ── -->
          <tr>
            <td style="background:${BG_CARD};padding:40px 40px 32px">
              ${content}
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td style="background:${BG_FOOTER};border-top:1px solid ${BORDER};border-radius:0 0 16px 16px;padding:20px 40px">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center">
                    <p style="margin:0 0 4px;font-size:12px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif">
                      <strong style="color:${TEXT_MID};letter-spacing:.5px">AURA</strong> · Agencia de DJs
                    </p>
                    <p style="margin:0;font-size:11px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif">
                      Buenos Aires, Argentina
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
}

// ─── Bloques reutilizables ────────────────────────────────────────────────────

function greeting(name: string): string {
  return `<p style="margin:0 0 24px;font-size:22px;font-weight:700;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif;line-height:1.3">Hola, ${name} 👋</p>`
}

function detailsCard(data: BookingEmailData): string {
  const members = data.memberNames.join(' &amp; ')
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${VIOLET_LIGHT};border:1px solid ${VIOLET_BORDER};border-radius:12px;margin:24px 0">
    <tr>
      <td style="padding:24px">

        <!-- Fecha -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px">
          <tr>
            <td width="36" valign="top">
              <div style="width:32px;height:32px;background:${VIOLET};border-radius:8px;text-align:center;line-height:32px;font-size:15px">📅</div>
            </td>
            <td valign="top" style="padding-left:12px">
              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif;font-weight:600">Fecha</p>
              <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif;text-transform:capitalize">${formatDateES(data.date)}</p>
            </td>
          </tr>
        </table>

        <!-- Horario -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px">
          <tr>
            <td width="36" valign="top">
              <div style="width:32px;height:32px;background:${VIOLET};border-radius:8px;text-align:center;line-height:32px;font-size:15px">🕐</div>
            </td>
            <td valign="top" style="padding-left:12px">
              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif;font-weight:600">Horario</p>
              <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif">
                ${data.startTime} – ${data.endTime}
                <span style="font-weight:400;font-size:13px;color:${TEXT_MID}"> · 45 min</span>
              </p>
            </td>
          </tr>
        </table>

        <!-- Equipo -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="36" valign="top">
              <div style="width:32px;height:32px;background:${VIOLET};border-radius:8px;text-align:center;line-height:32px;font-size:15px">🎧</div>
            </td>
            <td valign="top" style="padding-left:12px">
              <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif;font-weight:600">Con</p>
              <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif">${members}</p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>`
}

function ctaButton(href: string, label: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto 0">
    <tr>
      <td style="border-radius:10px;background:linear-gradient(135deg,${VIOLET_DARK} 0%,${VIOLET} 100%)">
        <a href="${href}" target="_blank"
          style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;font-family:system-ui,-apple-system,sans-serif;letter-spacing:.3px">
          ${label} &rarr;
        </a>
      </td>
    </tr>
  </table>`
}

function divider(): string {
  return `<div style="height:1px;background:${BORDER};margin:28px 0"></div>`
}

function bodyText(text: string): string {
  return `<p style="margin:0;font-size:15px;color:${TEXT_MID};line-height:1.7;font-family:system-ui,-apple-system,sans-serif">${text}</p>`
}

function statusBadge(text: string, color: string, bg: string, border: string): string {
  return `
  <div style="display:inline-block;background:${bg};border:1px solid ${border};border-radius:100px;padding:4px 14px;margin-bottom:20px">
    <span style="font-size:12px;font-weight:700;letter-spacing:.5px;color:${color};font-family:system-ui,-apple-system,sans-serif;text-transform:uppercase">${text}</span>
  </div>`
}

// ─── Emails de reserva ────────────────────────────────────────────────────────

/** Se envía cuando el cliente hace la reserva (status: pending). */
export async function sendBookingRequestEmail(data: BookingEmailData): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const html = layout(
    `Recibimos tu solicitud de reunión con AURA — te confirmamos a la brevedad`,
    `${greeting(data.clientName)}
    ${statusBadge('Solicitud recibida', '#92400e', '#fffbeb', '#fde68a')}
    ${bodyText('Recibimos tu solicitud de reunión. Nuestro equipo la está revisando y te confirmaremos a la brevedad.')}
    ${detailsCard(data)}
    ${divider()}
    ${bodyText('¿Tenés alguna consulta? Respondé este email y te ayudamos.')}`
  )

  await resend.emails.send({
    from: FROM,
    to: data.clientEmail,
    subject: 'Recibimos tu solicitud de reunión — AURA',
    html,
  })
}

/** Se envía cuando todos los participantes aceptan (status: confirmed). */
export async function sendBookingConfirmedEmail(data: BookingEmailData): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const promises: Promise<unknown>[] = []

  // ── Confirmación inmediata ──────────────────────────────────────────────────
  promises.push(
    resend.emails.send({
      from: FROM,
      to: data.clientEmail,
      subject: '¡Tu reunión está confirmada! — AURA',
      html: layout(
        `¡Tu reunión con AURA está confirmada! Te esperamos.`,
        `${greeting(data.clientName)}
        ${statusBadge('Confirmada ✓', '#065f46', '#ecfdf5', '#6ee7b7')}
        ${bodyText('¡Excelente noticia! Tu reunión quedó confirmada. Anotá los detalles para no olvidarte.')}
        ${detailsCard(data)}
        ${divider()}
        ${bodyText('Si necesitás reprogramar o tenés alguna consulta, respondé este email y te ayudamos.')}`
      ),
    })
  )

  // ── Recordatorio día anterior (9 AM ART) ───────────────────────────────────
  const dayBefore = scheduledDayBefore(data.date)
  if (dayBefore) {
    promises.push(
      resend.emails.send({
        from: FROM,
        to: data.clientEmail,
        subject: 'Tu reunión con AURA es mañana — te esperamos',
        scheduledAt: dayBefore,
        html: layout(
          `Recordatorio: mañana tenés reunión con AURA`,
          `${greeting(data.clientName)}
          ${statusBadge('Recordatorio', VIOLET, VIOLET_LIGHT, VIOLET_BORDER)}
          ${bodyText('Solo pasamos a recordarte que mañana tenés tu reunión con nosotros.')}
          ${detailsCard(data)}
          ${divider()}
          ${bodyText('¿Necesitás reprogramar? Respondé este email con tiempo y lo coordinamos.')}`
        ),
      })
    )
  }

  // ── Recordatorio 1 hora antes ─────────────────────────────────────────────
  const hourBefore = scheduledHourBefore(data.date, data.startTime)
  if (hourBefore) {
    promises.push(
      resend.emails.send({
        from: FROM,
        to: data.clientEmail,
        subject: 'Tu reunión empieza en 1 hora — AURA',
        scheduledAt: hourBefore,
        html: layout(
          `Tu reunión con AURA empieza en 1 hora`,
          `${greeting(data.clientName)}
          ${statusBadge('En 1 hora ⏰', '#92400e', '#fffbeb', '#fde68a')}
          ${bodyText('Tu reunión está por comenzar. ¡Nos vemos en un rato!')}
          ${detailsCard(data)}`
        ),
      })
    )
  }

  await Promise.allSettled(promises)
}

// ─── Link de segunda reserva ──────────────────────────────────────────────────

export interface SecondBookingLinkEmailData {
  clientName: string
  clientEmail: string
  djNames: string[]
  link: string
}

/** Se envía al cliente cuando el coordinador habilita la segunda reserva. */
export async function sendSecondBookingLinkEmail(data: SecondBookingLinkEmailData): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const djs = data.djNames.join(' &amp; ')

  await resend.emails.send({
    from: FROM,
    to: data.clientEmail,
    subject: '¡El siguiente paso está listo! Elegí tu horario con los DJs — AURA',
    html: layout(
      `Ya podés agendar tu reunión con los DJs de AURA`,
      `${greeting(data.clientName)}
      ${bodyText('¡Fue un placer tener nuestra primera reunión! Ahora viene lo mejor: elegir el horario para conocer a los DJs de tu evento.')}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${VIOLET_LIGHT};border:1px solid ${VIOLET_BORDER};border-radius:12px;margin:24px 0">
        <tr>
          <td style="padding:20px 24px">
            <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif;font-weight:600">Tus DJs asignados</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif">🎧 ${djs}</p>
          </td>
        </tr>
      </table>

      ${bodyText('Hacé click en el botón para ver los horarios disponibles y reservar el que mejor te quede.')}
      ${ctaButton(data.link, 'Elegir fecha y horario')}
      ${divider()}
      <p style="margin:0;font-size:12px;color:${TEXT_LIGHT};text-align:center;font-family:system-ui,-apple-system,sans-serif;word-break:break-all">
        ¿El botón no funciona? Copiá este link:<br/>
        <span style="color:${VIOLET}">${data.link}</span>
      </p>`
    ),
  })
}

// ─── Rechazo ─────────────────────────────────────────────────────────────────

export async function sendBookingRejectedEmail(
  data: Pick<
    BookingEmailData,
    'clientName' | 'clientEmail' | 'date' | 'startTime' | 'endTime' | 'memberNames'
  >
): Promise<void> {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to: data.clientEmail,
    subject: 'Sobre tu solicitud de reunión — AURA',
    html: layout(
      `Información sobre tu solicitud de reunión`,
      `${greeting(data.clientName)}
      ${bodyText('Lamentablemente no pudimos confirmar tu solicitud para el siguiente horario:')}
      ${detailsCard(data as BookingEmailData)}
      ${divider()}
      ${bodyText('Por favor, intentá reservar otro horario disponible. Disculpá los inconvenientes y quedamos a disposición para cualquier consulta.')}`
    ),
  })
}

// ─── Email de invitación a miembro del equipo ─────────────────────────────────

export interface InviteMemberEmailData {
  memberName: string
  email: string
  role: string
  link: string
}

/** Se envía cuando un admin invita a un nuevo miembro al equipo. */
export async function sendInviteMemberEmail(data: InviteMemberEmailData): Promise<void> {
  const resend = getResend()
  if (!resend) return

  const roleLabel = data.role === 'aura_admin' ? 'Administrador' : 'Miembro del equipo'

  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Te invitaron a unirte al equipo de AURA`,
    html: layout(
      `Te invitaron a unirte al panel de AURA`,
      `${greeting(data.memberName)}
      ${bodyText('Fuiste invitado a unirte al panel de gestión de AURA. Con tu cuenta podrás acceder al sistema, gestionar tu disponibilidad y mucho más.')}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${VIOLET_LIGHT};border:1px solid ${VIOLET_BORDER};border-radius:12px;margin:24px 0">
        <tr>
          <td style="padding:20px 24px">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-bottom:12px">
                  <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif;font-weight:600">Tu cuenta</p>
                  <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif">${data.email}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="margin:0;font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif;font-weight:600">Rol</p>
                  <p style="margin:2px 0 0;font-size:15px;font-weight:600;color:${TEXT_DARK};font-family:system-ui,-apple-system,sans-serif">🎧 ${roleLabel}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      ${bodyText('Hacé click en el botón para crear tu contraseña y acceder al panel.')}
      ${ctaButton(data.link, 'Crear mi contraseña')}
      ${divider()}
      <p style="margin:0 0 8px;font-size:13px;color:${TEXT_LIGHT};font-family:system-ui,-apple-system,sans-serif">
        ⚠️ Este link es válido por <strong>24 horas</strong>. Si expira, pedile al administrador que te envíe una nueva invitación.
      </p>
      <p style="margin:0;font-size:12px;color:${TEXT_LIGHT};text-align:center;font-family:system-ui,-apple-system,sans-serif;word-break:break-all">
        ¿El botón no funciona? Copiá este link:<br/>
        <span style="color:${VIOLET}">${data.link}</span>
      </p>`
    ),
  })
}
