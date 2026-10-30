import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { EnlaceVideo } from "@/lib/noticias/video";
import { AUTOR_ANONIMO, TRANSICIONES_OPINION, tieneSeguimiento } from "@/lib/participacion";
export { tieneSeguimiento };
import type {
  CategoriaTecnica,
  EstadoParticipacion,
  EstadoVerificacion,
  Parroquia,
  TipoParticipacion,
  TipoTextoLegal,
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
  /** Datos de «Terminación del perfil» (v3). */
  perfil: Perfil;
  /** Solo metadatos: el archivo va a Storage en plataforma-api. */
  documentos: Partial<Record<TipoDocumento, DocumentoCargado>>;
  /**
   * VERIFICADO en cuanto carga sus documentos (R18: la verificación va aparte del perfil). El
   * Revisor no verifica perfiles: coteja los documentos del autor al evaluar cada participación.
   */
  estadoVerificacion: EstadoVerificacion;
  /** Fecha ISO en que pidió la baja de la cuenta. */
  bajaSolicitada?: string;
  /**
   * Fecha ISO en que terminó o saltó el recorrido guiado. Sin ella, el recorrido se lanza solo en
   * el primer ingreso. Vacía ("") si la API no lo informa: se toma como visto.
   */
  tourVistoAt?: string;
  /**
   * Versión aceptada de cada texto legal. Si una es distinta de la vigente, tiene que aceptarla
   * de nuevo para seguir usando la cuenta. Sin el dato (la API aún no lo informa), nada pendiente.
   */
  textosAceptados?: Partial<Record<TipoTextoLegal, string>>;
  /** Versión vigente de cada texto según la API ("" si no hay ninguna publicada). */
  textosVigentes?: Partial<Record<TipoTextoLegal, string>>;
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
  /** «Sí», «No» o «No aplica»: si es «Sí», la verificación pide el documento REPRESENTACION. */
  acreditacion?: string;
};

