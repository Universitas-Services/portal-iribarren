"use server";

import { RedirectType, redirect } from "next/navigation";
import { refresh } from "next/cache";
import type { z } from "zod";
import type { TipoTextoLegal } from "@/lib/api/types";
import { getPost } from "@/lib/api";
import { usaApi } from "@/lib/plataforma-api/cliente";
import {
  MENSAJE_TEXTOS_PENDIENTES,
  textosPendientes,
  textosVigentes,
  versionesVistasVigentes,
} from "./textos-legales";
import {
  acreditacionSchema,
  cambiarContrasenaSchema,
  datosNaturalSchema,
  documentoPerfilSchema,
  loginSchema,
  nombresSchema,
  participacionSchema,
  recuperarSchema,
  registroNaturalSchema,
  registroOrganizacionSchema,
  representanteSchema,
  restablecerSchema,
} from "@/lib/validation/schemas";
import {
  actualizarNombres,
  cambiarContrasena,
  cargarDocumento,
  cerrarSesion,
  cerrarTodasLasSesiones,
  cuentaDeSesion,
  enviarParticipacion,
  guardarPerfil,
  marcarTourVisto,
  aceptarTextosLegales,
  perfilCompleto,
  solicitarBaja,
  iniciarSesion,
  recuperar,
  reenviarVerificacion,
  registrar,
  restablecer,
  verificarCorreo,
} from "./servicio";
import {
  cambiarContrasenaApi,
  cerrarSesionApi,
  cerrarTodasLasSesionesApi,
  guardarPerfilApi,
  ingresarApi,
  marcarTourVistoApi,
  aceptarTextosLegalesApi,
  reenviarApi,
  recuperarApi,
  restablecerApi,
  solicitarBajaApi,
  registrarApi,
} from "./acciones-api";
import {
  abrirSesion,
  almacen,
  borrarSesion,
  esDemo,
  esDesarrollo,
  guardarAviso,
  idSesion,
  refrescarSesion,
  leerAviso,
} from "./sesion";

/** Estado que devuelven las acciones a sus formularios (useActionState). */
export type EstadoFormulario = {
  errores?: Record<string, string>;
  /** Lo escrito, para no vaciar el formulario si hay errores (nunca las contraseñas). */
  valores?: Record<string, string>;
  mensaje?: { tipo: "error" | "info" | "exito"; texto: string };
  /** Solo en desarrollo: enlace que en producción llegaría por correo. */
  enlaceDesarrollo?: string;
  /** El inicio de sesión falló porque el correo no está verificado. */
  noVerificado?: boolean;
};

const CASILLAS = ["aceptaTerminos", "aceptaPoliticaDatos"];
const SECRETOS = ["contrasenaActual", "contrasena", "confirmarContrasena"];

/** Convierte el FormData en objeto: casillas a booleano y prefijos de cédula/RIF unidos. */
function leer(fd: FormData) {
  const datos: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") datos[k] = v;
  for (const c of CASILLAS) datos[c] = fd.get(c) === "on";
  if (fd.has("cedulaNumero")) datos.cedula = `${fd.get("cedulaPrefijo")}-${fd.get("cedulaNumero")}`;
  if (fd.has("rifNumero")) datos.rif = `${fd.get("rifPrefijo")}-${fd.get("rifNumero")}`;
  if (fd.has("cedulaRepresentanteNumero"))
    datos.cedulaRepresentante = `${fd.get("cedulaRepresentantePrefijo")}-${fd.get("cedulaRepresentanteNumero")}`;
  // Un <input type="file"> vacío llega como un archivo de 0 bytes: se trata como «sin archivo».
  for (const [k, v] of fd.entries()) if (v instanceof File && v.size > 0) datos[k] = v;
  // Campos con varios archivos.
  if (fd.has("imagenes"))
    datos.imagenes = fd.getAll("imagenes").filter((f) => f instanceof File && f.size > 0);
  return datos;
}

/** Lo escrito por la persona, sin contraseñas, para volver a llenar el formulario. */
function valoresDe(datos: Record<string, unknown>) {
  const valores: Record<string, string> = {};
  for (const [k, v] of Object.entries(datos)) {
    if (typeof v === "string" && !SECRETOS.includes(k)) valores[k] = v;
    // Las casillas marcadas vuelven marcadas.
    else if (v === true) valores[k] = "on";
  }
  return valores;
}

