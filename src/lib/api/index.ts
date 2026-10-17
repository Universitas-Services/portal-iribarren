import "server-only";
import { cacheLife } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { consultarDocumentos } from "@/lib/documentos/consultas";
import { banners, documentos, posts, processStatus } from "@/lib/mocks/data";
import { paraPortada, relacionadas, consultarNoticias } from "@/lib/noticias/consultas";
import type {
  Banner,
  Documento,
  FiltrosDocumentos,
  FiltrosNoticias,
  PaginaDocumentos,
  PaginaNoticias,
  Post,
  PostSummary,
  ProcessStatus,
} from "./types";

/*
 * Capa de datos del portal. Hoy devuelve datos de ejemplo; cuando exista plataforma-api,
 * estas funciones llamarán al BFF y las pantallas no cambian.
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

/** HTML permitido en el cuerpo de una noticia (lo que produce el editor del admin). */
const HTML_PERMITIDO: sanitizeHtml.IOptions = {
  allowedTags: ["p", "h2", "h3", "h4", "ul", "ol", "li", "strong", "em", "a", "blockquote", "br"],
  allowedAttributes: { a: ["href", "title"] },
  allowedSchemes: ["https", "mailto"],
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

export async function getProcess(): Promise<ProcessStatus> {
  await simularRed(0.6);
  return processStatus;
}

export async function getBanners(): Promise<Banner[]> {
  await simularRed(1);
  return banners;
}

export async function getLatestPosts(limit = 3): Promise<PostSummary[]> {
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
  await simularRed(1);
  return consultarNoticias(posts, filtros);
}

export async function getPost(slug: string): Promise<Post | undefined> {
  "use cache";
  cacheLife("minutes");
  await simularRed(1);
  const post = posts.find((p) => p.slug === slug);
  return post && { ...post, cuerpo: sanitizeHtml(post.cuerpo, HTML_PERMITIDO) };
}

export async function getRelatedPosts(slug: string): Promise<PostSummary[]> {
  "use cache";
  cacheLife("minutes");
  await simularRed(1.2);
  const post = posts.find((p) => p.slug === slug);
  return post ? relacionadas(posts, post) : [];
}

/** Slugs publicados, para prerenderizar el detalle y para el sitemap. */
export async function getPostSlugs(): Promise<{ slug: string; publicadoEl: string }[]> {
  "use cache";
  cacheLife("minutes");
  return posts.map(({ slug, publicadoEl }) => ({ slug, publicadoEl }));
}

/* Repositorio documental: público y cacheado como las noticias. */

export async function getDocumentos(filtros: FiltrosDocumentos): Promise<PaginaDocumentos> {
  "use cache";
  cacheLife("minutes");
  await simularRed(1);
  return consultarDocumentos(documentos, filtros);
}

export async function getDocumento(slug: string): Promise<Documento | undefined> {
  "use cache";
  cacheLife("minutes");
  await simularRed(1);
  return documentos.find((d) => d.slug === slug);
}

/** Slugs de los documentos, para prerenderizar el detalle y para el sitemap. */
export async function getDocumentoSlugs(): Promise<{ slug: string; fecha: string }[]> {
  "use cache";
  cacheLife("minutes");
  return documentos.map((d) => ({ slug: d.slug, fecha: d.actualizadoEl ?? d.publicadoEl }));
}

export type { Banner, Post, PostSummary, ProcessStatus } from "./types";
