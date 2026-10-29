import { describe, expect, it } from "vitest";
import { conActual, enLista, soloDeLista } from "./catalogos";

describe("desplegables administrados por la alcaldía (R16)", () => {
  const vigentes = ["Catedral", "El Cují"];

  it("compara sin importar mayúsculas ni espacios", () => {
    expect(enLista(vigentes, " el cují ")).toBe(true);
    expect(enLista(vigentes, "Cabudare")).toBe(false);
    expect(enLista(vigentes, undefined)).toBe(false);
  });

  it("conserva el valor que la persona ya tenía aunque se haya desactivado", () => {
    expect(conActual(vigentes, "Tamaca")).toEqual(["Catedral", "El Cují", "Tamaca"]);
    expect(conActual(vigentes, "Catedral")).toEqual(vigentes);
    expect(conActual(vigentes)).toEqual(vigentes);
  });

  it("descarta del filtro un valor que no está en la lista", () => {
    expect(soloDeLista({ parroquia: "Cabudare", q: "x" }, "parroquia", vigentes)).toEqual({
      parroquia: undefined,
      q: "x",
    });
    expect(soloDeLista({ parroquia: "Catedral" }, "parroquia", vigentes).parroquia).toBe(
      "Catedral",
    );
  });
});
