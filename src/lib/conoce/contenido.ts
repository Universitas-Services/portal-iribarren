/*
 * Contenido de «Conoce el PDUL», tal como lo entregó la Alcaldía (seis bloques). Solo se
 * corrigieron tildes y erratas; no se agregan datos que el texto no trae. Cuando exista el CMS,
 * este módulo se reemplaza por la consulta de la página.
 */

/** Bloque I: ¿Qué es un PDUL y por qué es crucial para Barquisimeto? */
export const QUE_ES = [
  "El Plan de Desarrollo Urbano Local (PDUL) es el instrumento jurídico de planificación mediante el cual el Municipio establece las directrices para organizar y orientar el desarrollo urbano, regular los usos del suelo y definir las condiciones para el crecimiento ordenado de la ciudad. Comprende, entre otros aspectos, la ocupación del territorio, la movilidad, los servicios públicos, los espacios públicos, los equipamientos urbanos y la protección ambiental, con un horizonte de planificación de veinte años (2026–2046).",
  "Su importancia va más allá de la elaboración de mapas y documentos técnicos. El PDUL busca establecer un marco de referencia claro para las decisiones públicas y las actuaciones privadas que inciden en la ciudad.",
];

export const CIFRAS: [string, string][] = [
  ["20", "años de horizonte, 2026–2046"],
  ["24", "meses de elaboración"],
  ["4", "fases secuenciales"],
  ["10", "parroquias del municipio"],
];

/** Bloque II: los tres componentes del PDUL. */
export const COMPONENTES: { titulo: string; texto: string; lista?: string[] }[] = [
  {
    titulo: "El estudio técnico y prospectivo",
    texto:
      "Analiza las condiciones físicas, ambientales, socioeconómicas y urbanas de Barquisimeto, incluyendo la movilidad y las infraestructuras de servicios. Sus resultados fundamentan la estrategia territorial y el modelo de desarrollo urbano propuesto para el período 2026–2046.",
  },
  {
    titulo: "Ordenanza de Zonificación",
    texto:
      "Establece las disposiciones que regulan el uso y la ocupación del suelo, conforme a la normativa aplicable. Incluye determinaciones urbanísticas como:",
    lista: [
      "Usos permitidos",
      "Variables Urbanas Fundamentales (VUF)",
      "Densidades y alturas",
      "Retiros y demás condiciones de edificación",
      "Instrumentos de gestión del suelo, cuando corresponda",
    ],
  },
  {
    titulo: "El programa de actuaciones urbanísticas",
    texto:
      "Organiza y prioriza las actuaciones propuestas para orientar el desarrollo urbano, como obras de vialidad, infraestructura de servicios, espacios públicos y equipamientos. Su programación permite establecer prioridades, horizontes de ejecución y necesidades de inversión a corto, mediano y largo plazo.",
  },
];

/** Bloque III: Antecedentes urbanos. ¿Por qué un nuevo PDUL ahora? */
export const ANTECEDENTES = [
  "Barquisimeto fue referente nacional al sancionar su primer PDUL el 28 de agosto de 2003, conforme a la Gaceta Municipal Extraordinaria N° 1.803. Sin embargo, aquel instrumento estableció en su artículo 150 una vigencia temporal expresa hasta el 31 de diciembre de 2016.",
  "Ante el vencimiento del plazo sin que se hubiese promulgado un plan sustitutivo, la Sala Constitucional del Tribunal Supremo de Justicia dictó la sentencia N° 928 del 17 de diciembre de 2018, mediante la cual declaró la ultractividad cautelar de la ordenanza de 2003 para evitar el caos y la parálisis normativa en el municipio, ordenando a su vez la formulación definitiva de un nuevo instrumento.",
  "En las últimas dos décadas, la dinámica demográfica, económica y territorial de Iribarren desbordó las previsiones de 2003, superando las 27.146 hectáreas originales de la poligonal urbana y generando nuevos retos en materia de servicios públicos, movilidad, vivienda y preservación ecológica. Con el inicio formal de este proceso en septiembre de 2026, el municipio Iribarren supera casi una década de transitoriedad jurídica para construir, junto a su ciudadanía, las reglas de Barquisimeto del futuro.",
];

