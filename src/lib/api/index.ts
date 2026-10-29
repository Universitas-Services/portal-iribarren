import "server-only";
import { cacheLife } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { MARCO } from "@/lib/conoce/contenido";
import { bannersVigentes } from "@/lib/banners";
import {
  consultarDocumentos,
  paginaDeDocumentosApi,
  type PaginaDocumentosApi,
} from "@/lib/documentos/consultas";
import { banners, documentos, posts, processStatus } from "@/lib/mocks/data";
import { textoLegalSimulado } from "@/lib/mocks/textos-legales";
import { paraPortada, relacionadas, consultarNoticias } from "@/lib/noticias/consultas";
import { ErrorApi, pedirApi, urlApi, usaApi } from "@/lib/plataforma-api/cliente";
import type {
  Banner,
  Documento,
  FiltrosDocumentos,
  FiltrosNoticias,
  InicioPortal,
  ItemMarcoLegal,
  PaginaDocumentos,
  PaginaNoticias,
  Post,
  PostSummary,
  ProcessStatus,
  TextoLegal,
  TipoTextoLegal,
} from "./types";

/*
 * Capa de datos del portal. Con plataforma-api (API_URL definida), las noticias (guía R7), los
 * documentos (guía R8) y el Marco legal (guía R9) salen de la API; lo demás, y todo sin API_URL,
 * sigue con los datos de ejemplo. Las pantallas no cambian.
 */

/**
 * Retraso artificial para ver los skeletons con datos de ejemplo.
 * Solo en desarrollo: MOCK_DELAY_MS=1500 pnpm dev
 */
async function simularRed(factor = 1) {
  const ms = Number(process.env.MOCK_DELAY_MS ?? 0);
  if (process.env.NODE_ENV !== "production" && ms > 0) {
    await new Promise((r) => setTimeout(r, ms * factor));
  }
}

/** Imágenes del cuerpo: solo medios de la API (guía R6) y con texto alternativo. */
const imagenDeLaApi = (src?: string) => {
  const base = urlApi();
  return Boolean(base && src?.startsWith(`${base}/media/`));
};

/** HTML permitido en el cuerpo de una noticia (lo que produce el editor del admin). */
const HTML_PERMITIDO: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "strong",
    "em",
    "a",
    "blockquote",
    "br",
    "img",
  ],
  allowedAttributes: { a: ["href", "title"], img: ["src", "alt"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https", "http"] },
  exclusiveFilter: (f) => f.tag === "img" && (!imagenDeLaApi(f.attribs.src) || !f.attribs.alt),
  transformTags: {
    // Los enlaces externos se abren en otra pestaña sin dar acceso a window.opener.
    a: (tagName, attribs) => ({
      tagName,
      attribs: attribs.href?.startsWith("/")
        ? attribs
        : { ...attribs, target: "_blank", rel: "noopener noreferrer" },
    }),
  },
};

/**
 * La API no responde o falla (5xx): el contenido del Inicio se muestra vacío en vez de tumbar la
 * página entera. El error queda en el registro del servidor.
 */
function apiCaida(e: unknown, que: string) {
  if (!(e instanceof ErrorApi) || e.status < 500) return false;
  console.error(`[portal] No se pudo leer ${que} de la API: ${e.code}`);
  return true;
}

/**
 * Fases del PDUL y fase actual (termómetro y «¿En qué va el proceso?»). Con plataforma-api,
 * GET /portal/process (guía R10): el estado de cada fase ya viene calculado (D3: las anteriores
 * «Completado», la actual «En curso», las siguientes lo que fije el Operador).
 */
export async function getProcess(): Promise<ProcessStatus> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    try {
      const r = await pedirApi<Omit<ProcessStatus, "ejemplo">>("/portal/process", {
        portal: true,
        publica: true,
      });
      return { fases: r.fases, faseActual: r.faseActual, ejemplo: false };
    } catch (e) {
      if (!apiCaida(e, "proceso")) throw e;
      return { fases: [], faseActual: 0, ejemplo: false };
    }
  }
  await simularRed(0.6);
  return processStatus;
}

/**
 * Marco legal de Conoce el PDUL. Con plataforma-api, GET /portal/legal-framework (guía R9): ya
 * viene en su orden, hasta 10, y con el botón solo si su noticia o documento sigue publicado.
 * Sin la API, los 7 ítems del texto del cliente (`MARCO` en `src/lib/conoce/contenido.ts`), que
 * son también el seed de Iribarren en la API. Vida corta para que los cambios del Operador se
 * vean pronto.
 */
export async function getMarcoLegal(): Promise<ItemMarcoLegal[]> {
  "use cache";
  cacheLife("minutes");
  if (usaApi())
    return (
      await pedirApi<{ data: ItemMarcoLegal[] }>("/portal/legal-framework", {
        portal: true,
        publica: true,
      })
    ).data;
  return MARCO.slice(0, 10).map(({ nombre, texto, enlace }) => ({
    titulo: nombre,
    descripcion: texto,
    boton: enlace && { texto: enlace.label, href: enlace.href },
  }));
}

