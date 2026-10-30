import { afterEach, describe, expect, it, vi } from "vitest";
import { documentosCompletos, perfilCompleto, resumenCuenta } from "@/lib/auth/servicio";
import { ErrorApi, pedirApi, type PerfilApi } from "./cliente";
import { cuentaDePerfil, mensajeDeError, telefonoApi, valorDeCatalogo } from "./mapeo";
import { abrirSello, sellar, tokensDeRespuesta } from "./sello";

describe("cookie cifrada", () => {
  const tokens = { a: "acceso", r: "refresco", x: 1_000, u: "usuario" };

  it("guarda y lee los tokens con el mismo secreto", () => {
    expect(abrirSello(sellar(tokens, "secreto"), "secreto")).toEqual(tokens);
  });

  it("rechaza otro secreto o una cookie alterada", () => {
    const valor = sellar(tokens, "secreto");
    expect(abrirSello(valor, "otro")).toBeNull();
    const [iv, cuerpo, etiqueta] = valor.split(".");
    const alterado = `${iv}.${cuerpo!.slice(0, -2)}AA.${etiqueta}`;
    expect(abrirSello(alterado, "secreto")).toBeNull();
    expect(abrirSello("basura", "secreto")).toBeNull();
  });

  it("no deja los tokens a la vista", () => {
    expect(sellar(tokens, "secreto")).not.toContain("refresco");
  });

  it("calcula el vencimiento del access token", () => {
    const r = { accessToken: "a", refreshToken: "r", expiresIn: 900, user: { id: "u" } };
    expect(tokensDeRespuesta(r, 0)).toEqual({ a: "a", r: "r", x: 900_000, u: "u", v: 0 });
  });
});

describe("cliente de la API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("envía x-client-id y el token, y devuelve el JSON", async () => {
    vi.stubEnv("API_URL", "https://api.test/api/v1/");
    vi.stubEnv("PORTAL_CLIENT_ID", "portal-iribarren");
    const fetchSimulado = vi.fn(async () => new Response(JSON.stringify({ ok: 1 })));
    vi.stubGlobal("fetch", fetchSimulado);
    await expect(pedirApi("/portal/me/profile", { token: "t", portal: true })).resolves.toEqual({
      ok: 1,
    });
    const [url, init] = fetchSimulado.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.test/api/v1/portal/me/profile");
    const h = new Headers(init.headers);
    expect(h.get("x-client-id")).toBe("portal-iribarren");
    expect(h.get("authorization")).toBe("Bearer t");
  });

  it("convierte el formato de error de la API en ErrorApi", async () => {
    vi.stubEnv("API_URL", "https://api.test/api/v1");
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              statusCode: 401,
              code: "INVALID_CREDENTIALS",
              message: "Correo o contraseña incorrectos",
              requestId: "r1",
            }),
            { status: 401 },
          ),
      ),
    );
    const e = await pedirApi("/auth/login", { cuerpo: {} }).catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ErrorApi);
    expect((e as ErrorApi).code).toBe("INVALID_CREDENTIALS");
    expect(mensajeDeError(e)).toBe("El correo o la contraseña no son correctos.");
  });

  it("explica la falta de conexión sin detalles técnicos", async () => {
    vi.stubEnv("API_URL", "https://api.test/api/v1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("fetch failed");
      }),
    );
    const e = await pedirApi("/health").catch((x: unknown) => x);
    expect(mensajeDeError(e)).toMatch(/No pudimos conectar/);
  });
});

