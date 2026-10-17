import { describe, expect, it } from "vitest";
import type { PostFormat } from "@/lib/api/types";
import { acomodarMosaico, type Celda } from "./mosaico";

/** Comprueba que las piezas no se pisan y cubren un rectángulo completo, sin huecos. */
function sinHuecos(celdas: Celda[], columnas: number) {
  const filas = Math.max(...celdas.map((c) => c.row + c.h - 1));
  const mapa = Array.from({ length: filas }, () => Array<number>(columnas).fill(0));
  for (const { col, row, w, h } of celdas)
    for (let r = row - 1; r < row - 1 + h; r++)
      for (let c = col - 1; c < col - 1 + w; c++) mapa[r]![c]! += 1;
  return mapa.every((fila) => fila.every((n) => n === 1));
}

const LISTADO: PostFormat[] = [
  "IMAGEN",
  "DOCUMENTO",
  "TEXTO",
  "GALERIA",
  "DOCUMENTO",
  "TEXTO",
  "IMAGEN",
  "TEXTO",
  "IMAGEN",
];

describe("acomodarMosaico", () => {
  it("respeta el tamaño base de cada formato cuando no hay huecos", () => {
    const [galeria, documento] = acomodarMosaico(["GALERIA", "DOCUMENTO", "DOCUMENTO"], 4);
    expect(galeria).toEqual({ col: 1, row: 1, w: 2, h: 2 });
    expect(documento).toMatchObject({ col: 3, row: 1, w: 1 });
  });

  it.each([4, 2])("cubre todo el mosaico sin huecos con %i columnas", (columnas) => {
    expect(sinHuecos(acomodarMosaico(LISTADO, columnas), columnas)).toBe(true);
  });

  it("no deja huecos con combinaciones difíciles", () => {
    const casos: PostFormat[][] = [
      ["TEXTO", "TEXTO", "IMAGEN"],
      ["IMAGEN", "IMAGEN", "IMAGEN"],
      ["GALERIA", "TEXTO", "TEXTO", "IMAGEN", "DOCUMENTO"],
      ["DOCUMENTO"],
      ["TEXTO", "GALERIA", "IMAGEN", "IMAGEN", "IMAGEN", "TEXTO", "DOCUMENTO"],
    ];
    for (const caso of casos) {
      expect(sinHuecos(acomodarMosaico(caso, 4), 4)).toBe(true);
      expect(sinHuecos(acomodarMosaico(caso, 2), 2)).toBe(true);
    }
  });

  it("no deja huecos en 500 listados pseudoaleatorios", () => {
    const formatos: PostFormat[] = ["TEXTO", "IMAGEN", "GALERIA", "DOCUMENTO", "VIDEO"];
    let semilla = 42;
    const azar = () => (semilla = (semilla * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 500; i++) {
      const caso = Array.from(
        { length: 1 + Math.floor(azar() * 12) },
        () => formatos[Math.floor(azar() * formatos.length)]!,
      );
      expect(sinHuecos(acomodarMosaico(caso, 4), 4), caso.join(",")).toBe(true);
      expect(sinHuecos(acomodarMosaico(caso, 2), 2), caso.join(",")).toBe(true);
    }
  });

  it("en dos columnas una galería ocupa todo el ancho", () => {
    expect(acomodarMosaico(["GALERIA"], 2)[0]).toEqual({ col: 1, row: 1, w: 2, h: 2 });
  });
});
