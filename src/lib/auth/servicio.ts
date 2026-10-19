import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { EnlaceVideo } from "@/lib/noticias/video";
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
  /**
   * VERIFICADO en cuanto el perfil queda completo (decisión del cliente). El Revisor no verifica
   * perfiles: coteja los documentos de identidad del autor al evaluar cada participación.
   */
  estadoVerificacion: EstadoVerificacion;
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
  /** Epoch ms desde el que valen sus sesiones (cambio o restablecimiento de contraseña). */
  sesionesDesde?: number;
  /** Epoch ms del último cambio, para saber qué instantánea de la sesión es más nueva. */
  actualizadaEl?: number;
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
  /** Metadatos: los archivos van a Storage en plataforma-api. */
  imagenes: Omit<DocumentoCargado, "version" | "subidoEl">[];
  video?: EnlaceVideo;
  soporte?: Omit<DocumentoCargado, "version" | "subidoEl">;
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
  c.sesionesDesde = ahora;
  return "OK";
}

export type ResultadoCambioContrasena =
  "OK" | "SIN_SESION" | "ACTUAL_INCORRECTA" | "IGUAL_A_LA_ACTUAL";

/**
 * Cambio de contraseña con la sesión abierta (POST /portal/auth/password/change, por pedir a
 * backend). Exige la actual y cierra las demás sesiones de la cuenta; la actual sigue abierta.
 */
