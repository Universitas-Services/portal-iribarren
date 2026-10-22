/*
 * Campaña «Barquisimeto suena en ti» de la Alcaldía de Iribarren (22-10-2026). El portal la
 * promociona con una tarjeta en el inicio y un banner dentro del contenido. Las piezas (logo,
 * ilustración y cinta «suena en ti») las entregó el cliente y están en `public/campana/`.
 */
export const CAMPANA = {
  url: "https://www.barquisimetosuenaenti.com/",
  nombre: "Barquisimeto suena en ti",
  /** Ilustración de la ciudad con la palabra BARQUISIMETO (2395 × 886). */
  ilustracion: "/campana/barquisimeto.svg",
  /** Cinta «SUENA EN TI» (1593 × 241). */
  cinta: "/campana/suena-en-ti.svg",
  /** Logo «Barquisimeto suena en ti» sin íconos (1859 × 464). */
  logo: "/campana/barquisimeto-suena-en-ti.png",
} as const;
