import type { Banner, PostSummary, ProcessStatus } from "@/lib/api/types";

/**
 * Datos de ejemplo. Las fases son las oficiales; la fase actual, las noticias y los banners
 * son ilustrativos y se reemplazan por los de la API.
 */

export const processStatus: ProcessStatus = {
  fases: [
    {
      id: "decreto",
      nombre: "Decreto del alcalde",
      descripcion: "El Decreto 48-2026 activa la formulación del nuevo PDUL.",
    },
    {
      id: "plan-trabajo",
      nombre: "Aprobación del plan de trabajo",
      descripcion: "Se aprueba la ruta técnica, el equipo y el cronograma.",
    },
    {
      id: "diagnostico",
      nombre: "Diagnóstico",
      descripcion: "Levantamos cómo está la ciudad hoy, parroquia por parroquia.",
    },
    {
      id: "formulacion",
      nombre: "Formulación",
      descripcion: "Las propuestas técnicas y ciudadanas se convierten en plan.",
    },
    {
      id: "consulta",
      nombre: "Consulta pública",
      descripcion: "60 días para revisar el borrador y presentar observaciones.",
    },
    {
      id: "camara",
      nombre: "Aprobación en Cámara",
      descripcion: "El Concejo Municipal discute y sanciona la ordenanza.",
    },
    {
      id: "vigencia",
      nombre: "Vigencia",
      descripcion: "El plan rige el crecimiento de la ciudad.",
    },
  ],
  faseActual: 2,
  ejemplo: true,
};

export const banners: Banner[] = [
  {
    id: "registro-actores",
    titulo: "Abrimos el Registro municipal de actores",
    texto:
      "Comunas, consejos comunales, gremios, universidades y el sector productivo: inscribe a tu organización y sé parte del plan.",
    enlace: { href: "/registro", etiqueta: "Inscribir mi organización" },
    tono: "rojo",
  },
  {
    id: "propuestas-abiertas",
    titulo: "Tu propuesta ya puede llegar al plan",
    texto:
      "Antes de la consulta pública formal ya recibimos opiniones y propuestas. Cada una recibe su folio y una respuesta.",
    enlace: { href: "/participa", etiqueta: "Enviar una propuesta" },
    tono: "calido",
  },
  {
    id: "documentos",
    titulo: "Consulta los documentos del PDUL",
    texto: "Decreto, plan de trabajo e informes técnicos, en PDF y al alcance de cualquiera.",
    enlace: { href: "/documentos", etiqueta: "Ver el repositorio" },
    tono: "tinta",
  },
];

export const posts: PostSummary[] = [
  {
    slug: "arranca-diagnostico-parroquias",
    titulo: "Arranca el diagnóstico urbano en las nueve parroquias",
    resumen:
      "Los equipos técnicos recorren cada parroquia para levantar el estado de la vialidad, los servicios y el uso del suelo.",
    categoria: "Avances",
    parroquia: "Todas las parroquias",
    publicadoEl: "2026-10-14",
  },
  {
    slug: "mesa-tecnica-catedral",
    titulo: "Mesa técnica con consejos comunales de Catedral",
    resumen: "Vecinos y voceros priorizaron movilidad y espacios públicos del centro histórico.",
    categoria: "Minutas",
    parroquia: "Catedral",
    publicadoEl: "2026-10-10",
  },
  {
    slug: "universidades-se-suman",
    titulo: "Las universidades de Lara se suman al PDUL",
    resumen:
      "UCLA, UPTAEB y UNEXPO acompañarán el diagnóstico con estudios de suelo, riesgo y movilidad.",
    categoria: "Comunicados",
    publicadoEl: "2026-10-07",
  },
];