describe("traducción de datos", () => {
  it("da al teléfono el formato de la API", () => {
    expect(telefonoApi("04141234567")).toBe("0414-1234567");
    expect(telefonoApi("+582512345678")).toBe("0251-2345678");
  });

  it("busca el valor del catálogo sin importar mayúsculas", () => {
    const valores = ["Cámaras Empresariales", "Otros"];
    expect(valorDeCatalogo(valores, "Cámaras empresariales")).toBe("Cámaras Empresariales");
    expect(valorDeCatalogo(valores, "Inexistente")).toBe("Inexistente");
  });

  it("indica los minutos de bloqueo", () => {
    const e = new ErrorApi(403, "ACCOUNT_LOCKED", "x", { retryAfterSeconds: 610 });
    expect(mensajeDeError(e)).toMatch(/11 min/);
  });

  const doc = (tipo: string) => ({
    id: tipo,
    tipo,
    version: 1,
    createdAt: "2026-10-20T12:00:00.000Z",
    file: { originalName: `${tipo}.pdf`, mimeType: "application/pdf", sizeBytes: 1000 },
  });

  it("arma la cuenta de una persona natural desde el perfil", () => {
    const perfil: PerfilApi = {
      id: "u1",
      email: "ana@correo.test",
      tipoPerfil: "NATURAL",
      cedula: "V-12345678",
      nombres: "Ana María",
      apellidos: "Pérez",
      telefono: "0414-1234567",
      ocupacion: null,
      perfilEstado: "COMPLETO",
      missing: [],
      bajaSolicitada: null,
      identityDocuments: [doc("CEDULA")],
      organization: null,
    };
    const c = cuentaDePerfil(perfil);
    expect(c.documentos.IDENTIDAD?.nombre).toBe("CEDULA.pdf");
    expect(c.estadoVerificacion).toBe("VERIFICADO");
    expect(perfilCompleto(c)).toBe(true);
    expect(resumenCuenta(c)).toMatchObject({ nombre: "Ana María Pérez", corto: "Ana" });
  });

  it("arma la cuenta de una organización y traduce condición, acreditación y documentos", () => {
    const perfil: PerfilApi = {
      id: "u2",
      email: "cc@correo.test",
      tipoPerfil: "ORGANIZACION",
      cedula: "V-7654321",
      nombres: "Luis",
      apellidos: "Gómez",
      telefono: null,
      ocupacion: null,
      perfilEstado: "INCOMPLETO",
      missing: ["archivoRepresentacion"],
      bajaSolicitada: null,
      identityDocuments: [],
      organization: {
        id: "o1",
        rif: "J-12345678-9",
        razonSocial: "Consejo Comunal Los Cardones",
        tipoEntidad: "Consejos Comunales / Comunas",
        telefonoInstitucional: "0251-1234567",
        condicion: "VOCERO_OFICIAL",
        tieneAcreditacion: "SI",
        documents: [doc("ACREDITACION")],
      },
    };
    const c = cuentaDePerfil(perfil);
    expect(c.perfil).toMatchObject({
      condicion: "Vocero o vocera oficial",
      acreditacion: "Sí",
      nombresRepresentante: "Luis",
      cedulaRepresentante: "V-7654321",
    });
    expect(c.documentos.ENTIDAD).toBeDefined();
    expect(c.documentos.REPRESENTACION).toBeUndefined();
    // R18: el perfil son los datos; con «Sí» falta el documento de la representación.
    expect(perfilCompleto(c)).toBe(true);
    expect(documentosCompletos(c)).toBe(false);
    expect(c.estadoVerificacion).toBe("PENDIENTE");
    expect(resumenCuenta(c)).toMatchObject({
      nombre: "Consejo Comunal Los Cardones",
      puedeProponer: false,
      faltantesVerificacion: ["Documento que acredita la representación"],
    });
  });

  it("toma la verificación y la baja solicitada de la API", () => {
    const perfil: PerfilApi = {
      id: "u3",
      email: "rosa@correo.test",
      tipoPerfil: "NATURAL",
      cedula: "V-11222333",
      nombres: "Rosa",
      apellidos: "Mora",
      telefono: "0414-1234567",
      ocupacion: null,
      perfilEstado: "COMPLETO",
      missing: [],
      bajaSolicitada: "2026-10-27T13:00:00.000Z",
      identityDocuments: [doc("CEDULA")],
      organization: null,
    };
    const c = cuentaDePerfil(perfil);
    expect(c.estadoVerificacion).toBe("VERIFICADO");
    expect(c.bajaSolicitada).toBe("2026-10-27T13:00:00.000Z");
    // Si la API ya informa `documentosEstado` (R18), manda ese.
    expect(cuentaDePerfil({ ...perfil, documentosEstado: "PENDIENTE" }).estadoVerificacion).toBe(
      "PENDIENTE",
    );
    expect(cuentaDePerfil({ ...perfil, identityDocuments: [] }).estadoVerificacion).toBe(
      "PENDIENTE",
    );
    // Sin `textosLegales` (la API aún no lo manda) no se pide aceptar nada de nuevo.
    expect(c.textosAceptados).toBeUndefined();
    expect(
      cuentaDePerfil({
        ...perfil,
        textosLegales: {
          terminos: { aceptada: 2, vigente: 3 },
          politicaDatos: { aceptada: null, vigente: 1 },
        },
      }).textosAceptados,
    ).toEqual({ TERMINOS: "2", POLITICA_DATOS: "" });
    // Sin versión publicada (vigente null): queda vacía, y con vacía no hay nada pendiente.
    expect(
      cuentaDePerfil({
        ...perfil,
        textosLegales: {
          terminos: { aceptada: 1, vigente: 2 },
          politicaDatos: { aceptada: null, vigente: null },
        },
      }).textosVigentes,
    ).toEqual({ TERMINOS: "2", POLITICA_DATOS: "" });
    // Sin `tourVistoAt` (la API aún no lo manda) el recorrido no se lanza solo.
    expect(resumenCuenta(c).tourPendiente).toBe(false);
    expect(resumenCuenta(cuentaDePerfil({ ...perfil, tourVistoAt: null })).tourPendiente).toBe(
      true,
    );
    expect(
      resumenCuenta(cuentaDePerfil({ ...perfil, tourVistoAt: "2026-10-28T12:00:00.000Z" }))
        .tourPendiente,
    ).toBe(false);
  });

  it("traduce el correo sin verificar y el enlace inválido", () => {
    expect(mensajeDeError(new ErrorApi(403, "EMAIL_NOT_VERIFIED", "x"))).toMatch(/verificas/);
    expect(mensajeDeError(new ErrorApi(400, "INVALID_TOKEN", ""))).toBe("El enlace no es válido.");
  });
});

