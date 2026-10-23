import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { NewsCard } from "@/components/noticias/news-card";
import { getLatestPosts } from "@/lib/api";
import type { PostSummary } from "@/lib/api/types";
import { almacenInteracciones } from "@/lib/interacciones/almacen";
import {
  claveNoticia,
  masValoradas,
  masVistas,
  resumenInteracciones,
} from "@/lib/interacciones/interacciones";
import { PestanasNoticias } from "./pestanas-noticias";

const POR_PESTANA = 3;
const LECTOR = {
  clave: (p: PostSummary) => claveNoticia(p.slug),
  fecha: (p: PostSummary) => p.publicadoEl,
};

/**
 * Noticias en carril horizontal, con pestañas: las recientes, las más vistas y las más valoradas
 * («Me gusta» menos «No me gusta»). Los contadores cambian con cada visita: se leen al pedir la
 * página.
 */
export async function NewsRail() {
  await connection();
  const todas = await getLatestPosts(50);
  const alm = almacenInteracciones();

  const tarjetas = (posts: PostSummary[]) => (
    <>
      {posts.map((post) => {
        const r = resumenInteracciones(alm, claveNoticia(post.slug));
        return (
          <li key={post.slug} className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
            <NewsCard post={post} metricas={{ vistas: r.vistas, likes: r.likes }} />
          </li>
        );
      })}
      <li className="w-[70%] shrink-0 snap-start sm:w-[30%] lg:w-[22%]">
        <Link
          href="/noticias"
          className="group flex h-full min-h-56 flex-col justify-between rounded-tarjeta border-2 border-dashed border-rojo/40 p-6 font-display text-rojo transition-[background-color,border-color] duration-200 hover:border-rojo hover:bg-rojo/5"
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
        className="font-display text-3xl font-extrabold text-noche sm:text-4xl"
      >
        Noticias y novedades
      </h2>
      <PestanasNoticias
        pestanas={[
          {
            id: "recientes",
            etiqueta: "Recientes",
            contenido: tarjetas(todas.slice(0, POR_PESTANA)),
          },
          {
            id: "vistas",
            etiqueta: "Más vistas",
            contenido: tarjetas(masVistas(alm, todas, LECTOR, POR_PESTANA)),
          },
          {
            id: "valoradas",
            etiqueta: "Más valoradas",
            contenido: tarjetas(masValoradas(alm, todas, LECTOR, POR_PESTANA)),
          },
        ]}
      />
    </section>
  );
}
