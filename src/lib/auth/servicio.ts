import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type {
  CategoriaTecnica,
  EstadoParticipacion,
  EstadoVerificacion,
  Parroquia,
  TipoParticipacion,
} from "@/lib/api/types";

/*
 * Autenticación simulada del portal. Reproduce las reglas de /portal/auth/* (backlog 1.4) sobre
 * un almacén en memoria, para construir las pantallas antes de que exista plataforma-api.
 * Es lógica pura: no lee cookies ni variables de entorno, así que se prueba con Vitest.
 */

export const ALCALDIA = "iribarren";
const HORA = 60 * 60 * 1000;

export type TipoCuenta = "NATURAL" | "ORGANIZACION";

export type Cuenta = {
  id: string;
  tipo: TipoCuenta;
  correo: string;
  hash: string;
  verificado: boolean;
  /** Alcaldías en las que la cuenta tiene membresía (una cuenta, varios portales). */
  membresias: string[];
  /** Datos de «Terminación del perfil» (v3). */
  perfil: Perfil;
  /** Solo metadatos: el archivo va a Storage en plataforma-api. */
  documentos: Partial<Record<TipoDocumento, DocumentoCargado>>;
  /** Revisión de identidad que hace el Revisor desde el admin. */
  estadoVerificacion: EstadoVerificacion;
  /** Con REQUIERE_CORRECCION: qué documento debe reemplazarse y por qué. */
  correccion?: { documento: TipoDocumento; motivo: string };
  /** Fecha ISO en que pidió la baja de la cuenta. */
  bajaSolicitada?: string;
  /** Persona natural. */
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  /** Organización: la cédula del representante llega al completar el perfil. */
  razonSocial?: string;
  rif?: string;
  tipoEntidad?: string;
};

export type TipoDocumento = "IDENTIDAD" | "REPRESENTACION" | "ENTIDAD";

export type DocumentoCargado = {
  nombre: string;
  mime: string;
  tamano: number;
  version: number;
  subidoEl: string;
};

export type Perfil = {
  /** Persona natural. */
  telefono?: string;
  ocupacion?: string;
  /** Organización: quién la representa. */
  condicion?: string;
  nombresRepresentante?: string;
  apellidosRepresentante?: string;
  cedulaRepresentante?: string;
  telefonoInstitucional?: string;
  /** «Sí», «No» o «No aplica»: si es «Sí», hace falta el documento REPRESENTACION. */
  acreditacion?: string;
};

export type Participacion = {
  folio: string;
  cuentaId: string;
  tipo: TipoParticipacion;
  noticia?: { slug: string; titulo: string };
  parroquia: Parroquia;
  sector: string;
  categoriaTecnica: CategoriaTecnica;
  descripcion: string;
  adjunto?: Omit<DocumentoCargado, "version">;
  mostrarNombre: boolean;
  /** Nombre o razón social al momento del envío. */
  autor: string;
  estado: EstadoParticipacion;
  creadaEl: string;
  historial: { estado: EstadoParticipacion; fecha: string; comentario?: string }[];
};

type TipoToken = "VERIFICAR" | "RESTABLECER";
type Token = { cuentaId: string; tipo: TipoToken; expira: number; usado: boolean };

export type Almacen = {
  cuentas: Map<string, Cuenta>;
  tokens: Map<string, Token>;
  sesiones: Map<string, string>;
  participaciones: Map<string, Participacion>;
  /** Idempotency-Key ya procesadas (por cuenta) → folio emitido. */
  idempotencia: Map<string, string>;
  /** Último número de folio emitido. */
  secuencia: number;
};

export const crearAlmacen = (): Almacen => ({
  cuentas: new Map(),
  tokens: new Map(),
  sesiones: new Map(),
  participaciones: new Map(),
  idempotencia: new Map(),
  secuencia: 0,
});

/* ---------- Contraseñas (scrypt con sal, comparación en tiempo constante) ---------- */

