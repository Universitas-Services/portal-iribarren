import type { Foto } from "@/components/home/hero";

/*
 * Datos del sitio y encabezado del Inicio (R17). La alcaldía los edita desde el admin; el portal
 * los lee de plataforma-api (GET /portal/site y GET /portal/home). Sin la API, o si no responde,
 * se muestran los valores de abajo, que son los que el portal tenía fijos.
 */

export type Red = "INSTAGRAM" | "FACEBOOK" | "X" | "YOUTUBE" | "TIKTOK" | "WHATSAPP";

/** Imagen como la guarda el admin (la misma forma de los banners). */
export type ImagenSitio = {
  src: string;
  alt: string;
  ancho: number;
  alto: number;
  credito?: { autor: string; licencia: string; fuente: string };
  /** Encuadre (`object-position`) de las fotos del encabezado. */
  posicion?: string;
};

export type DatosSitio = {
  alcalde: { nombre: string; cargo: string; foto?: ImagenSitio };
  contacto: { correo?: string; telefono?: string; direccion: string; horario?: string };
  redes: { red: Red; usuario: string; url: string }[];
  enlaces: { texto: string; url: string }[];
};

export type EncabezadoInicio = {
  destacado: string;
  titulo: string;
  subtitulo: string;
  fotos: ImagenSitio[];
};

export type IconoSector = "PERSONAS" | "CASCO" | "BIRRETE" | "FABRICA" | "CASA" | "EDIFICIO";

export type ActoresInicio = {
  titulo: string;
  texto: string;
  sectores: { nombre: string; detalle: string; icono: IconoSector }[];
};

/* ---------- Valores de hoy ---------- */

export const SITIO_INICIAL: DatosSitio = {
  alcalde: { nombre: "Yanys Agüero", cargo: "Alcalde de Iribarren" },
  contacto: { direccion: "Palacio Municipal, Barquisimeto" },
  redes: [
    {
      red: "INSTAGRAM",
      usuario: "@alcaldiairibarren",
      url: "https://www.instagram.com/alcaldiairibarren/",
    },
    {
      red: "INSTAGRAM",
      usuario: "@yanysaguerove",
      url: "https://www.instagram.com/yanysaguerove/",
    },
  ],
  enlaces: [
    // Enlaces oficiales pendientes de confirmar con el cliente: los edita la alcaldía (R17).
    { texto: "Decreto 48-2026", url: "/conoce-el-pdul#marco-legal" },
    { texto: "LOOU", url: "/conoce-el-pdul#marco-legal" },
    { texto: "Sentencia N° 928/2018 del TSJ", url: "/conoce-el-pdul#marco-legal" },
  ],
};

const CC = (v: string) => `CC BY-SA ${v}`;
const foto = (
  archivo: string,
  alt: string,
  autor: string,
  licencia: string,
  fuente: string,
  posicion?: string,
): ImagenSitio => ({
  src: `/fotos/${archivo}`,
  alt,
  ancho: 1600,
  alto: 1067,
  credito: { autor, licencia, fuente },
  ...(posicion ? { posicion } : {}),
});

/**
 * Lugares emblemáticos de Barquisimeto, empezando por Plaza Ayacucho. Fotos libres de Wikimedia
 * Commons con su crédito; la alcaldía las reemplaza por fotos oficiales desde el admin.
 */
