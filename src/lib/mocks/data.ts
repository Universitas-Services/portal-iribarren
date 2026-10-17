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
  },
  {
    id: "diagnostico",
    titulo: "Así se preparará el diagnóstico de las diez parroquias",
    texto: "Conoce qué levantarán los equipos técnicos y cómo puedes aportar desde tu comunidad.",
    enlace: { href: "/noticias/se-prepara-diagnostico-parroquias", etiqueta: "Leer la noticia" },
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
    slug: "decreto-inicio-pdul-iribarren",
    titulo:
      "Alcalde Yanys Agüero promulga el Decreto de Inicio del PDUL Iribarren: análisis del marco de garantías para la inversión y el desarrollo social",
    resumen:
      "El Decreto Municipal N° 48-2026 abre formalmente la hoja de ruta participativa que dotará a Barquisimeto de un plan ordenador a 20 años, superando una parálisis normativa de casi una década.",
    categoria: "Análisis institucional",
    formato: "IMAGEN",
    publicadoEl: "2026-09-14",
    destacada: true,
    imagenes: [
      {
        ...FOTOS.skylineOeste,
        alt: "Vista de Barquisimeto con las montañas al fondo",
        ilustrativa: true,
      },
    ],
    cuerpo: `<p>En un acto institucional que convoca a las cámaras empresariales, gremios técnicos, universidades y el Poder Popular, el alcalde del Municipio Iribarren, Yanys Enrique Agüero, ha firmado y promulgado el Decreto de Inicio del procedimiento para la elaboración del nuevo Plan de Desarrollo Urbano Local (PDUL). Este acto administrativo activa las fases de diagnóstico, concertación social y formulación de la futura Ordenanza que regirá el crecimiento de Barquisimeto hasta el año 2046.</p>`,
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
          titulo: "Simplificación y cero papel",
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
        ...FOTOS.teatro,
        alt: "Fachada del Teatro Juares en el centro de Barquisimeto",
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
    slug: "microzonificacion-sismica-zonificacion",
    titulo:
      "Microzonificación sísmica e ingeniería hídrica: los pilares técnicos de la nueva zonificación de Barquisimeto",
    resumen:
      "Cómo los estudios de geología, aceleración del suelo y drenajes pluviales reconfiguran el otorgamiento de permisos de construcción en la DPCU.",
    categoria: "Retiros y VUF",
    formato: "IMAGEN",
    publicadoEl: "2026-09-04",
    destacada: true,
    imagenes: [
      {
        ...FOTOS.skylineCentro,
        alt: "Edificios residenciales del centro de Barquisimeto",
        ilustrativa: true,
      },
    ],
    cuerpo: `<p>El urbanismo moderno no se diseña en un escritorio; se fundamenta en la ciencia de la tierra. La formulación del nuevo PDUL incorpora los estudios de microzonificación sísmica (FUNVISIS/COVENIN 1756) y la evaluación de cuencas hídricas como condicionantes directos de la edificabilidad y el régimen de las Variables Urbanas Fundamentales (VUF) en Iribarren.</p>`,
    puntos: {
      items: [
        {
          titulo: "Sismorresistencia aplicada a la parcela",
          texto:
            "Barquisimeto está categorizada en Zona Sísmica 5. La microzonificación permite identificar el comportamiento dinámico de los suelos, condicionando las alturas y la densidad en función de la capacidad de respuesta del terreno ante movimientos telúricos.",
        },
        {
          titulo: "Protección marginal y drenajes pluviales",
          texto:
            "La vulnerabilidad ante lluvias intensas en las cuencas del Río Turbio y la Quebrada La Ruezga exige fijar franjas de protección marginal (retiros de 25 a 50 metros) y exigencias de suelo permeable para evitar inundaciones urbanas.",
        },
        {
          titulo: "De variables estáticas a variables paramétricas (4D)",
          texto:
            "La propuesta doctrinaria de AVIPRI busca evolucionar las VUF tradicionales (Arts. 86 y 87 LOOU) hacia un modelo dinámico donde la densidad y los retiros (amortiguación cinética) se ajusten a la capacidad real de los servicios y la seguridad estructural.",
        },
      ],
    },
  },
  {
    slug: "anuncio-decreto-48-aniversario",
    titulo:
      "En el 474.º aniversario de Barquisimeto, el alcalde anuncia el Decreto 48 para un nuevo PDUL",
    resumen:
      "Se convocará a las fuerzas vivas del municipio, incluido el sector empresarial, para construir una planificación urbana participativa.",
    categoria: "Comunicados",
    formato: "GALERIA",
    publicadoEl: "2026-09-14",
    imagenes: [
      {
        ...FOTOS.obelisco,
        alt: "El Obelisco de Barquisimeto iluminado al anochecer",
        ilustrativa: true,
      },
      { ...FOTOS.catedral, alt: "Catedral Metropolitana de Barquisimeto", ilustrativa: true },
      {
        ...FOTOS.manto,
        alt: "Monumento Manto de la Divina Pastora al atardecer",
        ilustrativa: true,
      },
    ],
    cuerpo: `<p>En el marco de la celebración de los 474 años de Barquisimeto, el alcalde Yanys Agüero anunció la creación del Decreto 48, que permitirá establecer el nuevo Plan de Desarrollo Urbano Local (PDUL) de Iribarren.</p>
<p>Se convocará a las fuerzas vivas del municipio, incluyendo al sector empresarial, para construir una planificación urbana participativa. El nuevo PDUL estará orientado a la esperanza, el futuro, el desarrollo y la planificación urbanística del municipio.</p>
<p>Iribarren mantiene una deuda de 8 años en materia de planificación urbana: el plan anterior venció en 2016 y su prórroga culminó en 2018.</p>
<p>El anuncio se realizó durante la Sesión Solemne por el 474.º aniversario de Barquisimeto, con la presencia del gobernador Luis Reyes Reyes, alcaldes, concejales, representantes de los Poderes Públicos y ciudadanos. Durante la sesión también fueron entregadas las órdenes Ciudad Barquisimeto y Juan Guillermo Iribarren a personalidades destacadas por su aporte a la ciudad.</p>`,
    boton: {
      texto: "Ver la publicación en Instagram",
      href: "https://www.instagram.com/p/DdS3mOfFocQ/",
    },
  },
  {
    slug: "avanzamos-hacia-el-futuro-video",
    titulo: "¡Avanzamos hacia el futuro de Barquisimeto!",
    resumen:
      "El alcalde presentó el Decreto N.º 48-2026 y tres compromisos: construcción participativa, rigor técnico con seguridad jurídica y justicia social.",
    categoria: "Comunicados",
    formato: "VIDEO",
    publicadoEl: "2026-09-15",
    imagenes: [],
    video: {
      fuente: "INSTAGRAM",
      url: "https://www.instagram.com/reel/DdUGySaIYsG/",
      portada: {
        ...FOTOS.catedral,
        alt: "Catedral Metropolitana de Barquisimeto",
        ilustrativa: true,
      },
    },
    cuerpo: `<p>En el marco del 474 aniversario de la ciudad, el alcalde del municipio Iribarren, Yanys Agüero, presentó el Decreto N.º 48-2026 para dar paso a un nuevo Plan de Desarrollo Urbano Local (PDUL) proyectado para las futuras generaciones.</p>
<p>Durante su intervención, el mandatario destacó tres compromisos clave para el municipio:</p>
<ul><li>Una construcción participativa que saldrá de las oficinas para debatirse en la calle con todos los sectores.</li><li>El rigor técnico y la seguridad jurídica para impulsar la inversión del sector privado.</li><li>La garantía de una justicia social que no se negocia, sino que se formaliza.</li></ul>`,
  },
  {
    slug: "se-prepara-diagnostico-parroquias",
    titulo: "Así se preparará el diagnóstico urbano de las diez parroquias",
    resumen:
      "Cuando se apruebe el plan de trabajo, los equipos técnicos recorrerán cada parroquia para levantar vialidad, servicios y uso del suelo.",
    categoria: "Avances",
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
    titulo: "En video: un recorrido por la ciudad que vamos a planificar",
    resumen:
      "Veinte segundos por la Catedral, el Teatro Juares y la Barquisimeto que crece. Con subtítulos.",
    categoria: "Galería",
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
    slug: "plan-de-trabajo-en-revision",
    titulo: "El plan de trabajo para formular el PDUL entra en revisión",
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
    cuerpo: `<p>El plan de trabajo, en revisión durante la segunda fase del proceso, es el documento que ordena el trabajo técnico y describe cómo se reciben y responden las propuestas ciudadanas.</p>${nota}`,
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
    titulo: "Jornada de escucha en Santa Rosa",
    resumen:
      "Más de cien vecinos compartieron sus prioridades sobre transporte, agua y espacios deportivos.",
    categoria: "Avances",
    formato: "IMAGEN",
    parroquia: "Santa Rosa",
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
    titulo: "Decreto 48-2026 de formulación del PDUL",
    descripcion:
      "Activa la formulación del Plan de Desarrollo Urbano Local y crea el Registro municipal de actores.",
    categoria: "Decretos y normativa",
    estado: "OFICIAL",
    version: "1.0",
    publicadoEl: "2026-08-20",
    archivo: pdf("Decreto 48-2026 (ejemplo).pdf", "decreto-48-2026-ejemplo.pdf", 3219, 2),
    versiones: [{ version: "1.0", fecha: "2026-08-20", nota: "Publicación en Gaceta Municipal." }],
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