export function cifrar(contrasena: string) {
  const sal = randomBytes(16).toString("hex");
  return `${sal}:${scryptSync(contrasena, sal, 32).toString("hex")}`;
}

function coincide(contrasena: string, hash: string) {
  const [sal, esperado] = hash.split(":");
  if (!sal || !esperado) return false;
  const calculado = scryptSync(contrasena, sal, 32);
  const guardado = Buffer.from(esperado, "hex");
  return guardado.length === calculado.length && timingSafeEqual(guardado, calculado);
}

const nuevoId = () => randomBytes(18).toString("base64url");

function emitirToken(
  alm: Almacen,
  cuentaId: string,
  tipo: TipoToken,
  horas: number,
  ahora: number,
) {
  // Un enlace nuevo invalida los anteriores del mismo tipo.
  for (const t of alm.tokens.values())
    if (t.cuentaId === cuentaId && t.tipo === tipo) t.usado = true;
  const token = nuevoId();
  alm.tokens.set(token, { cuentaId, tipo, expira: ahora + horas * HORA, usado: false });
  return token;
}

const porCorreo = (alm: Almacen, correo: string) =>
  [...alm.cuentas.values()].find((c) => c.correo === correo.toLowerCase());

/* ---------- Registro ---------- */

export type DatosRegistro =
  | {
      tipo: "NATURAL";
      cedula: string;
      nombres: string;
      apellidos: string;
      correo: string;
      contrasena: string;
    }
  | {
      tipo: "ORGANIZACION";
      tipoEntidad: string;
      razonSocial: string;
      rif: string;
      correo: string;
      contrasena: string;
    };

export type ResultadoRegistro =
  /** Respuesta neutra (202): igual exista o no la cuenta, para no revelar correos registrados. */
  | { estado: "ENVIADO"; tokenDesarrollo?: string }
  /** La cédula o el RIF ya pertenecen a otra cuenta con otro correo. */
  | { estado: "IDENTITY_CONFLICT"; campo: "cedula" | "rif" };

export function registrar(alm: Almacen, d: DatosRegistro, ahora = Date.now()): ResultadoRegistro {
  const correo = d.correo.toLowerCase();
  const existente = porCorreo(alm, correo);
  if (existente) {
    // En producción se envía un correo «ya tienes cuenta» (con enlace para unirse si es de otra
    // alcaldía). La pantalla es la misma que la de un registro nuevo.
    return { estado: "ENVIADO" };
  }

  const otros = [...alm.cuentas.values()];
  if (d.tipo === "NATURAL" && otros.some((c) => c.cedula === d.cedula)) {
    return { estado: "IDENTITY_CONFLICT", campo: "cedula" };
  }
  if (d.tipo === "ORGANIZACION" && otros.some((c) => c.rif === d.rif)) {
    return { estado: "IDENTITY_CONFLICT", campo: "rif" };
  }

  const id = nuevoId();
  const { contrasena, ...datos } = d;
  alm.cuentas.set(id, {
    ...datos,
    id,
    correo,
    hash: cifrar(contrasena),
    verificado: false,
    membresias: [ALCALDIA],
    perfil: {},
    documentos: {},
    estadoVerificacion: "PENDIENTE",
  });
  return { estado: "ENVIADO", tokenDesarrollo: emitirToken(alm, id, "VERIFICAR", 24, ahora) };
}

/** Reenvío de verificación: neutro; solo genera enlace si la cuenta existe y no está verificada. */
export function reenviarVerificacion(alm: Almacen, correo: string, ahora = Date.now()) {
  const c = porCorreo(alm, correo);
  if (!c || c.verificado) return { tokenDesarrollo: undefined };
  return { tokenDesarrollo: emitirToken(alm, c.id, "VERIFICAR", 24, ahora) };
}

/* ---------- Enlaces de un solo uso ---------- */

export type EstadoEnlace = "OK" | "VENCIDO" | "USADO" | "INVALIDO";

