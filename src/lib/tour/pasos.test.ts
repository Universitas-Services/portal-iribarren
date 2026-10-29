import { describe, expect, it } from "vitest";
import { RUTAS_CON_RECORRIDO, paginaDe, recorridoDe } from "./pasos";

describe("recorrido guiado", () => {
  it("cada página tiene sus pasos y termina con los generales", () => {
    for (const ruta of RUTAS_CON_RECORRIDO.filter((r) => !r.includes("["))) {
      const pasos = recorridoDe(ruta, { conSesion: true });
      expect(pasos.length).toBeGreaterThan(3);
      expect(pasos.at(-1)?.objetivo).toEqual(['[data-tour="ayuda"]']);
      for (const p of pasos) expect(p.objetivo?.length).toBeGreaterThan(0);
    }
  });

  it("el primer ingreso empieza con el saludo, sin objetivo", () => {
    const [primero] = recorridoDe("/mi-cuenta", { conSesion: true, bienvenida: true });
    expect(primero?.titulo).toMatch(/bienvenida/);
    expect(primero?.objetivo).toBeUndefined();
  });

  it("las páginas de detalle comparten el recorrido y las demás usan el general", () => {
    expect(paginaDe("/noticias/una-noticia")).toBe("/noticias/[slug]");
    expect(paginaDe("/mi-cuenta/participaciones/IRI-2026-0001")).toBe("/mi-cuenta/participaciones");
    expect(paginaDe("/terminos")).toBeUndefined();
    expect(recorridoDe("/terminos", { conSesion: false }).map((p) => p.titulo)).toEqual([
      "Las secciones del portal",
      "Inicia sesión o regístrate",
      "Este recorrido, cuando quieras",
    ]);
  });
});
