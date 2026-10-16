/** Formatos de presentación compartidos (fechas, pesos de archivo, plurales). */

const fechaCorta = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Caracas",
});

const fechaLarga = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "America/Caracas",
});

/** Las fechas llegan como AAAA-MM-DD; se fijan al mediodía de Caracas para no correr de día. */
const aFecha = (iso: string) => new Date(`${iso}T12:00:00-04:00`);

export const formatearFecha = (iso: string) => fechaCorta.format(aFecha(iso));
export const formatearFechaLarga = (iso: string) => fechaLarga.format(aFecha(iso));

export function formatearPeso(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toLocaleString("es-VE", { maximumFractionDigits: 1 })} MB`;
}

export const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
