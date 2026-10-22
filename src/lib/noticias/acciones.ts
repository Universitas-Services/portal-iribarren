"use server";

import { cuentaDeSesion } from "@/lib/auth/servicio";
import { almacen, idSesion } from "@/lib/auth/sesion";
import { almacenInteracciones } from "./almacen-interacciones";
import {
  reaccionar,
  registrarVista,
  resumenInteracciones,
  type Reaccion,
  type ResumenInteracciones,
} from "./interacciones";

const slugValido = (slug: unknown): slug is string =>
  typeof slug === "string" && /^[a-z0-9-]{1,200}$/.test(slug);

async function cuentaId() {
  return cuentaDeSesion(almacen(), await idSesion())?.id;
}

/** Suma una vista (la noticia es estática: la vista se cuenta desde el navegador al abrirla). */
export async function vistaAccion(slug: string): Promise<ResumenInteracciones | null> {
  if (!slugValido(slug)) return null;
  registrarVista(almacenInteracciones(), slug);
  return resumenInteracciones(almacenInteracciones(), slug, await cuentaId());
}

export type ResultadoReaccion =
  | { estado: "OK"; resumen: ResumenInteracciones }
  | { estado: "SIN_SESION" }
  | { estado: "INVALIDA" };

/** «Me gusta» / «No me gusta»: exige sesión, no el perfil completo. */
export async function reaccionarAccion(
  slug: string,
  reaccion: Reaccion,
): Promise<ResultadoReaccion> {
  if (!slugValido(slug) || (reaccion !== "LIKE" && reaccion !== "DISLIKE"))
    return { estado: "INVALIDA" };
  const id = await cuentaId();
  if (!id) return { estado: "SIN_SESION" };
  reaccionar(almacenInteracciones(), id, slug, reaccion);
  return { estado: "OK", resumen: resumenInteracciones(almacenInteracciones(), slug, id) };
}
