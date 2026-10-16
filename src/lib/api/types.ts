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

export type Imagen = {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  /** Autor y licencia; obligatorio cuando la imagen no es propia de la Alcaldía. */
  credito?: { autor: string; licencia: string; fuente: string };
};

export type Adjunto = {
  nombre: string;
  url: string;
  tipo: "application/pdf";
  pesoBytes: number;
  paginas?: number;
};

/**
 * Formatos en que la Alcaldía publica noticias y banners:
 * solo texto, con una imagen, con varias imágenes o con un documento adjunto.
 */
export const FORMATOS = ["TEXTO", "IMAGEN", "GALERIA", "DOCUMENTO"] as const;
export type PostFormat = (typeof FORMATOS)[number];

export type BannerTone = "rojo" | "tinta" | "calido";

export type Banner = {
  id: string;
  titulo: string;
  texto: string;
  enlace: { href: string; etiqueta: string };
  tono: BannerTone;
  /** Con imagen, el banner la muestra de fondo con un velo para el contraste. */
  imagen?: Imagen;
};

export const CATEGORIAS = ["Avances", "Minutas", "Comunicados", "Entrevistas", "Galería"] as const;
export type PostCategory = (typeof CATEGORIAS)[number];

export type PostSummary = {
  slug: string;
  titulo: string;
  resumen: string;
  categoria: PostCategory;
  formato: PostFormat;
  parroquia?: string;
  /** Fecha ISO de publicación (AAAA-MM-DD). */
  publicadoEl: string;
  /** Primera imagen, para la tarjeta. */
  portada?: Imagen;
  conteoImagenes?: number;
  /** Hasta 3 imágenes para el collage de una galería en el listado. */
  miniaturas?: Imagen[];
  /** Datos del adjunto para descargarlo desde el listado sin abrir la noticia. */
  adjunto?: Pick<Adjunto, "url" | "pesoBytes" | "paginas">;
};

export type Post = Omit<PostSummary, "adjunto"> & {
  /** HTML del editor; se sanea en el servidor antes de mostrarlo. */
  cuerpo: string;
  imagenes: Imagen[];
  adjunto?: Adjunto;
  autor?: string;
  actualizadoEl?: string;
};

export type FiltrosNoticias = {
  q?: string;
  categoria?: PostCategory;
  formato?: PostFormat;
  desde?: string;
  hasta?: string;
  pagina: number;
};

export type Pagina<T> = {
  items: T[];
  total: number;
  pagina: number;
  paginas: number;
  porPagina: number;
};

/** Listado de noticias: además de la página, cuántas hay de cada formato con los demás filtros. */
export type PaginaNoticias = Pagina<PostSummary> & {
  porFormato: Record<PostFormat, number> & { TODOS: number };
};
