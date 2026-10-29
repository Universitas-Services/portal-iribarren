/*
 * Recorrido guiado: qué se puede hacer en cada página del portal. Cada paso resalta el primer
 * elemento visible de `objetivo` (selectores CSS); así, en el teléfono, el paso del menú apunta
 * al botón de menú y en escritorio a la navegación. Sin ningún objetivo visible, el paso se
 * muestra centrado. Son instrucciones de uso del portal, no textos oficiales.
 */

export type PasoTour = { objetivo?: string[]; titulo: string; texto: string };

const MENU_MOVIL = '[data-tour="menu-movil"]';

const BIENVENIDA: PasoTour = {
  titulo: "¡Te damos la bienvenida a PDUL YA!",
  texto:
    "En pocos pasos te mostramos qué puedes hacer aquí. Puedes saltar el recorrido y verlo cuando quieras con el botón de la brújula.",
};

/** Lo que vale en cualquier página: el menú, la cuenta y este mismo botón. */
function generales(conSesion: boolean): PasoTour[] {
  return [
    {
      objetivo: ['nav[aria-label="Principal"]', MENU_MOVIL],
      titulo: "Las secciones del portal",
      texto:
        "Desde el menú vas al Inicio, conoces el PDUL, lees noticias y documentos, ves las propuestas publicadas y participas.",
    },
    conSesion
      ? {
          objetivo: ['[data-tour="cuenta"]', MENU_MOVIL],
          titulo: "Tu cuenta",
          texto:
            "Desde aquí vas a Mi cuenta, a tus participaciones con su seguimiento y a la seguridad de tu cuenta.",
        }
      : {
          objetivo: ['[data-tour="cuenta"]', MENU_MOVIL],
          titulo: "Inicia sesión o regístrate",
          texto:
            "Con una cuenta puedes opinar. Si completas tu perfil, también puedes enviar propuestas formales.",
        },
    {
      objetivo: ['[data-tour="ayuda"]'],
      titulo: "Este recorrido, cuando quieras",
      texto: "Toca la brújula en cualquier página para ver qué puedes hacer en ella.",
    },
  ];
}

