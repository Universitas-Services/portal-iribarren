import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorApi, type ParticipacionPropiaApi } from "@/lib/plataforma-api/cliente";
import {
  erroresParticipacion,
  participacionDeApi,
  propuestaDeApi,
} from "@/lib/plataforma-api/mapeo";

/*
 * Participaciones contra plataforma-api (guía R11): el cuerpo multipart y la cabecera del envío,
 * el mapeo de las vistas y los errores por campo.
 */

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ refresh: vi.fn(), cacheLife: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: (ruta: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { ruta });
  },
  RedirectType: { replace: "replace" },
}));
vi.mock("./sesion-api", () => ({
  tokenOIngresar: async () => "token",
  tokensDeCookie: async () => null,
  sincronizarCuentaApi: async () => undefined,
  guardarTokens: async () => undefined,
  borrarTokens: async () => undefined,
}));
vi.mock("./sesion", () => ({ almacen: () => ({}), guardarAviso: async () => undefined }));

const envio = {
  idempotencia: "clave-de-prueba-123",
  tipo: "PROPUESTA_FORMAL",
  noticia: "una-noticia",
  parroquia: "Catedral",
  sector: "Centro",
  categoriaTecnica: "Vialidad y Transporte",
  descripcion: "Una propuesta de prueba con suficiente detalle para el plan de desarrollo urbano.",
  latitud: 10.06,
  longitud: -69.34,
  video: { url: "https://youtu.be/abc" },
  mostrarNombre: false,
  imagenes: [new File([new Uint8Array(4)], "foto.jpg", { type: "image/jpeg" })],
  soporte: new File([new Uint8Array(4)], "plano.pdf", { type: "application/pdf" }),
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("envío de una participación", () => {
  it("arma el multipart con los nombres de la API y sin la noticia fuera de una opinión", async () => {
    const { cuerpoParticipacion } = await import("./acciones-api");
    const fd = cuerpoParticipacion(envio);
    expect(fd.get("mostrarNombre")).toBe("no");
    expect(fd.get("latitud")).toBe("10.06");
    expect(fd.get("video")).toBe("https://youtu.be/abc");
    expect(fd.has("noticia")).toBe(false);
    expect(fd.getAll("imagenes")).toHaveLength(1);
    expect((fd.get("soporte") as File).name).toBe("plano.pdf");
    expect(fd.has("idempotencia")).toBe(false);
    const opinion = cuerpoParticipacion({ ...envio, tipo: "OPINION_NOTICIA", latitud: undefined });
    expect(opinion.get("noticia")).toBe("una-noticia");
    expect(opinion.has("latitud")).toBe(false);
  });

  it("manda la clave en la cabecera Idempotency-Key y va al acuse", async () => {
    vi.stubEnv("API_URL", "https://api.ejemplo.test/api/v1");
    let cabecera: string | null = null;
    vi.stubGlobal("fetch", async (_url: string, init: RequestInit) => {
      cabecera = new Headers(init.headers).get("Idempotency-Key");
      return new Response(
        JSON.stringify({
          folio: "IRI-2026-0045",
          estado: "PENDIENTE",
          recibidaEl: "x",
          comprobante: {},
        }),
        { status: 201 },
      );
    });
    const { enviarParticipacionApi } = await import("./acciones-api");
    await expect(enviarParticipacionApi(envio, {})).rejects.toMatchObject({
      ruta: "/participa/enviada?folio=IRI-2026-0045",
    });
    expect(cabecera).toBe("clave-de-prueba-123");
  });

  it("los errores de la API marcan el campo del formulario", () => {
    const err = (code: string, details?: unknown, message = "x") =>
      erroresParticipacion(new ErrorApi(400, code, message, details));
    expect(err("VALIDATION_ERROR", { ubicacion: "Marca el punto." })).toEqual({
      errores: { ubicacion: "Marca el punto." },
    });
    expect(err("INVALID_CATALOG_VALUE", { field: "parroquia" }).errores).toEqual({
      parroquia: "Elige una opción de la lista.",
    });
    expect(err("FUERA_DEL_MUNICIPIO").errores?.ubicacion).toMatch(/fuera del Municipio/);
    expect(err("FILE_TOO_LARGE", undefined, "La imagen supera 2 MB").errores).toHaveProperty(
      "imagenes",
    );
    expect(err("INVALID_FILE", undefined, "Solo se aceptan PDF").errores).toHaveProperty("soporte");
    expect(err("PERFIL_INCOMPLETO", { missing: ["telefono", "documentoIdentidad"] }).mensaje).toBe(
      "Para enviar una propuesta formal completa tu perfil y tus documentos en Mi cuenta: falta el teléfono de contacto, el documento de identidad.",
    );
    expect(err("DOCUMENTOS_PENDIENTES", { missing: ["archivoAcreditacion"] }).mensaje).toMatch(
      /falta el documento de la organización/,
    );
  });
});

describe("vistas de la API", () => {
  const propia: ParticipacionPropiaApi = {
    folio: "IRI-2026-0045",
    tipo: "OPINION_GENERAL",
    parroquia: "Catedral",
    sector: "Centro",
    categoriaTecnica: "Vialidad y Transporte",
    descripcion: "Texto",
    imagenes: [{ nombre: "foto.jpg", mime: "image/jpeg", tamano: 10 }],
    mostrarNombre: true,
    autor: "Ana",
    estado: "PENDIENTE",
    recibidaEl: "2026-10-29T20:09:44.740Z",
    historial: [{ estado: "PENDIENTE", fecha: "2026-10-29T20:09:44.740Z" }],
    comprobante: { codigoVerificacion: "YYDK-FJK9", hashContenido: "1182e46f", sello: null },
  };

  it("la del autor conserva el acuse y usa la fecha de recepción", () => {
    const p = participacionDeApi(propia, "cuenta-1");
    expect(p).toMatchObject({ cuentaId: "cuenta-1", creadaEl: propia.recibidaEl });
    expect(p.comprobante?.codigoVerificacion).toBe("YYDK-FJK9");
  });

  it("la pública trae el autor visible y los totales", () => {
    const p = propuestaDeApi({
      ...propia,
      autor: "Ciudadano de Iribarren",
      publicadaEl: "2026-10-30T12:00:00.000Z",
      totales: { vistas: 0, likes: 0, dislikes: 0 },
    });
    expect(p).toMatchObject({ autor: "Ciudadano de Iribarren", estado: "PUBLICADA" });
    expect(p).not.toHaveProperty("comprobante");
  });
});
