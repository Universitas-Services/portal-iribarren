import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ErrorApi, pedirApi, type PerfilApi, type SesionApi } from "@/lib/plataforma-api/cliente";
import { cuentaDePerfil } from "@/lib/plataforma-api/mapeo";
import {
  abrirSello,
  COOKIE_API,
  DURACION_COOKIE_S,
  secretoSesion,
  sellar,
  tokensDeRespuesta,
} from "@/lib/plataforma-api/sello";
import type { Almacen } from "./servicio";

/*
 * Sesión del portal contra plataforma-api (cuando API_URL está definida). La cookie guarda los
 * tokens cifrados; Proxy los renueva antes de cada página. La cuenta se lee de la API y se copia
 * en el almacén del portal con el mismo id, así «Mi cuenta», las participaciones y los permisos
 * siguen funcionando igual. Lo que la API aún no ofrece (participaciones) sigue simulado.
 */

const opciones = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

/** Clave de la sesión en el almacén del portal para una cuenta de la API. */
const claveSesion = (usuarioId: string) => `api:${usuarioId}`;

export async function tokensDeCookie() {
  const valor = (await cookies()).get(COOKIE_API)?.value;
  return valor ? abrirSello(valor, secretoSesion()) : null;
}

/** Access token vigente, o al ingreso si no hay sesión. Para Server Actions. */
export async function tokenOIngresar(volver = "/mi-cuenta") {
  const t = await tokensDeCookie();
  if (!t || t.x <= Date.now()) redirect(`/ingresar?volver=${encodeURIComponent(volver)}`);
  return t.a;
}

/** Guarda en la cookie los tokens de un login, un refresh o un cambio de contraseña. */
export async function guardarTokens(r: SesionApi) {
  (await cookies()).set(COOKIE_API, sellar(tokensDeRespuesta(r), secretoSesion()), {
    ...opciones,
    maxAge: DURACION_COOKIE_S,
  });
}

export async function borrarTokens() {
  (await cookies()).delete(COOKIE_API);
}

function copiarEnAlmacen(alm: Almacen, perfil: PerfilApi) {
  const cuenta = cuentaDePerfil(perfil);
  alm.cuentas.set(cuenta.id, cuenta);
  alm.sesiones.set(claveSesion(cuenta.id), cuenta.id);
  return claveSesion(cuenta.id);
}

/** Una sola lectura del perfil por petición, aunque varias partes de la página lo pidan. */
const perfilDeToken = cache(async (token: string) =>
  pedirApi<PerfilApi>("/portal/me/profile", { token, portal: true }),
);

/** Sesión de la cookie: copia la cuenta de la API en el almacén y devuelve su clave. */
export async function idSesionApi(alm: Almacen) {
  const t = await tokensDeCookie();
  if (!t || t.x <= Date.now()) return undefined;
  try {
    return copiarEnAlmacen(alm, await perfilDeToken(t.a));
  } catch (e) {
    if (e instanceof ErrorApi && (e.status === 401 || e.status === 403)) return undefined;
    throw e;
  }
}

/** Tras guardar algo en la API: vuelve a leer la cuenta para que la redirección la vea al día. */
export async function sincronizarCuentaApi(alm: Almacen) {
  const t = await tokensDeCookie();
  if (!t) return undefined;
  const perfil = await pedirApi<PerfilApi>("/portal/me/profile", { token: t.a, portal: true });
  copiarEnAlmacen(alm, perfil);
  return alm.cuentas.get(perfil.id);
}
