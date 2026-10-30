import "server-only";
import { usaApi } from "@/lib/plataforma-api/cliente";
import {
  claveAporte,
  claveNoticia,
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

type Totales = { vistas: number; likes: number };

/**
 * Vistas y «Me gusta» de una tarjeta. Con plataforma-api vienen en la tarjeta (`totales`, guía
 * R12); sin ella, del almacén simulado.
 */
function metricas(clave: string, totales?: Totales) {
  if (usaApi()) return { vistas: totales?.vistas ?? 0, likes: totales?.likes ?? 0 };
  const r = resumenInteracciones(almacenInteracciones(), clave);
  return { vistas: r.vistas, likes: r.likes };
}

/** Vistas y «Me gusta» de un aporte publicado, para su tarjeta. */
export const metricasAporte = (folio: string, totales?: Totales) =>
  metricas(claveAporte(folio), totales);

/** Vistas y «Me gusta» de una noticia, para su tarjeta. */
export const metricasNoticia = (slug: string, totales?: Totales) =>
  metricas(claveNoticia(slug), totales);
