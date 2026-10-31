import "server-only";
import { cacheLife } from "next/cache";
import {
  ErrorApi,
  pedirApi,
  type PaginaApi,
  type ParticipacionPropiaApi,
  type ParticipacionPublicaApi,
} from "@/lib/plataforma-api/cliente";
import { participacionDeApi, propuestaDeApi } from "@/lib/plataforma-api/mapeo";
import { aSlug } from "@/lib/validation/schemas";
import type { FiltroParticipaciones, Participacion, PropuestaPublica } from "./servicio";
import { tokensDeCookie } from "./sesion-api";

/*
 * Lecturas de participaciones contra plataforma-api (guía R11). Las del autor van con su token;
 * la galería es pública y se cachea unos minutos. Devuelven las mismas formas que la simulación,
 * así las pantallas no cambian.
 */

async function token() {
  const t = await tokensDeCookie();
  return t && t.x > Date.now() ? t.a : undefined;
}

/** Un 404 (no existe o no es de la cuenta) o un 401 (sesión vencida) es «no hay». */
const noHay = (e: unknown) => e instanceof ErrorApi && (e.status === 404 || e.status === 401);

/** Una participación de la cuenta en sesión. */
export async function miParticipacionApi(
  folio: string,
  cuentaId: string,
): Promise<Participacion | undefined> {
  const t = await token();
  if (!t) return undefined;
  try {
    const p = await pedirApi<ParticipacionPropiaApi>(
      `/portal/me/participations/${encodeURIComponent(folio)}`,
      { token: t, portal: true },
    );
    return participacionDeApi(p, cuentaId);
  } catch (e) {
    if (noHay(e)) return undefined;
    throw e;
  }
}

function consulta(f: FiltroParticipaciones, extra: Record<string, string | number> = {}) {
  const qs = new URLSearchParams();
  if (f.estado) qs.set("estado", aSlug(f.estado));
  if (f.tipo) qs.set("tipo", aSlug(f.tipo));
  if (f.folio) qs.set("folio", f.folio);
  if (f.parroquia) qs.set("parroquia", f.parroquia);
  if (f.categoriaTecnica) qs.set("categoriaTecnica", f.categoriaTecnica);
  if (f.q) qs.set("q", f.q);
  for (const [k, v] of Object.entries(extra)) qs.set(k, String(v));
  return qs.toString();
}

/**
 * Las participaciones de la cuenta, filtradas, y cuántas tiene en total (sin filtros: la
 * pantalla vacía distingue «aún no enviaste» de «sin resultados»). Null sin sesión.
 */
export async function misParticipacionesApi(f: FiltroParticipaciones, cuentaId: string) {
  const t = await token();
  if (!t) return null;
  const pedir = (filtros: FiltroParticipaciones, limit: number) =>
    pedirApi<PaginaApi<ParticipacionPropiaApi>>(
      `/portal/me/participations?${consulta(filtros, { limit })}`,
      { token: t, portal: true },
    );
  const hayFiltros = Boolean(f.estado || f.tipo || f.folio);
  try {
    const [lista, todas] = await Promise.all([
      pedir({ estado: f.estado, tipo: f.tipo, folio: f.folio }, 100),
      hayFiltros ? pedir({}, 1) : undefined,
    ]);
    return {
      total: (todas ?? lista).meta.total,
      items: lista.data.map((p) => participacionDeApi(p, cuentaId)),
    };
  } catch (e) {
    if (e instanceof ErrorApi && e.status === 401) return null;
    throw e;
  }
}

export type PaginaGaleria = {
  items: PropuestaPublica[];
  total: number;
  pagina: number;
  paginas: number;
};

/** Galería pública: todo lo publicado, de la publicación más reciente. Se cachea unos minutos. */
export async function galeriaApi(
  f: FiltroParticipaciones,
  pagina: number,
  limite = 12,
): Promise<PaginaGaleria> {
  "use cache";
  cacheLife("minutes");
  const r = await pedirApi<PaginaApi<ParticipacionPublicaApi>>(
    `/portal/participations?${consulta(
      { tipo: f.tipo, parroquia: f.parroquia, categoriaTecnica: f.categoriaTecnica, q: f.q },
      { page: pagina, limit: limite },
    )}`,
    { portal: true, publica: true },
  );
  return {
    items: r.data.map(propuestaDeApi),
    total: r.meta.total,
    // Una página fuera de rango la API la lleva a la última.
    pagina: r.meta.page,
    paginas: Math.max(1, r.meta.totalPages),
  };
}

/** Una participación publicada, o undefined si no lo está (404). */
export async function propuestaPublicaApi(folio: string): Promise<PropuestaPublica | undefined> {
  "use cache";
  cacheLife("minutes");
  try {
    const p = await pedirApi<ParticipacionPublicaApi>(
      `/portal/participations/${encodeURIComponent(folio.toUpperCase())}`,
      { portal: true, publica: true },
    );
    return propuestaDeApi(p);
  } catch (e) {
    if (e instanceof ErrorApi && e.status === 404) return undefined;
    throw e;
  }
}

/* ---------- Adjuntos (guía R19) ---------- */

type UrlFirmada = { url: string; expiraEl: string };

/**
 * URL firmada (5 minutos) de una foto de un aporte publicado. Pública: la API solo la da si el
 * aporte está PUBLICADA y el archivo es una foto. Sin caché: la URL vence.
 */
export async function urlAdjuntoPublicoApi(folio: string, id: string) {
  try {
    const r = await pedirApi<UrlFirmada>(
      `/portal/participations/${encodeURIComponent(folio.toUpperCase())}/files/${encodeURIComponent(id)}/url`,
      { portal: true, publica: true },
    );
    return r.url;
  } catch (e) {
    if (noHay(e)) return undefined;
    throw e;
  }
}

/** URL firmada de una foto o del soporte de un aporte propio; `descargar` lo baja como archivo. */
export async function urlAdjuntoPropioApi(folio: string, id: string, descargar: boolean) {
  const t = await token();
  if (!t) return undefined;
  try {
    const r = await pedirApi<UrlFirmada>(
      `/portal/me/participations/${encodeURIComponent(folio)}/files/${encodeURIComponent(id)}/url${descargar ? "?disposicion=attachment" : ""}`,
      { token: t, portal: true },
    );
    return r.url;
  } catch (e) {
    if (noHay(e)) return undefined;
    throw e;
  }
}
