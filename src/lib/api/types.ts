/** Tipos que hoy llenan los datos de ejemplo y mañana la API (vía BFF). */

/** Estado de cada fase tal como lo comunica la Alcaldía. */
export const ESTADOS_FASE = [
  "COMPLETADO",
  "EN_CURSO",
  "PENDIENTE",
  "PROXIMAMENTE",
  "FUTURO",
] as const;
export type EstadoFase = (typeof ESTADOS_FASE)[number];

export type ProcessPhase = {
  id: string;
  nombre: string;
  descripcion: string;
  estado: EstadoFase;
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
  /** Foto de archivo que no corresponde al hecho narrado; se rotula «Foto ilustrativa». */
  ilustrativa?: boolean;
};

export type Adjunto = {
  nombre: string;
  url: string;
  tipo: "application/pdf";
  pesoBytes: number;
  paginas?: number;
};

/**
 * Video de una noticia: un archivo subido desde el admin (MP4 o WebM), un enlace de YouTube
 * (se carga solo al pulsar reproducir, sin cookies) o una publicación de Instagram (se abre
 * en otra pestaña; el portal no carga scripts de Instagram).
 */
export type Video = {
  fuente: "ARCHIVO" | "YOUTUBE" | "INSTAGRAM";
  /** URL del archivo, o la URL de YouTube (watch, youtu.be o shorts). */
  url: string;
  /** Imagen de portada; también es la de la tarjeta en el listado. */
  portada?: Imagen;
  duracionSeg?: number;
  /** Subtítulos en WebVTT, para quien no puede escuchar el audio. */
  subtitulos?: string;
};

/**
 * Formatos en que la Alcaldía publica noticias y banners: solo texto, con una imagen,
 * con varias imágenes, con un documento adjunto o con un video.
 */
export const FORMATOS = ["TEXTO", "IMAGEN", "GALERIA", "DOCUMENTO", "VIDEO"] as const;
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
  /** Posición en el carrusel, de menor a mayor (el Operador la cambia arrastrando). */
  orden: number;
  /**
   * Fechas entre las que se muestra, ambas incluidas. «AAAA-MM-DD» (día completo en hora de
   * Venezuela) o fecha y hora ISO. Sin una de ellas, el banner no tiene ese límite.
   */
  vigencia?: { desde?: string; hasta?: string };
};

/**
 * Catálogo de categorías de noticias, según la Propuesta v4 (en producción lo administra el
 * Operador desde el admin). «Decretos y normativas» y «Normativa» vienen así del cliente.
 */
export const CATEGORIAS = [
  "Análisis institucional",
  "Doctrina legal",
  "Decretos y normativas",
  "Normativa",
  "Mensaje institucional",
  "Auditoría y diagnóstico",
  "Mesas de trabajo",
  "Despliegue territorial",
  "Visión de futuro",
] as const;
export type PostCategory = (typeof CATEGORIAS)[number];

/* ---------- Catálogos de participación y perfil (Propuesta v3, formularios 1 a 3) ---------- */

/** Las 10 parroquias del Municipio Iribarren. */
export const PARROQUIAS = [
  "Concepción",
  "Catedral",
  "El Cují",
  "Tamaca",
  "Ana Soto",
  "Santa Rosa",
  "Unión",
  "Juárez",
  "Buena Vista",
  "Águedo Felipe Alvarado",
] as const;
export type Parroquia = (typeof PARROQUIAS)[number];

/** Categorías técnicas del plan para clasificar opiniones y propuestas. */
export const CATEGORIAS_TECNICAS = [
  "Zonificación y Uso de Suelo",
  "Servicios Públicos y Redes",
  "Vialidad y Transporte",
  "Equipamiento Urbano",
  "Medio Ambiente y Riesgos",
  "Patrimonio y Renovación Urbana",
] as const;
export type CategoriaTecnica = (typeof CATEGORIAS_TECNICAS)[number];

export const OCUPACIONES = [
  "Comerciante",
  "Profesional Independiente",
  "Estudiante",
  "Empleado Público",
  "Empleado Privado",
  "Ama de Casa",
  "Jubilado/Pensionado",
  "Otro",
] as const;

