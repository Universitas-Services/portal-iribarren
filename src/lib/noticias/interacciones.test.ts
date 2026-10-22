import { describe, expect, it } from "vitest";
import {
  cifrasDeEjemplo,
  crearAlmacenInteracciones,
  masValoradas,
  masVistas,
  reaccionar,
  registrarVista,
  resumenInteracciones,
} from "./interacciones";

describe("reacciones a una noticia", () => {
  it("repetir la misma reacción la quita", () => {
    const alm = crearAlmacenInteracciones();
    const base = cifrasDeEjemplo("n");
    expect(reaccionar(alm, "ana", "n", "LIKE")).toBe("LIKE");
    expect(resumenInteracciones(alm, "n", "ana")).toMatchObject({
      likes: base.likes + 1,
      mia: "LIKE",
    });
    expect(reaccionar(alm, "ana", "n", "LIKE")).toBeNull();
    expect(resumenInteracciones(alm, "n", "ana")).toMatchObject({ likes: base.likes, mia: null });
  });

  it("la reacción contraria reemplaza a la anterior: una sola por cuenta", () => {
    const alm = crearAlmacenInteracciones();
    const base = cifrasDeEjemplo("n");
    reaccionar(alm, "ana", "n", "LIKE");
    reaccionar(alm, "ana", "n", "DISLIKE");
    expect(resumenInteracciones(alm, "n", "ana")).toMatchObject({
      likes: base.likes,
      dislikes: base.dislikes + 1,
      mia: "DISLIKE",
    });
  });

  it("cada cuenta reacciona por su lado y en cada noticia", () => {
    const alm = crearAlmacenInteracciones();
    reaccionar(alm, "ana", "n", "LIKE");
    reaccionar(alm, "luis", "n", "LIKE");
    reaccionar(alm, "ana", "otra", "DISLIKE");
    expect(resumenInteracciones(alm, "n").likes).toBe(cifrasDeEjemplo("n").likes + 2);
    expect(resumenInteracciones(alm, "n", "luis").mia).toBe("LIKE");
    expect(resumenInteracciones(alm, "otra", "ana").mia).toBe("DISLIKE");
    expect(resumenInteracciones(alm, "n").mia).toBeNull();
  });
});

describe("vistas y orden de la portada", () => {
  const posts = [
    { slug: "a", publicadoEl: "2026-10-01" },
    { slug: "b", publicadoEl: "2026-10-02" },
    { slug: "c", publicadoEl: "2026-10-03" },
  ];

  it("cada apertura suma una vista", () => {
    const alm = crearAlmacenInteracciones();
    registrarVista(alm, "a");
    registrarVista(alm, "a");
    expect(resumenInteracciones(alm, "a").vistas).toBe(cifrasDeEjemplo("a").vistas + 2);
  });

  it("ordena por vistas y por valoración", () => {
    const alm = crearAlmacenInteracciones();
    for (let i = 0; i < 1000; i++) registrarVista(alm, "a");
    expect(masVistas(alm, posts, 1)[0]?.slug).toBe("a");
    for (let i = 0; i < 200; i++) reaccionar(alm, `c${i}`, "b", "LIKE");
    expect(masValoradas(alm, posts, 3)[0]?.slug).toBe("b");
    for (let i = 0; i < 400; i++) reaccionar(alm, `d${i}`, "b", "DISLIKE");
    expect(masValoradas(alm, posts, 3).at(-1)?.slug).toBe("b");
  });

  it("las cifras de ejemplo son estables", () => {
    expect(cifrasDeEjemplo("una-noticia")).toEqual(cifrasDeEjemplo("una-noticia"));
  });
});
