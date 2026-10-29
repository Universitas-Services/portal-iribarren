import { afterEach, describe, expect, it, vi } from "vitest";
import type { TextoLegal, TipoTextoLegal } from "@/lib/api/types";
import type { Cuenta } from "./servicio";

/*
 * Textos legales con plataforma-api (R15): lo pendiente lo decide el perfil (vigente al
 * instante); si el texto cacheado es de otra versión, se pide sin caché. Y aceptar no tumba la
 * pantalla si mientras tanto se publicó otra versión (409).
 */

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn(), cacheLife: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(), RedirectType: { replace: "replace" } }));

const getTextoLegal = vi.fn();
vi.mock("@/lib/api", () => ({ getTextoLegal: (...a: unknown[]) => getTextoLegal(...a) }));

const texto = (tipo: TipoTextoLegal, version: string): TextoLegal => ({
  tipo,
  version,
  publicadoEl: "2026-10-29T12:00:00.000Z",
  html: "<p>Texto</p>",
});

const cuenta = (c: Partial<Cuenta>) => c as Cuenta;

afterEach(() => {
  getTextoLegal.mockReset();
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("pendientes según el perfil de la API", () => {
  it("pide solo lo que el perfil marca distinto, y sin caché si la cacheada es vieja", async () => {
    const { textosPendientes } = await import("./textos-legales");
    getTextoLegal.mockImplementation(async (tipo: TipoTextoLegal, o?: { fresco?: boolean }) =>
      // La cacheada es la 1; sin caché ya llega la 2.
      texto(tipo, o?.fresco ? "2" : "1"),
    );
    const r = await textosPendientes(
      cuenta({
        textosAceptados: { TERMINOS: "1", POLITICA_DATOS: "1" },
        textosVigentes: { TERMINOS: "2", POLITICA_DATOS: "1" },
      }),
    );
    expect(r.map((t) => [t.tipo, t.version])).toEqual([["TERMINOS", "2"]]);
    expect(getTextoLegal).toHaveBeenCalledWith("TERMINOS", { fresco: true });
  });

  it("al día, sin versión publicada (vigente vacía) o sin dato: nada pendiente", async () => {
    const { textosPendientes } = await import("./textos-legales");
    getTextoLegal.mockImplementation(async (tipo: TipoTextoLegal) => texto(tipo, "1"));
    expect(
      await textosPendientes(
        cuenta({
          textosAceptados: { TERMINOS: "1", POLITICA_DATOS: "" },
          textosVigentes: { TERMINOS: "1", POLITICA_DATOS: "" },
        }),
      ),
    ).toEqual([]);
    expect(await textosPendientes(cuenta({}))).toEqual([]);
    expect(await textosPendientes(undefined)).toEqual([]);
  });
});

describe("aceptar contra la API", () => {
  it("un 409 TEXTO_LEGAL_DESACTUALIZADO se avisa sin lanzar", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    vi.doMock("./sesion-api", () => ({
      tokenOIngresar: async () => "token",
      tokensDeCookie: async () => null,
      sincronizarCuentaApi: async () => undefined,
      guardarTokens: async () => undefined,
      borrarTokens: async () => undefined,
    }));
    vi.doMock("./sesion", () => ({ almacen: () => ({}), guardarAviso: async () => undefined }));
    vi.stubGlobal(
      "fetch",
      async () =>
        new Response(
          JSON.stringify({ statusCode: 409, code: "TEXTO_LEGAL_DESACTUALIZADO", message: "x" }),
          { status: 409 },
        ),
    );
    const { aceptarTextosLegalesApi } = await import("./acciones-api");
    expect(await aceptarTextosLegalesApi({ TERMINOS: "1" })).toEqual({
      ok: false,
      mensaje: "Hay una versión más nueva: léela antes de aceptarla.",
    });
  });
});