/**
 * Inicio elegido por la alcaldía. Con plataforma-api, GET /portal/home (guía R10): el mensaje
 * del alcalde es una noticia de texto publicada, o null. Con null (y sin la API), el Inicio
 * muestra el texto provisional (decisión D10).
 */
export async function getHome(): Promise<InicioPortal> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    try {
      return await pedirApi<InicioPortal>("/portal/home", { portal: true, publica: true });
    } catch (e) {
      if (!apiCaida(e, "inicio")) throw e;
      return { mensajeAlcalde: null };
    }
  }
  await simularRed(1);
  return { mensajeAlcalde: null };
}

/**
 * Solo los banners vigentes y en su orden. Se cachea por horas: la vigencia va por día, así que
 * un banner aparece o vence a más tardar una hora después de su fecha.
 */
export async function getBanners(): Promise<Banner[]> {
  "use cache";
  if (usaApi()) {
    try {
      // GET /portal/banners (guía R10) ya trae las 6 primeras vigentes, en su orden.
      const r = await pedirApi<{ data: Omit<Banner, "orden" | "vigencia">[] }>("/portal/banners", {
        portal: true,
        publica: true,
      });
      cacheLife("hours");
      return r.data.map((b, orden) => ({ ...b, orden }));
    } catch (e) {
      if (!apiCaida(e, "diapositivas")) throw e;
      // Se reintenta pronto: el fallo no queda guardado por horas.
      cacheLife("minutes");
      return [];
    }
  }
  cacheLife("hours");
  await simularRed(1);
  // La tarjeta muestra hasta 6 diapositivas a la vez.
  return bannersVigentes(banners, Date.now()).slice(0, 6);
}

/* ---------- Textos legales (R15, pedido a backend) ---------- */

type TextoLegalApi = {
  tipo: TipoTextoLegal;
  version: number;
  publicadoAt: string;
  html: string;
  nota?: string | null;
};

/** GET /portal/legal-texts/{tipo}: la versión vigente. Se cachea; la API caída da null. */
async function textoLegalApi(tipo: TipoTextoLegal): Promise<TextoLegal | null> {
  "use cache";
  try {
    const t = await pedirApi<TextoLegalApi>(`/portal/legal-texts/${tipo}`, {
      portal: true,
      publica: true,
    });
    cacheLife("hours");
    return {
      tipo,
      version: String(t.version),
      publicadoEl: t.publicadoAt,
      html: sanitizeHtml(t.html, HTML_PERMITIDO),
      nota: t.nota ?? undefined,
    };
  } catch (e) {
    // La API aún no tiene la ruta (404) o no responde: el portal enlaza a la página del texto.
    if (!(e instanceof ErrorApi) || (e.status !== 404 && !apiCaida(e, "textos legales"))) throw e;
    cacheLife("minutes");
    return null;
  }
}

/**
 * Términos de uso o política de datos vigentes, o null si no se pudieron leer. Sin la API, el
 * contenido provisional (en memoria: la ruta de desarrollo puede publicar una versión nueva).
 */
export async function getTextoLegal(tipo: TipoTextoLegal): Promise<TextoLegal | null> {
  if (usaApi()) return textoLegalApi(tipo);
  return textoLegalSimulado(tipo);
}

/* ---------- Noticias (guía R7: /portal/posts) ---------- */

type PaginaApi<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number; porFormato?: unknown };
};

/** Detalle de la API: la noticia más sus relacionadas (totales y mia llegan con R12). */
type DetalleApi = Post & { relacionadas?: PostSummary[] };

const sanear = (p: Post): Post => ({ ...p, cuerpo: sanitizeHtml(p.cuerpo ?? "", HTML_PERMITIDO) });

/** Una noticia no publicada responde 404: para el portal, no existe. */
async function detalleApi(slug: string): Promise<DetalleApi | undefined> {
  try {
    return await pedirApi<DetalleApi>(`/portal/posts/${encodeURIComponent(slug)}`, {
      portal: true,
      publica: true,
    });
  } catch (e) {
    if (e instanceof ErrorApi && e.status === 404) return undefined;
    throw e;
  }
}

/**
 * Para el Inicio: destacadas primero y luego las más recientes. La API da hasta 12 por
 * `featured`; si se piden más (los rankings de «Noticias y novedades»), se completan con el
 * listado, que va de la más reciente a la más antigua.
 */
async function portadaApi(limit: number): Promise<PostSummary[]> {
  const primeras = await pedirApi<PostSummary[] | { data: PostSummary[] }>(
    `/portal/posts/featured?limit=${Math.min(limit, 12)}`,
    { portal: true, publica: true },
  );
  const lista = Array.isArray(primeras) ? primeras : primeras.data;
  if (limit <= 12) return lista;
  const resto = await pedirApi<PaginaApi<PostSummary>>(
    `/portal/posts?limit=${Math.min(limit, 100)}&page=1`,
    { portal: true, publica: true },
  );
  const vistas = new Set(lista.map((p) => p.slug));
  return [...lista, ...resto.data.filter((p) => !vistas.has(p.slug))].slice(0, limit);
}

