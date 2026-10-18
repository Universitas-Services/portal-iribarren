import type { Banner, Documento, Imagen, Post, ProcessStatus } from "@/lib/api/types";

/**
 * Datos de ejemplo. Las fases son las oficiales; la fase actual, las noticias y los banners
 * son ilustrativos y se reemplazan por los de la API.
 */

/** Fases y estados según la Propuesta de Gestión Ciudadana v3 del cliente. */
export const processStatus: ProcessStatus = {
  fases: [
    {
      id: "decreto",
      nombre: "Decreto del alcalde",
      descripcion: "El Decreto 48-2026 abrió formalmente la formulación del nuevo PDUL.",
      estado: "COMPLETADO",
    },
    {
      id: "plan-trabajo",
      nombre: "Aprobación del plan de trabajo",
      descripcion: "Se define la ruta técnica, los equipos y el cronograma del plan.",
      estado: "EN_CURSO",
    },
    {
      id: "diagnostico",
      nombre: "Diagnóstico",
      descripcion: "Levantaremos cómo está la ciudad hoy, parroquia por parroquia.",
      estado: "PENDIENTE",
    },
    {
      id: "formulacion",
      nombre: "Formulación",
      descripcion: "Las propuestas técnicas y ciudadanas se convertirán en plan.",
      estado: "PENDIENTE",
    },
    {
      id: "consulta",
      nombre: "Consulta pública",
      descripcion: "60 días para revisar el borrador y presentar observaciones.",
      estado: "PROXIMAMENTE",
    },
    {
      id: "camara",
      nombre: "Aprobación en Cámara",
      descripcion: "El Concejo Municipal discute y sanciona la ordenanza.",
      estado: "PENDIENTE",
    },
    {
      id: "vigencia",
      nombre: "Vigencia",
      descripcion: "El plan regirá el crecimiento de la ciudad durante 20 años, hasta 2046.",
      estado: "FUTURO",
    },
  ],
  faseActual: 1,
  ejemplo: false,
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
    orden: 1,
    vigencia: { desde: "2026-09-14" },
  },
  {
    id: "diagnostico",
    titulo: "Así se preparará el diagnóstico de las diez parroquias",
    texto: "Conoce qué levantarán los equipos técnicos y cómo puedes aportar desde tu comunidad.",
    enlace: { href: "/noticias/se-prepara-diagnostico-parroquias", etiqueta: "Leer la noticia" },
    tono: "tinta",
    imagen: FOTOS.skylineOeste,
    orden: 2,
  },
  {
    id: "propuestas-abiertas",
    titulo: "Tu propuesta ya puede llegar al plan",
    texto:
      "Antes de la consulta pública formal ya recibimos opiniones y propuestas. Cada una recibe su folio y una respuesta.",
    enlace: { href: "/participa", etiqueta: "Enviar una propuesta" },
    tono: "calido",
    orden: 3,
  },
  {
    id: "documentos",
    titulo: "Consulta los documentos del PDUL",
    texto: "Decreto, plan de trabajo e informes técnicos, en PDF y al alcance de cualquiera.",
    enlace: { href: "/documentos", etiqueta: "Ver el repositorio" },
    tono: "tinta",
    orden: 4,
  },
];

const nota = "<p><em>Contenido de ejemplo para la maqueta del portal.</em></p>";

/** Fotos entregadas por la Alcaldía para las noticias de la Propuesta v4. */
const FOTO = (src: string, alt: string, ancho: number, alto: number): Imagen => ({
  src: `/noticias/${src}`,
  alt,
  ancho,
  alto,
});

const GACETA = {
  nombre: "Decreto N° 48-2026 (Gaceta Municipal Extraordinaria N° 5256).pdf",
  url: "/docs/gaceta-5256-decreto-48-2026.pdf",
  tipo: "application/pdf" as const,
  pesoBytes: 3_973_907,
  paginas: 5,
};

/**
 * Noticias reales (Propuesta de Gestión Ciudadana v4) y, al final, publicaciones de ejemplo
 * que muestran los formatos. Las de ejemplo llevan `ejemplo: true`: se rotulan y nunca van a
 * la portada del Inicio.
 */
