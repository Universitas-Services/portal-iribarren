/*
 * Cliente de plataforma-api para el BFF del portal. Solo corre en el servidor (Server Actions,
 * componentes de servidor y Proxy): el navegador nunca habla con la API ni ve sus tokens.
 * La API se activa definiendo API_URL; sin ella el portal sigue con la simulación de siempre.
 * No importa `server-only` porque Proxy también lo carga.
 */

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
  metodo?: "GET" | "POST" | "PATCH";
  /** Objeto que va como JSON, o FormData para subir archivos. */
  cuerpo?: unknown;
  /** Access token de la sesión. */
  token?: string;
  /** Rutas /portal/* y el login del portal: identifican el portal con x-client-id. */
  portal?: boolean;
};

export async function pedirApi<T>(ruta: string, o: Opciones = {}): Promise<T> {
  const base = urlApi();
  if (!base) throw new ErrorApi(503, "API_NO_CONFIGURADA", "Falta API_URL.");

  const headers = new Headers({ Accept: "application/json" });
  if (o.token) headers.set("Authorization", `Bearer ${o.token}`);
  if (o.portal) {
    headers.set("x-client-id", process.env.PORTAL_CLIENT_ID || "portal-iribarren");
    // Solo un BFF puede enviar el secreto del portal; si no está definido, se omite.
    if (process.env.PORTAL_CLIENT_SECRET)
      headers.set("x-client-secret", process.env.PORTAL_CLIENT_SECRET);
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
      signal: AbortSignal.timeout(15_000),
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

/* ---------- Respuestas que usa el portal ---------- */

export type ResumenUsuarioApi = {
  id: string;
  email: string;
  nombres: string | null;
  apellidos: string | null;
  tipoPerfil: "NATURAL" | "ORGANIZACION" | null;
  perfilEstado: "INCOMPLETO" | "COMPLETO";
  missing: string[];
  membership: { tenantId: string; tenantNombre: string; status: string } | null;
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
