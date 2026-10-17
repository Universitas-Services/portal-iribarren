/**
 * Saca el identificador de un enlace de YouTube (watch, youtu.be, shorts o embed).
 * Devuelve undefined si el enlace no es de YouTube o el id no tiene la forma esperada,
 * para no incrustar nunca una URL arbitraria.
 */
export function idYoutube(url: string): string | undefined {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return undefined;
  }
  const host = u.hostname.replace(/^(www|m)\./, "");
  let id: string | null | undefined;
  if (host === "youtu.be") id = u.pathname.slice(1);
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    id =
      u.pathname === "/watch"
        ? u.searchParams.get("v")
        : u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/)?.[1];
  }
  return id && /^[\w-]{11}$/.test(id) ? id : undefined;
}

/** URL del reproductor sin cookies, con reproducción al abrir (la persona ya pulsó «play»). */
export const urlEmbedYoutube = (id: string) =>
  `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
