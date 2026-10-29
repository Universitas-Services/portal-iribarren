import Link from "next/link";
import { getBanners, getLatestPosts } from "@/lib/api";
import type { Banner } from "@/lib/api/types";
import { BannerCarousel } from "./banner-carousel";
import { Tile } from "./tile";

/**
 * Sin diapositivas (la alcaldía todavía no creó ninguna o todas vencieron), la tarjeta pasa por
 * las noticias destacadas, así el Inicio nunca queda con un hueco. Contenido real: título,
 * resumen y portada de cada noticia, con su enlace.
 */
async function respaldo(): Promise<Banner[]> {
  const noticias = await getLatestPosts(3);
  return noticias.map((n, orden) => ({
    id: `noticia-${n.slug}`,
    titulo: n.titulo,
    texto: n.resumen,
    enlace: { href: `/noticias/${n.slug}`, etiqueta: "Leer la noticia" },
    tono: "tinta",
    imagen: n.portada,
    orden,
  }));
}

export async function BannersTile({ className = "" }: { className?: string }) {
  const propias = await getBanners();
  const banners = propias.length ? propias : await respaldo();
  // Ni diapositivas ni noticias (la API no respondió): un acceso a Noticias en vez de un hueco.
  if (banners.length === 0)
    return (
      <Tile
        as="div"
        className={`flex flex-col justify-center bg-noche p-6 text-papel sm:p-8 ${className}`}
      >
        <p className="font-display text-2xl font-extrabold">Novedades del PDUL</p>
        <Link
          href="/noticias"
          className="mt-4 inline-flex min-h-11 w-fit items-center rounded-xl bg-papel px-5 font-display font-bold text-noche"
        >
          Ver las noticias
        </Link>
      </Tile>
    );
  return (
    <Tile as="div" className={`overflow-hidden ${className}`}>
      <BannerCarousel banners={banners} />
    </Tile>
  );
}
