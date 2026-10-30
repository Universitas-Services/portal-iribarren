import "server-only";
import { cacheLife } from "next/cache";
import { siHayTextosPendientes } from "@/lib/auth/acciones-api";
import type { PropuestaPublica } from "@/lib/auth/servicio";
import { tokensDeCookie } from "@/lib/auth/sesion-api";
import type { PostSummary } from "@/lib/api/types";
import { ErrorApi, pedirApi, type ParticipacionPublicaApi } from "@/lib/plataforma-api/cliente";
import { mensajeDeError, propuestaDeApi } from "@/lib/plataforma-api/mapeo";
import type { Reaccion, ResumenInteracciones } from "./interacciones";

/*
 * Vistas, reacciones y rankings contra plataforma-api (guía R12). La vista cuenta una por
 * visitante cada 30 minutos: por eso va con la IP y el navegador del ciudadano. Reaccionar exige
 * sesión; la vista no, pero con sesión la API dice cuál es la reacción del ciudadano (`mia`).
 */

export type ObjetivoApi = { tipo: "noticia"; slug: string } | { tipo: "aporte"; folio: string };

const ruta = (o: ObjetivoApi) =>
  o.tipo === "noticia"
    ? `/portal/posts/${encodeURIComponent(o.slug)}`
    : `/portal/participations/${encodeURIComponent(o.folio)}`;

/** Access token vigente, o undefined: la sesión es opcional para contar la vista. */
async function token() {
  const t = await tokensDeCookie();
  return t && t.x > Date.now() ? t.a : undefined;
}

/** Suma la vista y devuelve los contadores; null si no está publicado o la API no respondió. */
export async function vistaApi(o: ObjetivoApi): Promise<ResumenInteracciones | null> {
  try {
    return await pedirApi<ResumenInteracciones>(`${ruta(o)}/views`, {
      metodo: "POST",
      token: await token(),
      portal: true,
      visitante: true,
    });
  } catch (e) {
    // Si la API falla, la página sigue sin contadores: no es motivo para un error.
    if (e instanceof ErrorApi) return null;
    throw e;
  }
}

export type ResultadoReaccionApi =
  | { estado: "OK"; resumen: ResumenInteracciones }
  | { estado: "SIN_SESION" }
  | { estado: "PROPIO" }
  | { estado: "INVALIDA" }
  /** Hay textos legales por aceptar: la página se vuelve a pintar con el modal. */
  | { estado: "TEXTOS" }
  | { estado: "LIMITE"; mensaje: string };

/**
 * Pone o quita la reacción. `PUT` es un interruptor en la API; aun así, si la reacción ya era la
 * del ciudadano se manda `DELETE`, que deja claro que se quita.
 */
export async function reaccionApi(
  o: ObjetivoApi,
  valor: Reaccion,
  actual: Reaccion | null,
): Promise<ResultadoReaccionApi> {
  const t = await token();
  if (!t) return { estado: "SIN_SESION" };
  try {
    const resumen = await pedirApi<ResumenInteracciones>(`${ruta(o)}/reaction`, {
      token: t,
      portal: true,
      ...(actual === valor
        ? { metodo: "DELETE" as const }
        : { metodo: "PUT" as const, cuerpo: { valor } }),
    });
    return { estado: "OK", resumen };
  } catch (e) {
    if (!(e instanceof ErrorApi)) throw e;
    if (e.status === 401) return { estado: "SIN_SESION" };
    if (e.code === "OWN_CONTENT") return { estado: "PROPIO" };
    if (e.code === "TEXTOS_LEGALES_PENDIENTES") {
      siHayTextosPendientes(e);
      return { estado: "TEXTOS" };
    }
    if (e.status === 429) return { estado: "LIMITE", mensaje: mensajeDeError(e) };
    if (e.status === 404 || e.status === 400) return { estado: "INVALIDA" };
    throw e;
  }
}

export type RankingNoticias = "recientes" | "vistas" | "valoradas";
export type RankingAportes = "vistas" | "reacciones";

/** Noticias del Inicio según el ranking de la API (solo lo publicado). Se cachea unos minutos. */
export async function rankingNoticiasApi(por: RankingNoticias, limite = 3): Promise<PostSummary[]> {
  "use cache";
  cacheLife("minutes");
  const r = await pedirApi<{ data: PostSummary[] }>(
    `/portal/posts/ranking?por=${por}&limit=${limite}`,
    { portal: true, publica: true },
  );
  return r.data;
}

/** Aportes de «La gente opina» según el ranking de la API. Se cachea unos minutos. */
export async function rankingAportesApi(
  por: RankingAportes,
  limite = 6,
): Promise<PropuestaPublica[]> {
  "use cache";
  cacheLife("minutes");
  const r = await pedirApi<{ data: ParticipacionPublicaApi[] }>(
    `/portal/participations/ranking?por=${por}&limit=${limite}`,
    { portal: true, publica: true },
  );
  return r.data.map(propuestaDeApi);
}
