import { describe, expect, it } from "vitest";
import { ENCABEZADO_INICIAL, fotoDelEncabezado, iniciales, urlLicencia } from "./sitio";

/* Datos del sitio y encabezado del Inicio (R17): lo que el portal arma con lo que da la API. */

describe("encabezado y alcalde", () => {
  it("arma el enlace de la licencia por su nombre", () => {
    expect(urlLicencia("CC BY-SA 4.0")).toBe(
      "https://creativecommons.org/licenses/by-sa/4.0/deed.es",
    );
    expect(urlLicencia("CC BY 2.0")).toBe("https://creativecommons.org/licenses/by/2.0/deed.es");
    expect(urlLicencia("CC0 1.0")).toBe(
      "https://creativecommons.org/publicdomain/zero/1.0/deed.es",
    );
    expect(urlLicencia("Todos los derechos reservados")).toBeUndefined();
  });

  it("una foto sin crédito es de la alcaldía; con crédito, lleva autor, licencia y fuente", () => {
    expect(fotoDelEncabezado({ src: "/a.jpg", alt: "Plaza", ancho: 10, alto: 10 })).toMatchObject({
      autor: undefined,
      licencia: undefined,
      fuente: undefined,
    });
    const f = fotoDelEncabezado(ENCABEZADO_INICIAL.fotos[0]!);
    expect(f.autor).toMatch(/Wikimedia Commons/);
    expect(f.licencia?.url).toMatch(/creativecommons\.org/);
    expect(f.posicion).toBe("50% 55%");
  });

  it("las iniciales salen del nombre", () => {
    expect(iniciales("Yanys Agüero")).toBe("YA");
    expect(iniciales("  maría  josé  pérez ")).toBe("MJ");
  });

  it("los valores de hoy traen las 10 fotos con su crédito", () => {
    expect(ENCABEZADO_INICIAL.fotos).toHaveLength(10);
    expect(ENCABEZADO_INICIAL.fotos.every((f) => f.alt && f.credito?.licencia)).toBe(true);
  });
});