/** Solo las fechas que nombra el bloque III. */
export const LINEA_TIEMPO = [
  {
    fecha: "28 de agosto de 2003",
    texto: "Se sanciona el primer PDUL (Gaceta Municipal Extraordinaria N° 1.803).",
  },
  { fecha: "31 de diciembre de 2016", texto: "Vence su vigencia, fijada por el artículo 150." },
  {
    fecha: "17 de diciembre de 2018",
    texto: "Sentencia N° 928 de la Sala Constitucional del TSJ: ultractividad cautelar.",
  },
  { fecha: "Septiembre de 2026", texto: "Inicio formal del proceso del nuevo PDUL." },
];

/** Bloque IV: Naturaleza jurídica y marco legal del PDUL. */
export const MARCO_INTRO = [
  "El Plan de Desarrollo Urbano Local (PDUL) es un instrumento de planificación urbana de ámbito municipal, formulado conforme a la Constitución y las leyes aplicables. Su contenido técnico orienta el desarrollo urbano, mientras que sus disposiciones normativas, una vez aprobadas mediante el instrumento jurídico correspondiente, establecen reglas de obligatorio cumplimiento dentro de su ámbito de aplicación.",
  "Su formulación y aprobación deben respetar las competencias municipales, la legislación urbanística y el procedimiento legal establecido.",
];

export const MARCO: {
  nombre: string;
  texto: string;
  enlace?: { href: string; label: string };
}[] = [
  {
    nombre: "Constitución de la República Bolivariana de Venezuela (CRBV, arts. 168 y 178)",
    texto:
      "Consagra el gobierno local y otorga la competencia exclusiva e intangible a los municipios para regular la ordenación urbanística y el uso del suelo.",
  },
  {
    nombre: "Agenda Hábitat III y ODS",
    texto:
      "Alineado con los Objetivos de Desarrollo Sostenible (Agenda 2030) y ONU-Hábitat para una Barquisimeto compacta, verde, accesible y resiliente al cambio climático.",
  },
  {
    nombre: "Ley Orgánica de Ordenación Urbanística (LOOU, 1987, arts. 10 y 34)",
    texto:
      "Delimita el contenido obligatorio del PDUL y la potestad del Concejo Municipal para sancionar mediante Ordenanza.",
  },
  {
    nombre: "Ley Orgánica del Poder Público Municipal (LOPPM, 2010, art. 54)",
    texto:
      "Define a las Ordenanzas como leyes locales de aplicación general y obligatorio cumplimiento.",
  },
  {
    nombre: "Sentencia N° 928/2018 de la Sala Constitucional del TSJ",
    texto:
      "Hito jurisprudencial que constató el vencimiento del plazo de vigencia del plan de 2003 (previsto en su artículo 150) y decretó cautelarmente su ultractividad para evitar que Barquisimeto quedara en un vacío normativo, ordenando a las autoridades municipales la formulación del nuevo texto legal.",
    enlace: { href: "/noticias/marco-jurisprudencial-pdul", label: "Leer el análisis" },
  },
  {
    nombre: "Guía metodológica MINFRA (Resolución N° 139 / G.O. N° 37.888)",
    texto:
      "Marco técnico oficial que fija las etapas de elaboración y la estructura exigida para el expediente urbano.",
  },
  {
    nombre: "Decreto Municipal N° 48-2026 (Gaceta Municipal Extraordinaria N° 5256 del 14-09-2026)",
    texto:
      "Acto administrativo dictado por el Alcalde del Municipio Iribarren, Yanys Enrique Agüero, mediante el cual se declara formalmente el inicio del procedimiento técnico, administrativo y participativo para la elaboración del nuevo PDUL, instruyendo a la Dirección de Planificación y Control Urbano (DPCU) la apertura del registro de actores y de esta plataforma tecnológica de participación ciudadana.",
    enlace: { href: "/documentos/decreto-48-2026", label: "Ver en el repositorio" },
  },
];

/** Bloque V: Procedimiento de elaboración. */
export const PROCEDIMIENTO_INTRO =
  "La elaboración del nuevo PDUL del Municipio Iribarren no es un acto improvisado de despacho; es un procedimiento administrativo riguroso y transparente que abarca 24 meses continuos divididos en 4 fases secuenciales e interdependientes:";

export type Hito = {
  titulo: string;
  texto: string;
  subhitos?: { titulo: string; texto: string }[];
};

