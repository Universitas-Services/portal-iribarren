import { describe, expect, it } from "vitest";
import type { Documento } from "@/lib/api/types";
import { parseFiltrosDocumentos } from "@/lib/validation/schemas";
import { consultarDocumentos, paginaDeDocumentosApi } from "./consultas";

const doc = (slug: string, extra: Partial<Documento> = {}): Documento => ({
  slug,
  titulo: `Documento ${slug}`,
  descripcion: "Descripción",
  categoria: "Minutas",
  estado: "OFICIAL",
  version: "1.0",
  publicadoEl: "2026-09-01",
  archivo: { nombre: "x.pdf", url: "/x.pdf", tipo: "application/pdf", pesoBytes: 1000 },
  versiones: [],
  ...extra,
});

const lista: Documento[] = [
  doc("decreto", { categoria: "Decretos y normativa", publicadoEl: "2026-08-20" }),
  doc("plan", {
    categoria: "Plan de trabajo",
    publicadoEl: "2026-09-02",
    actualizadoEl: "2026-10-20",
  }),
  doc("informe", {
    categoria: "Informes técnicos",
    estado: "BORRADOR",
    publicadoEl: "2026-10-12",
    titulo: "Diagnóstico preliminar",
  }),
  doc("minuta", { estado: "BORRADOR", publicadoEl: "2026-09-15" }),
];

describe("consultarDocumentos", () => {
  it("ordena por la fecha vigente (actualización o publicación)", () => {
    const r = consultarDocumentos(lista, { pagina: 1 });
    expect(r.items.map((d) => d.slug)).toEqual(["plan", "informe", "minuta", "decreto"]);
  });

  it("filtra por estado y categoría y busca sin tildes", () => {
    expect(consultarDocumentos(lista, { pagina: 1, estado: "BORRADOR" }).total).toBe(2);
    expect(
      consultarDocumentos(lista, { pagina: 1, estado: "BORRADOR", categoria: "Minutas" }).items,
    ).toHaveLength(1);
    expect(consultarDocumentos(lista, { pagina: 1, q: "DIAGNOSTICO" }).items[0]?.slug).toBe(
      "informe",
    );
  });

  it("cada conteo respeta los demás filtros", () => {
    const r = consultarDocumentos(lista, { pagina: 1, estado: "BORRADOR" });
    expect(r.porCategoria).toMatchObject({ TODAS: 2, Minutas: 1, "Informes técnicos": 1 });
    expect(r.porEstado).toEqual({ TODOS: 4, OFICIAL: 2, BORRADOR: 2 });
    const c = consultarDocumentos(lista, { pagina: 1, categoria: "Minutas" });
    expect(c.porEstado).toEqual({ TODOS: 1, OFICIAL: 0, BORRADOR: 1 });
  });

  it("pagina y lleva una página fuera de rango a la última", () => {
    const r = consultarDocumentos(lista, { pagina: 9 }, 3);
    expect(r).toMatchObject({ pagina: 2, paginas: 2, total: 4 });
    expect(r.items).toHaveLength(1);
  });
});

describe("parseFiltrosDocumentos", () => {
  it("lee estado y categoría de la URL", () => {
    expect(
      parseFiltrosDocumentos({ estado: "borrador", categoria: "Cartografía", pagina: "2" }),
    ).toEqual({ q: undefined, estado: "BORRADOR", categoria: "Cartografía", pagina: 2 });
  });

  it("descarta valores inválidos sin lanzar error", () => {
    expect(
      parseFiltrosDocumentos({ estado: "archivado", categoria: "Leyes", pagina: "0" }),
    ).toEqual({ q: undefined, estado: undefined, categoria: undefined, pagina: 1 });
  });
});

describe("paginaDeDocumentosApi", () => {
  it("lee la página de la API con sus conteos y nunca menos de una página", () => {
    const porCategoria = {
      TODAS: 0,
      "Decretos y normativa": 0,
      "Plan de trabajo": 0,
      "Informes técnicos": 0,
      Cartografía: 0,
      Minutas: 0,
    };
    const porEstado = { TODOS: 0, OFICIAL: 0, BORRADOR: 0 };
    expect(
      paginaDeDocumentosApi({
        data: [],
        meta: { page: 1, limit: 10, total: 0, totalPages: 0, porCategoria, porEstado },
      }),
    ).toEqual({
      items: [],
      total: 0,
      pagina: 1,
      paginas: 1,
      porPagina: 10,
      porCategoria,
      porEstado,
    });
    const d = doc("decreto", {
      descargaUrl: "https://api.test/api/v1/portal/documents/decreto/download",
    });
    const r = paginaDeDocumentosApi({
      data: [d],
      meta: { page: 2, limit: 10, total: 11, totalPages: 2, porCategoria, porEstado },
    });
    expect(r).toMatchObject({ pagina: 2, paginas: 2, total: 11 });
    expect(r.items[0]!.descargaUrl).toMatch(/\/download$/);
  });
});
