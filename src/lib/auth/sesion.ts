import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { almacenDemo } from "./fixtures";
import {
  cuentaDeSesion,
  filtrarParticipaciones,
  participacionesDe,
  participacionPropia,
  propuestaPublica,
  propuestasPublicadas,
  type FiltroParticipaciones,
  resumenCuenta,
  vistaPerfil,
  type Almacen,
  type ResumenCuenta,
  type VistaPerfil,
} from "./servicio";

/*
 * Sesión del portal sobre la autenticación simulada. Con plataforma-api, estas funciones
 * llamarán al BFF y guardarán su token en la misma cookie httpOnly; las pantallas no cambian.
 */

const COOKIE_SESION = "pdul_sesion";
/** Cookie breve con el correo del último registro o reenvío (no viaja en la URL). */
const COOKIE_AVISO = "pdul_aviso";

const globalConAuth = globalThis as typeof globalThis & { __pdulAuth?: Almacen };
/** Un solo almacén por proceso, aunque Next recargue los módulos en desarrollo. */
export const almacen = (): Almacen => (globalConAuth.__pdulAuth ??= almacenDemo());

export const esDesarrollo = process.env.NODE_ENV !== "production";

const opciones = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: !esDesarrollo,
  path: "/",
};

/** Usuario de la sesión actual, o null. Solo datos de presentación. */
export async function getUsuario(): Promise<ResumenCuenta | null> {
  const id = (await cookies()).get(COOKIE_SESION)?.value;
  const cuenta = cuentaDeSesion(almacen(), id);
  return cuenta ? resumenCuenta(cuenta) : null;
}

/** Todo lo que muestra «Mi cuenta», o null sin sesión. */
export async function getPerfil(): Promise<VistaPerfil | null> {
  const id = (await cookies()).get(COOKIE_SESION)?.value;
  const cuenta = cuentaDeSesion(almacen(), id);
  return cuenta ? vistaPerfil(cuenta) : null;
}

/** Una participación de la cuenta en sesión (nunca la de otra persona). */
export async function getParticipacion(folio: string) {
  const id = (await cookies()).get(COOKIE_SESION)?.value;
  return participacionPropia(almacen(), id, folio);
}

/** Participaciones de la cuenta en sesión, filtradas (null sin sesión). */
export async function getMisParticipaciones(filtros: FiltroParticipaciones) {
  const id = (await cookies()).get(COOKIE_SESION)?.value;
  if (!cuentaDeSesion(almacen(), id)) return null;
  const todas = participacionesDe(almacen(), id);
  return { total: todas.length, items: filtrarParticipaciones(todas, filtros) };
}

/*
 * Galería pública. Sale del almacén en memoria, que cambia en cada envío: se lee al pedir la
 * página (connection). Con plataforma-api pasa a «use cache» con revalidación por etiqueta.
 */
export async function getPropuestasPublicadas(filtros: FiltroParticipaciones) {
  await connection();
  return propuestasPublicadas(almacen(), filtros);
}

export async function getPropuestaPublica(folio: string) {
  await connection();
  return propuestaPublica(almacen(), folio);
}

export async function idSesion() {
  return (await cookies()).get(COOKIE_SESION)?.value;
}

/**
 * Páginas de invitado (ingreso, registro, recuperación): con la sesión abierta no se muestran y
 * llevan a la cuenta. En el render, `redirect()` reemplaza la entrada del historial.
 */
export async function soloInvitados(destino = "/mi-cuenta") {
  if (!(await getUsuario())) return;
  const seguro = destino.startsWith("/") && !destino.startsWith("//") ? destino : "/mi-cuenta";
  redirect(seguro);
}

/** Solo en Server Actions: Next no permite escribir cookies durante el render. */
export async function abrirSesion(sesion: string) {
  (await cookies()).set(COOKIE_SESION, sesion, { ...opciones, maxAge: 60 * 60 * 8 });
}

export async function borrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
}

export type Aviso = { correo: string; enlaceDesarrollo?: string };

export async function guardarAviso(aviso: Aviso) {
  (await cookies()).set(COOKIE_AVISO, JSON.stringify(aviso), { ...opciones, maxAge: 60 * 30 });
}

export async function leerAviso(): Promise<Aviso | null> {
  const valor = (await cookies()).get(COOKIE_AVISO)?.value;
  if (!valor) return null;
  try {
    const a = JSON.parse(valor) as Aviso;
    return typeof a.correo === "string" ? a : null;
  } catch {
    return null;
  }
}
