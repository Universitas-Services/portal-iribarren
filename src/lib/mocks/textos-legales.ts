import type { TextoLegal, TipoTextoLegal } from "@/lib/api/types";

/*
 * Textos legales sin la API. El texto definitivo lo prepara el equipo de documentación y pasa por
 * revisión legal: mientras tanto se muestra qué contendrá, marcado como provisional, sin inventar
 * el texto. La versión coincide con la que la API usa hoy (VERSION_TERMINOS).
 */

const lista = (items: string[]) =>
  `<h2>Qué incluirá</h2><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

const BASE: Record<TipoTextoLegal, TextoLegal> = {
  TERMINOS: {
    tipo: "TERMINOS",
    version: "2026-10-17",
    publicadoEl: "2026-10-17T12:00:00.000Z",
    provisional: true,
    html: lista([
      "Qué es el portal PDUL YA y qué trámites no gestiona (son de la DPCU).",
      "Requisitos para crear una cuenta como persona natural u organización.",
      "Cómo se reciben, revisan y responden las opiniones y propuestas, y qué significa el folio.",
      "Por qué un aporte enviado no se puede editar ni eliminar.",
      "Normas de convivencia y motivos para suspender una cuenta.",
    ]),
  },
  POLITICA_DATOS: {
    tipo: "POLITICA_DATOS",
    version: "2026-10-17",
    publicadoEl: "2026-10-17T12:00:00.000Z",
    provisional: true,
    html: lista([
      "Qué datos se piden (identidad, contacto y documentos) y para qué se usan.",
      "Quién puede ver tus documentos: solo el personal revisor de la alcaldía.",
      "Cuándo se muestra tu nombre en un aporte publicado (solo si respondes que sí).",
      "Cuánto tiempo se conservan los datos y cómo solicitar la baja de la cuenta.",
      "Cómo se comparten tus datos entre portales de distintas alcaldías.",
    ]),
  },
};

type Estado = { textos: Record<TipoTextoLegal, TextoLegal> };
const g = globalThis as typeof globalThis & { __textosLegales?: Estado };

/** Versión vigente simulada (vive en memoria del servidor de desarrollo). */
export function textoLegalSimulado(tipo: TipoTextoLegal): TextoLegal {
  g.__textosLegales ??= { textos: { ...BASE } };
  return g.__textosLegales.textos[tipo];
}

/**
 * Solo desarrollo y pruebas E2E: publica una versión nueva simulada, como haría un Administrador
 * desde plataforma-admin, para ver el pedido de aceptar otra vez.
 */
export function publicarTextoLegalSimulado(tipo: TipoTextoLegal, nota: string, ahora = Date.now()) {
  const actual = textoLegalSimulado(tipo);
  const n = Number(actual.version.split("-v")[1] ?? 1) + 1;
  const nuevo: TextoLegal = {
    ...actual,
    version: `${BASE[tipo].version}-v${n}`,
    publicadoEl: new Date(ahora).toISOString(),
    nota,
  };
  g.__textosLegales!.textos[tipo] = nuevo;
  return nuevo;
}

/** Vuelve a las versiones iniciales (limpieza de las pruebas). */
export function reiniciarTextosLegalesSimulados() {
  g.__textosLegales = { textos: { ...BASE } };
}
