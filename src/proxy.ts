import { NextResponse, type NextRequest } from "next/server";

/*
 * Verificación optimista de las rutas privadas: sin la cookie de sesión no tiene sentido
 * renderizar la página, así que se va directo a «Iniciar sesión» con el regreso indicado.
 * Solo mira si la cookie existe (Proxy corre en cada petición y no debe consultar datos); la
 * validez real de la sesión la comprueba cada página con getUsuario()/getPerfil().
 * No redirige a los invitados con cookie: una cookie vencida haría un bucle. Eso lo resuelve
 * soloInvitados() en las páginas de ingreso y registro.
 */

/** Mismo nombre que en src/lib/auth/sesion.ts (Proxy no comparte módulos con la app). */
const COOKIE_SESION = "pdul_sesion";

export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_SESION)) return NextResponse.next();
  const { pathname, search } = request.nextUrl;
  const destino = new URL("/ingresar", request.url);
  destino.searchParams.set("volver", `${pathname}${search}`);
  if (pathname.startsWith("/participa")) destino.searchParams.set("motivo", "participar");
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ["/mi-cuenta/:path*", "/participa/:path*", "/unirme"],
};