function revisarToken(alm: Almacen, token: string, tipo: TipoToken, ahora: number) {
  const t = alm.tokens.get(token);
  if (!t || t.tipo !== tipo) return { estado: "INVALIDO" as const };
  if (t.usado) return { estado: "USADO" as const, t };
  if (t.expira < ahora) return { estado: "VENCIDO" as const, t };
  return { estado: "OK" as const, t };
}

export function verificarCorreo(alm: Almacen, token: string, ahora = Date.now()): EstadoEnlace {
  const r = revisarToken(alm, token, "VERIFICAR", ahora);
  if (r.estado !== "OK") return r.estado;
  r.t.usado = true;
  const c = alm.cuentas.get(r.t.cuentaId);
  if (c) c.verificado = true;
  return "OK";
}

/** Correo al que pertenece un enlace (para ofrecer «reenviar» cuando venció). */
export function correoDeToken(alm: Almacen, token: string) {
  const t = alm.tokens.get(token);
  return t ? alm.cuentas.get(t.cuentaId)?.correo : undefined;
}

/* ---------- Inicio de sesión ---------- */

export type ResultadoIngreso =
  | { estado: "CREDENCIALES" }
  | { estado: "NO_VERIFICADO"; correo: string }
  | { estado: "OK"; sesion: string; siguiente: "UNIRSE" | "PERFIL" | "LISTO" };

export function iniciarSesion(alm: Almacen, correo: string, contrasena: string): ResultadoIngreso {
  const c = porCorreo(alm, correo);
  // Mismo mensaje si el correo no existe o la contraseña no coincide.
  if (!c || !coincide(contrasena, c.hash)) return { estado: "CREDENCIALES" };
  if (!c.verificado) return { estado: "NO_VERIFICADO", correo: c.correo };
  const sesion = nuevoId();
  alm.sesiones.set(sesion, c.id);
  const siguiente = !c.membresias.includes(ALCALDIA)
    ? "UNIRSE"
    : !perfilCompleto(c)
      ? "PERFIL"
      : "LISTO";
  return { estado: "OK", sesion, siguiente };
}

export const cuentaDeSesion = (alm: Almacen, sesion?: string) =>
  sesion ? alm.cuentas.get(alm.sesiones.get(sesion) ?? "") : undefined;

export function cerrarSesion(alm: Almacen, sesion?: string) {
  if (sesion) alm.sesiones.delete(sesion);
}

/** Crea la membresía en esta alcaldía para una cuenta que ya existía en otro portal. */
export function unirse(alm: Almacen, sesion?: string) {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return false;
  if (!c.membresias.includes(ALCALDIA)) c.membresias.push(ALCALDIA);
  return true;
}

/* ---------- Recuperación de contraseña ---------- */

/** Siempre neutro: solo genera enlace si la cuenta existe. */
export function recuperar(alm: Almacen, correo: string, ahora = Date.now()) {
  const c = porCorreo(alm, correo);
  return { tokenDesarrollo: c ? emitirToken(alm, c.id, "RESTABLECER", 1, ahora) : undefined };
}

export const estadoRestablecer = (alm: Almacen, token: string, ahora = Date.now()) =>
  revisarToken(alm, token, "RESTABLECER", ahora).estado;

export function restablecer(
  alm: Almacen,
  token: string,
  contrasena: string,
  ahora = Date.now(),
): EstadoEnlace {
  const r = revisarToken(alm, token, "RESTABLECER", ahora);
  if (r.estado !== "OK") return r.estado;
  r.t.usado = true;
  const c = alm.cuentas.get(r.t.cuentaId);
  if (!c) return "INVALIDO";
  c.hash = cifrar(contrasena);
  // Cambiar la contraseña cierra las sesiones abiertas de la cuenta.
  for (const [s, id] of alm.sesiones) if (id === c.id) alm.sesiones.delete(s);
  return "OK";
}

/* ---------- Perfil ---------- */

export type PasoPerfil = {
  clave: "DATOS" | "IDENTIDAD" | "REPRESENTANTE" | "ACREDITACION" | "ENTIDAD";
  titulo: string;
  hecho: boolean;
};

