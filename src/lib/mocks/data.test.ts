import { describe, expect, it } from "vitest";
import { CATEGORIAS } from "@/lib/api/types";
import { documentos, posts, processStatus } from "./data";

/** Los datos de ejemplo deben respetar lo que dice la Propuesta v3 del cliente. */
describe("datos alineados con la Propuesta v3", () => {
  it("la fase actual es la única EN_CURSO y las anteriores están completadas", () => {
    const { fases, faseActual } = processStatus;
    expect(fases).toHaveLength(7);
    expect(fases[faseActual]?.estado).toBe("EN_CURSO");
    expect(fases.filter((f) => f.estado === "EN_CURSO")).toHaveLength(1);
    expect(fases.slice(0, faseActual).every((f) => f.estado === "COMPLETADO")).toBe(true);
  });

  it("solo usa parroquias del catálogo oficial de 10", () => {
    const oficiales = [
      "Concepción",
      "Catedral",
      "El Cují",
      "Tamaca",
      "Ana Soto",
      "Santa Rosa",
      "Unión",
      "Juárez",
      "Buena Vista",
      "Águedo Felipe Alvarado",
      "Todas las parroquias",
    ];
    for (const p of posts) if (p.parroquia) expect(oficiales).toContain(p.parroquia);
  });

  it("slugs únicos, categorías válidas y fechas ISO", () => {
    for (const lista of [posts, documentos]) {
      const slugs = lista.map((x) => x.slug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }
    for (const p of posts) {
      expect(CATEGORIAS).toContain(p.categoria);
      expect(p.publicadoEl).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("noticias de la Propuesta v4", () => {
  const reales = posts.filter((p) => !p.ejemplo);

  it("hay 9 noticias reales y las de ejemplo están marcadas", () => {
    expect(reales).toHaveLength(9);
    for (const p of posts.filter((x) => x.ejemplo)) expect(p.cuerpo).toMatch(/ejemplo/i);
  });

  it("las destacadas son las 3 reales más recientes", () => {
    expect(
      reales
        .filter((p) => p.destacada)
        .map((p) => p.slug)
        .sort(),
    ).toEqual(
      [
        "primera-mesa-tecnica-concejo-alcaldia",
        "reunion-auditoria-legal-institucional",
        "vision-de-futuro-conversacion-publica",
      ].sort(),
    );
  });

  it("el nombre del alcalde se escribe «Yanys»", () => {
    for (const p of posts) expect(`${p.titulo} ${p.cuerpo}`).not.toMatch(/Yanis/);
  });
});
