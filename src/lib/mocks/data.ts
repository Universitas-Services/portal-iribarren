import type { Banner, Imagen, Post, ProcessStatus } from "@/lib/api/types";

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

/** Fotos libres de Wikimedia Commons; el crédito se muestra junto a cada una. */
const FOTOS = {
  catedral: {
    src: "/fotos/catedral-metropolitana.jpg",
    alt: "Catedral Metropolitana de Barquisimeto, con su torre blanca y techo de cristal",
    ancho: 2400,
    alto: 1613,
    credito: {
      autor: "Rube96pinto",
      licencia: "CC BY-SA 4.0",
      fuente:
        "https://commons.wikimedia.org/wiki/File:Santa_Iglesia_Catedral_Metropolitana,_Catedral_de_Barquisimeto.jpg",
    },
  },
  teatro: {
    src: "/fotos/teatro-juares.jpg",
    alt: "Fachada del Teatro Juares en el centro de Barquisimeto",
    ancho: 1600,
    alto: 1045,
    credito: {
      autor: "Wilfredor",
      licencia: "CC BY-SA 3.0",
      fuente: "https://commons.wikimedia.org/wiki/File:Teatro_Juares.jpg",
    },
  },
  obelisco: {
    src: "/fotos/obelisco-2005.jpg",
    alt: "El Obelisco de Barquisimeto iluminado al anochecer, con la ciudad de fondo",
    ancho: 1600,
    alto: 1200,
    credito: {
      autor: "Andres Mendez",
      licencia: "CC BY-SA 2.0",
      fuente: "https://commons.wikimedia.org/wiki/File:Obelisco_de_Barquisimeto,_2005.jpg",
    },
  },
  skylineOeste: {
    src: "/fotos/skyline-oeste.jpg",
    alt: "Edificios de Barquisimeto con las montañas al fondo",
    ancho: 1600,
    alto: 1067,
    credito: {
      autor: "Lacamaradefran",
      licencia: "CC BY-SA 4.0",
      fuente:
        "https://commons.wikimedia.org/wiki/File:Digitaliza_Tu_Ciudad_Barquisimeto_2025-8.jpg",
    },
  },
  skylineCentro: {
    src: "/fotos/skyline-centro.jpg",
    alt: "Vista de edificios residenciales del centro de Barquisimeto",
    ancho: 1600,
    alto: 1067,
    credito: {
      autor: "Lacamaradefran",
      licencia: "CC BY-SA 4.0",
      fuente:
        "https://commons.wikimedia.org/wiki/File:Digitaliza_Tu_Ciudad_Barquisimeto_2025-9.jpg",
    },
  },
  manto: {
    src: "/fotos/manto-divina-pastora.jpg",
    alt: "Silueta del monumento Manto de la Divina Pastora contra un atardecer naranja",
    ancho: 1600,
    alto: 1067,
    credito: {
      autor: "José Ocanto",
      licencia: "CC BY-SA 4.0",
      fuente: "https://commons.wikimedia.org/wiki/File:Monumento_Manto_1.jpg",
    },
  },
} satisfies Record<string, Imagen>;

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
    id: "diagnostico",
    titulo: "El diagnóstico recorre las nueve parroquias",
    texto: "Conoce qué están levantando los equipos técnicos y cuándo pasan por tu comunidad.",
    enlace: { href: "/noticias/arranca-diagnostico-parroquias", etiqueta: "Leer la noticia" },
    tono: "tinta",
    imagen: FOTOS.skylineOeste,
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

const nota = "<p><em>Contenido de ejemplo para la maqueta del portal.</em></p>";

