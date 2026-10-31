import {
  aUrlFirmada,
  respuestaDeError,
  urlAdjuntoPublicoApi,
} from "@/lib/auth/participaciones-api";
import { usaApi } from "@/lib/plataforma-api/cliente";

/**
 * Abre una foto de un aporte publicado (R19): pide a plataforma-api la URL firmada de 5 minutos y
 * redirige a ella. Así la URL no queda en la página, que se cachea. El documento de soporte no se
 * abre desde aquí: solo lo ve su autor. Sin la API no hay archivos (los ejemplos traen su URL).
 */
export async function GET(
  _request: Request,
  ctx: RouteContext<"/propuestas/[folio]/archivo/[id]">,
) {
  if (!usaApi()) return new Response("No encontrado", { status: 404 });
  const { folio, id } = await ctx.params;
  try {
    const url = await urlAdjuntoPublicoApi(folio, id);
    return url ? aUrlFirmada(url) : new Response("No encontrado", { status: 404 });
  } catch (e) {
    return respuestaDeError(e);
  }
}