export const posts: Post[] = [
  {
    slug: "decreto-inicio-pdul-iribarren",
    titulo:
      "Alcalde Yanys Agüero promulga el Decreto de Inicio del PDUL Iribarren: análisis del marco de garantías para la inversión y el desarrollo social",
    resumen:
      "El Decreto Municipal de la Alcaldía de Iribarren N° 48-2026 abre formalmente la hoja de ruta participativa que dotará a Barquisimeto de un plan ordenador a 20 años, superando una parálisis normativa de casi una década.",
    categoria: "Análisis institucional",
    formato: "IMAGEN",
    publicadoEl: "2026-09-14",
    imagenes: [
      FOTO(
        "decreto-prensa.png",
        "El alcalde atiende a la prensa con el Decreto de Inicio del PDUL en la mano",
        1168,
        1441,
      ),
    ],
    cuerpo: `<p>En un acto institucional que convoca a las cámaras empresariales, gremios técnicos, universidades y el Poder Popular, el Alcalde del Municipio Iribarren, Yanys Enrique Agüero, ha firmado y promulgado el Decreto de Inicio del procedimiento para la elaboración del nuevo Plan de Desarrollo Urbano Local (PDUL). Este acto administrativo activa las fases de diagnóstico, concertación social y formulación de la futura Ordenanza que regirá el crecimiento de Barquisimeto hasta el año 2046.</p>`,
    puntos: {
      items: [
        {
          titulo: "Superación del estancamiento normativo",
          texto:
            "El Decreto responde al deber legal de actualizar un plan cuya vigencia expiró originalmente en 2016, ordenando a la Dirección de Planificación y Control Urbano (DPCU) liderar las actuaciones técnicas.",
        },
        {
          titulo: "Tres garantías innegociables para la ciudad",
          texto:
            "El marco normativo promulgado establece que el plan no se redactará a puerta cerrada; se priorizará el rigor técnico y la seguridad jurídica como motor para reactivar la inversión privada, y se equilibrará el desarrollo del centro con la atención a las parroquias periféricas.",
        },
        {
          titulo: "Simplificación y cero papel (TrustTech)",
          texto:
            "Se instruye la digitalización de los procesos de recepción de propuestas y la aplicación del criterio «cero papel» e interoperabilidad en la sustanciación del expediente urbano.",
        },
      ],
    },
  },
  {
    slug: "marco-jurisprudencial-pdul",
    titulo:
      "El marco jurisprudencial del nuevo PDUL Iribarren: análisis de la sentencia N° 928/2018 del TSJ y la superación del vacío normativo en Barquisimeto",
    resumen:
      "La Sala Constitucional del TSJ constató la caducidad del plan de 2003 y fijó cautelarmente su ultractividad, imponiendo la obligación de sancionar una nueva Ordenanza adaptada a la legalidad urbanística y al derecho a la ciudad.",
    categoria: "Doctrina legal",
    formato: "IMAGEN",
    publicadoEl: "2026-09-18",
    imagenes: [
      {
        ...FOTO(
          "sentencia-tsj-zonificacion.jpg",
          "Sede del Tribunal Supremo de Justicia junto a un plano de zonificación urbana de Barquisimeto",
          1024,
          559,
        ),
        ilustrativa: true,
      },
    ],
    cuerpo: `<p>La vigencia temporal de la Ordenanza sobre el Plan de Desarrollo Urbano Local (PDUL) de la Ciudad de Barquisimeto, promulgada el 28 de agosto de 2003 en Gaceta Municipal N° 1.803 Extraordinario, estuvo expresamente limitada hasta el año 2016 conforme a su Artículo 150. Ante la expiración de dicho plazo y el riesgo de paralización administrativa del <em>ius aedificandi</em>, la Sala Constitucional del Tribunal Supremo de Justicia (TSJ), mediante la Sentencia N° 928 del 17 de diciembre de 2018 (Expediente N° 2017-0088), acordó cautelarmente la aplicación ultractiva de la normativa derogada para resguardar la seguridad jurídica y la vida local.</p>
<p>Este fallo judicial, ratificado y analizado en causas posteriores de omisión constitucional por el derecho a la ciudad (Sentencia N° 0171/2021), sentó la doctrina según la cual la ultractividad es una medida provisoria de emergencia que no exime al Municipio de su deber de formular, consultar y sancionar una nueva Ordenanza plenamente adaptada a la Ley Orgánica de Ordenación Urbanística (LOOU) y a las exigencias contemporáneas del territorio.</p>`,
    puntos: {
      titulo: "Fundamentos jurisprudenciales, certidumbre jurídica y transición regulatoria",
      items: [
        {
          titulo: "Naturaleza provisoria de la ultractividad cautelar",
          texto:
            "La decisión del TSJ evitó el desamparo regulatorio que habría dejado a Barquisimeto sin Variables Urbanas Fundamentales (VUF) ni controles de zonificación. No obstante, la jurisprudencia advierte que la medida cautelar no es un estado permanente; el cese definitivo de la ultractividad exige la aprobación formal del nuevo instrumento de planificación local por parte de las autoridades municipales.",
        },
      ],
    },
  },
  {
    slug: "anuncio-decreto-48-aniversario",
    titulo:
      "Anuncio histórico en los 474 años de Barquisimeto: Alcalde Yanys Agüero decreta la creación del nuevo PDUL",
    resumen:
      "Durante la Sesión Solemne por el aniversario de la ciudad, se formalizó el Decreto 48 para saldar una deuda de ocho años en materia de planificación urbana participativa.",
    categoria: "Decretos y normativas",
    formato: "GALERIA",
    publicadoEl: "2026-09-14",
    imagenes: [
      FOTO(
        "sesion-solemne-mesa.png",
        "Mesa directiva y orador en la Sesión Solemne por el 474.º aniversario de Barquisimeto",
        1169,
        1440,
      ),
      FOTO(
        "sesion-solemne-publico.png",
        "Autoridades y público asistentes a la Sesión Solemne, de noche, en el centro de Barquisimeto",
        1168,
        1431,
      ),
      FOTO("sesion-solemne-alcalde.png", "El alcalde durante la Sesión Solemne", 1168, 1438),
    ],
    cuerpo: `<p>En el marco de la celebración de los 474 años de Barquisimeto, el alcalde Yanys Agüero anunció la creación del Decreto 48, instrumento clave que dará vida al nuevo Plan de Desarrollo Urbano Local (PDUL) del municipio Iribarren. El anuncio, realizado durante la Sesión Solemne con la presencia de autoridades regionales y locales, marca un punto de inflexión para superar una década de transitoriedad normativa y convocar a todas las fuerzas vivas a la co-creación del futuro urbano de la ciudad.</p>`,
    puntos: {
      items: [
        {
          titulo: "Planificación participativa",
          texto:
            "Convocatoria abierta a gremios, sector empresarial, academia y Poder Popular para diseñar el modelo de ciudad.",
        },
        {
          titulo: "Deuda normativa superada",
          texto:
            "Se pone fin a la parálisis de un plan anterior vencido en 2016 y cuya prórroga expiró en 2018.",
        },
        {
          titulo: "Visión de futuro y cohesión",
          texto:
            "Orientación hacia el desarrollo sostenible, la esperanza y la justicia social en las parroquias.",
        },
      ],
    },
    boton: {
      texto: "Ver publicación oficial en Instagram",
      href: "https://www.instagram.com/p/DdS3mOfFocQ/",
    },
  },
  {
    slug: "tres-compromisos-alcalde-pdul",
    titulo: "Tres compromisos clave del Alcalde Yanys Agüero para el nuevo PDUL de Iribarren",
    resumen:
      "Participación en la calle, rigor técnico con seguridad jurídica y justicia social formalizada guiarán el desarrollo de Barquisimeto hacia el futuro.",
    categoria: "Mensaje institucional",
    formato: "VIDEO",
    publicadoEl: "2026-09-15",
    imagenes: [],
    video: {
      fuente: "ARCHIVO",
      url: "/videos/tres-compromisos-pdul.mp4",
      portada: FOTO(
        "sesion-solemne-alcalde.png",
        "El alcalde Yanys Agüero en la presentación del Decreto 48",
        1168,
        1438,
      ),
    },
    cuerpo: `<p>En el marco del 474.º aniversario de la ciudad, el alcalde del municipio Iribarren, Yanys Agüero, presentó oficialmente el Decreto N.º 48-2026 para dar paso a un nuevo Plan de Desarrollo Urbano Local (PDUL) proyectado para las futuras generaciones. Durante su intervención, el mandatario destacó los tres pilares fundamentales que regirán la hoja de ruta del municipio.</p>`,
    boton: {
      texto: "Ver publicación oficial en Instagram",
      href: "https://www.instagram.com/reel/DdUGySaIYsG/",
    },
  },
  {
    slug: "reunion-auditoria-legal-institucional",
    titulo:
      "Reunión preparatoria evalúa el Informe de auditoría legal e institucional urbanística de Iribarren",
    resumen:
      "Equipos de la Alcaldía, Concejo Municipal y DPCU afinan las bases técnicas y jurídicas para consolidar el diagnóstico del nuevo PDUL.",
    categoria: "Auditoría y diagnóstico",
    formato: "GALERIA",
    publicadoEl: "2026-10-03",
    destacada: true,
    imagenes: [
      FOTO("auditoria-1.png", "Participante atento durante la reunión de trabajo", 1169, 1538),
      FOTO(
        "auditoria-2.png",
        "Un expositor explica ideas frente a una pantalla durante la reunión",
        1168,
        1534,
      ),
      FOTO(
        "auditoria-3.png",
        "Asistentes revisan documentos alrededor de la mesa de trabajo",
        1168,
        1532,
      ),
      FOTO("auditoria-4.png", "Participantes de la reunión sentados a la mesa", 1169, 1538),
    ],
    cuerpo: `<p>Sostuvimos una importante reunión preparatoria en la que revisamos detalladamente el Informe de Auditoría Legal e Institucional Urbanística del municipio Iribarren. Este paso fundamental nos permite sentar bases sólidas para avanzar en el diseño de nuestro Plan de Desarrollo Urbano Local (PDUL).</p>
<p>Esta jornada de trabajo reunió la experiencia del equipo de la Alcaldía de Iribarren, Concejo Municipal, DPCU, como unidad rectora de este proceso, así como organizaciones gubernamentales y no gubernamentales de nuestro municipio. Este paso de diagnóstico es clave para proyectar un crecimiento urbano ordenado, legalmente sustentado y adaptado a las necesidades reales de nuestra gente.</p>`,
    puntos: {
      items: [
        {
          titulo: "Articulación institucional",
          texto:
            "Trabajo conjunto entre la Alcaldía, el Concejo Municipal, la DPCU y organizaciones gubernamentales y no gubernamentales.",
        },
        {
          titulo: "Diagnóstico sólido",
          texto:
            "Revisión detallada del Informe de Auditoría Legal e Institucional Urbanística como base del plan.",
        },
        {
          titulo: "Crecimiento ordenado",
          texto:
            "Proyección de un desarrollo urbano legalmente sustentado y adaptado a las necesidades reales de la ciudadanía.",
        },
      ],
    },
    boton: {
      texto: "Ver publicación oficial en Instagram",
      href: "https://www.instagram.com/p/DeCjxl5HOme/",
    },
  },
  {
    slug: "primera-mesa-tecnica-concejo-alcaldia",
    titulo:
      "Concejo Municipal y Alcaldía instalan primera mesa técnica para avanzar en el nuevo PDUL de Iribarren",
    resumen:
      "Con el inicio del diagnóstico participativo instruido por el Decreto 048, autoridades y sectores sociales trazan la hoja de ruta para el ordenamiento urbano a 20 años.",
    categoria: "Mesas de trabajo",
    formato: "TEXTO",
    publicadoEl: "2026-09-22",
    destacada: true,
    imagenes: [],
    cuerpo: `<p>El Concejo Municipal de Iribarren y la Alcaldía instalaron la primera mesa de trabajo técnica para avanzar en la actualización del Plan de Desarrollo Urbano Local (PDUL), en cumplimiento del Decreto 048 promulgado por el alcalde Yanys Agüero.</p>
<p>El presidente del cuerpo edilicio, Jesús Natera, detalló que el proceso abarca cuatro fases enfocadas en un diagnóstico participativo que integrará a empresarios, comunas, universidades y comerciantes para garantizar un crecimiento ordenado, seguro y sostenible en todo el municipio.</p>`,
  },
  {
    slug: "no-se-trata-de-improvisar-hcamp",
    titulo:
      "«No se trata de improvisar»: Alcalde Yanys Agüero detalla los plazos y fases del nuevo PDUL desde el HCAMP",
    resumen:
      "Con un horizonte de 20 años (2026-2046) y un trabajo continuo de año y medio a dos años, se encendieron oficialmente los motores para la construcción del plan urbanístico de Iribarren.",
    categoria: "Despliegue territorial",
    formato: "IMAGEN",
    publicadoEl: "2026-09-16",
    imagenes: [
      {
        ...FOTO(
          "obelisco-aereo.jpg",
          "Vista aérea del Obelisco de Barquisimeto y sus avenidas",
          1440,
          1800,
        ),
        ilustrativa: true,
      },
    ],
    cuerpo: `<p>No se trata de improvisar ni de armar un proyecto de la noche a la mañana. Se encendieron oficialmente los motores para la construcción del nuevo Plan de Desarrollo Urbano Local (PDUL) del municipio Iribarren, una ruta estratégica pensada con visión de futuro para los próximos 20 años (2026-2046).</p>
<p>Durante la entrega de la sala de espera Divina Pastora del HCAMP, el alcalde Yanys Agüero explicó detalles del nuevo plan de desarrollo urbano, el cual está diseñado para ejecutarse en cuatro etapas claves que sumarán entre un año y medio y dos años de trabajo continuo.</p>
<p>La primera fase, iniciada con el Decreto N° 48, se enfoca en el diagnóstico exhaustivo de la ciudad, mientras se convoca a la academia, gremios y sector privado bajo la premisa de que «quien se queda como espectador, no tiene derecho a opinar en el futuro».</p>`,
  },
  {
    slug: "vision-de-futuro-conversacion-publica",
    titulo:
      "El nuevo PDUL como espacio de conversación pública, técnica y participativa para Barquisimeto",
    resumen:
      "Una apuesta por devolverle a Iribarren su sitial de vanguardia urbanística conectado a las nuevas tendencias del derecho urbanístico global.",
    categoria: "Visión de futuro",
    formato: "IMAGEN",
    publicadoEl: "2026-10-04",
    destacada: true,
    imagenes: [
      FOTO(
        "vision-de-futuro-libros.png",
        "Dos personas muestran los libros «Nuevas tendencias del derecho urbanístico global» y «La propiedad y los límites de las potestades de corrección patrimonial del Estado»",
        1168,
        1527,
      ),
    ],
    cuerpo: `<p>El nuevo Plan de Desarrollo Urbano Local de Barquisimeto representa un espacio para abrir la conversación pública, técnica y participativa donde los guaros decidan el modelo de ciudad en la que desean vivir, devolviéndole al Municipio Iribarren su histórico sitial de vanguardia urbanística en toda Venezuela, y en esta oportunidad conectado a las nuevas tendencias del derecho urbanístico global.</p>`,
  },
  {
    slug: "gaceta-5256-decreto-48-2026",
    titulo:
      "Publicada en Gaceta Municipal N° 5256 Extraordinaria la promulgación del Decreto N° 48-2026 de inicio del PDUL Iribarren",
    resumen:
      "Queda oficialmente formalizada la publicación en Gaceta Municipal Extraordinaria N° 5256 del Decreto N° 48-2026.",
    categoria: "Normativa",
    formato: "DOCUMENTO",
    publicadoEl: "2026-09-11",
    imagenes: [],
    adjunto: GACETA,
    cuerpo: `<p>Queda oficialmente formalizada la publicación en Gaceta Municipal Extraordinaria N° 5256 del Decreto N° 48-2026, mediante el cual el alcalde del municipio Iribarren, Yanys Agüero, declara el inicio del procedimiento para la formulación del nuevo Plan de Desarrollo Urbano Local (PDUL).</p>
<p>Este instrumento jurídico ordena la creación de la Comisión Técnica-Organizadora (áreas técnica, legal y administrativa) y establece las directrices para la participación ciudadana y el ordenamiento territorial de Barquisimeto para los próximos 20 años.</p>`,
    boton: { texto: "Descargar Gaceta Oficial N° 5256", href: GACETA.url },
  },
  {
    slug: "se-prepara-diagnostico-parroquias",
    ejemplo: true,
    titulo: "Así se preparará el diagnóstico urbano de las diez parroquias",
    resumen:
      "Cuando se apruebe el plan de trabajo, los equipos técnicos recorrerán cada parroquia para levantar vialidad, servicios y uso del suelo.",
    categoria: "Auditoría y diagnóstico",
    formato: "IMAGEN",
    parroquia: "Todas las parroquias",
    publicadoEl: "2026-10-14",
    imagenes: [FOTOS.skylineOeste],
    cuerpo: `<p>Una vez aprobado el plan de trabajo, cuadrillas de la Dirección de Planificación recorrerán las diez parroquias del municipio para levantar información sobre vialidad, servicios públicos, equipamiento y uso del suelo.</p>
<h2>¿Qué se levanta?</h2>
<ul><li>Estado de calles, aceras y drenajes.</li><li>Cobertura de agua, electricidad y recolección de desechos.</li><li>Escuelas, ambulatorios, plazas y espacios deportivos.</li></ul>
<p>La información alimenta el diagnóstico, la tercera fase del PDUL, y estará disponible en el repositorio de documentos.</p>${nota}`,
  },
  {
    slug: "recorrido-ciudad-en-video",
    ejemplo: true,
    titulo: "En video: un recorrido por la ciudad que vamos a planificar",
    resumen:
      "Veinte segundos por la Catedral, el Teatro Juares y la Barquisimeto que crece. Con subtítulos.",
    categoria: "Despliegue territorial",
    formato: "VIDEO",
    publicadoEl: "2026-10-12",
    imagenes: [],
    video: {
      fuente: "ARCHIVO",
      url: "/videos/recorrido-ciudad-ejemplo.webm",
      duracionSeg: 20,
      subtitulos: "/videos/recorrido-ciudad-ejemplo.es.vtt",
      portada: {
        src: "/fotos/recorrido-ciudad-poster.jpg",
        alt: "La Catedral Metropolitana de Barquisimeto, portada del video",
        ancho: 960,
        alto: 540,
        credito: {
          autor: "Rube96pinto",
          licencia: "CC BY-SA 4.0",
          fuente:
            "https://commons.wikimedia.org/wiki/File:Santa_Iglesia_Catedral_Metropolitana,_Catedral_de_Barquisimeto.jpg",
        },
      },
    },
    cuerpo: `<p>Un video corto con algunos de los lugares que los vecinos señalaron en las primeras mesas técnicas. El video se arma con fotos de Wikimedia Commons bajo licencia CC BY-SA, y sus autores aparecen en pantalla.</p>${nota}`,
  },
  {
    slug: "mesa-tecnica-catedral",
    ejemplo: true,
    titulo: "Mesa técnica con consejos comunales de Catedral",
    resumen: "Vecinos y voceros priorizaron movilidad y espacios públicos del centro histórico.",
    categoria: "Mesas de trabajo",
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
    ejemplo: true,
    titulo: "Las universidades de Lara se suman al PDUL",
    resumen:
      "UCLA, UPTAEB y UNEXPO acompañarán el diagnóstico con estudios de suelo, riesgo y movilidad.",
    categoria: "Mensaje institucional",
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
    ejemplo: true,
    titulo: "Así se ve el centro histórico que vamos a planificar",
    resumen:
      "Un recorrido fotográfico por los lugares que más mencionaron los vecinos en las primeras mesas.",
    categoria: "Despliegue territorial",
    formato: "GALERIA",
    parroquia: "Catedral",
    publicadoEl: "2026-10-05",
    imagenes: [FOTOS.catedral, FOTOS.teatro, FOTOS.obelisco, FOTOS.skylineCentro, FOTOS.manto],
    cuerpo: `<p>Reunimos algunas imágenes de los espacios que los vecinos señalaron como emblemáticos y que el plan debe cuidar.</p>${nota}`,
  },
  {
    slug: "plan-de-trabajo-en-revision",
    ejemplo: true,
    titulo: "El plan de trabajo para formular el PDUL entra en revisión",
    resumen:
      "El documento fija las fases, los equipos y la forma en que la ciudadanía participa en cada etapa.",
    categoria: "Mensaje institucional",
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
    cuerpo: `<p>El plan de trabajo, en revisión durante la segunda fase del proceso, es el documento que ordena el trabajo técnico y describe cómo se reciben y responden las propuestas ciudadanas.</p>${nota}`,
  },
  {
    slug: "entrevista-equipo-tecnico",
    ejemplo: true,
    titulo: "«Queremos un plan que se entienda en cada comunidad»",
    resumen:
      "Conversamos con el equipo técnico sobre cómo se recogen las propuestas y qué pasa con cada una.",
    categoria: "Mensaje institucional",
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
    ejemplo: true,
    titulo: "Jornada de escucha en Santa Rosa",
    resumen:
      "Más de cien vecinos compartieron sus prioridades sobre transporte, agua y espacios deportivos.",
    categoria: "Auditoría y diagnóstico",
    formato: "IMAGEN",
    parroquia: "Santa Rosa",
    publicadoEl: "2026-09-19",
    imagenes: [FOTOS.manto],
    cuerpo: `<p>La jornada se realizó en las cercanías del monumento a la Divina Pastora. Las prioridades recogidas se suman al diagnóstico de la parroquia.</p>${nota}`,
  },
  {
    slug: "minuta-mesa-gremios",
    ejemplo: true,
    titulo: "Gremios técnicos revisan la metodología del diagnóstico",
    resumen:
      "Ingenieros, arquitectos y economistas aportaron observaciones a los instrumentos de campo.",
    categoria: "Mesas de trabajo",
    formato: "TEXTO",
    publicadoEl: "2026-09-15",
    imagenes: [],
    cuerpo: `<p>Representantes de los colegios profesionales revisaron las fichas de levantamiento y propusieron ajustes en la medición de densidad y de riesgo.</p>${nota}`,
  },
  {
    slug: "teatro-juares-espacio-publico",
    ejemplo: true,
    titulo: "El entorno del Teatro Juares, caso de estudio de espacio público",
    resumen:
      "El equipo técnico analiza cómo mejorar las aceras, la iluminación y los cruces del sector.",
    categoria: "Auditoría y diagnóstico",
    formato: "IMAGEN",
    parroquia: "Catedral",
    publicadoEl: "2026-09-10",
    imagenes: [FOTOS.teatro],
    cuerpo: `<p>El entorno del Teatro Juares concentra actividad cultural y comercial. Su estudio servirá de modelo para otros espacios públicos del centro.</p>${nota}`,
  },
  {
    slug: "ciudad-desde-arriba",
    ejemplo: true,
    titulo: "La ciudad desde arriba: así creció Barquisimeto",
    resumen:
      "Imágenes que muestran el crecimiento vertical y la expansión hacia el este y el oeste.",
    categoria: "Despliegue territorial",
    formato: "GALERIA",
    publicadoEl: "2026-09-04",
    imagenes: [FOTOS.skylineOeste, FOTOS.skylineCentro, FOTOS.obelisco],
    cuerpo: `<p>Comparar estas vistas ayuda a entender por qué la ciudad necesita un plan actualizado.</p>${nota}`,
  },
  {
    slug: "convocatoria-registro-actores",
    ejemplo: true,
    titulo: "Abierta la inscripción en el Registro municipal de actores",
    resumen:
      "Comunas, consejos comunales, gremios, universidades y empresas pueden inscribirse desde el portal.",
    categoria: "Mensaje institucional",
    formato: "TEXTO",
    publicadoEl: "2026-08-28",
    imagenes: [],
    cuerpo: `<p>El registro reúne a los cinco sectores convocados por el Decreto 48-2026. Las organizaciones inscritas reciben las convocatorias a mesas técnicas.</p>${nota}`,
  },
];

