/*
 * Folios que se generan al compilar las rutas de detalle. En Netlify, un parámetro que no se
 * generó al compilar devuelve 500 (el adaptador aún no sirve el App Shell de los parámetros no
 * listados de Next 16.3+). Los folios de la API simulada son secuenciales (IRI-2026-0001…), así
 * que el rango cubre los de ejemplo y los que se creen en la demo. Con plataforma-api se revisa.
 */
export const FOLIOS_PRERENDER = Array.from(
  { length: 300 },
  (_, i) => `IRI-2026-${String(i + 1).padStart(4, "0")}`,
);
