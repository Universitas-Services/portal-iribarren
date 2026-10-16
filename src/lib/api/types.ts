/** Tipos que hoy llenan los datos de ejemplo y mañana la API (vía BFF). */

export type ProcessPhase = {
  id: string;
  nombre: string;
  descripcion: string;
};

export type ProcessStatus = {
  fases: ProcessPhase[];
  /** Índice (0-based) de la fase en curso. */
  faseActual: number;
  /** true mientras los datos sean de ejemplo. */
  ejemplo: boolean;
};

export type BannerTone = "rojo" | "tinta" | "calido";

export type Banner = {
  id: string;
  titulo: string;
  texto: string;
  enlace: { href: string; etiqueta: string };
  tono: BannerTone;
};

export type PostCategory = "Avances" | "Minutas" | "Comunicados" | "Entrevistas" | "Galería";

export type PostSummary = {
  slug: string;
  titulo: string;
  resumen: string;
  categoria: PostCategory;
  parroquia?: string;
  /** Fecha ISO de publicación. */
  publicadoEl: string;
};
