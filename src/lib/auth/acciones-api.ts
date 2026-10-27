import "server-only";
import { RedirectType, redirect } from "next/navigation";
import {
  ErrorApi,
  pedirApi,
  type EnlaceNeutroApi,
  type ItemCatalogo,
  type RegistroApi,
  type SesionApi,
} from "@/lib/plataforma-api/cliente";
import {
  acreditacionApi,
  campoEnConflicto,
  condicionApi,
  documentoApi,
  mensajeDeError,
  telefonoApi,
  valorDeCatalogo,
} from "@/lib/plataforma-api/mapeo";
import type { EstadoFormulario } from "./acciones";
import { perfilCompleto, type TipoDocumento } from "./servicio";
import { almacen, guardarAviso } from "./sesion";
import {
  borrarTokens,
  guardarTokens,
  sincronizarCuentaApi,
  tokenOIngresar,
  tokensDeCookie,
} from "./sesion-api";

/*
 * Lo que hacen las Server Actions de la cuenta cuando el portal trabaja con plataforma-api.
 * Las validaciones del formulario (Zod) ya pasaron en acciones.ts; aquí se llama a la API y se
 * traducen sus errores a mensajes para la persona.
 */

const ir = (ruta: string): never => redirect(ruta, RedirectType.replace);

const error = (texto: string, valores?: Record<string, string>): EstadoFormulario => ({
  valores,
  mensaje: { tipo: "error", texto },
});

/* ---------- Ingreso ---------- */

async function login(correo: string, contrasena: string) {
  const r = await pedirApi<SesionApi>("/auth/login", {
    cuerpo: { email: correo, password: contrasena },
    portal: true,
  });
  await guardarTokens(r);
  return r;
}

export async function ingresarApi(
  correo: string,
  contrasena: string,
  volver: string,
): Promise<EstadoFormulario> {
  let r: SesionApi;
  try {
    r = await login(correo, contrasena);
  } catch (e) {
    if (e instanceof ErrorApi && e.code === "EMAIL_NOT_VERIFIED")
      return {
        valores: { correo },
        noVerificado: true,
        mensaje: {
          tipo: "error",
          texto: "Aún no verificas tu correo. Abre el enlace que te enviamos.",
        },
      };
    return error(mensajeDeError(e), { correo });
  }
  return ir(r.user.perfilEstado === "COMPLETO" ? volver : "/mi-cuenta");
}

export async function cerrarSesionApi() {
  const t = await tokensDeCookie();
  if (t) {
    // Revoca el refresh token en la API; si falla, la cookie se borra igual.
    await pedirApi("/auth/logout", { cuerpo: { refreshToken: t.r }, token: t.a }).catch(() => {});
  }
  await borrarTokens();
}

/**
 * «Cerrar sesión en todos los dispositivos»: la API revoca todos los refresh tokens de la cuenta,
 * también el de esta sesión. El access token sigue valiendo hasta que vence, así que la cookie se
 * borra siempre, aunque la llamada falle.
 */
export async function cerrarTodasLasSesionesApi() {
  const token = await tokenOIngresar("/mi-cuenta/seguridad");
  try {
    await pedirApi("/auth/sessions/revoke-all", { metodo: "POST", token });
  } finally {
    await borrarTokens();
  }
}

/* ---------- Registro ---------- */

/** Valores activos de un catálogo de la alcaldía (organization-types, occupations…). */
async function catalogo(tipo: string) {
  const r = await pedirApi<{ data: ItemCatalogo[] }>(`/portal/catalogs/${tipo}`, { portal: true });
  return r.data.map((i) => i.valor);
}

const CAMPO_CONFLICTO: Record<string, string> = {
  cedula: "Esta cédula ya está registrada con otro correo. Si es tuya, escribe a soporte.",
  rif: "Este RIF ya está registrado con otro correo. Si es de tu organización, escribe a soporte.",
};

