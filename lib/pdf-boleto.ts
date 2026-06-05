import { jsPDF } from "jspdf";

export type PdfBoletoData = {
  id: string;
  pasajeroNombre: string;
  pasajeroCedula: string;
  tipoPasajero: string;
  origenTramo: string;
  destinoTramo: string;
  fecha: string;
  hora: string;
  asiento: string;
  precioBase: number;
  descuento: number;
  precioFinal: number;
  codigoQr?: string | null;
  busNumero?: string | null;
  busPlaca?: string | null;
};

export type PdfConfiguracion = {
  nombreCooperativa: string;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  telefonoSoporte?: string | null;
  emailSoporte?: string | null;
};

const DEFAULT_PRIMARY = "#1E40AF";
const DEFAULT_SECONDARY = "#2563EB";

function hexToRgb(hex?: string | null): [number, number, number] {
  const value = /^#[0-9A-Fa-f]{6}$/.test(hex || "") ? hex!.slice(1) : DEFAULT_PRIMARY.slice(1);
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
  ];
}

function formatCurrency(value: number) {
  return `$${Number(value).toFixed(2)}`;
}

function descuentoMonto(boleto: PdfBoletoData) {
  const descuento = Number(boleto.descuento);
  if (descuento > 0 && descuento <= 1) return Number(boleto.precioBase) * descuento;
  return descuento;
}

export function generarPdfBoleto(boleto: PdfBoletoData, configuracion: PdfConfiguracion): Buffer {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const [primaryR, primaryG, primaryB] = hexToRgb(configuracion.colorPrimario);
  const [secondaryR, secondaryG, secondaryB] = hexToRgb(configuracion.colorSecundario || DEFAULT_SECONDARY);
  const descuento = descuentoMonto(boleto);

  doc.setFillColor(primaryR, primaryG, primaryB);
  doc.rect(0, 0, 210, 42, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(configuracion.nombreCooperativa, 16, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Boleto electronico de viaje", 16, 28);

  doc.setTextColor(17, 24, 39);
  doc.setDrawColor(229, 231, 235);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(14, 52, 182, 180, 4, 4, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`${boleto.origenTramo} - ${boleto.destinoTramo}`, 24, 68);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(`Fecha: ${boleto.fecha}`, 24, 80);
  doc.text(`Hora: ${boleto.hora}`, 24, 88);
  doc.text(`Bus: ${boleto.busNumero || "N/D"} ${boleto.busPlaca ? `(${boleto.busPlaca})` : ""}`, 24, 96);

  doc.setDrawColor(229, 231, 235);
  doc.line(24, 108, 186, 108);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Pasajero", 24, 122);
  doc.text("Asiento", 128, 122);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(55, 65, 81);
  doc.text(boleto.pasajeroNombre, 24, 132);
  doc.text(`CI: ${boleto.pasajeroCedula}`, 24, 140);
  doc.text(`Tipo: ${boleto.tipoPasajero.replaceAll("_", " ")}`, 24, 148);

  doc.setFillColor(secondaryR, secondaryG, secondaryB);
  doc.roundedRect(128, 128, 34, 22, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(boleto.asiento, 145, 142, { align: "center" });

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.text("Detalle de pago", 24, 166);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text("Precio base", 24, 178);
  doc.text(formatCurrency(boleto.precioBase), 186, 178, { align: "right" });
  doc.text("Descuento", 24, 186);
  doc.text(`-${formatCurrency(descuento)}`, 186, 186, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Precio final", 24, 196);
  doc.text(formatCurrency(boleto.precioFinal), 186, 196, { align: "right" });

  if (boleto.codigoQr) {
    doc.addImage(boleto.codigoQr, "PNG", 76, 202, 58, 58);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text("Presenta este codigo QR al momento de subir al bus.", 105, 270, { align: "center" });
  doc.text(`Boleto: ${boleto.id}`, 105, 278, { align: "center" });

  const contacto = [configuracion.emailSoporte, configuracion.telefonoSoporte].filter(Boolean).join(" | ");
  if (contacto) {
    doc.text(contacto, 105, 286, { align: "center" });
  }

  return Buffer.from(doc.output("arraybuffer"));
}
