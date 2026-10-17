import {
  FORMATOS,
  type FiltrosNoticias,
  type PaginaNoticias,
  type Post,
  type PostSummary,
} from "@/lib/api/types";

/*
 * Lógica de consulta de noticias sobre los datos de ejemplo: filtra, busca, ordena y pagina
 * igual que lo hará GET /portal/posts. Vive aparte de `src/lib/api` (server-only) para poder
 * probarla con Vitest.
 */

export const NOTICIAS_POR_PAGINA = 9;

/** Quita tildes y pasa a minúsculas para que «diagnostico» encuentre «Diagnóstico». */
export function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function resumir(post: Post): PostSummary {
  const {
    cuerpo: _cuerpo,
    imagenes,
    adjunto,
    video,
    puntos: _puntos,
    boton: _boton,
    autor: _autor,
    actualizadoEl: _act,
    ...resto
  } = post;
  return {
    ...resto,
    portada: imagenes[0] ?? video?.portada,
    duracionSeg: video?.duracionSeg,
    conteoImagenes: imagenes.length || undefined,
    miniaturas: post.formato === "GALERIA" ? imagenes.slice(0, 3) : undefined,
    adjunto: adjunto
      ? { url: adjunto.url, pesoBytes: adjunto.pesoBytes, paginas: adjunto.paginas }
      : undefined,
  };
}

const porFechaDesc = (a: Pick<Post, "publicadoEl">, b: Pick<Post, "publicadoEl">) =>
  b.publicadoEl.localeCompare(a.publicadoEl);

export function consultarNoticias(
  posts: Post[],
  filtros: FiltrosNoticias,
  porPagina = NOTICIAS_POR_PAGINA,
): PaginaNoticias {
  const q = filtros.q ? normalizar(filtros.q) : undefined;

  const base = posts
    .filter((p) => !filtros.categoria || p.categoria === filtros.categoria)
    .filter((p) => !filtros.desde || p.publicadoEl >= filtros.desde)
    .filter((p) => !filtros.hasta || p.publicadoEl <= filtros.hasta)
    .filter((p) => !q || normalizar(`${p.titulo} ${p.resumen}`).includes(q));

  // Los conteos por formato respetan los demás filtros, para que las pestañas digan
  // cuántos resultados hay en cada una antes de elegirla.
  const porFormato = {
    TODOS: base.length,
    ...Object.fromEntries(FORMATOS.map((f) => [f, base.filter((p) => p.formato === f).length])),
  } as PaginaNoticias["porFormato"];

  const filtradas = base
    .filter((p) => !filtros.formato || p.formato === filtros.formato)
    .sort(porFechaDesc);

  const total = filtradas.length;
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  // Una página fuera de rango muestra la última en lugar de una lista vacía.
  const pagina = Math.min(Math.max(1, filtros.pagina), paginas);
  const inicio = (pagina - 1) * porPagina;

  return {
    items: filtradas.slice(inicio, inicio + porPagina).map(resumir),
    total,
    pagina,
    paginas,
    porPagina,
    porFormato,
  };
}

/** Para el Inicio: primero las «destacadas en portada» (más recientes primero) y luego el resto. */
export function paraPortada(posts: Post[], limite = 3): PostSummary[] {
  const ordenadas = [...posts].sort(porFechaDesc);
  return [...ordenadas.filter((p) => p.destacada), ...ordenadas.filter((p) => !p.destacada)]
    .slice(0, limite)
    .map(resumir);
}

/** Hasta `limite` noticias de la misma categoría, sin incluir la actual; completa con recientes. */
export function relacionadas(posts: Post[], actual: Post, limite = 3): PostSummary[] {
  const otras = posts.filter((p) => p.slug !== actual.slug).sort(porFechaDesc);
  const misma = otras.filter((p) => p.categoria === actual.categoria);
  const resto = otras.filter((p) => p.categoria !== actual.categoria);
  return [...misma, ...resto].slice(0, limite).map(resumir);
}
