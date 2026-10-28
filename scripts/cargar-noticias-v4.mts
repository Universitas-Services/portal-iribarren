/*
 * Carga en plataforma-api las 9 noticias reales de la Propuesta v4 que hoy viven en
 * src/lib/mocks/data.ts (las que no llevan `ejemplo: true`), con sus fotos, el PDF de la Gaceta
 * y el video. Usa la API del panel (guías R6 y R7) con una cuenta OPERADOR o ADMIN.
 *
 *   node --no-warnings scripts/cargar-noticias-v4.mts            → simula: no llama a la API
 *   node --no-warnings scripts/cargar-noticias-v4.mts --cargar   → sube, crea y publica
 *
 * Variables: API_URL (…/api/v1), CORREO y CONTRASENA.
 *
 * - Es idempotente: si ya hay una noticia con el mismo título, la salta.
 * - Publica de la más antigua a la más reciente, así el orden del portal se mantiene. La fecha
 *   de publicación es la del momento de la carga: la API no permite fecharlas hacia atrás.
 * - La API arma el slug con el título, así que cambia. El mapa slug viejo → nuevo queda en
 *   src/lib/noticias/redirecciones-v4.json y next.config.ts redirige las direcciones viejas.
 *
 * Solo usa Node 24 (sin dependencias): `node` quita los tipos de los .ts al cargarlos.
 */

/* eslint-disable no-console -- script de terminal: informa cada paso por consola */

import { readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { posts } from "../src/lib/mocks/data.ts";

type Imagen = { src: string; alt: string; ancho: number; alto: number; [k: string]: unknown };
type Post = (typeof posts)[number];

const RAIZ = fileURLToPath(new URL("..", import.meta.url));
const PUBLICO = join(RAIZ, "public");
const MAPA = join(RAIZ, "src", "lib", "noticias", "redirecciones-v4.json");

const cargar = process.argv.includes("--cargar");
const base = process.env.API_URL?.replace(/\/+$/, "");

const TIPO_MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".vtt": "text/vtt",
};
const CLASE: Record<string, string> = {
  "image/jpeg": "imagen",
  "image/png": "imagen",
  "image/webp": "imagen",
  "application/pdf": "pdf",
  "video/mp4": "video",
  "video/webm": "video",
  "text/vtt": "subtitulos",
};

/* ---------- API ---------- */

let token = "";

async function api<T>(ruta: string, metodo = "GET", cuerpo?: unknown): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (cuerpo instanceof FormData) body = cuerpo;
  else if (cuerpo !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(cuerpo);
  }
  const r = await fetch(`${base}${ruta}`, { method: metodo, headers, body });
  const texto = await r.text();
  const datos = texto ? JSON.parse(texto) : undefined;
  if (!r.ok) {
    const detalle = datos?.details ? ` ${JSON.stringify(datos.details)}` : "";
    throw new Error(
      `${metodo} ${ruta} → ${r.status} ${datos?.code ?? ""}: ${datos?.message ?? ""}${detalle}`,
    );
  }
  return datos as T;
}

/* ---------- Archivos ---------- */

const subidos = new Map<string, string>();

/** Sube un archivo de public/ una sola vez y devuelve la URL de la API. */
async function subir(ruta: string): Promise<string> {
  const ya = subidos.get(ruta);
  if (ya) return ya;
  const tipo = TIPO_MIME[extname(ruta).toLowerCase()];
  if (!tipo) throw new Error(`Tipo de archivo desconocido: ${ruta}`);
  const bytes = await readFile(join(PUBLICO, ruta));
  if (!cargar) {
    console.log(`    subiría ${ruta} (${CLASE[tipo]}, ${Math.round(bytes.length / 1024)} KB)`);
    subidos.set(ruta, `<${ruta}>`);
    return `<${ruta}>`;
  }
  const datos = new FormData();
  datos.set("clase", CLASE[tipo]!);
  datos.set("file", new Blob([bytes], { type: tipo }), basename(ruta));
  const r = await api<{ url: string }>("/admin/media", "POST", datos);
  console.log(`    subido ${ruta} → ${r.url}`);
  subidos.set(ruta, r.url);
  return r.url;
}

