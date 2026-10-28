import { usaApi } from "@/lib/plataforma-api/cliente";
import { tokensDeCookie } from "@/lib/auth/sesion-api";
import { idSesion } from "@/lib/auth/sesion";

/*
 * ¿Sigue abierta la sesión? Lo consulta VigiaSesion (src/components/layout/vigia-sesion.tsx)
 * cuando la persona usa la página, vuelve a la pestaña o cambia de ruta. Como pasa por Proxy,
 * la consulta misma renueva el token y anota la actividad; si la sesión venció por
 * inactividad, Proxy ya borró la cookie y aquí responde que no.
 */
export async function GET() {
  const conSesion = usaApi() ? Boolean(await tokensDeCookie()) : Boolean(await idSesion());
  return Response.json({ conSesion }, { headers: { "Cache-Control": "no-store" } });
}