function conErrores(error: z.ZodError, datos: Record<string, unknown>): EstadoFormulario {
  const errores: Record<string, string> = {};
  for (const i of error.issues) {
    const campo = String(i.path[0] ?? "formulario");
    errores[campo] ??= i.message;
  }
  return { errores, valores: valoresDe(datos) };
}

/** Solo rutas internas para «volver», para no abrir una redirección a otro sitio. */
function destinoSeguro(volver: unknown, porDefecto: string) {
  return typeof volver === "string" && volver.startsWith("/") && !volver.startsWith("//")
    ? volver
    : porDefecto;
}

/**
 * Redirección que reemplaza la entrada del historial. En una Server Action, `redirect()` usa
 * push por defecto: tras iniciar sesión, «atrás» volvería al formulario de ingreso.
 */
function ir(ruta: string): never {
  return redirect(ruta, RedirectType.replace);
}

const enlace = (ruta: string, token?: string) =>
  (esDesarrollo || esDemo) && token ? `${ruta}?token=${token}` : undefined;

/* ---------- Registro ---------- */

async function finalizarRegistro(
  r: ReturnType<typeof registrar>,
  correo: string,
  datos: Record<string, unknown>,
  contrasena: string,
): Promise<EstadoFormulario> {
  if (r.estado === "IDENTITY_CONFLICT") {
    const campo = r.campo === "cedula" ? "cédula" : "RIF";
    return {
      valores: valoresDe(datos),
      mensaje: {
        tipo: "error",
        texto: `Esta ${campo} ya está registrada con otro correo. Si es tuya, escribe a soporte para recuperar el acceso.`,
      },
    };
  }
  // Demostración: sin correo real, la cuenta queda verificada y se entra directo a completar el
  // perfil. Si el correo ya existía (respuesta neutra), se sigue como siempre.
  if (esDemo && r.estado === "ENVIADO" && r.tokenDesarrollo) {
    verificarCorreo(almacen(), r.tokenDesarrollo);
    const ingreso = iniciarSesion(almacen(), correo, contrasena);
    if (ingreso.estado === "OK") {
      await abrirSesion(ingreso.sesion);
      ir("/mi-cuenta");
    }
  }
  await guardarAviso({ correo, enlaceDesarrollo: enlace("/verificar", r.tokenDesarrollo) });
  ir("/registro/revisa-tu-correo");
}

/**
 * Con un texto legal pendiente de aceptar, la cuenta no escribe nada (R15): ni perfil, ni
 * contraseña, ni aportes. El modal de aceptación ya está a la vista.
 */
async function bloqueoPorTextos(): Promise<EstadoFormulario | undefined> {
  const pendientes = await textosPendientes(cuentaDeSesion(almacen(), await idSesion()));
  if (pendientes.length === 0) return undefined;
  return { mensaje: { tipo: "error", texto: MENSAJE_TEXTOS_PENDIENTES } };
}

/** Un texto legal cambió mientras la persona llenaba el registro: debe leerlo otra vez. */
function textosCambiaron(datos: Record<string, unknown>): EstadoFormulario {
  const { aceptaTerminos: _t, aceptaPoliticaDatos: _p, ...resto } = datos;
  return {
    valores: valoresDe(resto),
    mensaje: {
      tipo: "error",
      texto:
        "Los términos de uso o la política de datos se actualizaron mientras te registrabas. Léelos y acéptalos de nuevo.",
    },
  };
}

export async function registrarNaturalAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = registroNaturalSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const { cedula, nombres, apellidos, correo, contrasena } = p.data;
  const textosAceptados = await versionesVistasVigentes(fd);
  if (!textosAceptados) return textosCambiaron(datos);
  if (usaApi())
    return registrarApi(
      { tipo: "NATURAL", cedula, nombres, apellidos },
      correo,
      contrasena,
      valoresDe(datos),
      textosAceptados,
    );
  const r = registrar(almacen(), {
    tipo: "NATURAL",
    cedula,
    nombres,
    apellidos,
    correo,
    contrasena,
    textosAceptados,
  });
  return finalizarRegistro(r, correo, datos, contrasena);
}

