import {
  ArrowRight,
  ClipboardList,
  Images,
  Megaphone,
  Mic,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { getLatestPosts } from "@/lib/api";
import type { PostCategory, PostSummary } from "@/lib/api/types";
import { RailControls } from "./rail-controls";

const CATEGORIA: Record<PostCategory, { Icon: LucideIcon; fondo: string; icono: string }> = {
  Avances: { Icon: Newspaper, fondo: "bg-rojo", icono: "text-papel/25" },
  Minutas: { Icon: ClipboardList, fondo: "bg-naranja", icono: "text-noche/20" },
  Comunicados: { Icon: Megaphone, fondo: "bg-noche", icono: "text-papel/15" },
  Entrevistas: { Icon: Mic, fondo: "bg-amarillo", icono: "text-noche/20" },
  Galería: { Icon: Images, fondo: "bg-rojo-oscuro", icono: "text-papel/20" },
};

const fecha = new Intl.DateTimeFormat("es-VE", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Caracas",
});

const formatear = (iso: string) => fecha.format(new Date(`${iso}T12:00:00-04:00`));

function NewsCard({ post }: { post: PostSummary }) {
  const c = CATEGORIA[post.categoria];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta bg-papel shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-elevada">
      <div aria-hidden="true" className={`relative aspect-[16/10] overflow-hidden ${c.fondo}`}>
        <c.Icon
          strokeWidth={1}
          className={`absolute -right-6 -bottom-8 size-48 transition-transform duration-500 ease-out-expo group-hover:scale-105 ${c.icono}`}
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-tinta/75">
          <span className="rounded-full bg-rojo/10 px-2.5 py-0.5 font-display text-xs font-bold text-rojo">
            {post.categoria}
          </span>
          {post.parroquia && <span>{post.parroquia}</span>}
          <span aria-hidden="true">·</span>
          <time dateTime={post.publicadoEl}>{formatear(post.publicadoEl)}</time>
        </p>
        <h3 className="mt-3 font-display text-xl leading-snug font-extrabold text-noche">
          <Link
            href={`/noticias/${post.slug}`}
            className="group-hover:text-rojo after:absolute after:inset-0"
          >
            {post.titulo}
          </Link>
        </h3>
        <p className="mt-2 leading-relaxed text-tinta">{post.resumen}</p>
      </div>
    </article>
  );
}

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