export async function registrarApi(
  d:
    | { tipo: "NATURAL"; cedula: string; nombres: string; apellidos: string }
    | { tipo: "ORGANIZACION"; tipoEntidad: string; razonSocial: string; rif: string },
  correo: string,
  contrasena: string,
  valores: Record<string, string>,
): Promise<EstadoFormulario> {
  let r: RegistroApi;
  try {
    const { tipo, ...datos } = d;
    const extra =
      tipo === "ORGANIZACION"
        ? { tipoEntidad: valorDeCatalogo(await catalogo("organization-types"), d.tipoEntidad) }
        : {};
    r = await pedirApi<RegistroApi>(
      `/portal/auth/register/${tipo === "NATURAL" ? "natural" : "organizacion"}`,
      {
        cuerpo: {
          ...datos,
          ...extra,
          email: correo,
          password: contrasena,
          aceptaTerminos: true,
          aceptaPoliticaDatos: true,
        },
        portal: true,
      },
    );
  } catch (e) {
    if (e instanceof ErrorApi && e.code === "IDENTITY_CONFLICT") {
      const campo = campoEnConflicto(e) ?? "";
      return error(CAMPO_CONFLICTO[campo] ?? mensajeDeError(e), valores);
    }
    return error(mensajeDeError(e), valores);
  }
  // La API responde igual aunque el correo ya exista (al dueño le llega «ya tienes una cuenta»).
  // Con la verificación exigida, «Revisa tu correo» y «Reenviar» leen el correo del aviso.
  if (r.verificacionPendiente) {
    await guardarAviso({ correo, enlaceDesarrollo: r.enlaceDesarrollo });
    return ir("/registro/revisa-tu-correo");
  }
  // Sin verificación exigida (algún entorno de pruebas): se entra directo.
  try {
    await login(correo, contrasena);
  } catch {
    return ir("/ingresar");
  }
  return ir("/mi-cuenta");
}

/** Reenvía el enlace de verificación. Neutro: no dice si la cuenta existe. */
export async function reenviarApi(correo: string): Promise<EstadoFormulario> {
  let r: EnlaceNeutroApi;
  try {
    r = await pedirApi<EnlaceNeutroApi>("/portal/auth/resend", {
      cuerpo: { email: correo },
      portal: true,
    });
  } catch (e) {
    return error(mensajeDeError(e));
  }
  await guardarAviso({ correo, enlaceDesarrollo: r?.enlaceDesarrollo });
  return {
    mensaje: {
      tipo: "info",
      texto: "Si la cuenta existe y aún no está verificada, te enviamos un enlace nuevo.",
    },
    enlaceDesarrollo: r?.enlaceDesarrollo,
  };
}

/* ---------- Recuperar y restablecer ---------- */

/** «Olvidé mi contraseña». Neutro: no dice si la cuenta existe. */
export async function recuperarApi(correo: string): Promise<EstadoFormulario> {
  let r: EnlaceNeutroApi;
  try {
    r = await pedirApi<EnlaceNeutroApi>("/portal/auth/forgot", {
      cuerpo: { email: correo },
      portal: true,
    });
  } catch (e) {
    return error(mensajeDeError(e), { correo });
  }
  return {
    valores: { correo },
    mensaje: {
      tipo: "exito",
      texto:
        "Si hay una cuenta con ese correo, te enviamos un enlace para crear una contraseña nueva. Vence en 1 hora.",
    },
    enlaceDesarrollo: r?.enlaceDesarrollo,
  };
}

/** Contraseña nueva con el enlace del correo. La API cierra todas las sesiones de la cuenta. */
export async function restablecerApi(token: string, contrasena: string): Promise<EstadoFormulario> {
  try {
    await pedirApi("/portal/auth/reset", {
      cuerpo: { token, password: contrasena },
      portal: true,
    });
  } catch (e) {
    if (e instanceof ErrorApi && e.code === "INVALID_TOKEN") {
      const estado = (e.details as { estado?: string } | undefined)?.estado;
      const texto =
        estado === "VENCIDO"
          ? "El enlace venció. Pide uno nuevo desde «Olvidé mi contraseña»."
          : estado === "USADO"
            ? "Este enlace ya se usó. Si necesitas cambiar la contraseña otra vez, pide uno nuevo."
            : "El enlace no es válido.";
      return { mensaje: { tipo: "error", texto } };
    }
    if (e instanceof ErrorApi && e.code === "VALIDATION_ERROR" && Array.isArray(e.details))
      return { errores: { contrasena: e.details.join(" ") } };
    return error(mensajeDeError(e));
  }
  // También queda cerrada la sesión de este navegador, si había.
  await borrarTokens();
  return ir("/ingresar?aviso=contrasena");
}

/* ---------- Contraseña ---------- */

