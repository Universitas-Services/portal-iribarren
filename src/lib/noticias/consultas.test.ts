import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/api/types";
import { parseFiltrosNoticias } from "@/lib/validation/schemas";
import { consultarNoticias, normalizar, relacionadas, resumir } from "./consultas";

const post = (slug: string, extra: Partial<Post> = {}): Post => ({
  slug,
  titulo: `Título ${slug}`,
  resumen: "Resumen",
  categoria: "Avances",
  formato: "TEXTO",
  publicadoEl: "2026-10-01",
  cuerpo: "<p>x</p>",
  imagenes: [],
  ...extra,
});

const lista: Post[] = [
  post("a", { publicadoEl: "2026-10-14", titulo: "Arranca el diagnóstico" }),
  post("b", { publicadoEl: "2026-10-10", categoria: "Minutas" }),
  post("c", { publicadoEl: "2026-09-01", categoria: "Comunicados" }),
  post("d", { publicadoEl: "2026-08-20", categoria: "Minutas" }),
];

describe("consultarNoticias", () => {
  it("ordena de la más reciente a la más antigua", () => {
    const r = consultarNoticias([...lista].reverse(), { pagina: 1 });
    expect(r.items.map((p) => p.slug)).toEqual(["a", "b", "c", "d"]);
  });

  it("filtra por categoría y por rango de fechas inclusivo", () => {
    expect(consultarNoticias(lista, { pagina: 1, categoria: "Minutas" }).total).toBe(2);
    const r = consultarNoticias(lista, { pagina: 1, desde: "2026-09-01", hasta: "2026-10-10" });
    expect(r.items.map((p) => p.slug)).toEqual(["b", "c"]);
  });

  it("busca sin distinguir tildes ni mayúsculas", () => {
    expect(consultarNoticias(lista, { pagina: 1, q: "DIAGNOSTICO" }).items[0]?.slug).toBe("a");
    expect(normalizar("Áéí Ñ")).toBe("aei n");
  });

  it("pagina y lleva una página fuera de rango a la última", () => {
    const r = consultarNoticias(lista, { pagina: 2 }, 3);
    expect(r).toMatchObject({ total: 4, paginas: 2, pagina: 2 });
    expect(r.items.map((p) => p.slug)).toEqual(["d"]);
    expect(consultarNoticias(lista, { pagina: 99 }, 3).pagina).toBe(2);
  });

  it("sin resultados devuelve una página vacía", () => {
    expect(consultarNoticias(lista, { pagina: 1, q: "zzz" })).toMatchObject({
      items: [],
      total: 0,
      paginas: 1,
      pagina: 1,
    });
  });
});

describe("resumir y relacionadas", () => {
  it("expone portada, conteo de imágenes y datos del adjunto sin el cuerpo", () => {
    const img = { src: "/a.jpg", alt: "a", ancho: 10, alto: 10 };
    const r = resumir(
      post("g", {
        formato: "GALERIA",
        imagenes: [img, img],
        adjunto: {
          nombre: "x.pdf",
          url: "/x.pdf",
          tipo: "application/pdf",
          pesoBytes: 1200,
          paginas: 2,
        },
      }),
    );
    expect(r).toMatchObject({ portada: img, conteoImagenes: 2, adjunto: { pesoBytes: 1200 } });
    expect(r).not.toHaveProperty("cuerpo");
  });

  it("prioriza la misma categoría y excluye la noticia actual", () => {
    const r = relacionadas(lista, lista[1]!, 2);
    expect(r.map((p) => p.slug)).toEqual(["d", "a"]);
  });
});

describe("parseFiltrosNoticias", () => {
  it("normaliza parámetros válidos", () => {
    expect(
      parseFiltrosNoticias({
        q: "  plan ",
        categoria: "Minutas",
        desde: "2026-01-01",
        pagina: "2",
      }),
    ).toEqual({
      q: "plan",
      categoria: "Minutas",
      desde: "2026-01-01",
      hasta: undefined,
      pagina: 2,
    });
  });

  it("descarta valores inválidos sin lanzar error", () => {
    expect(
      parseFiltrosNoticias({
        q: "",
        categoria: "Deportes",
        desde: "2026-02-30",
        hasta: "ayer",
        pagina: "-3",
      }),
    ).toEqual({
      q: undefined,
      categoria: undefined,
      desde: undefined,
      hasta: undefined,
      pagina: 1,
    });
  });

  it("toma el primer valor repetido e invierte un rango al revés", () => {
    expect(
      parseFiltrosNoticias({
        categoria: ["Avances", "Minutas"],
        desde: "2026-10-01",
        hasta: "2026-09-01",
      }),
    ).toMatchObject({ categoria: "Avances", desde: "2026-09-01", hasta: "2026-10-01" });
  });
});

describe("filtro por formato", () => {
  const conFormatos: Post[] = [
    post("t", { formato: "TEXTO", categoria: "Minutas" }),
    post("i", { formato: "IMAGEN" }),
    post("g", { formato: "GALERIA" }),
    post("d1", { formato: "DOCUMENTO", categoria: "Minutas" }),
    post("d2", { formato: "DOCUMENTO" }),
  ];

  it("filtra por formato y cuenta cada formato con los demás filtros", () => {
    const r = consultarNoticias(conFormatos, { pagina: 1, formato: "DOCUMENTO" });
    expect(r.items.map((p) => p.slug).sort()).toEqual(["d1", "d2"]);
    expect(r.porFormato).toEqual({ TODOS: 5, TEXTO: 1, IMAGEN: 1, GALERIA: 1, DOCUMENTO: 2 });
  });

  it("los conteos respetan la categoría elegida", () => {
    const r = consultarNoticias(conFormatos, { pagina: 1, categoria: "Minutas" });
    expect(r.porFormato).toMatchObject({ TODOS: 2, TEXTO: 1, DOCUMENTO: 1, IMAGEN: 0 });
  });

  it("lee el formato de la URL en minúsculas e ignora valores desconocidos", () => {
    expect(parseFiltrosNoticias({ formato: "galeria" }).formato).toBe("GALERIA");
    expect(parseFiltrosNoticias({ formato: "video" }).formato).toBeUndefined();
  });
});
