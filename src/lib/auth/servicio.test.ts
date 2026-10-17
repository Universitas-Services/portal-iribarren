import { describe, expect, it } from "vitest";
import { CONTRASENA_DEMO, almacenDemo } from "./fixtures";
import {
  correoDeToken,
  cuentaDeSesion,
  estadoRestablecer,
  iniciarSesion,
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
