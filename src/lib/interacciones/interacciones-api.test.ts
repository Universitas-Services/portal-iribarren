import { afterEach, describe, expect, it, vi } from "vitest";

/*
 * Vistas, reacciones y rankings contra plataforma-api (guía R12): las cabeceras del visitante,
 * el interruptor de la reacción y la traducción de los errores.
 */

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn(), cacheLife: vi.fn() }));
vi.mock("next/headers", () => ({
  headers: async () =>
    new Headers({ "user-agent": "Navegador de prueba/1.0", "x-forwarded-for": "190.1.2.3" }),
}));
const sesion = vi.hoisted(() => ({ token: "token" as string | null }));
vi.mock("@/lib/auth/sesion-api", () => ({
  tokensDeCookie: async () =>
    sesion.token ? { a: sesion.token, r: "r", x: Date.now() + 60_000, u: "u1" } : null,
}));
vi.mock("@/lib/auth/acciones-api", () => ({ siHayTextosPendientes: vi.fn() }));

const RESUMEN = { vistas: 3, likes: 1, dislikes: 0, mia: "LIKE" };

/** fetch simulado: responde en orden y guarda lo que recibió. */
function simularFetch(...respuestas: { status?: number; cuerpo?: unknown }[]) {
  const llamadas: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal("fetch", async (url: string, init: RequestInit) => {
    llamadas.push({ url, init });
    const r = respuestas.shift() ?? { status: 204 };
    return new Response(r.cuerpo === undefined ? null : JSON.stringify(r.cuerpo), {
      status: r.status ?? 200,
    });
  });
  return llamadas;
}

const cabecera = (init: RequestInit, k: string) => new Headers(init.headers).get(k);

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  sesion.token = "token";
});

describe("vistas y reacciones", () => {
  it("la vista va con el navegador, la IP y el token si hay sesión", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    vi.stubEnv("PORTAL_CLIENT_SECRET", "secreto-de-prueba");
    const llamadas = simularFetch({ cuerpo: RESUMEN }, { cuerpo: { ...RESUMEN, mia: null } });
    const { vistaApi } = await import("./api");
    expect(await vistaApi({ tipo: "noticia", slug: "una-noticia" })).toEqual(RESUMEN);
    const { url, init } = llamadas[0]!;
    expect(url).toBe("https://api.ejemplo.test/api/v1/portal/posts/una-noticia/views");
    expect(init.method).toBe("POST");
    expect(cabecera(init, "User-Agent")).toBe("Navegador de prueba/1.0");
    expect(cabecera(init, "x-client-ip")).toBe("190.1.2.3");
    expect(cabecera(init, "Authorization")).toBe("Bearer token");

    sesion.token = null;
    await vistaApi({ tipo: "aporte", folio: "IRI-2026-0045" });
    expect(llamadas[1]!.url).toContain("/portal/participations/IRI-2026-0045/views");
    expect(cabecera(llamadas[1]!.init, "Authorization")).toBeNull();
  });

  it("si la vista falla, no hay contadores pero tampoco error", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    simularFetch({ status: 404, cuerpo: { code: "NOT_FOUND", message: "x" } });
    const { vistaApi } = await import("./api");
    expect(await vistaApi({ tipo: "noticia", slug: "no-publicada" })).toBeNull();
  });

  it("pone con PUT y quita con DELETE la que ya tenía", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    const llamadas = simularFetch({ cuerpo: RESUMEN }, { cuerpo: { ...RESUMEN, mia: null } });
    const { reaccionApi } = await import("./api");
    const o = { tipo: "noticia" as const, slug: "una-noticia" };
    expect(await reaccionApi(o, "LIKE", null)).toEqual({ estado: "OK", resumen: RESUMEN });
    expect(llamadas[0]!.init.method).toBe("PUT");
    expect(JSON.parse(String(llamadas[0]!.init.body))).toEqual({ valor: "LIKE" });
    await reaccionApi(o, "LIKE", "LIKE");
    expect(llamadas[1]!.init.method).toBe("DELETE");
    expect(llamadas[1]!.init.body).toBeUndefined();
  });

  it("traduce los errores de la API", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    const { siHayTextosPendientes } = await import("@/lib/auth/acciones-api");
    simularFetch(
      { status: 403, cuerpo: { code: "OWN_CONTENT", message: "x" } },
      { status: 403, cuerpo: { code: "TEXTOS_LEGALES_PENDIENTES", message: "x" } },
      { status: 429, cuerpo: { code: "TOO_MANY_REQUESTS", message: "x" } },
      { status: 404, cuerpo: { code: "NOT_FOUND", message: "x" } },
      { status: 401, cuerpo: { code: "UNAUTHORIZED", message: "x" } },
    );
    const { reaccionApi } = await import("./api");
    const o = { tipo: "aporte" as const, folio: "IRI-2026-0045" };
    expect((await reaccionApi(o, "LIKE", null)).estado).toBe("PROPIO");
    expect((await reaccionApi(o, "LIKE", null)).estado).toBe("TEXTOS");
    expect(siHayTextosPendientes).toHaveBeenCalled();
    expect(await reaccionApi(o, "LIKE", null)).toMatchObject({ estado: "LIMITE" });
    expect((await reaccionApi(o, "LIKE", null)).estado).toBe("INVALIDA");
    expect((await reaccionApi(o, "LIKE", null)).estado).toBe("SIN_SESION");
    sesion.token = null;
    expect((await reaccionApi(o, "LIKE", null)).estado).toBe("SIN_SESION");
  });
});

describe("rankings", () => {
  it("pide el ranking con su orden y su límite, y mapea los aportes", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    const llamadas = simularFetch(
      { cuerpo: { data: [{ slug: "una", totales: { vistas: 9, likes: 2, dislikes: 0 } }] } },
      {
        cuerpo: {
          data: [
            {
              folio: "IRI-2026-0045",
              tipo: "OPINION_GENERAL",
              parroquia: "Catedral",
              sector: "Centro",
              categoriaTecnica: "Vialidad y Transporte",
              descripcion: "Texto",
              imagenes: [],
              autor: "Ciudadano de Iribarren",
              publicadaEl: "2026-10-30T12:00:00.000Z",
              totales: { vistas: 4, likes: 1, dislikes: 1 },
            },
          ],
        },
      },
    );
    const { rankingAportesApi, rankingNoticiasApi } = await import("./api");
    const noticias = await rankingNoticiasApi("valoradas", 3);
    expect(noticias[0]!.totales?.vistas).toBe(9);
    expect(llamadas[0]!.url).toContain("/portal/posts/ranking?por=valoradas&limit=3");
    const aportes = await rankingAportesApi("reacciones", 6);
    expect(llamadas[1]!.url).toContain("/portal/participations/ranking?por=reacciones&limit=6");
    expect(aportes[0]).toMatchObject({ folio: "IRI-2026-0045", estado: "PUBLICADA" });
    expect(aportes[0]!.totales).toEqual({ vistas: 4, likes: 1, dislikes: 1 });
  });
});
