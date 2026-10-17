import { describe, expect, it } from "vitest";
import { CONTRASENA_DEMO, almacenDemo } from "./fixtures";
import {
  abandonarPortal,
  cargarDocumento,
  correoDeToken,
  cuentaDeSesion,
  enviarParticipacion,
  estadoRestablecer,
  guardarPerfil,
  iniciarSesion,
  participacionesDe,
  participacionPropia,
  perfilCompleto,
  recuperar,
  reenviarVerificacion,
  registrar,
  restablecer,
  unirse,
  verificarCorreo,
} from "./servicio";

const natural = {
  tipo: "NATURAL" as const,
  cedula: "V-99999999",
  nombres: "Pedro",
  apellidos: "Gómez",
  correo: "Pedro@Ejemplo.com",
  contrasena: "Segura#2026x",
};

describe("registro", () => {
  it("crea la cuenta sin verificar con membresía en Iribarren y emite el enlace", () => {
    const alm = almacenDemo();
    const r = registrar(alm, natural);
    expect(r).toMatchObject({ estado: "ENVIADO" });
    const token = r.estado === "ENVIADO" ? r.tokenDesarrollo! : "";
    expect(correoDeToken(alm, token)).toBe("pedro@ejemplo.com");
    expect(iniciarSesion(alm, "pedro@ejemplo.com", natural.contrasena).estado).toBe(
      "NO_VERIFICADO",
    );
  });

  it("responde igual (neutro) si el correo ya existe, sin crear otra cuenta", () => {
    const alm = almacenDemo();
    const antes = alm.cuentas.size;
    expect(registrar(alm, { ...natural, correo: "ana@ejemplo.com" })).toEqual({
      estado: "ENVIADO",
    });
    expect(alm.cuentas.size).toBe(antes);
  });

  it("detecta una cédula o un RIF ya usados con otro correo", () => {
    const alm = almacenDemo();
    expect(registrar(alm, { ...natural, cedula: "V-12345678" })).toEqual({
      estado: "IDENTITY_CONFLICT",
      campo: "cedula",
    });
    expect(
      registrar(alm, {
        tipo: "ORGANIZACION",
        tipoEntidad: "Otros",
        razonSocial: "Otra",
        rif: "C-29876543-7",
        correo: "otra@org.com",
        contrasena: "Segura#2026x",
      }),
    ).toEqual({ estado: "IDENTITY_CONFLICT", campo: "rif" });
  });
});

describe("enlaces de verificación", () => {
  it("verifica una sola vez y reconoce los vencidos", () => {
    const alm = almacenDemo();
    const r = registrar(alm, natural);
    const token = r.estado === "ENVIADO" ? r.tokenDesarrollo! : "";
    expect(verificarCorreo(alm, token)).toBe("OK");
    expect(verificarCorreo(alm, token)).toBe("USADO");
    expect(verificarCorreo(alm, "demo-vencido")).toBe("VENCIDO");
    expect(verificarCorreo(alm, "no-existe")).toBe("INVALIDO");
  });

  it("un reenvío invalida el enlace anterior y no revela cuentas verificadas", () => {
    const alm = almacenDemo();
    const r = registrar(alm, natural);
    const viejo = r.estado === "ENVIADO" ? r.tokenDesarrollo! : "";
    const nuevo = reenviarVerificacion(alm, natural.correo).tokenDesarrollo!;
    expect(verificarCorreo(alm, viejo)).toBe("USADO");
    expect(verificarCorreo(alm, nuevo)).toBe("OK");
    expect(reenviarVerificacion(alm, "ana@ejemplo.com").tokenDesarrollo).toBeUndefined();
  });
});

describe("inicio de sesión", () => {
  it("no distingue entre correo inexistente y contraseña incorrecta", () => {
    const alm = almacenDemo();
    expect(iniciarSesion(alm, "nadie@x.com", "x").estado).toBe("CREDENCIALES");
    expect(iniciarSesion(alm, "ana@ejemplo.com", "mala").estado).toBe("CREDENCIALES");
  });

  it("indica el siguiente paso según membresía y perfil", () => {
    const alm = almacenDemo();
    expect(iniciarSesion(alm, "ana@ejemplo.com", CONTRASENA_DEMO)).toMatchObject({
      estado: "OK",
      siguiente: "LISTO",
    });
    expect(iniciarSesion(alm, "contacto@cardones.org", CONTRASENA_DEMO)).toMatchObject({
      siguiente: "PERFIL",
    });
    const carla = iniciarSesion(alm, "carla@ejemplo.com", CONTRASENA_DEMO);
    expect(carla).toMatchObject({ siguiente: "UNIRSE" });
    if (carla.estado === "OK") {
      expect(unirse(alm, carla.sesion)).toBe(true);
      expect(cuentaDeSesion(alm, carla.sesion)?.membresias).toContain("iribarren");
    }
  });
});

describe("recuperación de contraseña", () => {
  it("restablece una vez y cierra las sesiones abiertas", () => {
    const alm = almacenDemo();
    const sesion = iniciarSesion(alm, "ana@ejemplo.com", CONTRASENA_DEMO);
    const token = recuperar(alm, "ana@ejemplo.com").tokenDesarrollo!;
    expect(estadoRestablecer(alm, token)).toBe("OK");
    expect(restablecer(alm, token, "Nueva#Clave2026")).toBe("OK");
    expect(restablecer(alm, token, "Otra#Clave2026")).toBe("USADO");
    if (sesion.estado === "OK") expect(cuentaDeSesion(alm, sesion.sesion)).toBeUndefined();
    expect(iniciarSesion(alm, "ana@ejemplo.com", "Nueva#Clave2026").estado).toBe("OK");
  });

  it("es neutro con correos que no existen y los enlaces vencen a la hora", () => {
    const alm = almacenDemo();
    expect(recuperar(alm, "nadie@x.com").tokenDesarrollo).toBeUndefined();
    const t = recuperar(alm, "ana@ejemplo.com", 0).tokenDesarrollo!;
    expect(estadoRestablecer(alm, t, 2 * 60 * 60 * 1000)).toBe("VENCIDO");
  });
});