export async function getLatestPosts(limit = 3): Promise<PostSummary[]> {
  if (usaApi()) {
    try {
      return await portadaApi(limit);
    } catch (e) {
      if (!apiCaida(e, "noticias de portada")) throw e;
      return [];
    }
  }
  await simularRed(1.4);
  return paraPortada(posts, limit);
}

/*
 * Las noticias son contenido público: se cachean para que el detalle se prerenderice y
 * la navegación sea instantánea. Con la API real, cacheLife define cada cuánto se refrescan.
 */

export async function getPosts(filtros: FiltrosNoticias): Promise<PaginaNoticias> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    const p = new URLSearchParams({ page: String(filtros.pagina) });
    for (const [k, v] of Object.entries({
      categoria: filtros.categoria,
      formato: filtros.formato,
      desde: filtros.desde,
      hasta: filtros.hasta,
      q: filtros.q,
    }))
      if (v) p.set(k, v);
    const r = await pedirApi<PaginaApi<PostSummary>>(`/portal/posts?${p}`, {
      portal: true,
      publica: true,
    });
    return {
      items: r.data,
      total: r.meta.total,
      pagina: r.meta.page,
      paginas: Math.max(1, r.meta.totalPages),
      porPagina: r.meta.limit,
      porFormato: r.meta.porFormato as PaginaNoticias["porFormato"],
    };
  }
  await simularRed(1);
  return consultarNoticias(posts, filtros);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    const d = await detalleApi(slug);
    if (!d) return undefined;
    const { relacionadas: _r, ...post } = d;
    return sanear(post);
  }
  await simularRed(1);
  const post = posts.find((p) => p.slug === slug);
  return post && sanear(post);
}

export async function getRelatedPosts(slug: string): Promise<PostSummary[]> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) return (await detalleApi(slug))?.relacionadas ?? [];
  await simularRed(1.2);
  const post = posts.find((p) => p.slug === slug);
  return post ? relacionadas(posts, post) : [];
}

/** Slugs publicados, para prerenderizar el detalle y para el sitemap. */
export async function getPostSlugs(): Promise<{ slug: string; publicadoEl: string }[]> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    const todos: { slug: string; publicadoEl: string }[] = [];
    for (let pagina = 1; ; pagina++) {
      const r = await pedirApi<PaginaApi<PostSummary>>(`/portal/posts?limit=100&page=${pagina}`, {
        portal: true,
        publica: true,
      });
      todos.push(...r.data.map(({ slug, publicadoEl }) => ({ slug, publicadoEl })));
      if (pagina >= r.meta.totalPages) return todos;
    }
  }
  return posts.map(({ slug, publicadoEl }) => ({ slug, publicadoEl }));
}

/* ---------- Repositorio documental (guía R8: /portal/documents) ---------- */

/* Público y cacheado como las noticias. */

export async function getDocumentos(filtros: FiltrosDocumentos): Promise<PaginaDocumentos> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    const p = new URLSearchParams({ page: String(filtros.pagina) });
    for (const [k, v] of Object.entries({
      q: filtros.q,
      categoria: filtros.categoria,
      estado: filtros.estado,
    }))
      if (v) p.set(k, v);
    return paginaDeDocumentosApi(
      await pedirApi<PaginaDocumentosApi>(`/portal/documents?${p}`, {
        portal: true,
        publica: true,
      }),
    );
  }
  await simularRed(1);
  return consultarDocumentos(documentos, filtros);
}

/** Un documento oculto o eliminado responde 404: para el portal, no existe. */
export async function getDocumento(slug: string): Promise<Documento | undefined> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    try {
      return await pedirApi<Documento>(`/portal/documents/${encodeURIComponent(slug)}`, {
        portal: true,
        publica: true,
      });
    } catch (e) {
      if (e instanceof ErrorApi && e.status === 404) return undefined;
      throw e;
    }
  }
  await simularRed(1);
  return documentos.find((d) => d.slug === slug);
}

/** Slugs de los documentos, para prerenderizar el detalle y para el sitemap. */
export async function getDocumentoSlugs(): Promise<{ slug: string; fecha: string }[]> {
  "use cache";
  cacheLife("minutes");
  if (usaApi()) {
    const todos: { slug: string; fecha: string }[] = [];
    for (let pagina = 1; ; pagina++) {
      const r = await pedirApi<PaginaDocumentosApi>(`/portal/documents?limit=100&page=${pagina}`, {
        portal: true,
        publica: true,
      });
      todos.push(...r.data.map((d) => ({ slug: d.slug, fecha: d.actualizadoEl ?? d.publicadoEl })));
      if (pagina >= r.meta.totalPages) return todos;
    }
  }
  return documentos.map((d) => ({ slug: d.slug, fecha: d.actualizadoEl ?? d.publicadoEl }));
}

export type { Banner, InicioPortal, Post, PostSummary, ProcessStatus } from "./types";