export type Participacion = {
  folio: string;
  cuentaId: string;
  tipo: TipoParticipacion;
  noticia?: { slug: string; titulo: string };
  parroquia: Parroquia;
  sector: string;
  /** Punto marcado en el mapa: no se publica, solo lo ven el autor y la alcaldía. */
  ubicacion?: { lat: number; lng: number };
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
  /** Cuándo se publicó en la galería (con la API). */
  publicadaEl?: string;
  historial: {
    estado: EstadoParticipacion;
    fecha: string;
    comentario?: string;
    /** Código del motivo de rechazo (con la API). */
    motivo?: string;
  }[];
  /** Acuse con código de verificación y huella (con la API, guía R11). */
  comprobante?: { codigoVerificacion: string; hashContenido: string; sello: string | null };
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

export type DatosRegistro = (
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
    }
) & {
  /** Versiones de los textos legales que aceptó al registrarse. */
  textosAceptados?: Cuenta["textosAceptados"];
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
    // En producción se envía un correo «ya tienes cuenta». La pantalla es la misma que la de un
    // registro nuevo.
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
  | { estado: "OK"; sesion: string };

export function iniciarSesion(alm: Almacen, correo: string, contrasena: string): ResultadoIngreso {
  const c = porCorreo(alm, correo);
  // Mismo mensaje si el correo no existe o la contraseña no coincide.
  if (!c || !coincide(contrasena, c.hash)) return { estado: "CREDENCIALES" };
  if (!c.verificado) return { estado: "NO_VERIFICADO", correo: c.correo };
  const sesion = nuevoId();
  alm.sesiones.set(sesion, c.id);
  return { estado: "OK", sesion };
}

export const cuentaDeSesion = (alm: Almacen, sesion?: string) =>
  sesion ? alm.cuentas.get(alm.sesiones.get(sesion) ?? "") : undefined;

export function cerrarSesion(alm: Almacen, sesion?: string) {
  if (sesion) alm.sesiones.delete(sesion);
}

/**
 * «Cerrar sesión en todos los dispositivos» (POST /auth/sessions/revoke-all): cierra todas las
 * sesiones de la cuenta, también esta. Devuelve false si no hay sesión.
 */
export function cerrarTodasLasSesiones(alm: Almacen, sesion?: string, ahora = Date.now()) {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return false;
  for (const [s, id] of alm.sesiones) if (id === c.id) alm.sesiones.delete(s);
  c.sesionesDesde = ahora;
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
  clave: "DATOS" | "REPRESENTANTE" | "ACREDITACION";
  titulo: string;
  hecho: boolean;
};

/**
 * Pasos de «Terminación del perfil» según el tipo de cuenta: solo datos (R18). Los documentos
 * van aparte, en la verificación para propuestas formales.
 */
export function pasosPerfil(c: Cuenta): PasoPerfil[] {
  const p = c.perfil;
  if (c.tipo === "NATURAL") {
    return [{ clave: "DATOS", titulo: "Teléfono de contacto", hecho: !!p.telefono }];
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
    { clave: "ACREDITACION", titulo: "Acreditación de la representación", hecho: !!p.acreditacion },
  ];
}

export type PasoVerificacion = { clave: TipoDocumento; titulo: string; hecho: boolean };

/**
 * Documentos de la verificación para propuestas formales (opcional): la cédula de la persona, o
 * el documento de la organización y, si dijo tener acreditación, el de la representación.
 */
export function pasosVerificacion(c: Cuenta): PasoVerificacion[] {
  const d = c.documentos;
  if (c.tipo === "NATURAL") {
    return [{ clave: "IDENTIDAD", titulo: "Documento de identidad", hecho: !!d.IDENTIDAD }];
  }
  return [
    { clave: "ENTIDAD", titulo: "Documento de la organización", hecho: !!d.ENTIDAD },
    ...(c.perfil.acreditacion === "Sí"
      ? [
          {
            clave: "REPRESENTACION" as const,
            titulo: "Documento que acredita la representación",
            hecho: !!d.REPRESENTACION,
          },
        ]
      : []),
  ];
}

export const perfilCompleto = (c: Cuenta) => pasosPerfil(c).every((p) => p.hecho);

export const documentosCompletos = (c: Cuenta) => pasosVerificacion(c).every((p) => p.hecho);

/**
 * Solo la propuesta formal tiene requisitos: el perfil completo y los documentos cargados. Las
 * opiniones (general o sobre una noticia) solo piden la sesión (decisión del cliente).
 */
export const puedeEnviarTipo = (c: Cuenta, tipo: TipoParticipacion) =>
  tipo !== "PROPUESTA_FORMAL" || (perfilCompleto(c) && documentosCompletos(c));

/** Lo que falta para completar el perfil, en palabras para la persona. */
export const faltantesPerfil = (c: Cuenta) =>
  pasosPerfil(c)
    .filter((p) => !p.hecho)
    .map((p) => p.titulo);

/** Los documentos que faltan para la verificación. */
export const faltantesVerificacion = (c: Cuenta) =>
  pasosVerificacion(c)
    .filter((p) => !p.hecho)
    .map((p) => p.titulo);

/** Qué tiene completo la cuenta, para el aviso después de guardar. */
export type EstadoPerfil = { perfil: boolean; verificacion: boolean };

export const estadoPerfil = (c: Cuenta): EstadoPerfil => ({
  perfil: perfilCompleto(c),
  verificacion: documentosCompletos(c),
});

/**
 * A dónde vuelve «Mi cuenta» tras guardar: con el aviso de que ya puede proponer si con esto
 * quedaron el perfil y los documentos, o de que el perfil quedó completo.
 */
export function destinoTrasGuardar(antes: EstadoPerfil, despues?: EstadoPerfil) {
  if (despues?.perfil && despues.verificacion && !(antes.perfil && antes.verificacion))
    return "/mi-cuenta?guardado=verificado";
  if (despues?.perfil && !antes.perfil) return "/mi-cuenta?guardado=completo";
  return "/mi-cuenta?guardado=1";
}

/**
 * La verificación es automática: con los documentos cargados la cuenta queda VERIFICADO (y sigue
 * así aunque reemplace uno).
 */
function sincronizarVerificacion(c: Cuenta) {
  c.estadoVerificacion = documentosCompletos(c) ? "VERIFICADO" : "PENDIENTE";
}

export type ResultadoPerfil = "OK" | "SIN_SESION";

/** Guarda datos del perfil (la acreditación «Sí» puede dejar pendiente la verificación). */
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

/** Sube un documento o lo reemplaza con una versión nueva; si son todos, verifica la cuenta. */
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
    /** Cargó los documentos de la verificación (insignia «Verificado»). */
    documentosCompletos: documentosCompletos(c),
    /** Puede enviar una propuesta formal; las opiniones no tienen requisito. */
    puedeProponer: puedeEnviarTipo(c, "PROPUESTA_FORMAL"),
    /** Lo que falta del perfil (datos). */
    faltantes: faltantesPerfil(c),
    /** Los documentos que faltan para la verificación. */
    faltantesVerificacion: faltantesVerificacion(c),
    estadoVerificacion: c.estadoVerificacion,
    /** Primer ingreso: el recorrido guiado se lanza solo. */
    tourPendiente: c.tourVistoAt === undefined,
  };
}

