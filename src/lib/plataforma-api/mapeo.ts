import {
  type Cuenta,
  type DocumentoCargado,
  type Participacion,
  type PropuestaPublica,
  type TipoDocumento,
} from "@/lib/auth/servicio";
import type { ACREDITACION_REPRESENTANTE, CONDICIONES_REPRESENTANTE } from "@/lib/api/types";
import {
  ErrorApi,
  type ParticipacionPropiaApi,
  type ParticipacionPublicaApi,
  type PerfilApi,
} from "./cliente";

/*
 * Traducción entre los datos del portal y los de plataforma-api. Funciones puras: se prueban
 * con Vitest. Las pantallas siguen trabajando con la `Cuenta` del portal; aquí se arma desde el
 * perfil de la API y se convierten los valores de los formularios a los que espera la API.
 */

type Condicion = (typeof CONDICIONES_REPRESENTANTE)[number];
type Acreditacion = (typeof ACREDITACION_REPRESENTANTE)[number];

const CONDICION_API: Record<Condicion, string> = {
  "Representante legal": "REPRESENTANTE_LEGAL",
  "Vocero o vocera oficial": "VOCERO_OFICIAL",
  "Persona autorizada para actuar en nombre de la organización": "PERSONA_AUTORIZADA",
  "Persona de contacto institucional, sin representación legal": "CONTACTO_INSTITUCIONAL",
  Otro: "OTRO",
};

const ACREDITACION_API: Record<Acreditacion, "SI" | "NO" | "NO_APLICA"> = {
  Sí: "SI",
  No: "NO",
  "No aplica": "NO_APLICA",
};

/**
 * Documentos: IDENTIDAD es la cédula; ENTIDAD, el acta o registro de la organización (la API lo
 * llama ACREDITACION); REPRESENTACION, el que prueba la condición del representante.
 */
const DOCUMENTO_API: Record<TipoDocumento, "CEDULA" | "ACREDITACION" | "PRUEBA_REPRESENTACION"> = {
  IDENTIDAD: "CEDULA",
  ENTIDAD: "ACREDITACION",
  REPRESENTACION: "PRUEBA_REPRESENTACION",
};

const invertir = <K extends string, V extends string>(m: Record<K, V>) =>
  Object.fromEntries(Object.entries(m).map(([k, v]) => [v, k])) as Record<V, K>;

const CONDICION_PORTAL = invertir(CONDICION_API);
const ACREDITACION_PORTAL = invertir(ACREDITACION_API);
const DOCUMENTO_PORTAL = invertir(DOCUMENTO_API);

export const condicionApi = (c: Condicion) => CONDICION_API[c];
export const acreditacionApi = (a: Acreditacion) => ACREDITACION_API[a];
export const documentoApi = (t: TipoDocumento) => DOCUMENTO_API[t];

/** El portal guarda el teléfono sin separadores (04141234567 o +584141234567); la API, 0414-1234567. */
export function telefonoApi(telefono: string) {
  const local = telefono.replace(/\D/g, "").replace(/^58/, "0");
  return `${local.slice(0, 4)}-${local.slice(4)}`;
}

/**
 * Valor del catálogo de la alcaldía que corresponde a lo elegido en el formulario. La API exige
 * el valor exacto y algunos difieren solo en mayúsculas («Cámaras empresariales» frente a
 * «Cámaras Empresariales»); si no hay coincidencia se envía tal cual y la API lo rechaza.
 */
export function valorDeCatalogo(valores: string[], elegido: string) {
  const clave = (t: string) => t.normalize("NFC").toLocaleLowerCase("es").trim();
  return valores.find((v) => clave(v) === clave(elegido)) ?? elegido;
}

function documento(d: PerfilApi["identityDocuments"][number]): DocumentoCargado {
  return {
    nombre: d.file?.originalName ?? "documento",
    mime: d.file?.mimeType ?? "",
    tamano: d.file?.sizeBytes ?? 0,
    version: d.version,
    subidoEl: d.createdAt,
  };
}

/**
 * Cuenta del portal armada desde GET /portal/me/profile. La contraseña no viaja (hash vacío): la
 * valida la API. COMPLETO equivale a VERIFICADO en el portal (no hay perfiles rechazados, D15). La
 * baja solicitada también viene de la API.
 */
