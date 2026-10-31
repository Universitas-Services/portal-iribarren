/*
 * Cliente de plataforma-api para el BFF del portal. Solo corre en el servidor (Server Actions,
 * componentes de servidor y Proxy): el navegador nunca habla con la API ni ve sus tokens.
 * La API se activa definiendo API_URL; sin ella el portal sigue con la simulación de siempre.
 * No importa `server-only` porque Proxy también lo carga.
 */

import { headers as cabecerasEntrantes } from "next/headers";

/** URL base de la API (…/api/v1), sin la barra final, o undefined si no está configurada. */
export const urlApi = () => process.env.API_URL?.replace(/\/+$/, "") || undefined;

/** ¿El portal trabaja contra plataforma-api? Si no, usa la autenticación simulada. */
export const usaApi = () => !!urlApi();

/** Formato único de error de la API: { statusCode, code, message, details?, requestId }. */
export class ErrorApi extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ErrorApi";
  }
}

type Opciones = {
  metodo?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  /** Objeto que va como JSON, o FormData para subir archivos. */
  cuerpo?: unknown;
  /** Access token de la sesión. */
  token?: string;
  /** Rutas /portal/* y el login del portal: identifican el portal con x-client-id. */
  portal?: boolean;
  /**
   * Lectura pública cacheada («use cache»: noticias): no reenvía la IP del ciudadano, porque
   * ahí no se pueden leer las cabeceras de la petición y esas rutas no tienen límite por IP.
   */
  publica?: boolean;
  /** Cabeceras extra, como `Idempotency-Key` en el envío de una participación. */
  cabeceras?: Record<string, string>;
  /** Tiempo de espera en ms (15 s por defecto; los envíos con archivos necesitan más). */
  tiempo?: number;
  /**
   * Cuenta como visitante (vistas de R12): reenvía el navegador del ciudadano. La API identifica
   * al visitante con su IP y su User-Agent; sin ellos, todos cuentan como uno solo.
   */
  visitante?: boolean;
};

export async function pedirApi<T>(ruta: string, o: Opciones = {}): Promise<T> {
  const base = urlApi();
  if (!base) throw new ErrorApi(503, "API_NO_CONFIGURADA", "Falta API_URL.");

  const headers = new Headers({ Accept: "application/json" });
  if (o.token) headers.set("Authorization", `Bearer ${o.token}`);
  for (const [k, v] of Object.entries(o.cabeceras ?? {})) headers.set(k, v);
  if (o.portal) {
    headers.set("x-client-id", process.env.PORTAL_CLIENT_ID || "portal-iribarren");
    // Solo un BFF puede enviar el secreto del portal; si no está definido, se omite.
    if (process.env.PORTAL_CLIENT_SECRET) {
      headers.set("x-client-secret", process.env.PORTAL_CLIENT_SECRET);
      // La API limita por IP del ciudadano y solo acepta x-client-ip junto con el secreto; sin
      // ella vería la IP del servidor (Netlify), compartida por todos.
      const ip = o.publica ? undefined : await ipDelCiudadano();
      if (ip) headers.set("x-client-ip", ip);
    }
  }
  if (o.visitante) {
    const navegador = await navegadorDelCiudadano();
    if (navegador) headers.set("User-Agent", navegador);
  }
  let body: BodyInit | undefined;
  if (o.cuerpo instanceof FormData) body = o.cuerpo;
  else if (o.cuerpo !== undefined) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(o.cuerpo);
  }

  let r: Response;
  try {
    r = await fetch(`${base}${ruta}`, {
      method: o.metodo ?? (body ? "POST" : "GET"),
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(o.tiempo ?? 15_000),
    });
  } catch {
    throw new ErrorApi(503, "API_SIN_RESPUESTA", "No pudimos conectar con el servidor.");
  }

  const texto = await r.text();
  let datos: unknown;
  try {
    datos = texto ? JSON.parse(texto) : undefined;
  } catch {
    datos = undefined;
  }
  if (!r.ok) {
    const e = (datos ?? {}) as Partial<{
      code: string;
      message: string;
      details: unknown;
      requestId: string;
    }>;
    throw new ErrorApi(
      r.status,
      e.code ?? `HTTP_${r.status}`,
      e.message ?? "Error del servidor.",
      e.details,
      e.requestId,
    );
  }
  return datos as T;
}

/** IP de quien hizo la petición al portal; undefined fuera de una petición (build). */
async function ipDelCiudadano(): Promise<string | undefined> {
  try {
    const h = await cabecerasEntrantes();
    // Netlify pone la IP real en x-nf-client-connection-ip; x-forwarded-for como respaldo.
    return (
      h.get("x-nf-client-connection-ip")?.trim() ||
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      undefined
    );
  } catch {
    return undefined;
  }
}

/** User-Agent de quien hizo la petición al portal; undefined fuera de una petición. */
async function navegadorDelCiudadano(): Promise<string | undefined> {
  try {
    return (await cabecerasEntrantes()).get("user-agent")?.slice(0, 500) || undefined;
  } catch {
    return undefined;
  }
}

/* ---------- Respuestas que usa el portal ---------- */

export type EstadoEnlace = "OK" | "VENCIDO" | "USADO" | "INVALIDO";

/** Respuesta del registro: la misma exista o no el correo. */
export type RegistroApi = {
  email: string;
  verificacionPendiente: boolean;
  message: string;
  /** Solo con EXPONER_ENLACES_DESARROLLO en la API; nunca en producción. */
  enlaceDesarrollo?: string;
};

