"use server";

import { cuentaDeSesion } from "@/lib/auth/servicio";
import { almacen, getPropuestaPublica, idSesion } from "@/lib/auth/sesion";
import { usaApi } from "@/lib/plataforma-api/cliente";
import { almacenInteracciones } from "./almacen";
import { reaccionApi, vistaApi } from "./api";
import {
  claveAporte,
  claveNoticia,
  reaccionar,
  registrarVista,
  resumenInteracciones,
  type Reaccion,
  type ResumenInteracciones,
} from "./interacciones";

/** A qué se reacciona: una noticia o un aporte ciudadano publicado. */
export type Objetivo = { tipo: "noticia"; slug: string } | { tipo: "aporte"; folio: string };

/** ¿Tiene forma de slug o de folio? Lo demás ni se consulta. */
const bienFormado = (o: Objetivo) =>
  (o?.tipo === "noticia" && typeof o.slug === "string" && /^[a-z0-9-]{1,200}$/.test(o.slug)) ||
  (o?.tipo === "aporte" && typeof o.folio === "string" && /^IRI-\d{4}-\d{4,}$/.test(o.folio));

/**
 * Clave del objetivo si es válido: un slug con forma de slug, o el folio de un aporte que está
 * publicado (los que no lo están no tienen página pública ni reacciones).
 */
async function clave(o: Objetivo): Promise<string | null> {
  if (!bienFormado(o)) return null;
  if (o.tipo === "noticia") return claveNoticia(o.slug);
  return (await getPropuestaPublica(o.folio)) ? claveAporte(o.folio) : null;
}

async function cuentaActual() {
  return cuentaDeSesion(almacen(), await idSesion());
}

/** Suma una vista: las páginas de detalle son estáticas, así que se cuenta desde el navegador. */
export async function vistaAccion(o: Objetivo): Promise<ResumenInteracciones | null> {
  // Con la API, ella sabe si está publicado (404 si no) y cuenta una vez cada 30 minutos.
  if (usaApi()) return bienFormado(o) ? vistaApi(o) : null;
  const k = await clave(o);
  if (!k) return null;
  registrarVista(almacenInteracciones(), k);
  return resumenInteracciones(almacenInteracciones(), k, (await cuentaActual())?.id);
}

export type ResultadoReaccion =
  | { estado: "OK"; resumen: ResumenInteracciones }
  | { estado: "SIN_SESION" }
  /** Nadie reacciona a su propio aporte. */
  | { estado: "PROPIO" }
  | { estado: "INVALIDA" }
  /** Hay textos legales por aceptar (R15): la página se vuelve a pintar con el modal. */
  | { estado: "TEXTOS" }
  /** Demasiadas reacciones seguidas desde la misma conexión. */
  | { estado: "LIMITE"; mensaje: string };

/**
 * «Me gusta» / «No me gusta»: exige sesión, no el perfil completo. Pulsar la reacción que ya
 * tenía la quita. `actual` es la que ve el navegador, para decir a la API si se quita.
 */
export async function reaccionarAccion(
  o: Objetivo,
  reaccion: Reaccion,
  actual: Reaccion | null = null,
): Promise<ResultadoReaccion> {
  if (reaccion !== "LIKE" && reaccion !== "DISLIKE") return { estado: "INVALIDA" };
  if (usaApi()) {
    if (!bienFormado(o)) return { estado: "INVALIDA" };
    return reaccionApi(o, reaccion, actual === "LIKE" || actual === "DISLIKE" ? actual : null);
  }
  const k = await clave(o);
  if (!k) return { estado: "INVALIDA" };
  const cuenta = await cuentaActual();
  if (!cuenta) return { estado: "SIN_SESION" };
  if (o.tipo === "aporte" && almacen().participaciones.get(o.folio)?.cuentaId === cuenta.id)
    return { estado: "PROPIO" };
  reaccionar(almacenInteracciones(), cuenta.id, k, reaccion);
  return { estado: "OK", resumen: resumenInteracciones(almacenInteracciones(), k, cuenta.id) };
}
