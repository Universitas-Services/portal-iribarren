import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { NewsCard } from "@/components/noticias/news-card";
import { getLatestPosts } from "@/lib/api";
import type { PostSummary } from "@/lib/api/types";
import { almacenInteracciones, metricasNoticia } from "@/lib/interacciones/almacen";
import { rankingNoticiasApi } from "@/lib/interacciones/api";
import { claveNoticia, masValoradas, masVistas } from "@/lib/interacciones/interacciones";
import { ErrorApi, usaApi } from "@/lib/plataforma-api/cliente";
import { PestanasNoticias } from "./pestanas-noticias";

const POR_PESTANA = 3;
const LECTOR = {
  clave: (p: PostSummary) => claveNoticia(p.slug),
  fecha: (p: PostSummary) => p.publicadoEl,
};

type Pestanas = { recientes: PostSummary[]; vistas: PostSummary[]; valoradas: PostSummary[] };

/**
 * Las tres pestañas. Con plataforma-api, los rankings de la API (guía R12), cacheados unos
 * minutos. Sin ella, el almacén simulado, que cambia con cada visita: se lee al pedir la página.
 */
async function pestanas(): Promise<Pestanas | null> {
  if (usaApi()) {
    try {
      const [recientes, vistas, valoradas] = await Promise.all([
        rankingNoticiasApi("recientes", POR_PESTANA),
        rankingNoticiasApi("vistas", POR_PESTANA),
        rankingNoticiasApi("valoradas", POR_PESTANA),
      ]);
      return { recientes, vistas, valoradas };
    } catch (e) {
      // Si la API no responde, el Inicio sigue sin este carril.
      if (e instanceof ErrorApi && e.status >= 500) return null;
      throw e;
    }
  }
  await connection();
  const todas = await getLatestPosts(50);
  const alm = almacenInteracciones();
  return {
    recientes: todas.slice(0, POR_PESTANA),
    vistas: masVistas(alm, todas, LECTOR, POR_PESTANA),
    valoradas: masValoradas(alm, todas, LECTOR, POR_PESTANA),
  };
}

/**
 * Noticias en carril horizontal, con pestañas: las recientes, las más vistas y las más valoradas
 * («Me gusta» menos «No me gusta»).
 */
export async function NewsRail() {
  const p = await pestanas();
  if (!p || p.recientes.length === 0) return null;

  const tarjetas = (posts: PostSummary[]) => (
    <>
      {posts.map((post) => (
        <li key={post.slug} className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
          <NewsCard post={post} metricas={metricasNoticia(post.slug, post.totales)} />
        </li>
      ))}
      <li className="w-[70%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
        <Link
          href="/noticias"
          className="group flex h-full min-h-56 flex-col justify-between rounded-tarjeta border-2 border-dashed border-rojo/40 p-6 font-display text-enlace transition-[background-color,border-color] duration-200 hover:border-rojo hover:bg-rojo/5"
        >
          <span className="text-2xl leading-tight font-extrabold">Ver todas las noticias</span>
          <ArrowRight
            size={28}
            aria-hidden="true"
            className="transition-transform duration-200 ease-out-expo group-hover:translate-x-1.5"
          />
        </Link>
      </li>
    </>
  );

  return (
    <section aria-labelledby="noticias-titulo" className="revelar">
      <h2
        id="noticias-titulo"
        className="font-display text-3xl font-extrabold text-fuerte sm:text-4xl"
      >
        Noticias y novedades
      </h2>
      <PestanasNoticias
        pestanas={[
          { id: "recientes", etiqueta: "Recientes", contenido: tarjetas(p.recientes) },
          { id: "vistas", etiqueta: "Más vistas", contenido: tarjetas(p.vistas) },
          { id: "valoradas", etiqueta: "Más valoradas", contenido: tarjetas(p.valoradas) },
        ]}
      />
    </section>
  );
}