export function cuentaDePerfil(p: PerfilApi): Cuenta {
  const documentos: Cuenta["documentos"] = {};
  for (const d of [...p.identityDocuments, ...(p.organization?.documents ?? [])]) {
    const tipo = DOCUMENTO_PORTAL[d.tipo as keyof typeof DOCUMENTO_PORTAL];
    if (tipo) documentos[tipo] = documento(d);
  }
  const org = p.organization;
  const base = {
    id: p.id,
    correo: p.email,
    hash: "",
    verificado: true,
    documentos,
    estadoVerificacion:
      p.perfilEstado === "COMPLETO" ? ("VERIFICADO" as const) : ("PENDIENTE" as const),
    bajaSolicitada: p.bajaSolicitada ?? undefined,
    // Sin el campo (la API aún no lo tiene) se toma como visto: así no se lanza en cada ingreso.
    tourVistoAt: p.tourVistoAt === null ? undefined : (p.tourVistoAt ?? ""),
    textosAceptados: p.textosLegales && {
      TERMINOS: String(p.textosLegales.terminos.aceptada ?? ""),
      POLITICA_DATOS: String(p.textosLegales.politicaDatos.aceptada ?? ""),
    },
    // Lo vigente según la API, al instante (el texto del portal se cachea unos minutos).
    textosVigentes: p.textosLegales && {
      TERMINOS: String(p.textosLegales.terminos.vigente ?? ""),
      POLITICA_DATOS: String(p.textosLegales.politicaDatos.vigente ?? ""),
    },
  };
  if (p.tipoPerfil === "ORGANIZACION") {
    return {
      ...base,
      tipo: "ORGANIZACION",
      razonSocial: org?.razonSocial,
      rif: org?.rif,
      tipoEntidad: org?.tipoEntidad,
      perfil: {
        condicion: org?.condicion
          ? CONDICION_PORTAL[org.condicion as keyof typeof CONDICION_PORTAL]
          : undefined,
        nombresRepresentante: p.nombres ?? undefined,
        apellidosRepresentante: p.apellidos ?? undefined,
        cedulaRepresentante: p.cedula ?? undefined,
        telefonoInstitucional: org?.telefonoInstitucional ?? undefined,
        acreditacion: org?.tieneAcreditacion
          ? ACREDITACION_PORTAL[org.tieneAcreditacion]
          : undefined,
      },
    };
  }
  return {
    ...base,
    tipo: "NATURAL",
    cedula: p.cedula ?? undefined,
    nombres: p.nombres ?? undefined,
    apellidos: p.apellidos ?? undefined,
    perfil: { telefono: p.telefono ?? undefined, ocupacion: p.ocupacion ?? undefined },
  };
}