export const FASES: {
  numero: string;
  nombre: string;
  /** Solo si el cliente la dio. */
  duracion?: string;
  consiste: string;
  hitos: Hito[];
}[] = [
  {
    numero: "I",
    nombre: "Diagnóstico urbano integral",
    duracion: "Meses 1 a 6",
    consiste:
      "Es la radiografía científica y jurídica de la ciudad. Antes de proponer nuevas normas, el equipo multidisciplinario evalúa el estado real del territorio, la infraestructura y el marco normativo.",
    hitos: [
      {
        titulo: "Auditoría legal e institucional",
        texto:
          "Análisis del impacto de la sentencia N° 928/2018 del Tribunal Supremo de Justicia (que ordenó la ultractividad del plan de 2003) y del Decreto Municipal de inicio dictado por el alcalde Yanys Agüero.",
      },
      {
        titulo: "Base cartográfica y catastro multifinalitario",
        texto:
          "Levantamiento vectorial georreferenciado de las más de 27.146 hectáreas de la poligonal urbana y áreas de expansión.",
      },
      {
        titulo: "Evaluación de capacidad infraestructural",
        texto:
          "Diagnóstico de la oferta real de agua potable (Hidrolara), energía eléctrica (Corpoelec), drenajes y vialidad.",
      },
      {
        titulo: "Estudios de vulnerabilidad y riesgos",
        texto:
          "Mapeo de microzonificación sísmica, amenazas hídricas y conos de seguridad (como la Zona Protectora del Aeropuerto Jacinto Lara).",
      },
    ],
  },
  {
    numero: "II",
    nombre: "Opción de desarrollo (prospectiva)",
    consiste:
      "Es el debate técnico y social para definir el modelo de ciudad deseado para Barquisimeto hacia el año 2046 (imagen-objetivo).",
    hitos: [
      {
        titulo: "Pre-modelación de escenarios urbanos",
        texto:
          "Análisis comparativo entre el escenario tendencial (crecimiento desordenado) y el escenario alternativo de sostenibilidad y densidad adaptativa.",
      },
      {
        titulo: "Mesas de concertación técnica",
        texto:
          "Encuentros de co-diseño con el registro de organizaciones intermedias (Universidad Centroccidental Lisandro Alvarado - UCLA, Colegio de Ingenieros - CIEL, Colegio de Arquitectos - CAEL, cámaras de comercio, construcción e inmobiliaria, y comunas).",
      },
      {
        titulo: "Aprobación de la opción de desarrollo",
        texto:
          "Documento estratégico que fija las directrices de crecimiento, conservación ambiental, corredores viales y centros de empleo parroquiales.",
      },
    ],
  },
  {
    numero: "III",
    nombre: "Construcción del plan",
    consiste:
      "Traducción de las estrategias en instrumentos jurídicos y cartográficos de obligatorio cumplimiento para la administración y los ciudadanos.",
    hitos: [
      {
        titulo: "Anteproyecto de ordenanza de zonificación",
        texto:
          "Redacción del articulado normativo que establece el régimen de las Variables Urbanas Fundamentales (VUF), retiros, alturas, usos mixtos y cronotopía urbana.",
      },
      {
        titulo: "Planimetría definitiva",
        texto:
          "Juego de planos oficiales de zonificación, trama vial estructurante, redes de servicios y Zonas de Protección Urbana (ZPU).",
      },
      {
        titulo: "Programa de actuaciones urbanas (PAU)",
        texto:
          "Fichas operativas que catalogan y priorizan las inversiones e intervenciones públicas y privadas a corto (1–3 años), mediano (4–10 años) y largo plazo (11–20 años).",
      },
    ],
  },
  {
    numero: "IV",
    nombre: "Fase legislativa y consulta pública",
    consiste:
      "Fase de validación democrática, control de legalidad y conversión del proyecto en Ordenanza sancionada y promulgada.",
    hitos: [
      {
        titulo: "Admisión e inicio de trámite legislativo",
        texto:
          "Consignación formal del proyecto de Ordenanza ante el Concejo Municipal de Iribarren por parte del Alcalde (iniciativa legislativa exclusiva) para su primera discusión.",
      },
      {
        titulo: "Lapso legal de consulta pública reglamentaria (art. 38 LOOU y art. 140 LOAP)",
        texto: "",
        subhitos: [
          {
            titulo: "60 días continuos de exhibición pública",
            texto:
              "Apertura del periodo legal para que cualquier ciudadano, empresa o comunidad revise planos y borradores y presente alegatos u observaciones por escrito o vía web.",
          },
          {
            titulo: "30 días continuos de audiencias técnicas",
            texto:
              "Sesiones de trabajo con las Organizaciones Intermedias inscritas en el Registro Oficial para fundamentar propuestas.",
          },
        ],
      },
      {
        titulo: "Procesamiento y matriz motivada de respuestas",
        texto:
          "El equipo técnico evalúa cada alegato y emite un informe público y motivado aprobando o desestimando las observaciones (art. 40 LOOU).",
      },
      {
        titulo: "Conformidad ministerial y discrepancias (arts. 42 y 43 LOOU)",
        texto:
          "Revisión de armonización técnica por parte del Ministerio rector (MPPVH/MINFRA). En caso de discrepancias, se activa una comisión ad hoc tripartita.",
      },
      {
        titulo: "Segunda discusión, sanción y promulgación",
        texto:
          "Aprobación definitiva en Cámara Municipal, firma del Alcalde y publicación formal en Gaceta Municipal para su entrada en vigencia inmediata.",
      },
    ],
  },
];

