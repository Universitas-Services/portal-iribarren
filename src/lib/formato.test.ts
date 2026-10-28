import { describe, expect, it } from "vitest";
import { formatearFecha, formatearFechaLarga } from "./formato";

describe("fechas de las noticias", () => {
  it("acepta el AAAA-MM-DD de los ejemplos", () => {
    expect(formatearFechaLarga("2026-09-14")).toBe("14 de septiembre de 2026");
  });

  it("acepta el ISO completo de la API y lo muestra en la hora de Caracas", () => {
    expect(formatearFechaLarga("2026-10-27T14:00:00.000Z")).toBe("27 de octubre de 2026");
    // 02:00 UTC del 28 todavía es el 27 en Caracas (UTC−4).
    expect(formatearFechaLarga("2026-10-28T02:00:00.000Z")).toBe("27 de octubre de 2026");
    expect(() => formatearFecha("2026-10-27T14:00:00.000Z")).not.toThrow();
  });
});
