import type { PostFormat } from "@/lib/api/types";

/*
 * Acomodo del mosaico de noticias. Cada formato tiene un tamaño base (en celdas); las piezas
 * se apilan en orden sobre el punto más bajo y, al final, se estiran las vecinas para nivelar
 * el borde. El mosaico queda siempre como un rectángulo completo, sin espacios en blanco.
 */

export const TAMANO_BASE: Record<PostFormat, { w: number; h: number }> = {
  GALERIA: { w: 2, h: 2 },
  IMAGEN: { w: 1, h: 2 },
  TEXTO: { w: 2, h: 1 },
  DOCUMENTO: { w: 1, h: 1 },
};

/** Posición en la retícula, con columnas y filas desde 1 como en CSS. */
export type Celda = { col: number; row: number; w: number; h: number };

export function acomodarMosaico(formatos: PostFormat[], columnas: number): Celda[] {
  const ocupado: boolean[][] = [];
  const libre = (r: number, c: number) => c >= 0 && c < columnas && !ocupado[r]?.[c];
  const marcar = ({ col, row, w, h }: Celda) => {
    for (let r = row; r < row + h; r++) {
      ocupado[r] ??= [];
      for (let c = col; c < col + w; c++) ocupado[r]![c] = true;
    }
  };

  // 1. Acomodo tipo «horizonte»: cada pieza se apoya en el tramo más bajo (el de más a la
  //    izquierda si hay empate). Si el tramo es más angosto que la pieza, la pieza se angosta
  //    para caber: así nunca quedan huecos encerrados debajo de otra pieza.
  const alturas = Array<number>(columnas).fill(0);
  const celdas: Celda[] = formatos.map((f) => {
    const minima = Math.min(...alturas);
    const col = alturas.indexOf(minima);
    let ancho = 1;
    while (col + ancho < columnas && alturas[col + ancho] === minima) ancho++;
    const celda = {
      col,
      row: minima,
      w: Math.min(TAMANO_BASE[f].w, ancho),
      h: TAMANO_BASE[f].h,
    };
    for (let c = col; c < col + celda.w; c++) alturas[c] = minima + celda.h;
    marcar(celda);
    return celda;
  });

  // 2. Relleno de huecos: para cada celda libre se estira una pieza vecina siempre que la
  //    franja que gana esté libre entera. Se prefiere lo que menos deforma: las piezas de una
  //    columna crecen hacia abajo y las de una fila hacia la derecha.
  const filas = () => Math.max(0, ...celdas.map((c) => c.row + c.h));
  const en = (r: number, c: number) =>
    celdas.find((x) => r >= x.row && r < x.row + x.h && c >= x.col && c < x.col + x.w);
  const franjaLibre = (r0: number, r1: number, c0: number, c1: number) => {
    if (r0 < 0 || c0 < 0 || c1 > columnas) return false;
    for (let r = r0; r < r1; r++) for (let c = c0; c < c1; c++) if (!libre(r, c)) return false;
    return true;
  };

  function estirar(r: number, c: number) {
    const arriba = en(r - 1, c);
    const izquierda = en(r, c - 1);
    const abajo = en(r + 1, c);
    const derecha = en(r, c + 1);
    const opciones: [Celda | undefined, () => boolean, (x: Celda) => void][] = [
      [arriba, () => arriba!.w === 1, (x) => (x.h += 1)],
      [izquierda, () => izquierda!.h === 1, (x) => (x.w += 1)],
      [
        arriba,
        () => franjaLibre(r, r + 1, arriba!.col, arriba!.col + arriba!.w),
        (x) => (x.h += 1),
      ],
      [
        izquierda,
        () => franjaLibre(izquierda!.row, izquierda!.row + izquierda!.h, c, c + 1),
        (x) => (x.w += 1),
      ],
      [
        abajo,
        () => abajo!.row === r + 1 && franjaLibre(r, r + 1, abajo!.col, abajo!.col + abajo!.w),
        (x) => ((x.row -= 1), (x.h += 1)),
      ],
      [
        derecha,
        () =>
          derecha!.col === c + 1 && franjaLibre(derecha!.row, derecha!.row + derecha!.h, c, c + 1),
        (x) => ((x.col -= 1), (x.w += 1)),
      ],
    ];
    for (const [pieza, puede, aplicar] of opciones) {
      // La pieza debe tocar el hueco por su borde (no basta con estar en la fila o columna).
      if (!pieza || !puede()) continue;
      const toca =
        (pieza === arriba && pieza.row + pieza.h === r) ||
        (pieza === izquierda && pieza.col + pieza.w === c) ||
        pieza === abajo ||
        pieza === derecha;
      if (!toca) continue;
      aplicar(pieza);
      marcar(pieza);
      return true;
    }
    return false;
  }

  let cambio = true;
  while (cambio) {
    cambio = false;
    for (let r = 0; r < filas() && !cambio; r++)
      for (let c = 0; c < columnas && !cambio; c++) if (libre(r, c)) cambio = estirar(r, c);
  }

  return celdas.map(({ col, row, w, h }) => ({ col: col + 1, row: row + 1, w, h }));
}
