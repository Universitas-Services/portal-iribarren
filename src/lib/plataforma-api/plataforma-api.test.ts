import { afterEach, describe, expect, it, vi } from "vitest";
import { perfilCompleto, resumenCuenta } from "@/lib/auth/servicio";
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
    expect(tokensDeRespuesta(r, 0)).toEqual({ a: "a", r: "r", x: 900_000, u: "u" });
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
    expect(perfilCompleto(c)).toBe(false);
    expect(resumenCuenta(c).nombre).toBe("Consejo Comunal Los Cardones");
  });
});