describe("renovación de la cookie (Proxy)", async () => {
  const { esPrefetch, INACTIVIDAD_MS, renovarUnaVez, revisarCookie } = await import("./renovacion");
  const { secretoSesion } = await import("./sello");
  const ahora = 10_000_000;
  const cookie = (t: Partial<{ x: number; v: number; r: string }>) =>
    sellar({ a: "acceso", r: "refresco", x: ahora + 600_000, u: "u", ...t }, secretoSesion());
  const sesionApi = { accessToken: "a2", refreshToken: "r2", expiresIn: 900, user: { id: "u" } };

  it("cierra la sesión tras el plazo sin actividad, también en un prefetch", async () => {
    const vieja = cookie({ v: ahora - INACTIVIDAD_MS - 1 });
    for (const prefetch of [false, true])
      expect(await revisarCookie(vieja, { prefetch, ahora })).toEqual({
        valor: null,
        motivo: "inactividad",
      });
  });

  it("un prefetch no renueva ni cuenta como actividad", async () => {
    const refrescar = vi.fn();
    const porVencer = cookie({ x: ahora + 1_000, v: ahora - 120_000 });
    expect(await revisarCookie(porVencer, { prefetch: true, ahora, refrescar })).toBeUndefined();
    expect(refrescar).not.toHaveBeenCalled();
  });

  it("anota la actividad como mucho una vez por minuto", async () => {
    expect(await revisarCookie(cookie({ v: ahora - 30_000 }), { prefetch: false, ahora })).toBe(
      undefined,
    );
    const r = await revisarCookie(cookie({ v: ahora - 90_000 }), { prefetch: false, ahora });
    expect(r && r.valor && abrirSello(r.valor, secretoSesion())?.v).toBe(ahora);
  });

  it("las peticiones simultáneas comparten una sola renovación", async () => {
    const refrescar = vi.fn(async () => sesionApi);
    const porVencer = cookie({ x: ahora + 1_000, v: ahora });
    const [a, b] = await Promise.all([
      revisarCookie(porVencer, { prefetch: false, ahora, refrescar: refrescar as never }),
      revisarCookie(porVencer, { prefetch: false, ahora, refrescar: refrescar as never }),
    ]);
    expect(refrescar).toHaveBeenCalledTimes(1);
    for (const r of [a, b])
      expect(r && r.valor && abrirSello(r.valor, secretoSesion())?.r).toBe("r2");
  });

  it("si la API rechaza el refresh, la sesión termina; si no responde, queda igual", async () => {
    // Otro refresh: el anterior quedó recordado por la prueba de las renovaciones compartidas.
    const porVencer = cookie({ x: ahora + 1_000, v: ahora, r: "otro-refresco" });
    const rechazo = async () => {
      throw new ErrorApi(401, "REFRESH_TOKEN_REUSED", "x");
    };
    expect(
      await revisarCookie(porVencer, { prefetch: false, ahora: ahora + 1, refrescar: rechazo }),
    ).toEqual({ valor: null, motivo: "rechazada" });
    const caida = async () => {
      throw new ErrorApi(503, "API_SIN_RESPUESTA", "x");
    };
    expect(
      await revisarCookie(porVencer, { prefetch: false, ahora: ahora + 2, refrescar: caida }),
    ).toBeUndefined();
  });

  it("reconoce los prefetch del router", () => {
    expect(esPrefetch(new Headers({ "next-router-prefetch": "1" }))).toBe(true);
    expect(esPrefetch(new Headers({ "sec-purpose": "prefetch;prerender" }))).toBe(true);
    expect(esPrefetch(new Headers())).toBe(false);
    expect(renovarUnaVez).toBeTypeOf("function");
  });
});
