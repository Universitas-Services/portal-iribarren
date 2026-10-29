/*
 * Folios que se generan al compilar las rutas de detalle. En Netlify, un parámetro que no se
 * generó al compilar devuelve 500 (el adaptador aún no sirve el App Shell de los parámetros no
 * listados de Next 16.3+). Los folios son secuenciales por año (IRI-2026-0001…, también en
 * plataforma-api): el rango cubre los de ejemplo y los primeros reales de 2026 y 2027. Si la
 * alcaldía se acerca al tope, se amplía aquí.
 */
const folios = (anio: number, cuantos: number) =>
  Array.from({ length: cuantos }, (_, i) => `IRI-${anio}-${String(i + 1).padStart(4, "0")}`);

export const FOLIOS_PRERENDER = [...folios(2026, 600), ...folios(2027, 300)];
