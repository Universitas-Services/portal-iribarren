import "server-only";
import {
  claveAporte,
  crearAlmacenInteracciones,
  resumenInteracciones,
  type AlmacenInteracciones,
} from "./interacciones";

const globalConInteracciones = globalThis as typeof globalThis & {
  __pdulInteracciones?: AlmacenInteracciones;
};

/** Un solo almacén por proceso, aunque Next recargue los módulos en desarrollo. */
export const almacenInteracciones = (): AlmacenInteracciones =>
  (globalConInteracciones.__pdulInteracciones ??= crearAlmacenInteracciones());

/** Vistas y «Me gusta» de un aporte publicado, para su tarjeta. */
export function metricasAporte(folio: string) {
  const r = resumenInteracciones(almacenInteracciones(), claveAporte(folio));
  return { vistas: r.vistas, likes: r.likes };
}