export async function cambiarContrasenaApi(
  actual: string,
  nueva: string,
): Promise<EstadoFormulario> {
  const token = await tokenOIngresar("/mi-cuenta/seguridad");
  try {
    // La API revoca todas las sesiones y entrega tokens nuevos para esta.
    await guardarTokens(
      await pedirApi<SesionApi>("/auth/password", {
        metodo: "PATCH",
        cuerpo: { passwordActual: actual, nuevaPassword: nueva },
        token,
      }),
    );
  } catch (e) {
    if (e instanceof ErrorApi && e.code === "INVALID_PASSWORD")
      return { errores: { contrasenaActual: "La contraseña actual no es correcta." } };
    if (e instanceof ErrorApi && e.code === "WEAK_PASSWORD")
      return { errores: { contrasena: e.message } };
    if (e instanceof ErrorApi && e.code === "VALIDATION_ERROR" && Array.isArray(e.details))
      return { errores: { contrasena: e.details.join(" ") } };
    return error(mensajeDeError(e));
  }
  return ir("/mi-cuenta/seguridad?guardado=contrasena");
}

/* ---------- Perfil ---------- */

/** Tras guardar vuelve a «Mi cuenta»; si el perfil quedó completo, con el aviso para participar. */
async function trasGuardarApi(estabaCompleto: boolean): Promise<never> {
  const c = await sincronizarCuentaApi(almacen());
  return ir(
    !estabaCompleto && c && perfilCompleto(c)
      ? "/mi-cuenta?guardado=completo"
      : "/mi-cuenta?guardado=1",
  );
}

type DatosPerfil = {
  /** Nombres y apellidos de la persona natural (los del representante van aparte). */
  nombres?: string;
  apellidos?: string;
  telefono?: string;
  ocupacion?: string;
  condicion?: Parameters<typeof condicionApi>[0];
  nombresRepresentante?: string;
  apellidosRepresentante?: string;
  cedulaRepresentante?: string;
  telefonoInstitucional?: string;
  acreditacion?: Parameters<typeof acreditacionApi>[0];
};

/** PATCH /portal/me/profile con los nombres de campo de la API. */
function cuerpoPerfil(d: DatosPerfil) {
  const cuerpo: Record<string, string> = {};
  if (d.nombres) cuerpo.nombres = d.nombres;
  if (d.apellidos) cuerpo.apellidos = d.apellidos;
  if (d.telefono) cuerpo.telefono = telefonoApi(d.telefono);
  if (d.ocupacion !== undefined) cuerpo.ocupacion = d.ocupacion;
  if (d.condicion) cuerpo.condicion = condicionApi(d.condicion);
  if (d.nombresRepresentante) cuerpo.nombres = d.nombresRepresentante;
  if (d.apellidosRepresentante) cuerpo.apellidos = d.apellidosRepresentante;
  if (d.cedulaRepresentante) cuerpo.cedula = d.cedulaRepresentante;
  if (d.telefonoInstitucional) cuerpo.telefonoInstitucional = telefonoApi(d.telefonoInstitucional);
  if (d.acreditacion) cuerpo.tieneAcreditacion = acreditacionApi(d.acreditacion);
  return cuerpo;
}

async function subir(token: string, tipo: TipoDocumento, archivo: File) {
  const fd = new FormData();
  fd.set("tipo", documentoApi(tipo));
  fd.set("file", archivo, archivo.name);
  await pedirApi("/portal/me/documents", { cuerpo: fd, token, portal: true });
}

/**
 * Guarda datos del perfil y, si viene, un documento (en ese orden: la acreditación «Sí» exige
 * el documento, y así la API recalcula el estado con los dos).
 */
export async function guardarPerfilApi(
  estabaCompleto: boolean,
  datos: DatosPerfil,
  valores: Record<string, string>,
  documento?: { tipo: TipoDocumento; archivo: File },
): Promise<EstadoFormulario> {
  const token = await tokenOIngresar();
  try {
    const cuerpo = cuerpoPerfil(datos);
    if (Object.keys(cuerpo).length)
      await pedirApi("/portal/me/profile", { metodo: "PATCH", cuerpo, token, portal: true });
    if (documento) await subir(token, documento.tipo, documento.archivo);
  } catch (e) {
    return error(mensajeDeError(e), valores);
  }
  return trasGuardarApi(estabaCompleto);
}

/* ---------- Baja ---------- */

/** Solicitud de baja (idempotente). La persona puede seguir entrando hasta que la atiendan. */
export async function solicitarBajaApi(): Promise<never> {
  const token = await tokenOIngresar("/mi-cuenta/seguridad");
  await pedirApi("/portal/me/deletion-request", { metodo: "POST", token, portal: true });
  await sincronizarCuentaApi(almacen());
  return ir("/mi-cuenta/seguridad?guardado=baja");
}
