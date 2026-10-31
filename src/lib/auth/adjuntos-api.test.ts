import { afterEach, describe, expect, it, vi } from "vitest";
import { participacionDeApi, propuestaDeApi } from "@/lib/plataforma-api/mapeo";
import type { ParticipacionPropiaApi } from "@/lib/plataforma-api/cliente";
import { rutaPropia, rutaPublica, urlAdjunto } from "@/lib/participacion";
import { almacenDemo } from "./fixtures";
import { propuestaPublica } from "./servicio";

/*
 * Adjuntos de un aporte (guía R19): a dónde apunta cada uno, qué ve el público y las rutas que
 * piden la URL firmada a plataforma-api y redirigen.
 */

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn(), cacheLife: vi.fn() }));
vi.mock("./sesion-api", () => ({ tokensDeCookie: async () => null }));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("a dónde apunta un adjunto", () => {
  it("usa el archivo de ejemplo, si no la ruta del portal por su id", () => {
    const base = rutaPropia("IRI-2026-0045");
    expect(urlAdjunto({ url: "/fotos/obelisco.jpg", id: "f1" }, base)).toBe("/fotos/obelisco.jpg");
    expect(urlAdjunto({ id: "f 1" }, base)).toBe(
      "/mi-cuenta/participaciones/IRI-2026-0045/archivo/f%201",
    );
    expect(urlAdjunto({ id: "f1" }, rutaPublica("IRI-2026-0045"), true)).toBe(
      "/propuestas/IRI-2026-0045/archivo/f1?descargar=1",
    );
    // Sin id (la API de antes de R19) no se puede abrir: se lista por su nombre.
    expect(urlAdjunto({}, base)).toBeUndefined();
  });

  it("el público ve las fotos y el video, nunca el documento de soporte", () => {
    const p = propuestaPublica(almacenDemo(), "IRI-2026-0001")!;
    expect(p.imagenes[0]?.url).toMatch(/^\/fotos\//);
    expect(p).not.toHaveProperty("soporte");

    const propia: ParticipacionPropiaApi = {
      folio: "IRI-2026-0045",
      tipo: "PROPUESTA_FORMAL",
      parroquia: "Catedral",
      sector: "Centro",
      categoriaTecnica: "Vialidad y Transporte",
      descripcion: "Texto",
      imagenes: [{ id: "f1", nombre: "foto.jpg", mime: "image/jpeg", tamano: 10 }],
      soporte: { id: "f2", nombre: "croquis.pdf", mime: "application/pdf", tamano: 20 },
      mostrarNombre: true,
      autor: "Ana",
      estado: "PUBLICADA",
      recibidaEl: "2026-10-29T20:09:44.740Z",
      historial: [],
      comprobante: { codigoVerificacion: "YYDK-FJK9", hashContenido: "1182e46f", sello: null },
    };
    expect(participacionDeApi(propia, "c1")).toMatchObject({
      imagenes: [{ id: "f1" }],
      soporte: { id: "f2" },
    });
    const publica = propuestaDeApi({
      ...propia,
      publicadaEl: "2026-10-30T12:00:00.000Z",
      totales: { vistas: 0, likes: 0, dislikes: 0 },
    });
    expect(publica.imagenes[0]?.id).toBe("f1");
    expect(publica).not.toHaveProperty("soporte");
  });
});

describe("rutas que abren el archivo", () => {
  const ctx = (folio: string, id: string) => ({ params: Promise.resolve({ folio, id }) }) as never;

  it("la pública redirige a la URL firmada sin dejarla en caché", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    let pedida = "";
    vi.stubGlobal("fetch", async (url: string) => {
      pedida = url;
      return Response.json({ url: "https://api.ejemplo.test/api/v1/files/tok", expiraEl: "x" });
    });
    const { GET } = await import("@/app/propuestas/[folio]/archivo/[id]/route");
    const r = await GET(
      new Request("http://x/propuestas/IRI-2026-0045/archivo/f1"),
      ctx("iri-2026-0045", "f1"),
    );
    expect(pedida).toBe(
      "https://api.ejemplo.test/api/v1/portal/participations/IRI-2026-0045/files/f1/url",
    );
    expect(r.status).toBe(302);
    expect(r.headers.get("Location")).toBe("https://api.ejemplo.test/api/v1/files/tok");
    expect(r.headers.get("Cache-Control")).toBe("no-store");
    expect(r.headers.get("Referrer-Policy")).toBe("no-referrer");
  });

  it("un archivo que la API no da (soporte, no publicado) es 404", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    vi.stubGlobal("fetch", async () =>
      Response.json({ code: "NOT_FOUND", message: "x" }, { status: 404 }),
    );
    const { GET } = await import("@/app/propuestas/[folio]/archivo/[id]/route");
    const r = await GET(new Request("http://x"), ctx("IRI-2026-0045", "f2"));
    expect(r.status).toBe(404);
  });

  it("la del autor sin sesión, o sin la API, es 404", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    const propia = await import("@/app/mi-cuenta/participaciones/[folio]/archivo/[id]/route");
    expect((await propia.GET(new Request("http://x"), ctx("IRI-2026-0045", "f2"))).status).toBe(
      404,
    );
    vi.stubEnv("API_URL", "");
    const publica = await import("@/app/propuestas/[folio]/archivo/[id]/route");
    expect((await publica.GET(new Request("http://x"), ctx("IRI-2026-0045", "f1"))).status).toBe(
      404,
    );
  });
});
