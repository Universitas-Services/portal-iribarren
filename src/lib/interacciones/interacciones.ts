/*
 * Vistas y reacciones («Me gusta» / «No me gusta») de las noticias y de los aportes ciudadanos
 * publicados, simuladas en memoria hasta que plataforma-api las ofrezca. Funciones puras sobre
 * un almacén, con claves «noticia:<slug>» y «aporte:<folio>»: se prueban con Vitest.
 *
 * Reglas (como en una red social): reacciona quien tiene sesión, con o sin perfil completo; cada
 * cuenta tiene a lo sumo una reacción por elemento; repetir la misma la quita y elegir la otra la
 * reemplaza. Las vistas suben cada vez que se abre el detalle.
 */

export const claveNoticia = (slug: string) => `noticia:${slug}`;
export const claveAporte = (folio: string) => `aporte:${folio}`;

export type Reaccion = "LIKE" | "DISLIKE";

export type AlmacenInteracciones = {
  vistas: Map<string, number>;
  /** clave → (cuenta → reacción). */
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
 * Cifras iniciales de ejemplo por elemento, estables (derivadas de la clave), para que los
 * órdenes de la portada se distingan en la demostración. No son datos reales.
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
  // Con plataforma-api los contadores empiezan en cero (guía R7): sin cifras de ejemplo.
  const base = process.env.API_URL ? { vistas: 0, likes: 0, dislikes: 0 } : cifrasDeEjemplo(slug);
  const deNoticia = [...(alm.reacciones.get(slug)?.values() ?? [])];
  return {
    vistas: base.vistas + (alm.vistas.get(slug) ?? 0),
    likes: base.likes + deNoticia.filter((r) => r === "LIKE").length,
    dislikes: base.dislikes + deNoticia.filter((r) => r === "DISLIKE").length,
    mia: (cuentaId && alm.reacciones.get(slug)?.get(cuentaId)) || null,
  };
}

/** Cómo leer la clave y la fecha de cada elemento a ordenar. */
type Lector<T> = { clave: (t: T) => string; fecha: (t: T) => string };

function ordenar<T>(
  alm: AlmacenInteracciones,
  items: T[],
  l: Lector<T>,
  n: number,
  puntaje: (r: ResumenInteracciones) => number,
) {
  return [...items]
    .sort(
      (a, b) =>
        puntaje(resumenInteracciones(alm, l.clave(b))) -
          puntaje(resumenInteracciones(alm, l.clave(a))) || l.fecha(b).localeCompare(l.fecha(a)),
    )
    .slice(0, n);
}

/** De lo más visto a lo menos visto; empata a favor de lo más reciente. */
export const masVistas = <T>(alm: AlmacenInteracciones, items: T[], l: Lector<T>, n: number) =>
  ordenar(alm, items, l, n, (r) => r.vistas);

/** Por valoración («Me gusta» menos «No me gusta»); empata a favor de lo más reciente. */
export const masValoradas = <T>(alm: AlmacenInteracciones, items: T[], l: Lector<T>, n: number) =>
  ordenar(alm, items, l, n, (r) => r.likes - r.dislikes);

/** Por cantidad de reacciones («Me gusta» más «No me gusta»); empata a favor de lo más reciente. */
export const masReacciones = <T>(alm: AlmacenInteracciones, items: T[], l: Lector<T>, n: number) =>
  ordenar(alm, items, l, n, (r) => r.likes + r.dislikes);
