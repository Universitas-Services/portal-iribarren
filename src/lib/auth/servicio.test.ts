import { describe, expect, it } from "vitest";
import { CONTRASENA_DEMO, almacenDemo } from "./fixtures";
import {
  abandonarPortal,
  cargarDocumento,
  correoDeToken,
  cuentaDeSesion,
  enviarParticipacion,
  filtrarParticipaciones,
  estadoRestablecer,
  guardarPerfil,
  iniciarSesion,
  participacionesDe,
  participacionPropia,
  perfilCompleto,
  propuestaPublica,
  propuestasPublicadas,
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
    imagenes: [],
  };

  it("emite folios secuenciales con el formato IRI-AAAA-XXXX en estado Pendiente", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "ana@ejemplo.com");
    // Los folios siguen después de las participaciones de ejemplo.
    const n = alm.secuencia;
    const folio = (k: number) => `IRI-2026-${String(k).padStart(4, "0")}`;
    const ahora = Date.UTC(2026, 9, 17, 15);
    const a = enviarParticipacion(alm, s, "clave-1", datos, ahora);
    const b = enviarParticipacion(alm, s, "clave-2", datos, ahora + 1000);
    expect(a).toEqual({ estado: "OK", folio: folio(n + 1) });
    expect(b).toEqual({ estado: "OK", folio: folio(n + 2) });
    expect(participacionPropia(alm, s, folio(n + 1))?.estado).toBe("PENDIENTE");
    expect(
      participacionesDe(alm, s)
        .slice(0, 2)
        .map((p) => p.folio),
    ).toEqual([folio(n + 2), folio(n + 1)]);
  });

  it("la misma Idempotency-Key no crea un segundo folio", () => {
    const alm = almacenDemo();
    const s = sesionDe(alm, "ana@ejemplo.com");
    const antes = alm.participaciones.size;
    const a = enviarParticipacion(alm, s, "doble-clic", datos);
    const b = enviarParticipacion(alm, s, "doble-clic", datos);
    expect(b).toEqual(a);
    expect(alm.participaciones.size).toBe(antes + 1);
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

describe("seguimiento y galería", () => {
  it("filtra por estado, tipo y folio con o sin prefijo", () => {
    const alm = almacenDemo();
    const lista = participacionesDe(alm, sesionDe(alm, "ana@ejemplo.com"));
    expect(lista).toHaveLength(5);
    expect(filtrarParticipaciones(lista, { estado: "RECHAZADA" }).map((p) => p.folio)).toEqual([
      "IRI-2026-0003",
    ]);
    expect(filtrarParticipaciones(lista, { tipo: "PROPUESTA_FORMAL" })).toHaveLength(1);
    for (const folio of ["IRI-2026-0004", "2026-0004", "0004", "4"])
      expect(filtrarParticipaciones(lista, { folio }).map((p) => p.folio)).toEqual([
        "IRI-2026-0004",
      ]);
  });

  it("la galería solo muestra lo publicado con nombre autorizado y oculta la cuenta", () => {
    const alm = almacenDemo();
    const publicadas = propuestasPublicadas(alm);
    expect(publicadas.length).toBeGreaterThan(0);
    for (const p of publicadas) {
      expect(p.estado).toBe("PUBLICADA");
      expect(p.autor).toBeTruthy();
      expect(p).not.toHaveProperty("cuentaId");
    }
    // Aprobada sin autorización de nombre: no se publica.
    expect(propuestaPublica(alm, "IRI-2026-0002")).toBeUndefined();
    expect(propuestaPublica(alm, "iri-2026-0001")?.folio).toBe("IRI-2026-0001");
  });

  it("busca texto sin importar tildes y filtra por parroquia", () => {
    const alm = almacenDemo();
    expect(propuestasPublicadas(alm, { q: "CANCHA MULTIPLE" })).toHaveLength(1);
    expect(propuestasPublicadas(alm, { parroquia: "El Cují" })).toHaveLength(1);
  });
});
