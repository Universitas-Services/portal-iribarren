import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { usaApi } from "@/lib/plataforma-api/cliente";
import { almacenDemo } from "./fixtures";
import {
  galeriaApi,
  miParticipacionApi,
  misParticipacionesApi,
  propuestaPublicaApi,
  type PaginaGaleria,
} from "./participaciones-api";
import { borrarTokens, idSesionApi } from "./sesion-api";
import { DURACION_SESION_MS, firmarSesion, leerSesion } from "./token-sesion";
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
  type Cuenta,
  type ResumenCuenta,
  type VistaPerfil,
} from "./servicio";

/*
 * Sesión del portal. Con API_URL definida, la cuenta y sus tokens vienen de plataforma-api
 * (sesion-api.ts); sin ella, de la autenticación simulada. Las pantallas no cambian.
 */

const COOKIE_SESION = "pdul_sesion";
/** Cookie breve con el correo del último registro o reenvío (no viaja en la URL). */
const COOKIE_AVISO = "pdul_aviso";

const globalConAuth = globalThis as typeof globalThis & { __pdulAuth?: Almacen };
/** Un solo almacén por proceso, aunque Next recargue los módulos en desarrollo. */
export const almacen = (): Almacen => (globalConAuth.__pdulAuth ??= almacenDemo());

export const esDesarrollo = process.env.NODE_ENV !== "production";

/**
 * Despliegue de demostración (DEMO=1 en Netlify): el registro entra directo sin el paso del
 * correo, los enlaces que llegarían por correo se muestran en pantalla y aparece la cinta
 * «Entorno de demostración». En desarrollo no se activa, para que las E2E recorran el flujo real.
 */
// Con plataforma-api los datos son reales: nunca es demostración, aunque quede DEMO=1.
export const esDemo = process.env.DEMO === "1" && !usaApi();

/** Secreto de la firma de sesión. En Netlify: variable SESION_SECRETO. */
function secreto() {
  const s = process.env.SESION_SECRETO;
  if (s) return s;
  if (!esDesarrollo && !avisado) {
    avisado = true;
    console.warn("SESION_SECRETO no está definido: se usa un secreto de demostración.");
  }
  return "pdul-portal-demo-secreto-no-usar-en-produccion";
}
let avisado = false;

/** La cuenta sin la contraseña: viaja firmada en la cookie de sesión. */
function instantanea(c: Cuenta) {
  const { hash: _hash, ...resto } = c;
  return resto;
}

const opciones = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: !esDesarrollo,
  path: "/",
};

/** Usuario de la sesión actual, o null. Solo datos de presentación. */
export async function getUsuario(): Promise<ResumenCuenta | null> {
  const cuenta = cuentaDeSesion(almacen(), await idSesion());
  return cuenta ? resumenCuenta(cuenta) : null;
}

/** Todo lo que muestra «Mi cuenta», o null sin sesión. */
export async function getPerfil(): Promise<VistaPerfil | null> {
  const cuenta = cuentaDeSesion(almacen(), await idSesion());
  return cuenta ? vistaPerfil(cuenta) : null;
}

/** Una participación de la cuenta en sesión (nunca la de otra persona). */
export async function getParticipacion(folio: string) {
  const id = await idSesion();
  if (usaApi()) {
    const c = cuentaDeSesion(almacen(), id);
    return c ? miParticipacionApi(folio, c.id) : undefined;
  }
  return participacionPropia(almacen(), id, folio);
}

/** Participaciones de la cuenta en sesión, filtradas (null sin sesión). */
export async function getMisParticipaciones(filtros: FiltroParticipaciones) {
  const id = await idSesion();
  const c = cuentaDeSesion(almacen(), id);
  if (!c) return null;
  if (usaApi()) return misParticipacionesApi(filtros, c.id);
  const todas = participacionesDe(almacen(), id);
  return { total: todas.length, items: filtrarParticipaciones(todas, filtros) };
}