export async function registrarOrganizacionAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = registroOrganizacionSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const { tipoEntidad, razonSocial, rif, correo, contrasena } = p.data;
  const textosAceptados = await versionesVistasVigentes(fd);
  if (!textosAceptados) return textosCambiaron(datos);
  if (usaApi())
    return registrarApi(
      { tipo: "ORGANIZACION", tipoEntidad, razonSocial, rif },
      correo,
      contrasena,
      valoresDe(datos),
      textosAceptados,
    );
  const r = registrar(almacen(), {
    tipo: "ORGANIZACION",
    tipoEntidad,
    razonSocial,
    rif,
    correo,
    contrasena,
    textosAceptados,
  });
  return finalizarRegistro(r, correo, datos, contrasena);
}

/** Reenvía la verificación al correo del último registro (o al indicado al iniciar sesión). */
export async function reenviarAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const correo = String(fd.get("correo") ?? "") || (await leerAviso())?.correo;
  if (!correo)
    return { mensaje: { tipo: "error", texto: "Vuelve a registrarte para recibir un enlace." } };
  if (usaApi()) return reenviarApi(correo);
  const { tokenDesarrollo } = reenviarVerificacion(almacen(), correo);
  const enlaceDesarrollo = enlace("/verificar", tokenDesarrollo);
  await guardarAviso({ correo, enlaceDesarrollo });
  return {
    mensaje: {
      tipo: "info",
      texto: "Si la cuenta existe y aún no está verificada, te enviamos un enlace nuevo.",
    },
    enlaceDesarrollo,
  };
}

/* ---------- Inicio y cierre de sesión ---------- */

export async function ingresarAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = loginSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi())
    return ingresarApi(
      p.data.correo,
      p.data.contrasena,
      destinoSeguro(fd.get("volver"), "/mi-cuenta"),
    );
  const r = iniciarSesion(almacen(), p.data.correo, p.data.contrasena);
  if (r.estado === "CREDENCIALES") {
    return {
      valores: { correo: p.data.correo },
      mensaje: { tipo: "error", texto: "El correo o la contraseña no son correctos." },
    };
  }
  if (r.estado === "NO_VERIFICADO") {
    return {
      valores: { correo: p.data.correo },
      noVerificado: true,
      mensaje: {
        tipo: "error",
        texto: "Aún no verificas tu correo. Abre el enlace que te enviamos o pide uno nuevo.",
      },
    };
  }
  await abrirSesion(r.sesion);
  const volver = destinoSeguro(fd.get("volver"), "/mi-cuenta");
  if (r.siguiente === "PERFIL") ir("/mi-cuenta");
  ir(volver);
}

export async function cerrarSesionAccion() {
  if (usaApi()) await cerrarSesionApi();
  else cerrarSesion(almacen(), await idSesion());
  await borrarSesion();
  ir("/");
}

/** Cierra la sesión en este y en todos los dispositivos de la cuenta, y vuelve al ingreso. */
export async function cerrarTodasLasSesionesAccion() {
  // Si la API falla, la cookie ya se borró: igual hay que volver a ingresar.
  if (usaApi()) await cerrarTodasLasSesionesApi().catch(() => {});
  else cerrarTodasLasSesiones(almacen(), await idSesion());
  await borrarSesion();
  ir("/ingresar?aviso=sesiones");
}

/* ---------- Recuperar y restablecer ---------- */

export async function recuperarAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = recuperarSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi()) return recuperarApi(p.data.correo);
  const { tokenDesarrollo } = recuperar(almacen(), p.data.correo);
  return {
    valores: { correo: p.data.correo },
    mensaje: {
      tipo: "exito",
      texto:
        "Si hay una cuenta con ese correo, te enviamos un enlace para crear una contraseña nueva. Vence en 1 hora.",
    },
    enlaceDesarrollo: enlace("/restablecer", tokenDesarrollo),
  };
}

export async function restablecerAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = restablecerSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi()) return restablecerApi(p.data.token, p.data.contrasena);
  const estado = restablecer(almacen(), p.data.token, p.data.contrasena);
  if (estado === "OK") ir("/ingresar?aviso=contrasena");
  const texto =
    estado === "VENCIDO"
      ? "El enlace venció. Pide uno nuevo desde «Olvidé mi contraseña»."
      : estado === "USADO"
        ? "Este enlace ya se usó. Si necesitas cambiar la contraseña otra vez, pide uno nuevo."
        : "El enlace no es válido.";
  return { mensaje: { tipo: "error", texto } };
}