/** Pasos de «Terminación del perfil» según el tipo de cuenta (v3, formularios 1 y 2). */
export function pasosPerfil(c: Cuenta): PasoPerfil[] {
  const p = c.perfil;
  const d = c.documentos;
  if (c.tipo === "NATURAL") {
    return [
      { clave: "DATOS", titulo: "Teléfono de contacto", hecho: !!p.telefono },
      { clave: "IDENTIDAD", titulo: "Documento de identidad", hecho: !!d.IDENTIDAD },
    ];
  }
  return [
    {
      clave: "REPRESENTANTE",
      titulo: "Datos de quien representa a la organización",
      hecho: !!(
        p.condicion &&
        p.nombresRepresentante &&
        p.cedulaRepresentante &&
        p.telefonoInstitucional
      ),
    },
    {
      clave: "ACREDITACION",
      titulo: "Acreditación de la representación",
      hecho: !!p.acreditacion && (p.acreditacion !== "Sí" || !!d.REPRESENTACION),
    },
    { clave: "ENTIDAD", titulo: "Documento de la organización", hecho: !!d.ENTIDAD },
  ];
}

export const perfilCompleto = (c: Cuenta) => pasosPerfil(c).every((p) => p.hecho);

/** Puede enviar participaciones: perfil completo y sin rechazo del Revisor. */
export const puedeParticipar = (c: Cuenta) =>
  perfilCompleto(c) && c.estadoVerificacion !== "RECHAZADO";

/** Lo que falta para completar el perfil, en palabras para la persona. */
export const faltantesPerfil = (c: Cuenta) =>
  pasosPerfil(c)
    .filter((p) => !p.hecho)
    .map((p) => p.titulo);

/** Con «Requiere corrección», solo se puede tocar el documento que señaló el Revisor. */
export const soloCorreccion = (c: Cuenta) =>
  c.estadoVerificacion === "REQUIERE_CORRECCION" && !!c.correccion;

export type ResultadoPerfil = "OK" | "SIN_SESION" | "BLOQUEADO";

/**
 * Guarda datos del perfil. Con «Requiere corrección» los datos ya revisados no se tocan
 * (v3, rol 1 paso 4): solo se acepta el documento señalado.
 */
export function guardarPerfil(
  alm: Almacen,
  sesion: string | undefined,
  datos: Perfil,
): ResultadoPerfil {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return "SIN_SESION";
  if (soloCorreccion(c)) return "BLOQUEADO";
  c.perfil = { ...c.perfil, ...datos };
  return "OK";
}

/** Sube un documento o lo reemplaza con una versión nueva. */
export function cargarDocumento(
  alm: Almacen,
  sesion: string | undefined,
  tipo: TipoDocumento,
  archivo: { nombre: string; mime: string; tamano: number },
  ahora = Date.now(),
): ResultadoPerfil {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return "SIN_SESION";
  if (soloCorreccion(c) && c.correccion?.documento !== tipo) return "BLOQUEADO";
  const anterior = c.documentos[tipo];
  c.documentos[tipo] = {
    ...archivo,
    version: (anterior?.version ?? 0) + 1,
    subidoEl: new Date(ahora).toISOString(),
  };
  // Un documento nuevo vuelve a la bandeja del Revisor.
  if (c.correccion?.documento === tipo) c.correccion = undefined;
  if (c.estadoVerificacion !== "PENDIENTE") c.estadoVerificacion = "PENDIENTE";
  return "OK";
}

/** Quita la membresía de esta alcaldía y cierra la sesión. La cuenta sigue en otros portales. */
export function abandonarPortal(alm: Almacen, sesion?: string) {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return false;
  c.membresias = c.membresias.filter((m) => m !== ALCALDIA);
  cerrarSesion(alm, sesion);
  return true;
}

/** Registra la solicitud de baja; la atiende la alcaldía (los aportes enviados se conservan). */
export function solicitarBaja(alm: Almacen, sesion?: string, ahora = Date.now()) {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return false;
  c.bajaSolicitada ??= new Date(ahora).toISOString();
  return true;
}