/** Respuesta de resend y forgot: 204 sin cuerpo, o el enlace en desarrollo. */
export type EnlaceNeutroApi = { enlaceDesarrollo?: string } | undefined;

export type ResumenUsuarioApi = {
  id: string;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  tipoPerfil: "NATURAL" | "ORGANIZACION" | null;
  perfilEstado: "INCOMPLETO" | "COMPLETO";
  missing: string[];
  /** «portal» si el login llevó x-client-id; «admin» si no. */
  context: "portal" | "admin";
  /** Vacíos para la ciudadanía. */
  roles: ("SUPER_ADMIN" | "ADMIN" | "OPERADOR" | "REVISOR")[];
  permisos: string[];
  cuenta: { estado: "ACTIVA" | "SUSPENDIDA"; desde: string | null; motivo: string | null };
  alcaldia: { codigo: string; nombre: string };
};

export type SesionApi = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
  user: ResumenUsuarioApi;
};

type DocumentoApi = {
  id: string;
  tipo: string;
  version: number;
  createdAt: string;
  file: { originalName: string; mimeType: string; sizeBytes: number } | null;
};

export type PerfilApi = {
  id: string;
  email: string;
  tipoPerfil: "NATURAL" | "ORGANIZACION" | null;
  cedula: string | null;
  nombres: string | null;
  apellidos: string | null;
  telefono: string | null;
  ocupacion: string | null;
  perfilEstado: "INCOMPLETO" | "COMPLETO";
  missing: string[];
  /**
   * Documentos de la verificación para propuestas formales (R18, por llegar a la API). Sin el
   * campo, el portal lo calcula con los documentos.
   */
  documentosEstado?: "PENDIENTE" | "COMPLETO";
  documentosFaltantes?: string[];
  /** Fecha ISO de la solicitud de baja, o null. */
  bajaSolicitada: string | null;
  /** Fecha ISO en que terminó o saltó el recorrido guiado; null si nunca (primer ingreso). */
  tourVistoAt?: string | null;
  /**
   * Versión aceptada y vigente de cada texto legal (R15). `aceptada` null si nunca aceptó una;
   * `vigente` null si aún no hay versión publicada (entonces no hay nada pendiente).
   */
  textosLegales?: {
    terminos: { aceptada: number | null; vigente: number | null };
    politicaDatos: { aceptada: number | null; vigente: number | null };
  };
  identityDocuments: DocumentoApi[];
  organization: {
    id: string;
    rif: string;
    razonSocial: string;
    tipoEntidad: string;
    telefonoInstitucional: string | null;
    condicion: string | null;
    tieneAcreditacion: "SI" | "NO" | "NO_APLICA" | null;
    documents: DocumentoApi[];
  } | null;
};

export type ItemCatalogo = { id: string; valor: string; codigo: string | null; orden: number };

/** Renueva los tokens con el refresh token (rota: el anterior deja de valer). */
export const refrescarTokens = (refreshToken: string) =>
  pedirApi<SesionApi>("/auth/refresh", { cuerpo: { refreshToken } });

/* ---------- Participaciones (guía R11: /portal/participations) ---------- */

/** Acuse de recibo de un envío: el folio y el comprobante para verificarlo. */
export type ComprobanteApi = {
  codigoVerificacion: string;
  hashContenido: string;
  /** Sello de tiempo: null hasta R5b. */
  sello: string | null;
};

export type AcuseApi = {
  folio: string;
  estado: string;
  recibidaEl: string;
  comprobante: ComprobanteApi;
};

/**
 * Un adjunto de una participación. `id` (R19) sirve para pedir su URL firmada: llega en las
 * fotos de las dos vistas y en el soporte solo para el autor.
 */
type ArchivoApi = { id?: string; nombre: string; mime: string; tamano: number };

/** Lo común a la vista del autor y a la galería. */
type BaseParticipacionApi = {
  folio: string;
  tipo: "OPINION_GENERAL" | "OPINION_NOTICIA" | "PROPUESTA_FORMAL";
  noticia?: { slug: string; titulo: string };
  parroquia: string;
  sector: string;
  categoriaTecnica: string;
  descripcion: string;
  imagenes: ArchivoApi[];
  video?: { fuente: "YOUTUBE" | "INSTAGRAM"; url: string };
};

/** Lo que ve el autor de una de sus participaciones (GET /portal/me/participations/{folio}). */
export type ParticipacionPropiaApi = BaseParticipacionApi & {
  soporte?: ArchivoApi;
  ubicacion?: { lat: number; lng: number };
  mostrarNombre: boolean;
  autor: string;
  estado: "PENDIENTE" | "EN_REVISION" | "APROBADA" | "RECHAZADA" | "PUBLICADA";
  recibidaEl: string;
  publicadaEl?: string;
  historial: {
    estado: ParticipacionPropiaApi["estado"];
    fecha: string;
    comentario?: string;
    motivo?: string;
  }[];
  comprobante: ComprobanteApi;
};

/** La galería pública (GET /portal/participations): sin ubicación, historial ni comprobante. */
export type ParticipacionPublicaApi = BaseParticipacionApi & {
  autor: string;
  publicadaEl: string;
  totales: { vistas: number; likes: number; dislikes: number };
};

export type PaginaApi<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
