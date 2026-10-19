import type { Banner } from "@/lib/api/types";

/*
 * Banners del Inicio: solo los vigentes, en el orden que fija el Operador. Lógica pura para
 * probarla con Vitest; `getBanners` la aplica sobre los datos (y luego sobre la API).
 */

/** Venezuela no cambia de hora: siempre UTC−4. */
const HUSO_VENEZUELA = "-04:00";

const SOLO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

/** «AAAA-MM-DD» cuenta como el día completo en hora de Venezuela; si no, es fecha y hora ISO. */
function instante(fecha: string, borde: "inicio" | "fin") {
  if (!SOLO_FECHA.test(fecha)) return Date.parse(fecha);
  const hora = borde === "inicio" ? "00:00:00.000" : "23:59:59.999";
  return Date.parse(`${fecha}T${hora}${HUSO_VENEZUELA}`);
}

/** ¿Se muestra el banner en este momento? Ambos extremos de la vigencia están incluidos. */
export function estaVigente(b: Banner, ahora: number) {
  const { desde, hasta } = b.vigencia ?? {};
  if (desde && ahora < instante(desde, "inicio")) return false;
  if (hasta && ahora > instante(hasta, "fin")) return false;
  return true;
}

/** Los banners vigentes, de menor a mayor `orden` (a igual orden, se respeta el original). */
export function bannersVigentes(banners: Banner[], ahora: number) {
  return banners.filter((b) => estaVigente(b, ahora)).toSorted((a, b) => a.orden - b.orden);
}
