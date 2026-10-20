"use server";

import { coordenadasDeEnlace, esEnlaceCorto, esEnlaceMaps, type Ubicacion } from "./ubicacion";

export type ResultadoEnlace = { ok: true; ubicacion: Ubicacion } | { ok: false; mensaje: string };

const NO_LEIDO =
  "No encontramos coordenadas en ese enlace. En Google Maps, toca el punto, luego «Compartir» y copia el enlace.";

/**
 * Convierte un enlace de Google Maps en coordenadas. Los largos se leen directo; los cortos
 * (maps.app.goo.gl) se resuelven siguiendo sus redirecciones, solo hacia dominios de Google
 * Maps (evita usar el servidor para visitar sitios arbitrarios), con un máximo de 3 saltos.
 */
export async function resolverEnlaceMapaAccion(texto: string): Promise<ResultadoEnlace> {
  const inicial = esEnlaceMaps(String(texto).slice(0, 2000));
  if (!inicial) return { ok: false, mensaje: "Pega un enlace de Google Maps." };

  let url = inicial;
  for (let salto = 0; salto < 4; salto++) {
    const punto = coordenadasDeEnlace(url.href);
    if (punto) return { ok: true, ubicacion: punto };
    // Solo los enlaces cortos se siguen; uno largo sin coordenadas no tiene más que leer.
    if (!esEnlaceCorto(url) || salto === 3) break;
    let destino: string | null;
    try {
      const r = await fetch(url.href, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(5000),
        headers: { "User-Agent": "PDUL-YA/1.0 (portal de participacion ciudadana)" },
      });
      destino = r.headers.get("location");
    } catch {
      return {
        ok: false,
        mensaje: "No pudimos abrir el enlace. Intenta de nuevo o marca el punto en el mapa.",
      };
    }
    if (!destino) break;
    const siguiente = esEnlaceMaps(new URL(destino, url).href);
    // La página de consentimiento de Google trae el enlace real en «continue».
    const consentimiento = new URL(destino, url);
    const real =
      siguiente ??
      (consentimiento.hostname.startsWith("consent.google.")
        ? esEnlaceMaps(consentimiento.searchParams.get("continue") ?? "")
        : null);
    if (!real) break;
    url = real;
  }
  return { ok: false, mensaje: NO_LEIDO };
}
