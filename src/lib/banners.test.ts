import { describe, expect, it } from "vitest";
import type { Banner } from "@/lib/api/types";
import { banners as bannersDemo } from "@/lib/mocks/data";
import { bannersVigentes, estaVigente } from "./banners";

const banner = (id: string, orden: number, vigencia?: Banner["vigencia"]): Banner => ({
  id,
  titulo: id,
  texto: "Texto",
  enlace: { href: "/", etiqueta: "Ir" },
  tono: "rojo",
  orden,
  vigencia,
});

const en = (iso: string) => Date.parse(iso);

describe("estaVigente", () => {
  it("sin vigencia, siempre se muestra", () => {
    expect(estaVigente(banner("a", 1), en("2020-01-01T00:00:00Z"))).toBe(true);
  });

  it("incluye el día completo de «desde» y «hasta» en hora de Venezuela", () => {
    const b = banner("a", 1, { desde: "2026-10-10", hasta: "2026-10-20" });
    // 9 de octubre a las 23:59 en Caracas (03:59 UTC del 10): todavía no.
    expect(estaVigente(b, en("2026-10-10T03:59:00Z"))).toBe(false);
    expect(estaVigente(b, en("2026-10-10T04:00:00Z"))).toBe(true);
    // 20 de octubre a las 23:59 en Caracas (03:59 UTC del 21): aún vigente.
    expect(estaVigente(b, en("2026-10-21T03:59:00Z"))).toBe(true);
    expect(estaVigente(b, en("2026-10-21T04:00:00Z"))).toBe(false);
  });

  it("acepta un solo extremo y fechas con hora", () => {
    const ahora = en("2026-10-18T12:00:00Z");
    expect(estaVigente(banner("a", 1, { desde: "2026-10-01" }), ahora)).toBe(true);
    expect(estaVigente(banner("a", 1, { hasta: "2026-10-17" }), ahora)).toBe(false);
    expect(estaVigente(banner("a", 1, { hasta: "2026-10-18T11:00:00Z" }), ahora)).toBe(false);
    expect(estaVigente(banner("a", 1, { desde: "2026-10-18T11:00:00Z" }), ahora)).toBe(true);
  });
});

describe("bannersVigentes", () => {
  it("quita los vencidos y los futuros y ordena por «orden»", () => {
    const ahora = en("2026-10-18T12:00:00Z");
    const lista = [
      banner("tercero", 3),
      banner("vencido", 0, { hasta: "2026-09-30" }),
      banner("primero", 1, { desde: "2026-10-01", hasta: "2026-10-31" }),
      banner("futuro", 2, { desde: "2026-11-01" }),
      banner("segundo", 2),
    ];
    expect(bannersVigentes(lista, ahora).map((b) => b.id)).toEqual([
      "primero",
      "segundo",
      "tercero",
    ]);
    // No modifica la lista original.
    expect(lista[0]?.id).toBe("tercero");
  });

  it("los banners de ejemplo tienen orden único", () => {
    const ordenes = bannersDemo.map((b) => b.orden);
    expect(new Set(ordenes).size).toBe(ordenes.length);
  });
});