export function cambiarContrasena(
  alm: Almacen,
  sesion: string | undefined,
  actual: string,
  nueva: string,
): ResultadoCambioContrasena {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return "SIN_SESION";
  if (!coincide(actual, c.hash)) return "ACTUAL_INCORRECTA";
  if (actual === nueva) return "IGUAL_A_LA_ACTUAL";
  c.hash = cifrar(nueva);
  for (const [s, id] of alm.sesiones) if (id === c.id && s !== sesion) alm.sesiones.delete(s);
  // Los tokens anteriores dejan de valer; la sesión actual se vuelve a firmar al terminar.
  c.sesionesDesde = Date.now();
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

/**
 * La verificación es automática: un perfil completo queda VERIFICADO (y sigue así aunque se
 * reemplace un documento). Solo un RECHAZADO puesto desde el admin se conserva.
 */
function sincronizarVerificacion(c: Cuenta) {
  if (c.estadoVerificacion === "RECHAZADO") return;
  c.estadoVerificacion = perfilCompleto(c) ? "VERIFICADO" : "PENDIENTE";
}

export type ResultadoPerfil = "OK" | "SIN_SESION";

/** Guarda datos del perfil; si con ellos queda completo, la cuenta pasa a VERIFICADO. */
export function guardarPerfil(
  alm: Almacen,
  sesion: string | undefined,
  datos: Perfil,
): ResultadoPerfil {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return "SIN_SESION";
  c.perfil = { ...c.perfil, ...datos };
  sincronizarVerificacion(c);
  return "OK";
}

/**
 * Corrige nombres y apellidos de una persona natural (PATCH /portal/me/profile). La cédula no
 * se edita y el estado de verificación no cambia: el Revisor coteja nombre y cédula al evaluar
 * cada participación. Los aportes enviados conservan el nombre de entonces.
 */
export function actualizarNombres(
  alm: Almacen,
  sesion: string | undefined,
  nombres: string,
  apellidos: string,
): ResultadoPerfil {
  const c = cuentaDeSesion(alm, sesion);
  if (!c || c.tipo !== "NATURAL") return "SIN_SESION";
  c.nombres = nombres;
  c.apellidos = apellidos;
  return "OK";
}

/** Sube un documento o lo reemplaza con una versión nueva; si completa el perfil, lo verifica. */
export function cargarDocumento(
  alm: Almacen,
  sesion: string | undefined,
  tipo: TipoDocumento,
  archivo: { nombre: string; mime: string; tamano: number },
  ahora = Date.now(),
): ResultadoPerfil {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return "SIN_SESION";
  const anterior = c.documentos[tipo];
  c.documentos[tipo] = {
    ...archivo,
    version: (anterior?.version ?? 0) + 1,
    subidoEl: new Date(ahora).toISOString(),
  };
  sincronizarVerificacion(c);
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

/**
 * Transiciones que puede hacer el Revisor desde el admin (v3, 5.1). Despublicar devuelve una
 * propuesta PUBLICADA a APROBADA.
 */
export const TRANSICIONES: Record<EstadoParticipacion, EstadoParticipacion[]> = {
  PENDIENTE: ["EN_REVISION"],
  EN_REVISION: ["APROBADA", "RECHAZADA"],
  APROBADA: ["PUBLICADA"],
  RECHAZADA: [],
  PUBLICADA: ["APROBADA"],
};

export type ResultadoTransicion =
  | { estado: "OK" }
  | { estado: "NO_EXISTE" }
  | { estado: "TRANSICION_INVALIDA" }
  | { estado: "FALTA_MOTIVO" }
  | { estado: "SIN_NOMBRE_AUTORIZADO" };

/**
 * Cambio de estado de una participación, como lo hará el Revisor en plataforma-admin. En el
 * portal solo lo usa el simulador de desarrollo (y las pruebas E2E) para ver el seguimiento.
 */
export function cambiarEstadoParticipacion(
  alm: Almacen,
  folio: string,
  nuevo: EstadoParticipacion,
  comentario?: string,
  ahora = Date.now(),
): ResultadoTransicion {
  const p = alm.participaciones.get(folio.toUpperCase());
  if (!p) return { estado: "NO_EXISTE" };
  if (!TRANSICIONES[p.estado].includes(nuevo)) return { estado: "TRANSICION_INVALIDA" };
  const texto = comentario?.trim() || undefined;
  if (nuevo === "RECHAZADA" && !texto) return { estado: "FALTA_MOTIVO" };
  if (nuevo === "PUBLICADA" && !p.mostrarNombre) return { estado: "SIN_NOMBRE_AUTORIZADO" };
  p.estado = nuevo;
  p.historial.push({ estado: nuevo, fecha: new Date(ahora).toISOString(), comentario: texto });
  return { estado: "OK" };
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

/* ---------- Seguimiento y galería pública ---------- */

export type FiltroParticipaciones = {
  estado?: EstadoParticipacion;
  tipo?: TipoParticipacion;
  parroquia?: Parroquia;
  categoriaTecnica?: CategoriaTecnica;
  /** Folio completo o solo su número: «IRI-2026-0045», «2026-0045» o «45». */
  folio?: string;
  /** Texto libre en descripción, sector y autor (galería pública). */
  q?: string;
};

const sinTildes = (t: string) =>
  t
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

/** Si el folio buscado es solo un número, compara contra el secuencial sin ceros a la izquierda. */
function coincideFolio(folio: string, buscado: string) {
  const b = buscado.trim().toUpperCase();
  if (!b) return true;
  if (/^\d+$/.test(b)) return Number(folio.slice(-4)) === Number(b) || folio.endsWith(b);
  return folio.includes(b);
}

export function filtrarParticipaciones(lista: Participacion[], f: FiltroParticipaciones) {
  const q = f.q ? sinTildes(f.q.trim()) : "";
  return lista.filter(
    (p) =>
      (!f.estado || p.estado === f.estado) &&
      (!f.tipo || p.tipo === f.tipo) &&
      (!f.parroquia || p.parroquia === f.parroquia) &&
      (!f.categoriaTecnica || p.categoriaTecnica === f.categoriaTecnica) &&
      (!f.folio || coincideFolio(p.folio, f.folio)) &&
      (!q || sinTildes(`${p.descripcion} ${p.sector} ${p.autor}`).includes(q)),
  );
}

/**
 * Lo que puede ver cualquier visitante de una participación publicada: nunca el id de la
 * cuenta ni datos de contacto. El autor solo aparece si autorizó mostrar su nombre (v3, 5.1).
 */
export function vistaPublica(p: Participacion) {
  const { cuentaId: _cuenta, historial, mostrarNombre, autor, ...resto } = p;
  return {
    ...resto,
    autor: mostrarNombre ? autor : undefined,
    publicadaEl: historial.find((h) => h.estado === "PUBLICADA")?.fecha ?? p.creadaEl,
  };
}

export type PropuestaPublica = ReturnType<typeof vistaPublica>;

/** Galería pública: solo PUBLICADA y con nombre autorizado, de la más reciente a la más antigua. */
export function propuestasPublicadas(alm: Almacen, f: FiltroParticipaciones = {}) {
  const publicadas = [...alm.participaciones.values()].filter(
    (p) => p.estado === "PUBLICADA" && p.mostrarNombre,
  );
  return filtrarParticipaciones(publicadas, { ...f, estado: undefined })
    .map(vistaPublica)
    .sort((a, b) => b.publicadaEl.localeCompare(a.publicadaEl));
}

export function propuestaPublica(alm: Almacen, folio: string) {
  const p = alm.participaciones.get(folio.toUpperCase());
  return p && p.estado === "PUBLICADA" && p.mostrarNombre ? vistaPublica(p) : undefined;
}