/** Aportes por página de la galería pública (igual que la API). */
export const POR_PAGINA_GALERIA = 12;

/*
 * Galería pública, por páginas. Con plataforma-api, GET /portal/participations (cacheada unos
 * minutos). Sin ella sale del almacén en memoria, que cambia en cada envío: se lee al pedir la
 * página (connection).
 */
export async function getPropuestasPublicadas(
  filtros: FiltroParticipaciones,
  pagina = 1,
  limite = POR_PAGINA_GALERIA,
): Promise<PaginaGaleria> {
  if (usaApi()) return galeriaApi(filtros, pagina, limite);
  await connection();
  const todas = propuestasPublicadas(almacen(), filtros);
  const paginas = Math.max(1, Math.ceil(todas.length / limite));
  const actual = Math.min(Math.max(1, pagina), paginas);
  return {
    items: todas.slice((actual - 1) * limite, actual * limite),
    total: todas.length,
    pagina: actual,
    paginas,
  };
}

export async function getPropuestaPublica(folio: string) {
  if (usaApi()) return propuestaPublicaApi(folio);
  await connection();
  return propuestaPublica(almacen(), folio);
}

/**
 * Sesión de la cookie, válida en cualquier instancia: en Netlify cada petición puede caer en otra
 * función que no comparte memoria. Si la firma es buena, no venció y no fue revocada, la cuenta
 * se recrea desde la instantánea (si esta instancia no la tiene o tiene una versión más vieja)
 * y la sesión se registra aquí; el servicio la usa como siempre.
 */
export async function idSesion() {
  if (usaApi()) {
    // Lee la cookie y compara su vencimiento con la hora actual: siempre al pedir la página.
    await connection();
    return idSesionApi(almacen());
  }
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token) return undefined;
  // El vencimiento se compara con la hora actual: se calcula siempre al pedir la página.
  await connection();
  const alm = almacen();
  const datos = leerSesion(token, secreto());
  if (!datos) {
    alm.sesiones.delete(token);
    return undefined;
  }
  let cuenta = alm.cuentas.get(datos.u);
  const copia = datos.c as Omit<Cuenta, "hash"> | undefined;
  if (copia && copia.id === datos.u && (copia.actualizadaEl ?? 0) > (cuenta?.actualizadaEl ?? -1)) {
    cuenta = { ...structuredClone(copia), hash: cuenta?.hash ?? "" };
    alm.cuentas.set(cuenta.id, cuenta);
  }
  if (!cuenta || datos.e < (cuenta.sesionesDesde ?? 0)) {
    alm.sesiones.delete(token);
    return undefined;
  }
  if (!alm.sesiones.has(token)) alm.sesiones.set(token, cuenta.id);
  return token;
}

async function escribirToken(idAnterior: string) {
  const alm = almacen();
  const cuenta = alm.cuentas.get(alm.sesiones.get(idAnterior) ?? "");
  if (!cuenta) return;
  cuenta.actualizadaEl = Date.now();
  const token = firmarSesion({ cuentaId: cuenta.id, instantanea: instantanea(cuenta) }, secreto());
  alm.sesiones.delete(idAnterior);
  alm.sesiones.set(token, cuenta.id);
  (await cookies()).set(COOKIE_SESION, token, {
    ...opciones,
    maxAge: DURACION_SESION_MS / 1000,
  });
}

/**
 * Vuelve a firmar la sesión con la cuenta actualizada: tras guardar el perfil, subir un
 * documento, unirse o cambiar la contraseña. Solo en Server Actions.
 */
export async function refrescarSesion(actual?: string) {
  // Con la API la cuenta se lee en cada petición: no hay instantánea que actualizar.
  if (usaApi()) return;
  const id = actual ?? (await idSesion());
  if (id) await escribirToken(id);
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
  await escribirToken(sesion);
}

export async function borrarSesion() {
  (await cookies()).delete(COOKIE_SESION);
  await borrarTokens();
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