/* ---------- Perfil ---------- */

const metadatos = (f: File) => ({ nombre: f.name, mime: f.type, tamano: f.size });

/** Tras guardar vuelve a «Mi cuenta»; si el perfil quedó completo, con el aviso para participar. */
async function trasGuardar(estabaCompleto: boolean): Promise<never> {
  // La cookie lleva la cuenta firmada: se actualiza para que otra instancia no la vea vieja.
  await refrescarSesion();
  const c = cuentaDeSesion(almacen(), await idSesion());
  ir(
    !estabaCompleto && c && perfilCompleto(c)
      ? "/mi-cuenta?guardado=completo"
      : "/mi-cuenta?guardado=1",
  );
}

async function cuentaActual() {
  const sesion = await idSesion();
  const c = cuentaDeSesion(almacen(), sesion);
  if (!c) ir("/ingresar?volver=/mi-cuenta");
  return { sesion, completo: perfilCompleto(c) };
}

export async function guardarDatosNaturalAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const bloqueo = await bloqueoPorTextos();
  if (bloqueo) return bloqueo;
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = datosNaturalSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi())
    return guardarPerfilApi(
      completo,
      { ...p.data, ocupacion: p.data.ocupacion ?? "" },
      valoresDe(datos),
    );
  guardarPerfil(almacen(), sesion, p.data);
  return trasGuardar(completo);
}

export async function guardarRepresentanteAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const bloqueo = await bloqueoPorTextos();
  if (bloqueo) return bloqueo;
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = representanteSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi()) return guardarPerfilApi(completo, p.data, valoresDe(datos));
  guardarPerfil(almacen(), sesion, p.data);
  return trasGuardar(completo);
}

/** «¿Dispone de un documento que acredite su condición?» y, si es «Sí», el documento. */
export async function guardarAcreditacionAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const bloqueo = await bloqueoPorTextos();
  if (bloqueo) return bloqueo;
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = acreditacionSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const yaTiene = !!cuentaDeSesion(almacen(), sesion)?.documentos.REPRESENTACION;
  if (p.data.acreditacion === "Sí") {
    if (!datos.archivo && !yaTiene)
      return {
        errores: { archivo: "Adjunta el documento que acredita tu condición." },
        valores: valoresDe(datos),
      };
    if (datos.archivo) {
      const d = documentoPerfilSchema.safeParse({
        documento: "REPRESENTACION",
        archivo: datos.archivo,
      });
      if (!d.success) return conErrores(d.error, datos);
      if (usaApi())
        return guardarPerfilApi(completo, p.data, valoresDe(datos), {
          tipo: "REPRESENTACION",
          archivo: d.data.archivo,
        });
      cargarDocumento(almacen(), sesion, "REPRESENTACION", metadatos(d.data.archivo));
    }
  }
  if (usaApi()) return guardarPerfilApi(completo, p.data, valoresDe(datos));
  guardarPerfil(almacen(), sesion, p.data);
  return trasGuardar(completo);
}

/** Sube un documento del perfil o lo reemplaza con una versión nueva. */
export async function cargarDocumentoAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const bloqueo = await bloqueoPorTextos();
  if (bloqueo) return bloqueo;
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = documentoPerfilSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi())
    return guardarPerfilApi(completo, {}, valoresDe(datos), {
      tipo: p.data.documento,
      archivo: p.data.archivo,
    });
  cargarDocumento(almacen(), sesion, p.data.documento, metadatos(p.data.archivo));
  return trasGuardar(completo);
}

/** Corrige nombres y apellidos (persona natural). */
export async function guardarNombresAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const bloqueo = await bloqueoPorTextos();
  if (bloqueo) return bloqueo;
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = nombresSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi())
    return guardarPerfilApi(
      completo,
      { nombres: p.data.nombres, apellidos: p.data.apellidos },
      valoresDe(datos),
    );
  actualizarNombres(almacen(), sesion, p.data.nombres, p.data.apellidos);
  return trasGuardar(completo);
}

/* ---------- Seguridad ---------- */

