import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { NewsCard } from "@/components/noticias/news-card";
import { getLatestPosts } from "@/lib/api";
import { RailControls } from "./rail-controls";

/** Noticias en carril horizontal: se desliza con el dedo, la rueda o las flechas. */
export async function NewsRail() {
  const posts = await getLatestPosts(3);
  return (
    <section aria-labelledby="noticias-titulo" className="revelar">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            id="noticias-titulo"
            className="font-display text-3xl font-extrabold text-noche sm:text-4xl"
          >
            Noticias y novedades
          </h2>
          <p className="mt-2 text-sm text-tinta/70">Noticias de ejemplo.</p>
        </div>
        <RailControls targetId="carril-noticias" />
      </div>

      <ul
        id="carril-noticias"
        className="-mx-4 mt-8 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-5 overflow-x-auto px-4 pt-2 pb-8 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => (
          <li key={post.slug} className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[31%]">
            <NewsCard post={post} />
          </li>
        ))}
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
      </ul>
    </section>
  );
}