export const ENCABEZADO_INICIAL: EncabezadoInicio = {
  destacado: "Pensando en grande:",
  titulo: "Construyendo el Barquisimeto del futuro, humano y sostenible",
  subtitulo:
    "Planificación urbana participativa para la ciudad humana. Infórmate, opina y propón: el plan se construye con tu voz.",
  fotos: [
    foto(
      "plaza-ayacucho.jpg",
      "Plaza Ayacucho de Barquisimeto, con la estatua ecuestre al fondo de la avenida arbolada",
      "Rodolfo pimentel, Wikimedia Commons",
      CC("4.0"),
      "https://commons.wikimedia.org/wiki/File:Ayacucho1.jpg",
      "50% 55%",
    ),
    foto(
      "catedral-metropolitana.jpg",
      "Catedral Metropolitana de Barquisimeto, con su torre blanca y techo de cristal",
      "Rube96pinto, Wikimedia Commons",
      CC("4.0"),
      "https://commons.wikimedia.org/wiki/File:Santa_Iglesia_Catedral_Metropolitana,_Catedral_de_Barquisimeto.jpg",
    ),
    foto(
      "obelisco.jpg",
      "El Obelisco de Barquisimeto visto de frente bajo el cielo azul",
      "Miguel Ahiezer Salcedo, Wikimedia Commons",
      CC("3.0"),
      "https://commons.wikimedia.org/wiki/File:Obelisco_de_barquisimeto_vista_frontal.jpg",
      "50% 40%",
    ),
    foto(
      "iglesia-el-cristo.jpg",
      "Interior de la Basílica del Santo Cristo de la Gracia, con sus bóvedas y vitrales de colores",
      "Male3285, Wikimedia Commons",
      CC("3.0"),
      "https://commons.wikimedia.org/wiki/File:Iglesia_el_Cristo.jpg",
      "50% 45%",
    ),
    foto(
      "manto-divina-pastora-hero.jpg",
      "Silueta del Monumento Mariano Manto de la Divina Pastora contra un atardecer naranja",
      "José Ocanto, Wikimedia Commons (recorte)",
      CC("4.0"),
      "https://commons.wikimedia.org/wiki/File:Monumento_Manto_1.jpg",
      "50% 100%",
    ),
    foto(
      "flor-de-venezuela.jpg",
      "La Flor de Venezuela, estructura de pétalos metálicos en Barquisimeto",
      "Miguel Ahiezer Salcedo, Wikimedia Commons",
      CC("3.0"),
      "https://commons.wikimedia.org/wiki/File:Flor_de_Venezuela_(Barquisimeto).jpg",
      "50% 50%",
    ),
    foto(
      "estadio-gradas.jpg",
      "Gradas techadas del Estadio Antonio Herrera Gutiérrez con público, bajo un cielo azul con nubes",
      "Rodolfo pimentel, Wikimedia Commons (invertida)",
      CC("4.0"),
      "https://commons.wikimedia.org/wiki/File:LAS_GRADAS.jpg",
      "100% 45%",
    ),
    foto(
      "parque-cardenalito.jpg",
      "La tinaja del Parque El Cardenalito iluminada al anochecer, con la luna creciente",
      "Angel Pérez Santamaria, Wikimedia Commons",
      "CC0 1.0",
      "https://commons.wikimedia.org/wiki/File:Parque_Cardenalito.jpg",
      "70% 60%",
    ),
    foto(
      "iglesia-santa-rosa.jpg",
      "Fachada de la Iglesia de Santa Rosa en Barquisimeto",
      "Jesús David Ríos (Flickr), Wikimedia Commons",
      CC("2.0"),
      "https://commons.wikimedia.org/wiki/File:Iglesia_de_Santa_Rosa_1.jpg",
      "50% 40%",
    ),
    foto(
      "teatro-juares.jpg",
      "Fachada del Teatro Juares en el centro de Barquisimeto",
      "Wilfredor, Wikimedia Commons",
      CC("3.0"),
      "https://commons.wikimedia.org/wiki/File:Teatro_Juares.jpg",
      "50% 50%",
    ),
  ],
};

export const ACTORES_INICIAL: ActoresInicio = {
  titulo: "La ciudad que planificamos juntos.",
  texto:
    "El Registro municipal de actores reúne a los cinco sectores convocados por el Decreto 48-2026. Inscríbete como organización o participa como vecino.",
  sectores: [
    {
      nombre: "Poder Popular",
      detalle: "Comunas, consejos comunales, Comités de Tierras Urbanas y mesas técnicas.",
      icono: "PERSONAS",
    },
    {
      nombre: "Gremios técnicos y profesionales",
      detalle: "Ingenieros, arquitectos, abogados y economistas.",
      icono: "CASCO",
    },
    {
      nombre: "Sector académico y científico",
      detalle: "UCLA, UPTAEB, UNEXPO, UFT, UNEFA, UBV y más.",
      icono: "BIRRETE",
    },
    {
      nombre: "Sector económico y productivo",
      detalle: "Cámaras, PyMEs y COMDIBAR.",
      icono: "FABRICA",
    },
    {
      nombre: "Ciudadanía en general",
      detalle: "Vecinas y vecinos domiciliados en Iribarren.",
      icono: "CASA",
    },
  ],
};

/* ---------- Del formato de la API al de los componentes ---------- */

/** Enlace de la licencia Creative Commons por su nombre («CC BY-SA 4.0», «CC0 1.0»). */
export function urlLicencia(nombre: string): string | undefined {
  const cc0 = /^CC0\s*1\.0$/i.test(nombre.trim());
  if (cc0) return "https://creativecommons.org/publicdomain/zero/1.0/deed.es";
  const m = /^CC\s+(BY(?:-(?:SA|NC|ND))*)\s+(\d\.\d)$/i.exec(nombre.trim());
  return m
    ? `https://creativecommons.org/licenses/${m[1]!.toLowerCase()}/${m[2]}/deed.es`
    : undefined;
}

/** Una foto del encabezado como la usa el carrusel; sin crédito, es de la alcaldía. */
export const fotoDelEncabezado = (i: ImagenSitio): Foto => ({
  src: i.src,
  alt: i.alt,
  autor: i.credito?.autor || undefined,
  licencia: i.credito?.licencia
    ? { nombre: i.credito.licencia, url: urlLicencia(i.credito.licencia) }
    : undefined,
  fuente: i.credito?.fuente || undefined,
  posicion: i.posicion,
});

/** Iniciales para la tarjeta del alcalde cuando no hay foto («Yanys Agüero» → «YA»). */
export const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
