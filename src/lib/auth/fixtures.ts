import {
  ALCALDIA,
  cifrar,
  crearAlmacen,
  type Almacen,
  type Cuenta,
  type Participacion,
} from "./servicio";

/**
 * Cuentas de demostración para probar cada caso del acceso simulado. Las contraseñas están
 * documentadas en el README; todas son datos de ejemplo.
 */
export const CONTRASENA_DEMO = "Iribarren#2026";

const DOC_DEMO = {
  mime: "application/pdf",
  tamano: 412_000,
  version: 1,
  subidoEl: "2026-09-02T14:00:00.000Z",
};

const cuentas: Omit<Cuenta, "hash">[] = [
  {
    id: "demo-ana",
    tipo: "NATURAL",
    correo: "ana@ejemplo.com",
    cedula: "V-12345678",
    nombres: "Ana María",
    apellidos: "Pérez",
    verificado: true,
    membresias: [ALCALDIA],
    perfil: { telefono: "04141234567", ocupacion: "Profesional Independiente" },
    documentos: { IDENTIDAD: { ...DOC_DEMO, nombre: "cedula-ana.pdf" } },
    estadoVerificacion: "VERIFICADO",
  },
  {
    id: "demo-luis",
    tipo: "NATURAL",
    correo: "luis@ejemplo.com",
    cedula: "V-23456789",
    nombres: "Luis",
    apellidos: "Mendoza",
    verificado: false,
    membresias: [ALCALDIA],
    perfil: {},
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  },
  {
    id: "demo-carla",
    tipo: "NATURAL",
    correo: "carla@ejemplo.com",
    cedula: "V-34567890",
    nombres: "Carla",
    apellidos: "Rodríguez",
    verificado: true,
    membresias: ["palavecino"],
    perfil: { telefono: "04241234567" },
    documentos: { IDENTIDAD: { ...DOC_DEMO, nombre: "cedula-carla.pdf" } },
    estadoVerificacion: "VERIFICADO",
  },
  {
    id: "demo-jose",
    tipo: "NATURAL",
    correo: "jose@ejemplo.com",
    cedula: "V-14567890",
    nombres: "José Gregorio",
    apellidos: "Álvarez",
    verificado: true,
    membresias: [ALCALDIA],
    perfil: {},
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  },
  {
    id: "demo-rosa",
    tipo: "NATURAL",
    correo: "rosa@ejemplo.com",
    cedula: "E-81234567",
    nombres: "Rosa",
    apellidos: "Giménez",
    verificado: true,
    membresias: [ALCALDIA],
    // Perfil a medias: guardó el teléfono, pero aún no sube el documento de identidad.
    perfil: { telefono: "04161234567", ocupacion: "Comerciante" },
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  },
  {
    id: "demo-cardones",
    tipo: "ORGANIZACION",
    correo: "contacto@cardones.org",
    razonSocial: "Consejo Comunal Los Cardones",
    rif: "C-29876543-7",
    tipoEntidad: "Consejos comunales / Comunas",
    verificado: true,
    membresias: [ALCALDIA],
    perfil: {},
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  },
];

type Paso = { estado: Participacion["estado"]; fecha: string; comentario?: string };

/**
 * Participaciones de ejemplo para «Mis participaciones» y «Propuestas publicadas». Son textos
 * inventados para mostrar cada estado; no representan aportes reales. Las opiniones quedan
 * «Recibidas» o publicadas: solo las propuestas formales tienen seguimiento con respuesta.
 */
