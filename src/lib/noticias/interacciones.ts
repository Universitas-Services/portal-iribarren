/*
 * Vistas y reacciones («Me gusta» / «No me gusta») de las noticias, simuladas en memoria hasta
 * que plataforma-api las ofrezca. Funciones puras sobre un almacén: se prueban con Vitest.
 *
 * Reglas (como en una red social): reacciona quien tiene sesión, con o sin perfil completo; cada
 * cuenta tiene a lo sumo una reacción por noticia; repetir la misma la quita y elegir la otra la
 * reemplaza. Las vistas suben cada vez que se abre una noticia.
 */

export type Reaccion = "LIKE" | "DISLIKE";

export type AlmacenInteracciones = {
  vistas: Map<string, number>;
  /** slug → (cuenta → reacción). */
  reacciones: Map<string, Map<string, Reaccion>>;
};

export type ResumenInteracciones = {
  vistas: number;
  likes: number;
  dislikes: number;
  /** Reacción de la cuenta en sesión, si la hay. */
  mia: Reaccion | null;
};

export const crearAlmacenInteracciones = (): AlmacenInteracciones => ({
  vistas: new Map(),
  reacciones: new Map(),
});

/**
 * Cifras iniciales de ejemplo por noticia, estables (derivadas del slug), para que «Más vistas» y
 * «Más valoradas» se distingan en la demostración. No son datos reales.
 */
export function cifrasDeEjemplo(slug: string) {
  let h = 2166136261;
  for (const c of slug) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  return { vistas: 60 + (h % 540), likes: 4 + ((h >>> 9) % 46), dislikes: (h >>> 17) % 9 };
}

export function registrarVista(alm: AlmacenInteracciones, slug: string) {
  alm.vistas.set(slug, (alm.vistas.get(slug) ?? 0) + 1);
}

/** Aplica una reacción y devuelve la que queda (null si se quitó). */
export function reaccionar(
  alm: AlmacenInteracciones,
  cuentaId: string,
  slug: string,
  reaccion: Reaccion,
): Reaccion | null {
  const deNoticia = alm.reacciones.get(slug) ?? new Map<string, Reaccion>();
  alm.reacciones.set(slug, deNoticia);
  if (deNoticia.get(cuentaId) === reaccion) {
    deNoticia.delete(cuentaId);
    return null;
  }
  deNoticia.set(cuentaId, reaccion);
  return reaccion;
}

export function resumenInteracciones(
  alm: AlmacenInteracciones,
  slug: string,
  cuentaId?: string,
): ResumenInteracciones {
  const base = cifrasDeEjemplo(slug);
  const deNoticia = [...(alm.reacciones.get(slug)?.values() ?? [])];
  return {
    vistas: base.vistas + (alm.vistas.get(slug) ?? 0),
    likes: base.likes + deNoticia.filter((r) => r === "LIKE").length,
    dislikes: base.dislikes + deNoticia.filter((r) => r === "DISLIKE").length,
    mia: (cuentaId && alm.reacciones.get(slug)?.get(cuentaId)) || null,
  };
}

type ConFecha = { slug: string; publicadoEl: string };

/** De la más vista a la menos vista; empata a favor de la más reciente. */
export function masVistas<T extends ConFecha>(alm: AlmacenInteracciones, posts: T[], n: number) {
  return ordenar(posts, (p) => resumenInteracciones(alm, p.slug).vistas).slice(0, n);
}

/** Por valoración («Me gusta» menos «No me gusta»); empata a favor de la más reciente. */
export function masValoradas<T extends ConFecha>(alm: AlmacenInteracciones, posts: T[], n: number) {
  return ordenar(posts, (p) => {
    const r = resumenInteracciones(alm, p.slug);
    return r.likes - r.dislikes;
  }).slice(0, n);
}

function ordenar<T extends ConFecha>(posts: T[], puntaje: (p: T) => number) {
  return [...posts].sort(
    (a, b) => puntaje(b) - puntaje(a) || b.publicadoEl.localeCompare(a.publicadoEl),
  );
}
