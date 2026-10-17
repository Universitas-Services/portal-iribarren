import {
  DOC_CATEGORIAS,
  DOC_ESTADOS,
  type Documento,
  type FiltrosDocumentos,
  type PaginaDocumentos,
} from "@/lib/api/types";
import { normalizar } from "@/lib/noticias/consultas";

/*
 * Consulta del repositorio documental sobre los datos de ejemplo, igual que lo hará
 * GET /portal/documents. Pura y aparte de `src/lib/api` para probarla con Vitest.
 */

export const DOCUMENTOS_POR_PAGINA = 10;

/** Fecha que manda en el orden: la última actualización o, si no hay, la publicación. */
export const fechaVigente = (d: Pick<Documento, "publicadoEl" | "actualizadoEl">) =>
  d.actualizadoEl ?? d.publicadoEl;

export function consultarDocumentos(
  documentos: Documento[],
  filtros: FiltrosDocumentos,
  porPagina = DOCUMENTOS_POR_PAGINA,
): PaginaDocumentos {
  const q = filtros.q ? normalizar(filtros.q) : undefined;
  const coincide = (d: Documento) => !q || normalizar(`${d.titulo} ${d.descripcion}`).includes(q);

  // Cada conteo respeta los otros filtros, para que diga cuántos resultados habrá al elegirlo.
  const porTexto = documentos.filter(coincide);
  const paraCategorias = porTexto.filter((d) => !filtros.estado || d.estado === filtros.estado);
  const paraEstados = porTexto.filter(
    (d) => !filtros.categoria || d.categoria === filtros.categoria,
  );

  const porCategoria = {
    TODAS: paraCategorias.length,
    ...Object.fromEntries(
      DOC_CATEGORIAS.map((c) => [c, paraCategorias.filter((d) => d.categoria === c).length]),
    ),
  } as PaginaDocumentos["porCategoria"];

  const porEstado = {
    TODOS: paraEstados.length,
    ...Object.fromEntries(
      DOC_ESTADOS.map((e) => [e, paraEstados.filter((d) => d.estado === e).length]),
    ),
  } as PaginaDocumentos["porEstado"];

  const filtrados = paraEstados
    .filter((d) => !filtros.estado || d.estado === filtros.estado)
    .sort((a, b) => fechaVigente(b).localeCompare(fechaVigente(a)));

  const total = filtrados.length;
  const paginas = Math.max(1, Math.ceil(total / porPagina));
  const pagina = Math.min(Math.max(1, filtros.pagina), paginas);
  const inicio = (pagina - 1) * porPagina;

  return {
    items: filtrados.slice(inicio, inicio + porPagina),
    total,
    pagina,
    paginas,
    porPagina,
    porCategoria,
    porEstado,
  };
}