/** Publicaciones de ejemplo en los cuatro formatos: texto, imagen, galería y documento. */
export const posts: Post[] = [
  {
    slug: "arranca-diagnostico-parroquias",
    titulo: "Arranca el diagnóstico urbano en las nueve parroquias",
    resumen:
      "Los equipos técnicos recorren cada parroquia para levantar el estado de la vialidad, los servicios y el uso del suelo.",
    categoria: "Avances",
    formato: "IMAGEN",
    parroquia: "Todas las parroquias",
    publicadoEl: "2026-10-14",
    imagenes: [FOTOS.skylineOeste],
    cuerpo: `<p>Durante las próximas semanas, cuadrillas de la Dirección de Planificación recorrerán las nueve parroquias del municipio para levantar información sobre vialidad, servicios públicos, equipamiento y uso del suelo.</p>
<h2>¿Qué se levanta?</h2>
<ul><li>Estado de calles, aceras y drenajes.</li><li>Cobertura de agua, electricidad y recolección de desechos.</li><li>Escuelas, ambulatorios, plazas y espacios deportivos.</li></ul>
<p>La información alimenta el diagnóstico, la tercera fase del PDUL, y estará disponible en el repositorio de documentos.</p>${nota}`,
  },
  {
    slug: "mesa-tecnica-catedral",
    titulo: "Mesa técnica con consejos comunales de Catedral",
    resumen: "Vecinos y voceros priorizaron movilidad y espacios públicos del centro histórico.",
    categoria: "Minutas",
    formato: "DOCUMENTO",
    parroquia: "Catedral",
    publicadoEl: "2026-10-10",
    imagenes: [],
    adjunto: {
      nombre: "Minuta de la mesa técnica de Catedral (ejemplo).pdf",
      url: "/docs/minuta-mesa-tecnica-catedral-ejemplo.pdf",
      tipo: "application/pdf",
      pesoBytes: 3355,
      paginas: 2,
    },
    cuerpo: `<p>Voceros de doce consejos comunales de la parroquia Catedral se reunieron con el equipo técnico del PDUL para priorizar los problemas del centro histórico.</p>
<p>Los acuerdos quedaron en la minuta adjunta, que puedes leer aquí mismo o descargar.</p>${nota}`,
  },
  {
    slug: "universidades-se-suman",
    titulo: "Las universidades de Lara se suman al PDUL",
    resumen:
      "UCLA, UPTAEB y UNEXPO acompañarán el diagnóstico con estudios de suelo, riesgo y movilidad.",
    categoria: "Comunicados",
    formato: "TEXTO",
    publicadoEl: "2026-10-07",
    imagenes: [],
    cuerpo: `<p>La Alcaldía de Iribarren firmó acuerdos de cooperación con universidades de la región para acompañar técnicamente la formulación del Plan de Desarrollo Urbano Local.</p>
<h2>Aportes de cada institución</h2>
<p>Las universidades aportarán estudios de suelo y riesgo, conteos de movilidad y apoyo de estudiantes de pregrado en el levantamiento de campo.</p>
<blockquote><p>«La ciudad se planifica con conocimiento y con la gente», señaló el equipo técnico.</p></blockquote>${nota}`,
  },
  {
    slug: "recorrido-centro-historico",
    titulo: "Así se ve el centro histórico que vamos a planificar",
    resumen:
      "Un recorrido fotográfico por los lugares que más mencionaron los vecinos en las primeras mesas.",
    categoria: "Galería",
    formato: "GALERIA",
    parroquia: "Catedral",
    publicadoEl: "2026-10-05",
    imagenes: [FOTOS.catedral, FOTOS.teatro, FOTOS.obelisco, FOTOS.skylineCentro, FOTOS.manto],
    cuerpo: `<p>Reunimos algunas imágenes de los espacios que los vecinos señalaron como emblemáticos y que el plan debe cuidar.</p>${nota}`,
  },
  {
    slug: "plan-de-trabajo-aprobado",
    titulo: "Aprobado el plan de trabajo para formular el PDUL",
    resumen:
      "El documento fija las fases, los equipos y la forma en que la ciudadanía participa en cada etapa.",
    categoria: "Comunicados",
    formato: "DOCUMENTO",
    publicadoEl: "2026-09-29",
    imagenes: [],
    adjunto: {
      nombre: "Plan de trabajo del PDUL (ejemplo).pdf",
      url: "/docs/plan-de-trabajo-pdul-ejemplo.pdf",
      tipo: "application/pdf",
      pesoBytes: 4346,
      paginas: 3,
    },
    cuerpo: `<p>Con la aprobación del plan de trabajo se completa la segunda fase del proceso. El documento ordena el trabajo técnico y describe cómo se reciben y responden las propuestas ciudadanas.</p>${nota}`,
  },
  {
    slug: "entrevista-equipo-tecnico",
    titulo: "«Queremos un plan que se entienda en cada comunidad»",
    resumen:
      "Conversamos con el equipo técnico sobre cómo se recogen las propuestas y qué pasa con cada una.",
    categoria: "Entrevistas",
    formato: "TEXTO",
    publicadoEl: "2026-09-24",
    imagenes: [],
    cuerpo: `<p><strong>¿Qué cambia con este PDUL?</strong></p>
<p>El plan anterior es de 2003. La ciudad creció y hoy necesitamos ordenar ese crecimiento con información actualizada y con la participación de quienes viven en cada parroquia.</p>
<p><strong>¿Qué pasa con una propuesta enviada desde el portal?</strong></p>
<p>Recibe un folio, un revisor la evalúa y la persona recibe una respuesta. Las aprobadas pueden publicarse si el autor lo autoriza.</p>${nota}`,
  },
  {
    slug: "jornada-juan-de-villegas",
    titulo: "Jornada de escucha en Juan de Villegas",
    resumen:
      "Más de cien vecinos compartieron sus prioridades sobre transporte, agua y espacios deportivos.",
    categoria: "Avances",
    formato: "IMAGEN",
    parroquia: "Juan de Villegas",
    publicadoEl: "2026-09-19",
    imagenes: [FOTOS.manto],
    cuerpo: `<p>La jornada se realizó en las cercanías del monumento a la Divina Pastora. Las prioridades recogidas se suman al diagnóstico de la parroquia.</p>${nota}`,
  },
  {
    slug: "minuta-mesa-gremios",
    titulo: "Gremios técnicos revisan la metodología del diagnóstico",
    resumen:
      "Ingenieros, arquitectos y economistas aportaron observaciones a los instrumentos de campo.",
    categoria: "Minutas",
    formato: "TEXTO",
    publicadoEl: "2026-09-15",
    imagenes: [],
    cuerpo: `<p>Representantes de los colegios profesionales revisaron las fichas de levantamiento y propusieron ajustes en la medición de densidad y de riesgo.</p>${nota}`,
  },
  {
    slug: "teatro-juares-espacio-publico",
    titulo: "El entorno del Teatro Juares, caso de estudio de espacio público",
    resumen:
      "El equipo técnico analiza cómo mejorar las aceras, la iluminación y los cruces del sector.",
    categoria: "Avances",
    formato: "IMAGEN",
    parroquia: "Catedral",
    publicadoEl: "2026-09-10",
    imagenes: [FOTOS.teatro],
    cuerpo: `<p>El entorno del Teatro Juares concentra actividad cultural y comercial. Su estudio servirá de modelo para otros espacios públicos del centro.</p>${nota}`,
  },
  {
    slug: "ciudad-desde-arriba",
    titulo: "La ciudad desde arriba: así creció Barquisimeto",
    resumen:
      "Imágenes que muestran el crecimiento vertical y la expansión hacia el este y el oeste.",
    categoria: "Galería",
    formato: "GALERIA",
    publicadoEl: "2026-09-04",
    imagenes: [FOTOS.skylineOeste, FOTOS.skylineCentro, FOTOS.obelisco],
    cuerpo: `<p>Comparar estas vistas ayuda a entender por qué la ciudad necesita un plan actualizado.</p>${nota}`,
  },
  {
    slug: "convocatoria-registro-actores",
    titulo: "Abierta la inscripción en el Registro municipal de actores",
    resumen:
      "Comunas, consejos comunales, gremios, universidades y empresas pueden inscribirse desde el portal.",
    categoria: "Comunicados",
    formato: "TEXTO",
    publicadoEl: "2026-08-28",
    imagenes: [],
    cuerpo: `<p>El registro reúne a los cinco sectores convocados por el Decreto 48-2026. Las organizaciones inscritas reciben las convocatorias a mesas técnicas.</p>${nota}`,
  },
  {
    slug: "decreto-48-2026",
    titulo: "El alcalde decreta la formulación del nuevo PDUL",
    resumen: "Con el Decreto 48-2026 arranca formalmente el proceso de planificación urbana.",
    categoria: "Comunicados",
    formato: "IMAGEN",
    publicadoEl: "2026-08-20",
    imagenes: [FOTOS.catedral],
    cuerpo: `<p>El decreto activa la primera fase del proceso y convoca a la ciudadanía y a las instituciones a participar.</p>${nota}`,
  },
];