/** Registra la aceptación de las versiones vigentes de los textos legales. */
export function aceptarTextosLegales(
  alm: Almacen,
  sesion: string | undefined,
  versiones: Partial<Record<TipoTextoLegal, string>>,
) {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return false;
  c.textosAceptados = { ...c.textosAceptados, ...versiones };
  c.actualizadaEl = Date.now();
  return true;
}

/** Marca el recorrido guiado como visto (al terminarlo o saltarlo). */
export function marcarTourVisto(alm: Almacen, sesion?: string, ahora = Date.now()) {
  const c = cuentaDeSesion(alm, sesion);
  if (!c) return false;
  c.tourVistoAt ??= new Date(ahora).toISOString();
  return true;
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
    pasosVerificacion: pasosVerificacion(c),
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
  if (!puedeEnviarTipo(c, d.tipo)) return { estado: "PERFIL_INCOMPLETO" };

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
  // Decisión del cliente (19-10-2026, D1 cerrada el 26-10): el Revisor puede verificar o
  // rechazar directo desde Pendiente, y rechazar una verificada.
  PENDIENTE: ["EN_REVISION", "APROBADA", "RECHAZADA"],
  EN_REVISION: ["APROBADA", "RECHAZADA"],
  APROBADA: ["PUBLICADA", "RECHAZADA"],
  RECHAZADA: [],
  PUBLICADA: ["APROBADA"],
};

export type ResultadoTransicion =
  | { estado: "OK" }
  | { estado: "NO_EXISTE" }
  | { estado: "TRANSICION_INVALIDA" }
  | { estado: "FALTA_MOTIVO" }
  /** Las opiniones solo se publican o despublican: no pasan por revisión ni rechazo. */
  | { estado: "SIN_SEGUIMIENTO" };

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
  if (!tieneSeguimiento(p.tipo)) {
    if (!TRANSICIONES_OPINION[p.estado]?.includes(nuevo)) return { estado: "SIN_SEGUIMIENTO" };
  } else if (!TRANSICIONES[p.estado].includes(nuevo)) return { estado: "TRANSICION_INVALIDA" };
  const texto = comentario?.trim() || undefined;
  if (nuevo === "RECHAZADA" && !texto) return { estado: "FALTA_MOTIVO" };
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
      // El nombre de quien no lo autorizó no se busca: encontrarlo por su nombre lo delataría.
      (!q || sinTildes(`${p.descripcion} ${p.sector} ${autorVisible(p)}`).includes(q)),
  );
}

const autorVisible = (p: Participacion) => (p.mostrarNombre ? p.autor : AUTOR_ANONIMO);

/**
 * Lo que puede ver cualquier visitante de una participación publicada: nunca el id de la
 * cuenta ni datos de contacto. Sin nombre autorizado, el autor es «Ciudadano de Iribarren».
 */
export function vistaPublica(p: Participacion): PropuestaPublica {
  // La ubicación exacta no se publica: puede ser la casa de la persona.
  const {
    cuentaId: _cuenta,
    historial,
    mostrarNombre: _mostrar,
    autor: _autor,
    ubicacion: _ubicacion,
    ...resto
  } = p;
  return {
    ...resto,
    autor: autorVisible(p),
    publicadaEl: historial.find((h) => h.estado === "PUBLICADA")?.fecha ?? p.creadaEl,
  };
}

/** Una participación en la galería pública: sin cuenta, historial, ubicación ni estado. */
export type PropuestaPublica = Omit<
  Participacion,
  "cuentaId" | "historial" | "mostrarNombre" | "autor" | "ubicacion" | "comprobante"
> & {
  /** El nombre, o «Ciudadano de Iribarren» si no autorizó mostrarlo. */
  autor: string;
  publicadaEl: string;
  /** Vistas y reacciones de la API (en cero hasta R12). */
  totales?: { vistas: number; likes: number; dislikes: number };
};

/** Galería pública: todo lo PUBLICADA, de lo más reciente a lo más antiguo. */
export function propuestasPublicadas(alm: Almacen, f: FiltroParticipaciones = {}) {
  const publicadas = [...alm.participaciones.values()].filter((p) => p.estado === "PUBLICADA");
  return filtrarParticipaciones(publicadas, { ...f, estado: undefined })
    .map(vistaPublica)
    .sort((a, b) => b.publicadaEl.localeCompare(a.publicadaEl));
}

export function propuestaPublica(alm: Almacen, folio: string) {
  const p = alm.participaciones.get(folio.toUpperCase());
  return p && p.estado === "PUBLICADA" ? vistaPublica(p) : undefined;
}