/** En qué condición actúa quien completa el perfil de una organización. */
export const CONDICIONES_REPRESENTANTE = [
  "Representante legal",
  "Vocero o vocera oficial",
  "Persona autorizada para actuar en nombre de la organización",
  "Persona de contacto institucional, sin representación legal",
  "Otro",
] as const;

/** ¿Tiene un documento que acredite su condición? */
export const ACREDITACION_REPRESENTANTE = ["Sí", "No", "No aplica"] as const;

/**
 * Estado de verificación del perfil: PENDIENTE mientras está incompleto y VERIFICADO en cuanto
 * se completa (automático). RECHAZADO lo pone el admin y bloquea el envío de aportes.
 */
export const ESTADOS_VERIFICACION = ["PENDIENTE", "VERIFICADO", "RECHAZADO"] as const;
export type EstadoVerificacion = (typeof ESTADOS_VERIFICACION)[number];

export const TIPOS_PARTICIPACION = [
  "OPINION_GENERAL",
  "OPINION_NOTICIA",
  "PROPUESTA_FORMAL",
] as const;
export type TipoParticipacion = (typeof TIPOS_PARTICIPACION)[number];

export const NOMBRE_TIPO_PARTICIPACION: Record<TipoParticipacion, string> = {
  OPINION_GENERAL: "Opinión general",
  OPINION_NOTICIA: "Opinión sobre una noticia",
  PROPUESTA_FORMAL: "Propuesta formal",
};

/** Ciclo de vida de una participación (v3, sección 5.1). */
export const ESTADOS_PARTICIPACION = [
  "PENDIENTE",
  "EN_REVISION",
  "APROBADA",
  "RECHAZADA",
  "PUBLICADA",
] as const;
export type EstadoParticipacion = (typeof ESTADOS_PARTICIPACION)[number];

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
  /** «Destacada en portada»: el Inicio la muestra antes que las demás. */
  destacada?: boolean;
  /** Contenido de ejemplo de la maqueta: se rotula «Ejemplo» y nunca va a la portada. */
  ejemplo?: boolean;
  /** Duración del video, para la insignia de la tarjeta. */
  duracionSeg?: number;
  /** Datos del adjunto para descargarlo desde el listado sin abrir la noticia. */
  adjunto?: Pick<Adjunto, "url" | "pesoBytes" | "paginas">;
};

/** «Puntos de análisis» de la plantilla de noticias: pares título → explicación. */
export type PuntosAnalisis = {
  titulo?: string;
  items: { titulo: string; texto: string }[];
};

export type Post = Omit<PostSummary, "adjunto"> & {
  puntos?: PuntosAnalisis;
  /** Botón opcional al final de la noticia. */
  boton?: { texto: string; href: string };
  /** HTML del editor; se sanea en el servidor antes de mostrarlo. */
  cuerpo: string;
  imagenes: Imagen[];
  adjunto?: Adjunto;
  video?: Video;
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

/* ---------- Repositorio documental ---------- */

export const DOC_CATEGORIAS = [
  "Decretos y normativa",
  "Plan de trabajo",
  "Informes técnicos",
  "Cartografía",
  "Minutas",
] as const;
export type DocCategory = (typeof DOC_CATEGORIAS)[number];

/** Estado administrativo del documento: borrador de trabajo o documento oficializado. */
export const DOC_ESTADOS = ["OFICIAL", "BORRADOR"] as const;
export type DocEstado = (typeof DOC_ESTADOS)[number];

export type VersionDocumento = { version: string; fecha: string; nota: string };

export type Documento = {
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: DocCategory;
  estado: DocEstado;
  /** Versión vigente, p. ej. «1.2». */
  version: string;
  publicadoEl: string;
  actualizadoEl?: string;
  archivo: Adjunto;
  /** Historial, de la más reciente a la más antigua (la primera es la vigente). */
  versiones: VersionDocumento[];
};

export type FiltrosDocumentos = {
  q?: string;
  categoria?: DocCategory;
  estado?: DocEstado;
  pagina: number;
};

/** Listado de documentos con los conteos que muestran los filtros. */
export type PaginaDocumentos = Pagina<Documento> & {
  porCategoria: Record<DocCategory, number> & { TODAS: number };
  porEstado: Record<DocEstado, number> & { TODOS: number };
};
