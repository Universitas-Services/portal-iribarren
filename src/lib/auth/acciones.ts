"use server";

import { redirect } from "next/navigation";
import type { z } from "zod";
import { getPost } from "@/lib/api";
import {
  acreditacionSchema,
  datosNaturalSchema,
  documentoPerfilSchema,
  loginSchema,
  participacionSchema,
  recuperarSchema,
  registroNaturalSchema,
  registroOrganizacionSchema,
  representanteSchema,
  restablecerSchema,
} from "@/lib/validation/schemas";
import {
  abandonarPortal,
  cargarDocumento,
  cerrarSesion,
  cuentaDeSesion,
  enviarParticipacion,
  guardarPerfil,
  perfilCompleto,
  solicitarBaja,
  iniciarSesion,
  recuperar,
  reenviarVerificacion,
  registrar,
  restablecer,
  unirse,
} from "./servicio";
import {
  abrirSesion,
  almacen,
  borrarSesion,
  esDesarrollo,
  guardarAviso,
  idSesion,
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

const CASILLAS = ["aceptaTerminos", "aceptaPoliticaDatos", "mostrarNombre"];
const SECRETOS = ["contrasena", "confirmarContrasena"];

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

const enlace = (ruta: string, token?: string) =>
  esDesarrollo && token ? `${ruta}?token=${token}` : undefined;

/* ---------- Registro ---------- */

async function finalizarRegistro(
  r: ReturnType<typeof registrar>,
  correo: string,
  datos: Record<string, unknown>,
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
  await guardarAviso({ correo, enlaceDesarrollo: enlace("/verificar", r.tokenDesarrollo) });
  redirect("/registro/revisa-tu-correo");
}

export async function registrarNaturalAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = registroNaturalSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const { cedula, nombres, apellidos, correo, contrasena } = p.data;
  const r = registrar(almacen(), {
    tipo: "NATURAL",
    cedula,
    nombres,
    apellidos,
    correo,
    contrasena,
  });
  return finalizarRegistro(r, correo, datos);
}

export async function registrarOrganizacionAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = registroOrganizacionSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const { tipoEntidad, razonSocial, rif, correo, contrasena } = p.data;
  const r = registrar(almacen(), {
    tipo: "ORGANIZACION",
    tipoEntidad,
    razonSocial,
    rif,
    correo,
    contrasena,
  });
  return finalizarRegistro(r, correo, datos);
}

/** Reenvía la verificación al correo del último registro (o al indicado al iniciar sesión). */
export async function reenviarAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const correo = String(fd.get("correo") ?? "") || (await leerAviso())?.correo;
  if (!correo)
    return { mensaje: { tipo: "error", texto: "Vuelve a registrarte para recibir un enlace." } };
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
  if (r.siguiente === "UNIRSE") redirect(`/unirme?volver=${encodeURIComponent(volver)}`);
  if (r.siguiente === "PERFIL") redirect("/mi-cuenta");
  redirect(volver);
}

export async function cerrarSesionAccion() {
  cerrarSesion(almacen(), await idSesion());
  await borrarSesion();
  redirect("/");
}

/* ---------- Unirse a esta alcaldía ---------- */

export async function unirseAccion(fd: FormData) {
  if (!unirse(almacen(), await idSesion())) redirect("/ingresar");
  redirect(destinoSeguro(fd.get("volver"), "/mi-cuenta"));
}

/* ---------- Recuperar y restablecer ---------- */

export async function recuperarAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const datos = leer(fd);
  const p = recuperarSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
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
  const estado = restablecer(almacen(), p.data.token, p.data.contrasena);
  if (estado === "OK") redirect("/ingresar?aviso=contrasena");
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

const BLOQUEADO: EstadoFormulario = {
  mensaje: {
    tipo: "error",
    texto: "Mientras tu perfil está en corrección solo puedes reemplazar el documento señalado.",
  },
};

/** Tras guardar vuelve a «Mi cuenta»; si el perfil quedó completo, con el aviso para participar. */
async function trasGuardar(estabaCompleto: boolean): Promise<never> {
  const c = cuentaDeSesion(almacen(), await idSesion());
  redirect(
    !estabaCompleto && c && perfilCompleto(c)
      ? "/mi-cuenta?guardado=completo"
      : "/mi-cuenta?guardado=1",
  );
}

async function cuentaActual() {
  const sesion = await idSesion();
  const c = cuentaDeSesion(almacen(), sesion);
  if (!c) redirect("/ingresar?volver=/mi-cuenta");
  return { sesion, completo: perfilCompleto(c) };
}

export async function guardarDatosNaturalAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = datosNaturalSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (guardarPerfil(almacen(), sesion, p.data) === "BLOQUEADO") return BLOQUEADO;
  return trasGuardar(completo);
}

export async function guardarRepresentanteAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = representanteSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  if (guardarPerfil(almacen(), sesion, p.data) === "BLOQUEADO") return BLOQUEADO;
  return trasGuardar(completo);
}

/** «¿Dispone de un documento que acredite su condición?» y, si es «Sí», el documento. */
export async function guardarAcreditacionAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
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
      if (
        cargarDocumento(almacen(), sesion, "REPRESENTACION", metadatos(d.data.archivo)) ===
        "BLOQUEADO"
      )
        return BLOQUEADO;
    }
  }
  if (guardarPerfil(almacen(), sesion, p.data) === "BLOQUEADO") return BLOQUEADO;
  return trasGuardar(completo);
}

/** Sube un documento del perfil o lo reemplaza con una versión nueva. */
export async function cargarDocumentoAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const { sesion, completo } = await cuentaActual();
  const datos = leer(fd);
  const p = documentoPerfilSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const r = cargarDocumento(almacen(), sesion, p.data.documento, metadatos(p.data.archivo));
  if (r === "BLOQUEADO") return BLOQUEADO;
  return trasGuardar(completo);
}

export async function abandonarAccion() {
  abandonarPortal(almacen(), await idSesion());
  await borrarSesion();
  redirect("/ingresar?aviso=abandono");
}

export async function solicitarBajaAccion() {
  if (!solicitarBaja(almacen(), await idSesion())) redirect("/ingresar");
  redirect("/mi-cuenta?guardado=baja");
}

/* ---------- Participación ---------- */

export async function enviarParticipacionAccion(
  _prev: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const sesion = await idSesion();
  if (!cuentaDeSesion(almacen(), sesion)) redirect("/ingresar?volver=/participa&motivo=participar");
  const datos = leer(fd);
  const p = participacionSchema.safeParse(datos);
  if (!p.success) return conErrores(p.error, datos);
  const { idempotencia, noticia: slug, imagenes, soporte, ...resto } = p.data;

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
    imagenes: imagenes.map(metadatos),
    soporte: soporte ? metadatos(soporte) : undefined,
  });
  if (r.estado === "SIN_SESION") redirect("/ingresar?volver=/participa&motivo=participar");
  if (r.estado === "PERFIL_INCOMPLETO")
    return {
      valores: valoresDe(datos),
      mensaje: { tipo: "error", texto: "Completa tu perfil en Mi cuenta antes de enviar." },
    };
  redirect(`/participa/enviada?folio=${r.folio}`);
}