const pdf = (nombre: string, archivo: string, pesoBytes: number, paginas: number) => ({
  nombre,
  url: `/docs/${archivo}`,
  tipo: "application/pdf" as const,
  pesoBytes,
  paginas,
});

/**
 * Documentos de ejemplo del repositorio. Varios comparten el mismo PDF de muestra;
 * todos están rotulados «sin validez oficial» y se reemplazan por los reales del admin.
 */
export const documentos: Documento[] = [
  {
    slug: "decreto-48-2026",
    titulo: "Decreto N° 48-2026 de inicio del PDUL (Gaceta Municipal Extraordinaria N° 5256)",
    descripcion:
      "Declara el inicio del procedimiento para la formulación del nuevo PDUL y ordena la creación de la Comisión Técnica-Organizadora.",
    categoria: "Decretos y normativa",
    estado: "OFICIAL",
    version: "1.0",
    publicadoEl: "2026-09-11",
    archivo: pdf(
      GACETA.nombre,
      "gaceta-5256-decreto-48-2026.pdf",
      GACETA.pesoBytes,
      GACETA.paginas,
    ),
    versiones: [
      {
        version: "1.0",
        fecha: "2026-09-11",
        nota: "Publicación en Gaceta Municipal Extraordinaria N° 5256.",
      },
    ],
  },
  {
    slug: "plan-de-trabajo-pdul",
    titulo: "Plan de trabajo para la formulación del PDUL",
    descripcion:
      "Fases, equipos técnicos, cronograma y mecanismos de participación ciudadana en cada etapa.",
    categoria: "Plan de trabajo",
    estado: "BORRADOR",
    version: "2.1",
    publicadoEl: "2026-09-02",
    actualizadoEl: "2026-09-29",
    archivo: pdf(
      "Plan de trabajo del PDUL (ejemplo).pdf",
      "plan-de-trabajo-pdul-ejemplo.pdf",
      4346,
      3,
    ),
    versiones: [
      { version: "2.1", fecha: "2026-09-29", nota: "Versión en revisión por la DPCU." },
      {
        version: "2.0",
        fecha: "2026-09-15",
        nota: "Incorpora las observaciones de los gremios técnicos.",
      },
      { version: "1.0", fecha: "2026-09-02", nota: "Primera versión para revisión." },
    ],
  },
  {
    slug: "metodologia-diagnostico",
    titulo: "Metodología del diagnóstico urbano por parroquias",
    descripcion:
      "Cómo se levantará la información de vialidad, servicios, equipamiento y uso del suelo en las diez parroquias.",
    categoria: "Informes técnicos",
    estado: "BORRADOR",
    version: "0.3",
    publicadoEl: "2026-10-12",
    archivo: pdf(
      "Metodología del diagnóstico (ejemplo).pdf",
      "metodologia-diagnostico-ejemplo.pdf",
      4161,
      3,
    ),
    versiones: [
      {
        version: "0.3",
        fecha: "2026-10-12",
        nota: "Ajusta las fichas de campo con los aportes de los gremios.",
      },
      {
        version: "0.2",
        fecha: "2026-10-03",
        nota: "Suma el capítulo de riesgo sísmico e hídrico.",
      },
      { version: "0.1", fecha: "2026-09-25", nota: "Borrador inicial de la metodología." },
    ],
  },
  {
    slug: "minuta-mesa-tecnica-catedral",
    titulo: "Minuta de la mesa técnica con consejos comunales de Catedral",
    descripcion: "Acuerdos sobre movilidad peatonal y espacios públicos del centro histórico.",
    categoria: "Minutas",
    estado: "OFICIAL",
    version: "1.0",
    publicadoEl: "2026-10-10",
    archivo: pdf(
      "Minuta de la mesa técnica de Catedral (ejemplo).pdf",
      "minuta-mesa-tecnica-catedral-ejemplo.pdf",
      3355,
      2,
    ),
    versiones: [{ version: "1.0", fecha: "2026-10-10", nota: "Minuta firmada por los voceros." }],
  },
  {
    slug: "minuta-mesa-gremios",
    titulo: "Minuta de la mesa con gremios técnicos",
    descripcion:
      "Observaciones de ingenieros, arquitectos y economistas a los instrumentos de campo.",
    categoria: "Minutas",
    estado: "BORRADOR",
    version: "0.1",
    publicadoEl: "2026-09-15",
    archivo: pdf(
      "Minuta de la mesa con gremios (ejemplo).pdf",
      "minuta-mesa-tecnica-catedral-ejemplo.pdf",
      3355,
      2,
    ),
    versiones: [{ version: "0.1", fecha: "2026-09-15", nota: "Pendiente de firma." }],
  },
  {
    slug: "plano-base-parroquias",
    titulo: "Plano base de las diez parroquias",
    descripcion:
      "Límites parroquiales, red vial principal y zonas de estudio usadas en el diagnóstico.",
    categoria: "Cartografía",
    estado: "BORRADOR",
    version: "0.2",
    publicadoEl: "2026-09-30",
    archivo: pdf(
      "Plano base de las parroquias (ejemplo).pdf",
      "metodologia-diagnostico-ejemplo.pdf",
      4161,
      3,
    ),
    versiones: [
      {
        version: "0.2",
        fecha: "2026-09-30",
        nota: "Corrige el límite entre Concepción y Catedral.",
      },
      { version: "0.1", fecha: "2026-09-18", nota: "Primera versión del plano." },
    ],
  },
  {
    slug: "lineamientos-participacion",
    titulo: "Lineamientos de participación ciudadana en el PDUL",
    descripcion:
      "Cómo se reciben, revisan y responden las opiniones y propuestas enviadas desde el portal.",
    categoria: "Decretos y normativa",
    estado: "OFICIAL",
    version: "1.1",
    publicadoEl: "2026-09-05",
    actualizadoEl: "2026-09-22",
    archivo: pdf(
      "Lineamientos de participación (ejemplo).pdf",
      "plan-de-trabajo-pdul-ejemplo.pdf",
      4346,
      3,
    ),
    versiones: [
      { version: "1.1", fecha: "2026-09-22", nota: "Precisa los motivos de rechazo." },
      { version: "1.0", fecha: "2026-09-05", nota: "Publicación inicial." },
    ],
  },
  {
    slug: "cronograma-mesas-tecnicas",
    titulo: "Cronograma de mesas técnicas por parroquia",
    descripcion: "Fechas y lugares de las mesas técnicas del último trimestre de 2026.",
    categoria: "Plan de trabajo",
    estado: "BORRADOR",
    version: "0.4",
    publicadoEl: "2026-10-01",
    archivo: pdf(
      "Cronograma de mesas técnicas (ejemplo).pdf",
      "decreto-48-2026-ejemplo.pdf",
      3219,
      2,
    ),
    versiones: [{ version: "0.4", fecha: "2026-10-01", nota: "Agrega las mesas de Tamaca." }],
  },
];