/** Bloque VI: Objetivos estratégicos del PDUL Iribarren (2026–2046). */
export const OBJETIVOS: {
  clave: "juridica" | "policentrica" | "justicia" | "resiliencia" | "digital";
  titulo: string;
  texto: string;
}[] = [
  {
    clave: "juridica",
    titulo: "Seguridad jurídica y desarrollo productivo",
    texto:
      "Establecer criterios claros y transparentes para regular los usos del suelo y las condiciones de desarrollo urbano, contribuyendo a la seguridad jurídica y a la creación de condiciones favorables para la inversión, el comercio y la actividad industrial.",
  },
  {
    clave: "policentrica",
    titulo: "Ciudad policéntrica, compacta y conectada",
    texto:
      "Promover una estructura urbana integrada, con usos del suelo compatibles, centralidades articuladas y un sistema de movilidad sostenible que facilite el acceso al empleo, los servicios y las actividades económicas.",
  },
  {
    clave: "justicia",
    titulo: "Justicia territorial y servicios públicos",
    texto:
      "Orientar el crecimiento urbano de acuerdo con la capacidad de las infraestructuras y las necesidades de la población, priorizando la mejora de los servicios públicos, los espacios públicos y los equipamientos en los distintos sectores del municipio.",
  },
  {
    clave: "resiliencia",
    titulo: "Resiliencia ambiental y gestión de riesgos",
    texto:
      "Orientar la ocupación del territorio con criterios de protección ambiental, prevención de riesgos y adaptación al cambio climático, considerando las amenazas naturales y las condiciones de vulnerabilidad identificadas mediante estudios técnicos.",
  },
  {
    clave: "digital",
    titulo: "Modernización y gobernanza digital",
    texto:
      "Fortalecer la planificación y la gestión urbana mediante sistemas de información geográfica (SIG), información catastral actualizada y herramientas de seguimiento y trazabilidad que faciliten la transparencia y la participación ciudadana.",
  },
];

/**
 * Bloque VII: instancias y aspectos organizativos (artículo 2 del Decreto 48-2026). Las
 * competencias de cada instancia están en espera del texto oficial: no se redactan aquí.
 */
export const INSTANCIAS: {
  clave: "alcalde" | "concejo" | "comision";
  titulo: string;
  competencias: string[];
}[] = [
  { clave: "alcalde", titulo: "Alcalde del Municipio Iribarren", competencias: [] },
  { clave: "concejo", titulo: "Concejo Municipal", competencias: [] },
  { clave: "comision", titulo: "Comisión Técnica Organizadora", competencias: [] },
];

/** Cierre: llamada a registrarse y participar. */
export const LLAMADO = {
  titulo: "¿Listo para ser parte de la planificación de Barquisimeto?",
  texto:
    "Tu visión como ciudadano, gremio, universidad o comunidad organizada es fundamental en este proceso. Regístrate y participa en el PDUL.",
};
