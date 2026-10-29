"use server";

import { cuentaDeSesion } from "@/lib/auth/servicio";
import { almacen, getPropuestaPublica, idSesion } from "@/lib/auth/sesion";
import { usaApi } from "@/lib/plataforma-api/cliente";
import { almacenInteracciones } from "./almacen";
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

/**
 * Clave del objetivo si es válido: un slug con forma de slug, o el folio de un aporte que está
 * publicado (los que no lo están no tienen página pública ni reacciones).
 */
async function clave(o: Objetivo): Promise<string | null> {
  if (o?.tipo === "noticia" && typeof o.slug === "string" && /^[a-z0-9-]{1,200}$/.test(o.slug))
    return claveNoticia(o.slug);
  if (
    o?.tipo === "aporte" &&
    typeof o.folio === "string" &&
    /^IRI-\d{4}-\d{4,}$/.test(o.folio) &&
    (await getPropuestaPublica(o.folio))
  )
    return claveAporte(o.folio);
  return null;
}

async function cuentaActual() {
  return cuentaDeSesion(almacen(), await idSesion());
}

/** Suma una vista: las páginas de detalle son estáticas, así que se cuenta desde el navegador. */
export async function vistaAccion(o: Objetivo): Promise<ResumenInteracciones | null> {
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
  | { estado: "INVALIDA" };

/** «Me gusta» / «No me gusta»: exige sesión, no el perfil completo. */
export async function reaccionarAccion(
  o: Objetivo,
  reaccion: Reaccion,
): Promise<ResultadoReaccion> {
  const k = await clave(o);
  if (!k || (reaccion !== "LIKE" && reaccion !== "DISLIKE")) return { estado: "INVALIDA" };
  const cuenta = await cuentaActual();
  if (!cuenta) return { estado: "SIN_SESION" };
  // Con la API la galería no dice quién es el autor: lo comprobará la API en R12.
  if (
    !usaApi() &&
    o.tipo === "aporte" &&
    almacen().participaciones.get(o.folio)?.cuentaId === cuenta.id
  )
    return { estado: "PROPIO" };
  reaccionar(almacenInteracciones(), cuenta.id, k, reaccion);
  return { estado: "OK", resumen: resumenInteracciones(almacenInteracciones(), k, cuenta.id) };
}
