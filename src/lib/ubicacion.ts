/*
 * Ubicación de un aporte: un punto (latitud, longitud) dentro del Municipio Iribarren. Se marca
 * en el mapa (Leaflet + OpenStreetMap) o se pega un enlace de Google Maps. Funciones puras: se
 * prueban con Vitest y se usan en el cliente y en el servidor.
 */

export type Ubicacion = { lat: number; lng: number };

/**
 * Rectángulo aproximado y generoso que contiene el Municipio Iribarren (Barquisimeto y sus
 * parroquias). No es el límite oficial: solo descarta puntos claramente fuera del municipio.
 */
export const LIMITES_IRIBARREN = { sur: 9.8, norte: 10.4, oeste: -69.8, este: -69.0 } as const;

/** Centro del mapa: el casco central de Barquisimeto. */
export const CENTRO_BARQUISIMETO: Ubicacion = { lat: 10.0678, lng: -69.3467 };

export const dentroDeIribarren = ({ lat, lng }: Ubicacion) =>
  lat >= LIMITES_IRIBARREN.sur &&
  lat <= LIMITES_IRIBARREN.norte &&
  lng >= LIMITES_IRIBARREN.oeste &&
  lng <= LIMITES_IRIBARREN.este;

/** Enlace de Google Maps para un punto (lo que pide el cliente para el equipo de la alcaldía). */
export const enlaceGoogleMaps = ({ lat, lng }: Ubicacion) =>
  `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

export const formatoCoordenadas = ({ lat, lng }: Ubicacion) =>
  `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

const valido = (lat: number, lng: number): Ubicacion | null =>
  Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180
    ? { lat, lng }
    : null;

/** «10.06,-69.34», «10.06, -69.34» o «10.06,+-69.34» → punto. */
function parDeTexto(texto: string | null | undefined): Ubicacion | null {
  if (!texto) return null;
  const m = texto.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*,\s*\+?(-?\d{1,3}(?:\.\d+)?)\s*$/);
  return m ? valido(Number(m[1]), Number(m[2])) : null;
}

/** ¿Es un enlace de Google Maps (incluidos los cortos que hay que resolver en el servidor)? */
export function esEnlaceMaps(texto: string): URL | null {
  let url: URL;
  try {
    url = new URL(texto.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const h = url.hostname.toLowerCase();
  const google = /^(www\.)?google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(h);
  if (h === "maps.app.goo.gl") return url;
  if (h === "goo.gl" && url.pathname.startsWith("/maps")) return url;
  if (/^maps\.google\.[a-z]{2,3}(\.[a-z]{2})?$/.test(h)) return url;
  if (google && url.pathname.startsWith("/maps")) return url;
  return null;
}

/** Los enlaces cortos no traen coordenadas: hay que seguir su redirección en el servidor. */
export const esEnlaceCorto = (url: URL) =>
  url.hostname === "maps.app.goo.gl" || url.hostname === "goo.gl";

/**
 * Coordenadas de un enlace largo de Google Maps. Prioriza el lugar marcado (`!3d…!4d…`), luego
 * los parámetros de búsqueda (`q`, `query`, `ll`, `destination`, `center`) y por último el centro
 * de la vista (`@lat,lng`).
 */
export function coordenadasDeEnlace(texto: string): Ubicacion | null {
  const url = esEnlaceMaps(texto);
  if (!url) return null;
  const completo = decodeURIComponent(url.href);

  const lugar = completo.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (lugar) return valido(Number(lugar[1]), Number(lugar[2]));

  for (const p of ["q", "query", "ll", "destination", "center"]) {
    const punto = parDeTexto(url.searchParams.get(p));
    if (punto) return punto;
  }

  const ruta = decodeURIComponent(url.pathname).match(
    /\/(?:place|search|dir)\/(?:[^/]*\/)?(-?\d{1,2}\.\d+)\s*,\s*\+?(-?\d{1,3}\.\d+)/,
  );
  if (ruta) return valido(Number(ruta[1]), Number(ruta[2]));

  const vista = completo.match(/@(-?\d{1,2}\.\d+),(-?\d{1,3}\.\d+)/);
  if (vista) return valido(Number(vista[1]), Number(vista[2]));
  return null;
}
