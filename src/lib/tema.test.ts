import { describe, expect, it } from "vitest";
import { SCRIPT_TEMA, preferenciaDe, temaEfectivo } from "./tema";

/* Tema del portal: la preferencia guardada en el navegador y el tema que se ve. */

describe("tema", () => {
  it("sin preferencia o con un valor desconocido, claro", () => {
    expect(preferenciaDe(null)).toBe("claro");
    expect(preferenciaDe("morado")).toBe("claro");
    expect(preferenciaDe("oscuro")).toBe("oscuro");
    expect(preferenciaDe("sistema")).toBe("sistema");
  });

  it("«sistema» sigue al dispositivo; las otras, a la persona", () => {
    expect(temaEfectivo("sistema", true)).toBe("oscuro");
    expect(temaEfectivo("sistema", false)).toBe("claro");
    expect(temaEfectivo("claro", true)).toBe("claro");
    expect(temaEfectivo("oscuro", false)).toBe("oscuro");
  });

  it("el script del <head> aplica la misma regla", () => {
    const correr = (guardado: string | null, sistemaOscuro: boolean) => {
      const atributos: Record<string, string> = {};
      new Function("localStorage", "matchMedia", "document", SCRIPT_TEMA)(
        { getItem: () => guardado },
        () => ({ matches: sistemaOscuro }),
        { documentElement: { setAttribute: (k: string, v: string) => (atributos[k] = v) } },
      );
      return atributos["data-tema"];
    };
    expect(correr(null, true)).toBe("claro");
    expect(correr("oscuro", false)).toBe("oscuro");
    expect(correr("sistema", true)).toBe("oscuro");
    expect(correr("sistema", false)).toBe("claro");
    // Sin acceso a localStorage no falla: queda el claro del servidor.
    expect(() =>
      new Function("localStorage", "matchMedia", "document", SCRIPT_TEMA)(
        {
          getItem: () => {
            throw new Error("bloqueado");
          },
        },
        () => ({ matches: false }),
        {},
      ),
    ).not.toThrow();
  });
});
