import { aUrlFirmada, respuestaDeError, urlAdjuntoPropioApi } from "@/lib/auth/participaciones-api";
import { usaApi } from "@/lib/plataforma-api/cliente";

/**
 * Abre una foto o el documento de soporte de un aporte propio (R19), con la sesión del autor:
 * pide la URL firmada a plataforma-api y redirige. Con `?descargar=1` el archivo se descarga. Si
 * el aporte no es de la cuenta o la sesión venció, 404.
 */
export async function GET(
  request: Request,
  ctx: RouteContext<"/mi-cuenta/participaciones/[folio]/archivo/[id]">,
) {
  if (!usaApi()) return new Response("No encontrado", { status: 404 });
  const { folio, id } = await ctx.params;
  const descargar = new URL(request.url).searchParams.get("descargar") === "1";
  try {
    const url = await urlAdjuntoPropioApi(folio, id, descargar);
    return url ? aUrlFirmada(url) : new Response("No encontrado", { status: 404 });
  } catch (e) {
    return respuestaDeError(e);
  }
}