/** Cambia la contraseña con la sesión abierta y cierra las demás sesiones. */
export async function cambiarContrasenaAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const bloqueo = await bloqueoPorTextos();
  if (bloqueo) return bloqueo;
  const sesion = await idSesion();
  const datos = leer(fd);
  const p = cambiarContrasenaSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (usaApi()) return cambiarContrasenaApi(p.data.contrasenaActual, p.data.contrasena);
  const r = cambiarContrasena(almacen(), sesion, p.data.contrasenaActual, p.data.contrasena);
  if (r === "SIN_SESION") ir("/ingresar?volver=/mi-cuenta/seguridad");
  if (r === "ACTUAL_INCORRECTA")
    return { errores: { contrasenaActual: "La contraseña actual no es correcta." } };
  if (r === "IGUAL_A_LA_ACTUAL")
    return { errores: { contrasena: "La contraseña nueva debe ser distinta de la actual." } };
  // Los tokens anteriores quedaron revocados: la sesión actual se firma de nuevo.
  await refrescarSesion(sesion);
  return ir("/mi-cuenta/seguridad?guardado=contrasena");
}

export async function solicitarBajaAccion() {
  if (usaApi()) return solicitarBajaApi();
  if (!solicitarBaja(almacen(), await idSesion())) ir("/ingresar");
  await refrescarSesion();
  ir("/mi-cuenta/seguridad?guardado=baja");
}

/* ---------- Textos legales (R15) ---------- */

/**
 * Acepta las versiones vigentes de los textos pendientes. `versiones`: las que la persona leyó;
 * si alguna dejó de ser la vigente, no se acepta y el modal muestra la nueva.
 */
export async function aceptarTextosLegalesAccion(
  versiones: Partial<Record<TipoTextoLegal, string>>,
): Promise<{ ok: boolean; mensaje?: string }> {
  const sesion = await idSesion();
  const vigentes = await textosVigentes();
  const aceptadas: Partial<Record<TipoTextoLegal, string>> = {};
  for (const [tipo, version] of Object.entries(versiones) as [TipoTextoLegal, string][]) {
    if (vigentes[tipo]?.version !== version)
      return { ok: false, mensaje: "Hay una versión más nueva: léela antes de aceptarla." };
    aceptadas[tipo] = version;
  }
  if (usaApi()) await aceptarTextosLegalesApi(aceptadas);
  else if (aceptarTextosLegales(almacen(), sesion, aceptadas)) await refrescarSesion(sesion);
  else ir("/ingresar");
  refresh();
  return { ok: true };
}

/* ---------- Recorrido guiado ---------- */

/**
 * Al terminar o saltar el recorrido guiado: no vuelve a lanzarse solo. Sin sesión, nada. No
 * reescribe la cookie de sesión: eso obligaría a volver a pintar la página mientras la persona
 * sigue usándola.
 */
export async function marcarTourVistoAccion() {
  if (usaApi()) return marcarTourVistoApi();
  marcarTourVisto(almacen(), await idSesion());
}

/* ---------- Participación ---------- */

export async function enviarParticipacionAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const bloqueo = await bloqueoPorTextos();
  if (bloqueo) return bloqueo;
  const sesion = await idSesion();
  if (!cuentaDeSesion(almacen(), sesion)) ir("/ingresar?volver=/participa&motivo=participar");
  const datos = leer(fd);
  const p = participacionSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const { idempotencia, noticia: slug, imagenes, soporte, latitud, longitud, ...resto } = p.data;
  const ubicacion =
    latitud !== undefined && longitud !== undefined ? { lat: latitud, lng: longitud } : undefined;

  let noticia: { slug: string; titulo: string } | undefined;
  if (resto.tipo === "OPINION_NOTICIA" && slug) {
    const post = await getPost(slug);
    if (!post)
      return {
        errores: { noticia: "Esa noticia ya no está publicada." },
        valores: valoresDe(datos),
      };
    noticia = { slug: post.slug, titulo: post.titulo };
  }

  const r = enviarParticipacion(almacen(), sesion, idempotencia, {
    ...resto,
    noticia,
    ubicacion,
    imagenes: imagenes.map(metadatos),
    soporte: soporte ? metadatos(soporte) : undefined,
  });
  if (r.estado === "SIN_SESION") ir("/ingresar?volver=/participa&motivo=participar");
  if (r.estado === "PERFIL_INCOMPLETO")
    return {
      valores: valoresDe(datos),
      mensaje: {
        tipo: "error",
        texto: "Para enviar una propuesta formal, completa tu perfil en Mi cuenta.",
      },
    };
  ir(`/participa/enviada?folio=${r.folio}`);
}
