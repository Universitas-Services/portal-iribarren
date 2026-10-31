import { urlAdjuntoPublicoApi } from "@/lib/auth/participaciones-api";
import { usaApi } from "@/lib/plataforma-api/cliente";

/** Redirige a la URL firmada sin dejarla en caché ni filtrar la página de origen. */
const aUrlFirmada = (url: string) =>
  new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });

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
  } catch {
    return new Response("No se pudo abrir el archivo. Intenta de nuevo.", { status: 502 });
  }
}
