import { NextResponse, type NextRequest } from "next/server";
import { RUTAS_PRIVADAS } from "@/lib/auth/rutas-privadas";
import { usaApi } from "@/lib/plataforma-api/cliente";
import { esPrefetch, revisarCookie } from "@/lib/plataforma-api/renovacion";
import { COOKIE_API, DURACION_COOKIE_S } from "@/lib/plataforma-api/sello";

/*
 * Dos tareas antes de renderizar:
 *
 * 1. Con plataforma-api (API_URL definida), la cookie de la sesión (renovacion.ts): se cierra
 *    tras 15 minutos sin actividad; si el access token vence en menos de un minuto, se renueva
 *    con el refresh token (una sola vez aunque lleguen varias peticiones a la vez), y se anota
 *    la actividad. La cookie se reescribe en la petición (para que la página la use ya) y en la
 *    respuesta. Se hace aquí porque durante el render no se pueden escribir cookies.
 *
 * 2. Verificación optimista de las rutas privadas: sin la cookie de sesión no tiene sentido
 *    renderizar la página, así que se va directo a «Iniciar sesión» con el regreso indicado.
 *    Solo mira si la cookie existe; la validez real la comprueba cada página con getUsuario().
 *    No redirige a los invitados con cookie: una cookie vencida haría un bucle. Eso lo resuelve
 *    soloInvitados() en las páginas de ingreso y registro.
 */

/** Mismo nombre que en src/lib/auth/sesion.ts (sesión simulada). */
const COOKIE_SESION = "pdul_sesion";
const opciones = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DURACION_COOKIE_S,
};

export async function proxy(request: NextRequest) {
  const cambio = usaApi()
    ? await revisarCookie(request.cookies.get(COOKIE_API)?.value, {
        prefetch: esPrefetch(request.headers),
      })
    : undefined;
  if (cambio) {
    if (cambio.valor) request.cookies.set(COOKIE_API, cambio.valor);
    else request.cookies.delete(COOKIE_API);
  }

  const { pathname, search } = request.nextUrl;
  const privada = RUTAS_PRIVADAS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const conSesion = request.cookies.has(usaApi() ? COOKIE_API : COOKIE_SESION);

  let respuesta: NextResponse;
  if (privada && !conSesion) {
    const destino = new URL("/ingresar", request.url);
    destino.searchParams.set("volver", `${pathname}${search}`);
    if (cambio?.valor === null && cambio.motivo === "inactividad")
      destino.searchParams.set("aviso", "inactividad");
    else if (pathname.startsWith("/participa")) destino.searchParams.set("motivo", "participar");
    respuesta = NextResponse.redirect(destino);
  } else {
    respuesta = NextResponse.next({ request: { headers: request.headers } });
  }

  if (cambio?.valor) respuesta.cookies.set(COOKIE_API, cambio.valor, opciones);
  else if (cambio) respuesta.cookies.delete(COOKIE_API);
  return respuesta;
}

export const config = {
  // Todas las páginas (el encabezado muestra la sesión en cualquiera), sin archivos estáticos.
  matcher: ["/((?!_next/static|_next/image|.*\\.[a-z0-9]+$).*)"],
};
