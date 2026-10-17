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
