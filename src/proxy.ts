import { NextResponse, type NextRequest } from "next/server";
import { ErrorApi, refrescarTokens, usaApi } from "@/lib/plataforma-api/cliente";
import {
  abrirSello,
  COOKIE_API,
  DURACION_COOKIE_S,
  secretoSesion,
  sellar,
  tokensDeRespuesta,
} from "@/lib/plataforma-api/sello";

/*
 * Dos tareas antes de renderizar:
 *
 * 1. Con plataforma-api (API_URL definida): si el access token vence en menos de un minuto, lo
 *    renueva con el refresh token y reescribe la cookie, en la petición (para que la página lo
 *    use ya) y en la respuesta. Se hace aquí porque durante el render no se pueden escribir
 *    cookies, y el refresh token rota: usarlo sin guardar el nuevo cerraría la sesión.
 *
 * 2. Verificación optimista de las rutas privadas: sin la cookie de sesión no tiene sentido
 *    renderizar la página, así que se va directo a «Iniciar sesión» con el regreso indicado.
 *    Solo mira si la cookie existe; la validez real la comprueba cada página con getUsuario().
 *    No redirige a los invitados con cookie: una cookie vencida haría un bucle. Eso lo resuelve
 *    soloInvitados() en las páginas de ingreso y registro.
 */

/** Mismo nombre que en src/lib/auth/sesion.ts (sesión simulada). */
const COOKIE_SESION = "pdul_sesion";
const PRIVADAS = ["/mi-cuenta", "/participa"];
const MARGEN_MS = 60_000;

const opciones = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: DURACION_COOKIE_S,
};

async function renovar(request: NextRequest): Promise<{ valor: string | null } | undefined> {
  const actual = request.cookies.get(COOKIE_API)?.value;
  if (!actual) return undefined;
  const tokens = abrirSello(actual, secretoSesion());
  if (!tokens) return { valor: null };
  if (tokens.x - MARGEN_MS > Date.now()) return undefined;
  try {
    return { valor: sellar(tokensDeRespuesta(await refrescarTokens(tokens.r)), secretoSesion()) };
  } catch (e) {
    // Refresh vencido, revocado o reutilizado: la sesión terminó. Si la API no responde, se deja
    // la cookie como está y la página mostrará la sesión cerrada hasta que vuelva.
    return e instanceof ErrorApi && (e.status === 401 || e.status === 403)
      ? { valor: null }
      : undefined;
  }
}

export async function proxy(request: NextRequest) {
  const cambio = usaApi() ? await renovar(request) : undefined;
  if (cambio) {
    if (cambio.valor) request.cookies.set(COOKIE_API, cambio.valor);
    else request.cookies.delete(COOKIE_API);
  }

  const { pathname, search } = request.nextUrl;
  const privada = PRIVADAS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const conSesion = request.cookies.has(usaApi() ? COOKIE_API : COOKIE_SESION);

  let respuesta: NextResponse;
  if (privada && !conSesion) {
    const destino = new URL("/ingresar", request.url);
    destino.searchParams.set("volver", `${pathname}${search}`);
    if (pathname.startsWith("/participa")) destino.searchParams.set("motivo", "participar");
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