const participaciones: (Omit<Participacion, "folio" | "estado" | "creadaEl"> & {
  historial: Paso[];
})[] = [
  {
    cuentaId: "demo-ana",
    autor: "Ana María Pérez",
    tipo: "PROPUESTA_FORMAL",
    parroquia: "Catedral",
    sector: "Centro histórico, avenida 20",
    categoriaTecnica: "Vialidad y Transporte",
    descripcion:
      "Propongo semaforizar el cruce de la avenida 20 con la calle 30 y ampliar las aceras del tramo, porque en hora pico los peatones cruzan sin protección y los comercios ocupan el paso. Adjunto un croquis con la ubicación de los semáforos y el ancho propuesto. (Ejemplo)",
    imagenes: [{ nombre: "cruce-av20.jpg", mime: "image/jpeg", tamano: 812_000 }],
    soporte: { nombre: "croquis-cruce-av20.pdf", mime: "application/pdf", tamano: 640_000 },
    mostrarNombre: true,
    historial: [
      { estado: "PENDIENTE", fecha: "2026-09-22T14:10:00.000Z" },
      {
        estado: "EN_REVISION",
        fecha: "2026-09-25T13:00:00.000Z",
        comentario: "Se asigna a la mesa de movilidad para su evaluación técnica.",
      },
      {
        estado: "APROBADA",
        fecha: "2026-10-03T15:30:00.000Z",
        comentario:
          "La propuesta es pertinente y se incorpora al diagnóstico de vialidad de la parroquia Catedral.",
      },
      { estado: "PUBLICADA", fecha: "2026-10-04T12:00:00.000Z" },
    ],
  },
  {
    cuentaId: "demo-ana",
    autor: "Ana María Pérez",
    tipo: "OPINION_GENERAL",
    parroquia: "Concepción",
    sector: "Urb. Nueva Segovia",
    categoriaTecnica: "Servicios Públicos y Redes",
    descripcion:
      "En la urbanización los cortes de agua son frecuentes los fines de semana. Sería importante que el diagnóstico revise la capacidad del acueducto antes de autorizar nuevos edificios en la zona. (Ejemplo)",
    imagenes: [],
    mostrarNombre: false,
    historial: [{ estado: "PENDIENTE", fecha: "2026-09-28T19:45:00.000Z" }],
  },
  {
    cuentaId: "demo-ana",
    autor: "Ana María Pérez",
    tipo: "OPINION_NOTICIA",
    noticia: {
      slug: "se-prepara-diagnostico-parroquias",
      titulo: "Así se preparará el diagnóstico urbano de las diez parroquias",
    },
    parroquia: "Santa Rosa",
    sector: "Santa Rosa centro",
    categoriaTecnica: "Patrimonio y Renovación Urbana",
    descripcion:
      "Me parece bien que el diagnóstico incluya el casco de Santa Rosa. Pido que se consulte a los cultores del sector antes de definir alturas, para no afectar la imagen del pueblo. (Ejemplo)",
    imagenes: [],
    mostrarNombre: true,
    historial: [
      { estado: "PENDIENTE", fecha: "2026-10-06T12:15:00.000Z" },
      { estado: "PUBLICADA", fecha: "2026-10-12T15:00:00.000Z" },
    ],
  },
  {
    cuentaId: "demo-ana",
    autor: "Ana María Pérez",
    tipo: "PROPUESTA_FORMAL",
    parroquia: "Juárez",
    sector: "Sector El Manzano",
    categoriaTecnica: "Medio Ambiente y Riesgos",
    descripcion:
      "En época de lluvia la quebrada se desborda y afecta varias calles. Las fotos muestran cómo quedó el sector en agosto. Propongo que el estudio de riesgos priorice esta zona. (Ejemplo)",
    imagenes: [
      { nombre: "quebrada-1.jpg", mime: "image/jpeg", tamano: 1_200_000 },
      { nombre: "quebrada-2.jpg", mime: "image/jpeg", tamano: 980_000 },
    ],
    mostrarNombre: true,
    historial: [
      { estado: "PENDIENTE", fecha: "2026-10-13T10:05:00.000Z" },
      {
        estado: "EN_REVISION",
        fecha: "2026-10-15T13:40:00.000Z",
        comentario: "En evaluación por el equipo de vulnerabilidad y riesgos.",
      },
    ],
  },
  {
    cuentaId: "demo-ana",
    autor: "Ana María Pérez",
    tipo: "OPINION_GENERAL",
    parroquia: "Catedral",
    sector: "Plaza Bolívar",
    categoriaTecnica: "Equipamiento Urbano",
    descripcion:
      "Faltan bancos, sombra y bebederos en los alrededores de la plaza. Mucha gente mayor camina por el centro y no tiene dónde descansar. (Ejemplo)",
    imagenes: [],
    mostrarNombre: true,
    historial: [
      { estado: "PENDIENTE", fecha: "2026-10-16T17:30:00.000Z" },
      { estado: "PUBLICADA", fecha: "2026-10-18T13:00:00.000Z" },
    ],
  },
  {
    cuentaId: "demo-carla",
    autor: "Carla Rodríguez",
    tipo: "PROPUESTA_FORMAL",
    parroquia: "El Cují",
    sector: "Tamaca – El Cují, vía principal",
    categoriaTecnica: "Zonificación y Uso de Suelo",
    descripcion:
      "Proponemos reservar suelo para un centro de servicios parroquial en el eje El Cují–Tamaca, donde hoy los vecinos deben viajar al centro para trámites, salud y bancos. El documento adjunto identifica tres parcelas posibles. (Ejemplo)",
    imagenes: [],
    soporte: { nombre: "centro-servicios-elcuji.pdf", mime: "application/pdf", tamano: 1_450_000 },
    mostrarNombre: true,
    historial: [
      { estado: "PENDIENTE", fecha: "2026-09-24T15:00:00.000Z" },
      { estado: "EN_REVISION", fecha: "2026-09-29T12:00:00.000Z" },
      {
        estado: "APROBADA",
        fecha: "2026-10-07T14:00:00.000Z",
        comentario: "Se incorpora como insumo para las mesas de concertación de la Fase II.",
      },
      { estado: "PUBLICADA", fecha: "2026-10-08T12:00:00.000Z" },
    ],
  },
  {
    cuentaId: "demo-cardones",
    autor: "Consejo Comunal Los Cardones",
    tipo: "PROPUESTA_FORMAL",
    parroquia: "Unión",
    sector: "Los Cardones",
    categoriaTecnica: "Equipamiento Urbano",
    descripcion:
      "La comunidad propone convertir el terreno baldío de la calle 3 en una plaza con cancha múltiple e iluminación. Adjuntamos el acta de asamblea donde 214 vecinos respaldan la propuesta. (Ejemplo)",
    imagenes: [{ nombre: "terreno-calle3.jpg", mime: "image/jpeg", tamano: 1_050_000 }],
    soporte: { nombre: "acta-asamblea-cardones.pdf", mime: "application/pdf", tamano: 720_000 },
    mostrarNombre: true,
    historial: [
      { estado: "PENDIENTE", fecha: "2026-09-26T18:00:00.000Z" },
      { estado: "EN_REVISION", fecha: "2026-09-30T13:00:00.000Z" },
      {
        estado: "APROBADA",
        fecha: "2026-10-10T15:00:00.000Z",
        comentario: "Se incorpora al inventario de espacios públicos de la parroquia Unión.",
      },
      { estado: "PUBLICADA", fecha: "2026-10-11T12:00:00.000Z" },
    ],
  },
];

export function almacenDemo(): Almacen {
  const alm = crearAlmacen();
  const hash = cifrar(CONTRASENA_DEMO);
  for (const c of cuentas) alm.cuentas.set(c.id, { ...c, hash });
  // Enlaces de ejemplo para ver los estados «vencido» y «ya usado».
  alm.tokens.set("demo-vencido", {
    cuentaId: "demo-luis",
    tipo: "VERIFICAR",
    expira: 0,
    usado: false,
  });
  alm.tokens.set("demo-usado", {
    cuentaId: "demo-ana",
    tipo: "VERIFICAR",
    expira: Number.MAX_SAFE_INTEGER,
    usado: true,
  });
  participaciones.forEach((p, i) => {
    const folio = `IRI-2026-${String(i + 1).padStart(4, "0")}`;
    const ultimo = p.historial[p.historial.length - 1]!;
    alm.participaciones.set(folio, {
      ...p,
      folio,
      estado: ultimo.estado,
      creadaEl: p.historial[0]!.fecha,
    });
  });
  // Los aportes nuevos siguen la numeración después de los de ejemplo.
  alm.secuencia = participaciones.length;
  return alm;
}