/** Datos mínimos que ve la interfaz: nunca el hash. */
export function resumenCuenta(c: Cuenta) {
  return {
    nombre:
      c.tipo === "NATURAL"
        ? `${c.nombres ?? ""} ${c.apellidos ?? ""}`.trim()
        : (c.razonSocial ?? ""),
    corto: c.tipo === "NATURAL" ? (c.nombres?.split(" ")[0] ?? "") : (c.razonSocial ?? ""),
    tipo: c.tipo,
    correo: c.correo,
    perfilCompleto: perfilCompleto(c),
    puedeParticipar: puedeParticipar(c),
    faltantes: faltantesPerfil(c),
    estadoVerificacion: c.estadoVerificacion,
  };
}

export type ResumenCuenta = ReturnType<typeof resumenCuenta>;

/** Todo lo que muestra «Mi cuenta». */
export function vistaPerfil(c: Cuenta) {
  return {
    ...resumenCuenta(c),
    cedula: c.cedula,
    nombres: c.nombres,
    apellidos: c.apellidos,
    razonSocial: c.razonSocial,
    rif: c.rif,
    tipoEntidad: c.tipoEntidad,
    perfil: c.perfil,
    documentos: c.documentos,
    pasos: pasosPerfil(c),
    correccion: c.correccion,
    bajaSolicitada: c.bajaSolicitada,
  };
}

export type VistaPerfil = ReturnType<typeof vistaPerfil>;

/* ---------- Participación ---------- */

export type DatosParticipacion = Omit<
  Participacion,
  "folio" | "cuentaId" | "autor" | "estado" | "creadaEl" | "historial"
>;

export type ResultadoParticipacion =
  { estado: "OK"; folio: string } | { estado: "SIN_SESION" } | { estado: "PERFIL_INCOMPLETO" };

/**
 * Registra una participación con folio IRI-AAAA-XXXX en estado Pendiente (v3, 5.1).
 * Es idempotente: la misma Idempotency-Key de la misma cuenta devuelve el mismo folio, así un
 * doble clic o un reintento de red no crean dos participaciones.
 */
export function enviarParticipacion(
  alm: Almacen,
  sesion: string | undefined,
  idempotencia: string,
  d: DatosParticipacion,
  ahora = Date.now(),
): ResultadoParticipacion {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return { estado: "SIN_SESION" };
  const clave = `${c.id}:${idempotencia}`;
  const previo = alm.idempotencia.get(clave);
  if (previo) return { estado: "OK", folio: previo };
  if (!puedeParticipar(c)) return { estado: "PERFIL_INCOMPLETO" };

  alm.secuencia += 1;
  const fecha = new Date(ahora);
  const folio = `IRI-${fecha.getFullYear()}-${String(alm.secuencia).padStart(4, "0")}`;
  const creadaEl = fecha.toISOString();
  alm.participaciones.set(folio, {
    ...d,
    folio,
    cuentaId: c.id,
    autor: resumenCuenta(c).nombre,
    estado: "PENDIENTE",
    creadaEl,
    historial: [{ estado: "PENDIENTE", fecha: creadaEl }],
  });
  alm.idempotencia.set(clave, folio);
  return { estado: "OK", folio };
}

/** Una participación propia; nadie ve los folios de otra cuenta. */
export function participacionPropia(alm: Almacen, sesion: string | undefined, folio: string) {
  const c = cuentaDeSesion(alm, sesion);
  const p = alm.participaciones.get(folio);
  return c && p?.cuentaId === c.id ? p : undefined;
}

/** Participaciones de la cuenta, de la más reciente a la más antigua (base de la 3.11). */
export function participacionesDe(alm: Almacen, sesion?: string) {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return [];
  return [...alm.participaciones.values()]
    .filter((p) => p.cuentaId === c.id)
    .sort((a, b) => b.creadaEl.localeCompare(a.creadaEl));
}
