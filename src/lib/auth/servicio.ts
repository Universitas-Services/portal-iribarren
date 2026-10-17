import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

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
  perfilCompleto: boolean;
  /** Persona natural. */
  cedula?: string;
  nombres?: string;
  apellidos?: string;
  /** Organización: la cédula del representante llega al completar el perfil. */
  razonSocial?: string;
  rif?: string;
  tipoEntidad?: string;
};

type TipoToken = "VERIFICAR" | "RESTABLECER";
type Token = { cuentaId: string; tipo: TipoToken; expira: number; usado: boolean };

export type Almacen = {
  cuentas: Map<string, Cuenta>;
  tokens: Map<string, Token>;
  sesiones: Map<string, string>;
};

export const crearAlmacen = (): Almacen => ({
  cuentas: new Map(),
  tokens: new Map(),
  sesiones: new Map(),
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
    perfilCompleto: false,
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
    : !c.perfilCompleto
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

/** Lo que falta para completar el perfil, según el tipo de cuenta (v3, «Terminación del perfil»). */
export function faltantesPerfil(c: Cuenta): string[] {
  if (c.perfilCompleto) return [];
  return c.tipo === "NATURAL"
    ? ["Teléfono de contacto", "Ocupación (opcional)", "Documento de identidad (PDF, JPG o PNG)"]
    : [
        "Condición en la que actúas (representante legal, vocero u otra)",
        "Nombres, apellidos y cédula del representante",
        "Documento que acredita la representación",
      ];
}

/** Datos mínimos que ve la interfaz: nunca el hash ni datos de identidad completos. */
export function resumenCuenta(c: Cuenta) {
  return {
    nombre:
      c.tipo === "NATURAL"
        ? `${c.nombres ?? ""} ${c.apellidos ?? ""}`.trim()
        : (c.razonSocial ?? ""),
    corto: c.tipo === "NATURAL" ? (c.nombres?.split(" ")[0] ?? "") : (c.razonSocial ?? ""),
    tipo: c.tipo,
    correo: c.correo,
    perfilCompleto: c.perfilCompleto,
    faltantes: faltantesPerfil(c),
  };
}

export type ResumenCuenta = ReturnType<typeof resumenCuenta>;
