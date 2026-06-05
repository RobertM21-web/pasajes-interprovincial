import nodemailer from "nodemailer";

type EmailBoletoData = {
  pasajeroNombre: string;
  origenTramo: string;
  destinoTramo: string;
  fecha: string;
  hora: string;
  asiento: string;
  precioFinal: number;
};

type ContactoCooperativa = {
  emailSoporte?: string | null;
  telefonoSoporte?: string | null;
  direccion?: string | null;
};

type BoletoAttachment = {
  filename: string;
  content: Buffer;
};

const DEFAULT_PRIMARY = "#1E40AF";
const DEFAULT_SECONDARY = "#2563EB";

export function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number.parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Configuracion SMTP incompleta. Revisa SMTP_HOST, SMTP_USER y SMTP_PASSWORD.");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isHexColor(value?: string | null) {
  return Boolean(value && /^#[0-9A-Fa-f]{6}$/.test(value));
}

function renderBoletosEmail({
  nombreCooperativa,
  colorPrimario,
  colorSecundario,
  boletos,
  contacto,
}: {
  nombreCooperativa: string;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  boletos: EmailBoletoData[];
  contacto?: ContactoCooperativa;
}) {
  const primaryColor = isHexColor(colorPrimario) ? colorPrimario! : DEFAULT_PRIMARY;
  const secondaryColor = isHexColor(colorSecundario) ? colorSecundario! : DEFAULT_SECONDARY;
  const primerBoleto = boletos[0];
  const pasajeroSaludo = primerBoleto?.pasajeroNombre || "pasajero";
  const trayecto = `${primerBoleto?.origenTramo || ""} - ${primerBoleto?.destinoTramo || ""}`;
  const fechaHora = `${primerBoleto?.fecha || ""} ${primerBoleto?.hora ? `a las ${primerBoleto.hora}` : ""}`.trim();

  const rows = boletos
    .map(
      (boleto) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; font-weight: 600;">
            ${escapeHtml(boleto.pasajeroNombre)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: center;">
            ${escapeHtml(boleto.asiento)}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #111827; text-align: right; font-weight: 700;">
            $${Number(boleto.precioFinal).toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  const contactoItems = [
    contacto?.emailSoporte ? `Correo: ${escapeHtml(contacto.emailSoporte)}` : null,
    contacto?.telefonoSoporte ? `Telefono: ${escapeHtml(contacto.telefonoSoporte)}` : null,
    contacto?.direccion ? `Direccion: ${escapeHtml(contacto.direccion)}` : null,
  ].filter(Boolean);

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Tus boletos - ${escapeHtml(nombreCooperativa)}</title>
    </head>
    <body style="margin:0; padding:0; background:#f3f4f6; font-family:Arial, Helvetica, sans-serif; color:#111827;">
      <div style="padding:32px 16px;">
        <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden;">
          <div style="background:${primaryColor}; padding:28px 24px; color:#ffffff;">
            <p style="margin:0 0 6px; font-size:12px; letter-spacing:.08em; text-transform:uppercase; opacity:.9;">Compra confirmada</p>
            <h1 style="margin:0; font-size:24px; line-height:1.2;">${escapeHtml(nombreCooperativa)}</h1>
          </div>
          <div style="padding:28px 24px;">
            <h2 style="margin:0 0 12px; font-size:20px; color:#111827;">Hola, ${escapeHtml(pasajeroSaludo)}</h2>
            <p style="margin:0 0 22px; font-size:15px; line-height:1.6; color:#374151;">
              Tus boletos estan listos. Adjuntamos los PDF correspondientes para el viaje
              <strong>${escapeHtml(trayecto)}</strong>${fechaHora ? `, programado para <strong>${escapeHtml(fechaHora)}</strong>` : ""}.
            </p>
            <div style="border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; margin-bottom:22px;">
              <div style="background:#f9fafb; padding:14px 16px; border-bottom:1px solid #e5e7eb;">
                <strong style="font-size:14px; color:#111827;">Resumen del viaje</strong>
              </div>
              <table style="width:100%; border-collapse:collapse; font-size:14px;">
                <thead>
                  <tr>
                    <th style="padding:10px 12px; text-align:left; color:#6b7280; border-bottom:1px solid #e5e7eb;">Pasajero</th>
                    <th style="padding:10px 12px; text-align:center; color:#6b7280; border-bottom:1px solid #e5e7eb;">Asiento</th>
                    <th style="padding:10px 12px; text-align:right; color:#6b7280; border-bottom:1px solid #e5e7eb;">Total</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
            <div style="border-left:4px solid ${secondaryColor}; background:#f9fafb; padding:16px; border-radius:10px;">
              <p style="margin:0 0 6px; font-weight:700; color:#111827;">Instrucciones de abordaje</p>
              <p style="margin:0; font-size:14px; line-height:1.6; color:#374151;">
                Presenta tu codigo QR al momento de subir al bus. Puedes mostrarlo impreso o desde tu dispositivo movil.
              </p>
            </div>
          </div>
          <div style="background:#f9fafb; padding:20px 24px; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280;">
            <p style="margin:0 0 6px; font-weight:700; color:#374151;">${escapeHtml(nombreCooperativa)}</p>
            <p style="margin:0; line-height:1.5;">${contactoItems.length ? contactoItems.join(" | ") : "Gracias por viajar con nosotros."}</p>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

export async function enviarBoletosPorEmail({
  emailDestino,
  nombreCooperativa,
  colorPrimario,
  colorSecundario,
  boletos,
  attachments,
  contacto,
}: {
  emailDestino: string;
  nombreCooperativa: string;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  boletos: EmailBoletoData[];
  attachments: BoletoAttachment[];
  contacto?: ContactoCooperativa;
}) {
  if (!boletos.length) {
    throw new Error("No hay boletos para enviar.");
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"${nombreCooperativa}" <${process.env.SMTP_USER}>`,
    to: emailDestino,
    subject: `Tus boletos - ${nombreCooperativa}`,
    html: renderBoletosEmail({
      nombreCooperativa,
      colorPrimario,
      colorSecundario,
      boletos,
      contacto,
    }),
    attachments,
  });
}
