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

const fechaHora = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
  timeZone: "America/Caracas",
});

/** Marca de tiempo completa (ISO con hora), en hora de Caracas. */
export const formatearFechaHora = (iso: string) => fechaHora.format(new Date(iso));

export function formatearPeso(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toLocaleString("es-VE", { maximumFractionDigits: 1 })} MB`;
}

/** 84 → «1:24»; 3725 → «1:02:05». */
export function formatearDuracion(segundos: number) {
  const s = Math.max(0, Math.round(segundos));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = String(s % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${ss}` : `${m}:${ss}`;
}

/** Duración para lectores de pantalla: «1 minuto y 24 segundos». */
export function duracionLegible(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = Math.round(segundos % 60);
  const partes = [
    m ? plural(m, "minuto", "minutos") : "",
    s ? plural(s, "segundo", "segundos") : "",
  ];
  return partes.filter(Boolean).join(" y ") || "0 segundos";
}

export const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;