/** Mensaje para la persona a partir de un error de la API (nunca el detalle técnico). */
export function mensajeDeError(e: unknown): string {
  if (!(e instanceof ErrorApi)) return "Ocurrió un error inesperado. Intenta de nuevo.";
  switch (e.code) {
    case "INVALID_CREDENTIALS":
      return "El correo o la contraseña no son correctos.";
    case "TEXTO_LEGAL_DESACTUALIZADO":
      return "Los términos de uso o la política de datos se actualizaron. Léelos y acéptalos de nuevo.";
    case "TEXTOS_LEGALES_PENDIENTES":
      return "Se actualizaron los términos de uso o la política de datos: acéptalos para continuar.";
    case "ACCOUNT_LOCKED": {
      const s = (e.details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
      const min = s ? Math.max(1, Math.ceil(s / 60)) : 15;
      return `Tu cuenta quedó bloqueada por varios intentos fallidos. Intenta de nuevo en ${min} min.`;
    }
    case "EMAIL_NOT_VERIFIED":
      return "Aún no verificas tu correo. Abre el enlace que te enviamos o pide uno nuevo.";
    case "INVALID_TOKEN":
      return e.message || "El enlace no es válido.";
    case "INVALID_PASSWORD":
      return "La contraseña actual no es correcta.";
    case "ACCOUNT_DISABLED":
      return "Tu cuenta está suspendida. Escribe a soporte si crees que es un error.";
    case "TOO_MANY_REQUESTS": {
      const s = (e.details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
      return s
        ? `Hiciste demasiados envíos seguidos. Intenta de nuevo en ${Math.max(1, Math.ceil(s / 60))} min.`
        : "Hiciste demasiados intentos seguidos. Espera un momento y vuelve a intentarlo.";
    }
    case "PERFIL_INCOMPLETO":
      return faltaEnPerfil(e);
    case "FUERA_DEL_MUNICIPIO":
      return "El punto queda fuera del Municipio Iribarren. Marca un lugar dentro del municipio.";
    case "FILE_TOO_LARGE":
      return "El archivo supera los 2 MB.";
    case "INVALID_FILE":
    case "DOCUMENT_TYPE_NOT_ALLOWED":
      return e.message || "El archivo no es válido. Usa PDF, JPG o PNG de hasta 2 MB.";
    case "VALIDATION_ERROR":
    case "WEAK_PASSWORD":
    case "IDENTITY_CONFLICT":
    case "PROFILE_FIELD_LOCKED":
    case "INVALID_CATALOG_VALUE":
      // Mensajes de validación de la API, ya escritos para la persona.
      return Array.isArray(e.details) && typeof e.details[0] === "string"
        ? e.details.join(" ")
        : e.message;
    case "API_SIN_RESPUESTA":
    case "API_NO_CONFIGURADA":
      return "No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.";
    default:
      return e.status >= 500
        ? "El servidor tuvo un problema. Intenta de nuevo en unos minutos."
        : e.message;
  }
}

/** Campo del formulario al que apunta un IDENTITY_CONFLICT (correo, cédula o RIF). */
export const campoEnConflicto = (e: ErrorApi) =>
  (e.details as { field?: string } | undefined)?.field;

/* ---------- Participaciones (guía R11) ---------- */

/** Una de las participaciones del autor, tal como la usa el portal. */
export function participacionDeApi(p: ParticipacionPropiaApi, cuentaId: string): Participacion {
  return {
    folio: p.folio,
    cuentaId,
    tipo: p.tipo,
    noticia: p.noticia,
    parroquia: p.parroquia,
    sector: p.sector,
    ubicacion: p.ubicacion,
    categoriaTecnica: p.categoriaTecnica,
    descripcion: p.descripcion,
    imagenes: p.imagenes,
    video: p.video,
    soporte: p.soporte,
    mostrarNombre: p.mostrarNombre,
    autor: p.autor,
    estado: p.estado,
    creadaEl: p.recibidaEl,
    publicadaEl: p.publicadaEl,
    historial: p.historial,
    comprobante: p.comprobante,
  };
}

/** Una participación de la galería pública. */
export function propuestaDeApi(p: ParticipacionPublicaApi): PropuestaPublica {
  return {
    folio: p.folio,
    tipo: p.tipo,
    noticia: p.noticia,
    parroquia: p.parroquia,
    sector: p.sector,
    categoriaTecnica: p.categoriaTecnica,
    descripcion: p.descripcion,
    imagenes: p.imagenes,
    video: p.video,
    soporte: p.soporte,
    autor: p.autor,
    estado: "PUBLICADA",
    creadaEl: p.publicadaEl,
    publicadaEl: p.publicadaEl,
    totales: p.totales,
  };
}

/** Lo que falta del perfil (`details.missing` de PERFIL_INCOMPLETO), en palabras. */
const FALTA_PERFIL: Record<string, string> = {
  cedula: "la cédula",
  nombres: "los nombres",
  apellidos: "los apellidos",
  telefono: "el teléfono de contacto",
  documentoIdentidad: "el documento de identidad",
  telefonoInstitucional: "el teléfono institucional",
  condicion: "la condición del representante",
  tieneAcreditacion: "la acreditación",
  archivoAcreditacion: "el documento de acreditación",
  archivoRepresentacion: "el documento de representación",
};

function faltaEnPerfil(e: ErrorApi) {
  const falta = ((e.details as { missing?: string[] } | undefined)?.missing ?? [])
    .map((k) => FALTA_PERFIL[k])
    .filter(Boolean);
  return falta.length
    ? `Para enviar una propuesta formal completa tu perfil: falta ${falta.join(", ")}.`
    : "Para enviar una propuesta formal, completa tu perfil en Mi cuenta.";
}

/** Los campos del formulario de participación que la API puede señalar. */
const CAMPOS_PARTICIPACION = [
  "tipo",
  "noticia",
  "parroquia",
  "sector",
  "categoriaTecnica",
  "ubicacion",
  "descripcion",
  "video",
  "mostrarNombre",
  "imagenes",
  "soporte",
];

/**
 * Los errores de POST /portal/participations, por campo cuando la API dice cuál; si no, un
 * mensaje general. Así el formulario marca el campo como con la validación del portal.
 */
export function erroresParticipacion(e: unknown): {
  errores?: Record<string, string>;
  mensaje?: string;
} {
  if (!(e instanceof ErrorApi)) return { mensaje: mensajeDeError(e) };
  const d = e.details as Record<string, unknown> | string[] | undefined;
  switch (e.code) {
    case "VALIDATION_ERROR": {
      if (d && !Array.isArray(d)) {
        const errores: Record<string, string> = {};
        for (const [k, v] of Object.entries(d))
          if (CAMPOS_PARTICIPACION.includes(k) && typeof v === "string") errores[k] = v;
        if (Object.keys(errores).length) return { errores };
      }
      return { mensaje: mensajeDeError(e) };
    }
    case "INVALID_CATALOG_VALUE": {
      const campo = (d as { field?: string } | undefined)?.field;
      return campo && CAMPOS_PARTICIPACION.includes(campo)
        ? { errores: { [campo]: "Elige una opción de la lista." } }
        : { mensaje: mensajeDeError(e) };
    }
    case "FUERA_DEL_MUNICIPIO":
      return { errores: { ubicacion: mensajeDeError(e) } };
    case "INVALID_FILE":
    case "FILE_TOO_LARGE": {
      // La API no dice qué archivo: los mensajes de las fotos hablan de «imagen».
      const campo = /imagen/i.test(e.message) ? "imagenes" : "soporte";
      return { errores: { [campo]: mensajeDeError(e) } };
    }
    default:
      return { mensaje: mensajeDeError(e) };
  }
}
