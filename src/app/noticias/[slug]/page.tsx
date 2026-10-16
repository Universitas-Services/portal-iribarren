import { ArrowRight, MessageSquareText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CuerpoNoticia,
  FiguraNoticia,
  VisorDocumento,
} from "@/components/noticias/contenido-noticia";
import { EncabezadoPagina } from "@/components/noticias/encabezado-pagina";
import { Galeria } from "@/components/noticias/galeria";
import { NewsCard } from "@/components/noticias/news-card";
import { RelacionadasSkeleton } from "@/components/noticias/skeletons";
import { getPost, getPostSlugs, getRelatedPosts } from "@/lib/api";
import { formatearFechaLarga } from "@/lib/formato";

type Params = Promise<{ slug: string }>;

/** Las noticias publicadas se prerenderizan; un slug nuevo se genera en su primera visita. */
export async function generateStaticParams() {
  return (await getPostSlugs()).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getPost((await params).slug);
  if (!post) return { title: "Noticia no encontrada" };
  const portada = post.imagenes[0];
  return {
    title: post.titulo,
    description: post.resumen,
    openGraph: {
      type: "article",
      title: post.titulo,
      description: post.resumen,
      publishedTime: post.publicadoEl,
      images: portada
        ? [{ url: portada.src, width: portada.ancho, height: portada.alto, alt: portada.alt }]
        : undefined,
    },
  };
}

export default async function NoticiaPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const medio =
    post.formato === "IMAGEN" && post.imagenes[0] ? (
      <FiguraNoticia imagen={post.imagenes[0]} />
    ) : post.formato === "GALERIA" && post.imagenes.length > 0 ? (
      <Galeria imagenes={post.imagenes} titulo={post.titulo} />
    ) : null;

  return (
    <>
      <EncabezadoPagina
        ancho="max-w-4xl"
        migas={[
          { href: "/", label: "Inicio" },
          { href: "/noticias", label: "Noticias" },
          { label: post.categoria },
        ]}
        titulo={post.titulo}
        bajada={post.resumen}
      >
        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-papel/80">
          <Link
            href={`/noticias?categoria=${encodeURIComponent(post.categoria)}`}
            className="rounded-full bg-naranja px-3 py-1 font-display text-xs font-bold text-noche hover:bg-amarillo"
          >
            {post.categoria}
          </Link>
          {post.parroquia && <span>{post.parroquia}</span>}
          <span aria-hidden="true">·</span>
          <time dateTime={post.publicadoEl}>{formatearFechaLarga(post.publicadoEl)}</time>
        </p>
      </EncabezadoPagina>

      <article className="relative z-10 mx-auto -mt-16 max-w-4xl space-y-8 px-4 sm:px-6 lg:-mt-20 lg:px-8">
        {medio}

        <div className="rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-10">
          <CuerpoNoticia html={post.cuerpo} />
          {post.autor && <p className="mt-8 text-sm text-tinta/75">Por {post.autor}</p>}
        </div>

        {post.formato === "DOCUMENTO" && post.adjunto && <VisorDocumento adjunto={post.adjunto} />}

        <aside
          aria-labelledby="opinar-titulo"
          className="relative overflow-hidden rounded-tarjeta bg-rojo p-6 text-papel shadow-tarjeta sm:p-10"
        >
          <MessageSquareText
            aria-hidden="true"
            strokeWidth={1}
            className="pointer-events-none absolute -right-6 -bottom-10 size-48 text-papel/10"
          />
          <h2
            id="opinar-titulo"
            className="relative font-display text-2xl font-extrabold sm:text-3xl"
          >
            ¿Qué opinas de esta noticia?
          </h2>
          <p className="relative mt-3 max-w-xl leading-relaxed text-papel/90">
            Tu opinión llega al equipo del PDUL con un folio y recibe una respuesta. Solo necesitas
            tu cuenta con el perfil completo.
          </p>
          <Link
            href={`/participa?tipo=opinion-noticia&noticia=${post.slug}`}
            className="group relative mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-papel px-5 font-display font-bold text-rojo transition-transform duration-150 active:scale-[0.97]"
          >
            Opinar sobre esta noticia
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform duration-200 ease-out-expo group-hover:translate-x-1"
            />
          </Link>
        </aside>
      </article>

      <section
        aria-labelledby="mas-noticias"
        className="mx-auto max-w-7xl px-4 pt-20 pb-24 sm:px-6 lg:px-8 lg:pt-28"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="mas-noticias" className="font-display text-3xl font-extrabold text-noche">
            Más noticias
          </h2>
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1.5 font-display font-bold text-rojo hover:underline"
          >
            Ver todas
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8">
          <Suspense fallback={<RelacionadasSkeleton />}>
            <Relacionadas slug={post.slug} />
          </Suspense>
        </div>
      </section>
    </>
  );
}

async function Relacionadas({ slug }: { slug: string }) {
  const relacionadas = await getRelatedPosts(slug);
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {relacionadas.map((p) => (
        <li key={p.slug}>
          <NewsCard post={p} />
        </li>
      ))}
    </ul>
  );
}