const local = (src?: string) => Boolean(src && src.startsWith("/"));

async function imagen<T extends Imagen | undefined>(i: T): Promise<T> {
  return (i && local(i.src) ? { ...i, src: await subir(i.src) } : i) as T;
}

/** Los campos que espera PATCH /admin/posts/:id, con los archivos ya en la API. */
async function campos(p: Post) {
  const fotos = await Promise.all((p.imagenes ?? []).map((i) => imagen(i as Imagen)));
  // En la API, la foto de una noticia IMAGEN va en `portada` y la galería queda vacía.
  const esImagen = p.formato === "IMAGEN";
  const video = p.video
    ? {
        ...p.video,
        url:
          p.video.fuente === "ARCHIVO" && local(p.video.url)
            ? await subir(p.video.url)
            : p.video.url,
        portada: await imagen(p.video.portada as Imagen | undefined),
        subtitulos: local(p.video.subtitulos)
          ? await subir(p.video.subtitulos!)
          : p.video.subtitulos,
      }
    : undefined;
  const adjunto =
    p.adjunto && local(p.adjunto.url)
      ? { ...p.adjunto, url: await subir(p.adjunto.url) }
      : p.adjunto;
  return {
    tipo: "NOTICIA",
    formato: p.formato,
    titulo: p.titulo,
    resumen: p.resumen,
    categoria: p.categoria,
    parroquia: p.parroquia,
    portada: esImagen ? fotos[0] : undefined,
    cuerpo: p.cuerpo,
    imagenes: esImagen ? [] : fotos,
    adjunto,
    video,
    puntos: p.puntos,
    boton: p.boton,
    destacada: Boolean(p.destacada),
  };
}

/* ---------- Carga ---------- */

type Fila = { id: string; titulo: string; slug: string };

async function existente(titulo: string): Promise<Fila | undefined> {
  const q = encodeURIComponent(titulo.slice(0, 80));
  const r = await api<{ data: Fila[] }>(`/admin/posts?q=${q}&limit=100`);
  return r.data.find((n) => n.titulo === titulo);
}

async function main() {
  const reales = posts
    .filter((p) => !p.ejemplo)
    .sort((a, b) => a.publicadoEl.localeCompare(b.publicadoEl));
  console.log(`${reales.length} noticias reales de la v4. Modo: ${cargar ? "CARGAR" : "simular"}.`);

  if (cargar) {
    if (!base || !process.env.CORREO || !process.env.CONTRASENA)
      throw new Error("Faltan API_URL, CORREO o CONTRASENA.");
    const s = await api<{ accessToken: string }>("/auth/login", "POST", {
      email: process.env.CORREO,
      password: process.env.CONTRASENA,
    });
    token = s.accessToken;
  }

  const mapa: Record<string, string> = JSON.parse(await readFile(MAPA, "utf8").catch(() => "{}"));
  for (const p of reales) {
    console.log(`\n· ${p.publicadoEl} ${p.formato} «${p.titulo.slice(0, 70)}…»`);
    if (cargar) {
      const ya = await existente(p.titulo);
      if (ya) {
        console.log(`    ya existe (${ya.slug}): se salta`);
        if (ya.slug !== p.slug) mapa[p.slug] = ya.slug;
        continue;
      }
    }
    const datos = await campos(p);
    if (!cargar) {
      console.log(`    crearía, guardaría y publicaría (destacada: ${datos.destacada})`);
      continue;
    }
    const { id } = await api<{ id: string }>("/admin/posts", "POST");
    await api(`/admin/posts/${id}`, "PATCH", datos);
    const r = await api<{ slug: string }>(`/admin/posts/${id}/publish`, "POST");
    console.log(`    publicada: /noticias/${r.slug}`);
    if (r.slug !== p.slug) mapa[p.slug] = r.slug;
  }

  if (cargar) {
    await writeFile(MAPA, `${JSON.stringify(mapa, null, 2)}\n`);
    console.log(`\nRedirecciones guardadas en ${MAPA}.`);
  }
}

main().catch((e) => {
  console.error(`\nError: ${e instanceof Error ? e.message : e}`);
  process.exit(1);
});
