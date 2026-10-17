import { describe, expect, it } from "vitest";
import type { Post } from "@/lib/api/types";
import { parseFiltrosNoticias } from "@/lib/validation/schemas";
import { consultarNoticias, normalizar, paraPortada, relacionadas, resumir } from "./consultas";

const post = (slug: string, extra: Partial<Post> = {}): Post => ({
  slug,
  titulo: `Título ${slug}`,
  resumen: "Resumen",
  categoria: "Auditoría y diagnóstico",
  formato: "TEXTO",
  publicadoEl: "2026-10-01",
  cuerpo: "<p>x</p>",
  imagenes: [],
  ...extra,
});

const lista: Post[] = [
  post("a", { publicadoEl: "2026-10-14", titulo: "Arranca el diagnóstico" }),
  post("b", { publicadoEl: "2026-10-10", categoria: "Mesas de trabajo" }),
  post("c", { publicadoEl: "2026-09-01", categoria: "Mensaje institucional" }),
  post("d", { publicadoEl: "2026-08-20", categoria: "Mesas de trabajo" }),
];

describe("consultarNoticias", () => {
  it("ordena de la más reciente a la más antigua", () => {
    const r = consultarNoticias([...lista].reverse(), { pagina: 1 });
    expect(r.items.map((p) => p.slug)).toEqual(["a", "b", "c", "d"]);
  });

  it("filtra por categoría y por rango de fechas inclusivo", () => {
    expect(consultarNoticias(lista, { pagina: 1, categoria: "Mesas de trabajo" }).total).toBe(2);
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
  it("un video usa su portada en la tarjeta y expone la duración", () => {
    const portada = { src: "/v.jpg", alt: "v", ancho: 16, alto: 9 };
    const r = resumir(
      post("v", {
        formato: "VIDEO",
        video: { fuente: "ARCHIVO", url: "/v.webm", portada, duracionSeg: 84 },
      }),
    );
    expect(r).toMatchObject({ portada, duracionSeg: 84 });
    expect(r).not.toHaveProperty("video");
  });

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
        categoria: "Mesas de trabajo",
        desde: "2026-01-01",
        pagina: "2",
      }),
    ).toEqual({
      q: "plan",
      categoria: "Mesas de trabajo",
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
        categoria: ["Auditoría y diagnóstico", "Mesas de trabajo"],
        desde: "2026-10-01",
        hasta: "2026-09-01",
      }),
    ).toMatchObject({
      categoria: "Auditoría y diagnóstico",
      desde: "2026-09-01",
      hasta: "2026-10-01",
    });
  });
});

describe("filtro por formato", () => {
  const conFormatos: Post[] = [
    post("t", { formato: "TEXTO", categoria: "Mesas de trabajo" }),
    post("i", { formato: "IMAGEN" }),
    post("g", { formato: "GALERIA" }),
    post("d1", { formato: "DOCUMENTO", categoria: "Mesas de trabajo" }),
    post("d2", { formato: "DOCUMENTO" }),
  ];

  it("filtra por formato y cuenta cada formato con los demás filtros", () => {
    const r = consultarNoticias(conFormatos, { pagina: 1, formato: "DOCUMENTO" });
    expect(r.items.map((p) => p.slug).sort()).toEqual(["d1", "d2"]);
    expect(r.porFormato).toEqual({
      TODOS: 5,
      TEXTO: 1,
      IMAGEN: 1,
      GALERIA: 1,
      DOCUMENTO: 2,
      VIDEO: 0,
    });
  });

  it("los conteos respetan la categoría elegida", () => {
    const r = consultarNoticias(conFormatos, { pagina: 1, categoria: "Mesas de trabajo" });
    expect(r.porFormato).toMatchObject({ TODOS: 2, TEXTO: 1, DOCUMENTO: 1, IMAGEN: 0 });
  });

  it("lee el formato de la URL en minúsculas e ignora valores desconocidos", () => {
    expect(parseFiltrosNoticias({ formato: "galeria" }).formato).toBe("GALERIA");
    expect(parseFiltrosNoticias({ formato: "video" }).formato).toBe("VIDEO");
    expect(parseFiltrosNoticias({ formato: "audio" }).formato).toBeUndefined();
  });
});

describe("portada del Inicio", () => {
  it("muestra primero las destacadas y completa con las más recientes", () => {
    const lista: Post[] = [
      post("reciente", { publicadoEl: "2026-10-10" }),
      post("destacada-vieja", { publicadoEl: "2026-09-04", destacada: true }),
      post("destacada-nueva", { publicadoEl: "2026-09-14", destacada: true }),
      post("vieja", { publicadoEl: "2026-08-01" }),
    ];
    expect(paraPortada(lista).map((p) => p.slug)).toEqual([
      "destacada-nueva",
      "destacada-vieja",
      "reciente",
    ]);
  });

  it("un video de Instagram puede no tener portada y no expone sus puntos", () => {
    const r = resumir(
      post("ig", {
        formato: "VIDEO",
        video: { fuente: "INSTAGRAM", url: "https://www.instagram.com/reel/x/" },
        puntos: { items: [{ titulo: "a", texto: "b" }] },
      }),
    );
    expect(r.portada).toBeUndefined();
    expect(r).not.toHaveProperty("puntos");
  });

  it("acepta las categorías de la Propuesta v4 y descarta las anteriores", () => {
    expect(parseFiltrosNoticias({ categoria: "Doctrina legal" }).categoria).toBe("Doctrina legal");
    expect(parseFiltrosNoticias({ categoria: "Visión de futuro" }).categoria).toBe(
      "Visión de futuro",
    );
    expect(parseFiltrosNoticias({ categoria: "Retiros y VUF" }).categoria).toBeUndefined();
  });

  it("las publicaciones de ejemplo nunca llegan a la portada", () => {
    const lista: Post[] = [
      post("ejemplo-reciente", { publicadoEl: "2026-10-20", destacada: true, ejemplo: true }),
      post("real", { publicadoEl: "2026-09-01" }),
    ];
    expect(paraPortada(lista).map((p) => p.slug)).toEqual(["real"]);
  });
});
