import {
  ClipboardList,
  FileText,
  Image as ImageIcon,
  Images,
  Megaphone,
  Mic,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PostCategory, PostSummary } from "@/lib/api/types";
import { formatearFecha, formatearPeso, plural } from "@/lib/formato";

/** Cuando la noticia no trae imagen, la tarjeta usa un bloque de color con el ícono de su categoría. */
export const CATEGORIA: Record<PostCategory, { Icon: LucideIcon; fondo: string; icono: string }> = {
  Avances: { Icon: Newspaper, fondo: "bg-rojo", icono: "text-papel/25" },
  Minutas: { Icon: ClipboardList, fondo: "bg-naranja", icono: "text-noche/20" },
  Comunicados: { Icon: Megaphone, fondo: "bg-noche", icono: "text-papel/15" },
  Entrevistas: { Icon: Mic, fondo: "bg-amarillo", icono: "text-noche/20" },
  Galería: { Icon: Images, fondo: "bg-rojo-oscuro", icono: "text-papel/20" },
};

/** Insignia que anticipa el formato: foto, galería o documento. Los textos no llevan insignia. */
export function FormatoBadge({ post }: { post: PostSummary }) {
  const datos =
    post.formato === "GALERIA"
      ? { Icon: Images, texto: `Galería · ${plural(post.conteoImagenes ?? 0, "foto", "fotos")}` }
      : post.formato === "DOCUMENTO"
        ? {
            Icon: FileText,
            texto: `PDF${post.adjunto ? ` · ${formatearPeso(post.adjunto.pesoBytes)}` : ""}`,
          }
        : post.formato === "IMAGEN"
          ? { Icon: ImageIcon, texto: "Foto" }
          : null;
  if (!datos) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-noche/80 px-2.5 py-1 font-display text-xs font-bold text-papel backdrop-blur-sm">
      <datos.Icon size={14} aria-hidden="true" />
      {datos.texto}
    </span>
  );
}

/** Tarjeta uniforme para carriles y «Más noticias»; el listado usa el mosaico por formato. */
export function NewsCard({ post }: { post: PostSummary }) {
  const c = CATEGORIA[post.categoria];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta bg-papel shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-elevada">
      <div className={`relative aspect-[16/10] shrink-0 overflow-hidden ${c.fondo}`}>
        {post.portada ? (
          <Image
            src={post.portada.src}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.03]"
          />
        ) : (
          <c.Icon
            aria-hidden="true"
            strokeWidth={1}
            className={`absolute -right-6 -bottom-8 size-48 transition-transform duration-500 ease-out-expo group-hover:scale-105 ${c.icono}`}
          />
        )}
        <div className="absolute top-3 left-3">
          <FormatoBadge post={post} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-tinta/75">
          <span className="rounded-full bg-rojo/10 px-2.5 py-0.5 font-display text-xs font-bold text-rojo">
            {post.categoria}
          </span>
          {post.parroquia && <span>{post.parroquia}</span>}
          <span aria-hidden="true">·</span>
          <time dateTime={post.publicadoEl}>{formatearFecha(post.publicadoEl)}</time>
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