const sesionDe = (alm: ReturnType<typeof almacenDemo>, correo: string) => {
  const r = iniciarSesion(alm, correo, CONTRASENA_DEMO);
  if (r.estado !== "OK") throw new Error(`No se pudo iniciar sesión con ${correo}`);
  return r.sesion;
};

const pdf = { nombre: "cedula.pdf", mime: "application/pdf", tamano: 1000 };

describe("perfil", () => {
  it("se completa al guardar el teléfono y el documento de identidad", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "jose@ejemplo.com");
    const c = () => cuentaDeSesion(alm, s)!;
    expect(perfilCompleto(c())).toBe(false);
    expect(guardarPerfil(alm, s, { telefono: "04141112233" })).toBe("OK");
    expect(perfilCompleto(c())).toBe(false);
    expect(cargarDocumento(alm, s, "IDENTIDAD", pdf)).toBe("OK");
    expect(perfilCompleto(c())).toBe(true);
    expect(c().estadoVerificacion).toBe("PENDIENTE");
  });

  it("reemplazar un documento sube la versión y lo devuelve a revisión", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "ana@ejemplo.com");
    cargarDocumento(alm, s, "IDENTIDAD", pdf);
    const c = cuentaDeSesion(alm, s)!;
    expect(c.documentos.IDENTIDAD?.version).toBe(2);
    expect(c.estadoVerificacion).toBe("PENDIENTE");
  });

  it("con «Requiere corrección» solo acepta el documento señalado", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "rosa@ejemplo.com");
    expect(guardarPerfil(alm, s, { telefono: "04140000000" })).toBe("BLOQUEADO");
    expect(cargarDocumento(alm, s, "IDENTIDAD", pdf)).toBe("OK");
    const c = cuentaDeSesion(alm, s)!;
    expect(c.correccion).toBeUndefined();
    expect(c.estadoVerificacion).toBe("PENDIENTE");
    expect(guardarPerfil(alm, s, { telefono: "04140000000" })).toBe("OK");
  });

  it("la organización necesita representante, acreditación y documento de la entidad", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "contacto@cardones.org");
    guardarPerfil(alm, s, {
      condicion: "Vocero o vocera oficial",
      nombresRepresentante: "José",
      apellidosRepresentante: "Colmenárez",
      cedulaRepresentante: "V-11222333",
      telefonoInstitucional: "02512345678",
      acreditacion: "Sí",
    });
    cargarDocumento(alm, s, "ENTIDAD", pdf);
    expect(perfilCompleto(cuentaDeSesion(alm, s)!)).toBe(false);
    cargarDocumento(alm, s, "REPRESENTACION", pdf);
    expect(perfilCompleto(cuentaDeSesion(alm, s)!)).toBe(true);
  });

  it("abandonar el portal quita la membresía y cierra la sesión", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "ana@ejemplo.com");
    expect(abandonarPortal(alm, s)).toBe(true);
    expect(cuentaDeSesion(alm, s)).toBeUndefined();
    expect(iniciarSesion(alm, "ana@ejemplo.com", CONTRASENA_DEMO)).toMatchObject({
      siguiente: "UNIRSE",
    });
  });
});

describe("participación", () => {
  const datos = {
    tipo: "OPINION_GENERAL" as const,
    parroquia: "Catedral" as const,
    sector: "Centro",
    categoriaTecnica: "Vialidad y Transporte" as const,
    descripcion: "Una opinión de prueba con suficiente detalle para el plan de desarrollo.",
    mostrarNombre: true,
  };

  it("emite folios secuenciales con el formato IRI-AAAA-XXXX en estado Pendiente", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "ana@ejemplo.com");
    const ahora = Date.UTC(2026, 9, 17, 15);
    const a = enviarParticipacion(alm, s, "clave-1", datos, ahora);
    const b = enviarParticipacion(alm, s, "clave-2", datos, ahora + 1000);
    expect(a).toEqual({ estado: "OK", folio: "IRI-2026-0001" });
    expect(b).toEqual({ estado: "OK", folio: "IRI-2026-0002" });
    expect(participacionPropia(alm, s, "IRI-2026-0001")?.estado).toBe("PENDIENTE");
    expect(participacionesDe(alm, s).map((p) => p.folio)).toEqual([
      "IRI-2026-0002",
      "IRI-2026-0001",
    ]);
  });

  it("la misma Idempotency-Key no crea un segundo folio", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "ana@ejemplo.com");
    const a = enviarParticipacion(alm, s, "doble-clic", datos);
    const b = enviarParticipacion(alm, s, "doble-clic", datos);
    expect(b).toEqual(a);
    expect(alm.participaciones.size).toBe(1);
  });

  it("rechaza el envío con el perfil incompleto", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "jose@ejemplo.com");
    expect(enviarParticipacion(alm, s, "k", datos)).toEqual({ estado: "PERFIL_INCOMPLETO" });
  });

  it("nadie ve el folio de otra cuenta", () => {
    const alm = almacenDemo();
    const ana = sesionDe(alm, "ana@ejemplo.com");
    const rosa = sesionDe(alm, "rosa@ejemplo.com");
    const r = enviarParticipacion(alm, ana, "k", datos);
    if (r.estado !== "OK") throw new Error("debía enviarse");
    expect(participacionPropia(alm, rosa, r.folio)).toBeUndefined();
  });
});