const PAGINAS: Record<string, (conSesion: boolean) => PasoTour[]> = {
  "/": () => [
    {
      objetivo: ['[aria-labelledby="proceso-titulo"]'],
      titulo: "¿En qué va el plan?",
      texto:
        "El termómetro muestra la fase en la que va el Plan de Desarrollo Urbano Local y las que siguen.",
    },
    {
      objetivo: ['[aria-label="Anuncios del PDUL"]'],
      titulo: "Anuncios",
      texto: "Avisos y novedades de la alcaldía. Usa los puntos para pasar de uno a otro.",
    },
    {
      objetivo: ['[aria-labelledby="opinion-titulo"]'],
      titulo: "Da tu opinión",
      texto: "Desde aquí llegas al formulario para opinar o presentar una propuesta.",
    },
    {
      objetivo: ['[aria-labelledby="noticias-titulo"]'],
      titulo: "Noticias",
      texto: "Lo último del PDUL. En cada noticia puedes dejar tu opinión.",
    },
    {
      objetivo: ['[aria-labelledby="gente-opina-titulo"]'],
      titulo: "La gente opina",
      texto: "Opiniones y propuestas de la ciudadanía que la alcaldía publicó.",
    },
  ],
  "/conoce-el-pdul": () => [
    {
      objetivo: ['nav[aria-label="En esta página"]'],
      titulo: "Índice de la página",
      texto: "Salta directo a la sección que te interesa: qué es el PDUL, sus fases, objetivos…",
    },
    {
      objetivo: ['[aria-labelledby="procedimiento-titulo"]'],
      titulo: "Cómo se elabora",
      texto: "Las fases del plan y en qué consiste cada una.",
    },
    {
      objetivo: ['[aria-labelledby="participa-titulo"]'],
      titulo: "Tu parte",
      texto: "Cuando termines de leer, desde aquí puedes participar.",
    },
  ],
  "/noticias": () => [
    {
      objetivo: ["#filtros-noticias"],
      titulo: "Busca y filtra",
      texto: "Encuentra noticias por texto, categoría, fecha o formato.",
    },
  ],
  "/noticias/[slug]": () => [
    {
      objetivo: ['[aria-labelledby="opinar-titulo"]'],
      titulo: "Opina sobre esta noticia",
      texto: "Tu opinión llega al equipo del PDUL con un folio. Solo necesitas iniciar sesión.",
    },
  ],
  "/documentos": () => [
    {
      objetivo: ["#filtros-documentos"],
      titulo: "Busca un documento",
      texto: "Filtra los documentos del PDUL por texto, categoría o estado y descárgalos.",
    },
  ],
  "/propuestas": () => [
    {
      objetivo: ['form[aria-label="Filtrar propuestas y opiniones"]'],
      titulo: "Busca aportes",
      texto: "Filtra por tipo, parroquia o área del plan lo que la alcaldía publicó.",
    },
    {
      objetivo: ['[aria-labelledby="sumate"]'],
      titulo: "Súmate",
      texto: "¿Tienes una idea para tu comunidad? Envía tu propia opinión o propuesta.",
    },
  ],
  "/participa": () => [
    {
      objetivo: ['[data-tour="tipo"]'],
      titulo: "Elige qué enviar",
      texto:
        "Una opinión solo pide tu sesión. La propuesta formal pide además el perfil completo y un documento de soporte.",
    },
    {
      objetivo: ['[data-tour="nombre-publico"]'],
      titulo: "Tu nombre",
      texto:
        "Decide si aparece tu nombre si la alcaldía publica tu aporte. Si dices que no, aparece como «Ciudadano de Iribarren».",
    },
    {
      objetivo: ['[data-tour="enviar"]'],
      titulo: "Revisa y envía",
      texto: "Antes de enviar ves un resumen. Recibes un folio para seguir tu aporte.",
    },
  ],
  "/mi-cuenta": () => [
    {
      objetivo: ['[data-tour="progreso"]'],
      titulo: "Tu perfil",
      texto: "Para opinar no hace falta. Complétalo para poder enviar propuestas formales.",
    },
    {
      objetivo: ['nav[aria-label="Secciones de mi cuenta"]'],
      titulo: "Tu cuenta por secciones",
      texto: "Tus datos, tus participaciones con su seguimiento y la seguridad de tu cuenta.",
    },
  ],
  "/mi-cuenta/participaciones": () => [
    {
      objetivo: ['form[role="search"]'],
      titulo: "Tus participaciones",
      texto: "Busca tus aportes por folio, estado o tipo. Abre uno para ver su línea de tiempo.",
    },
  ],
  "/mi-cuenta/seguridad": () => [
    {
      objetivo: ['nav[aria-label="Secciones de mi cuenta"]'],
      titulo: "Seguridad de tu cuenta",
      texto: "Cambia tu contraseña, cierra la sesión o pide la baja de la cuenta.",
    },
  ],
};

/** La clave de PAGINAS para una ruta (las de detalle comparten recorrido). */
export function paginaDe(ruta: string) {
  if (PAGINAS[ruta]) return ruta;
  if (ruta.startsWith("/noticias/")) return "/noticias/[slug]";
  if (ruta.startsWith("/mi-cuenta/participaciones")) return "/mi-cuenta/participaciones";
  return undefined;
}

/** Los pasos de la página, luego los generales; con `bienvenida`, antes un saludo. */
export function recorridoDe(
  ruta: string,
  { conSesion, bienvenida = false }: { conSesion: boolean; bienvenida?: boolean },
): PasoTour[] {
  const pagina = paginaDe(ruta);
  return [
    ...(bienvenida ? [BIENVENIDA] : []),
    ...(pagina ? PAGINAS[pagina]!(conSesion) : []),
    ...generales(conSesion),
  ];
}

export const RUTAS_CON_RECORRIDO = Object.keys(PAGINAS);
