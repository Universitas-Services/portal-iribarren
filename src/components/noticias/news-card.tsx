import {
  ClipboardList,
  Eye,
  ThumbsUp,
  FileText,
  Gavel,
  Image as ImageIcon,
  Images,
  Landmark,
  Map as MapIcon,
  Megaphone,
  Play,
  Scale,
  ScrollText,
  Telescope,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PostCategory, PostSummary } from "@/lib/api/types";
import { formatearDuracion, formatearFecha, formatearPeso, plural } from "@/lib/formato";

/** Cuando la noticia no trae imagen, la tarjeta usa un bloque de color con el ícono de su categoría. */
export const CATEGORIA: Record<
  PostCategory,
  { Icon: LucideIcon; fondo: string; icono: string; textoOscuro?: boolean }
> = {
  "Análisis institucional": { Icon: Landmark, fondo: "bg-noche", icono: "text-papel/15" },
  "Doctrina legal": { Icon: Scale, fondo: "bg-rojo-oscuro", icono: "text-papel/20" },
  "Decretos y normativas": { Icon: ScrollText, fondo: "bg-rojo", icono: "text-papel/25" },
  Normativa: { Icon: Gavel, fondo: "bg-noche", icono: "text-papel/15" },
  "Mensaje institucional": { Icon: Megaphone, fondo: "bg-rojo", icono: "text-papel/25" },
  "Auditoría y diagnóstico": {
    Icon: ClipboardList,
    fondo: "bg-naranja",
    icono: "text-noche/20",
    textoOscuro: true,
  },
  "Mesas de trabajo": {
    Icon: UsersRound,
    fondo: "bg-amarillo",
    icono: "text-noche/20",
    textoOscuro: true,
  },
  "Despliegue territorial": { Icon: MapIcon, fondo: "bg-rojo-oscuro", icono: "text-papel/20" },
  "Visión de futuro": { Icon: Telescope, fondo: "bg-noche", icono: "text-papel/15" },
};

/** Rótulo de las publicaciones de ejemplo de la maqueta (no son noticias reales). */
export function EtiquetaEjemplo({ claro = false }: { claro?: boolean }) {
  return (
    <span
      className={`rounded-full border border-dashed px-2.5 py-0.5 font-display text-xs font-bold ${
        claro ? "border-papel/60 text-papel" : "border-tinta/40 text-tinta/80"
      }`}
    >
      Ejemplo
    </span>
  );
}

/** Insignia que anticipa el formato: foto, galería, video o documento. Los textos no llevan. */
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
          : post.formato === "VIDEO"
            ? {
                Icon: Play,
                texto: `Video${post.duracionSeg ? ` · ${formatearDuracion(post.duracionSeg)}` : ""}`,
              }
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
export function NewsCard({
  post,
  metricas,
}: {
  post: PostSummary;
  /** Vistas y «Me gusta», en el carril del inicio. */
  metricas?: { vistas: number; likes: number };
}) {
  const c = CATEGORIA[post.categoria];
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-tarjeta bg-papel shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-elevada">
      <div className={`relative aspect-[16/10] shrink-0 overflow-hidden ${c.fondo}`}>
        {post.portada ? (
          <Image
            src={post.portada.src}
            alt={post.portada.alt}
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
          {post.ejemplo && <EtiquetaEjemplo />}
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
        {metricas && (
          <p className="mt-auto flex gap-4 pt-4 text-sm text-tinta/75">
            <span className="inline-flex items-center gap-1.5">
              <Eye size={16} aria-hidden="true" />
              <span className="tabular-nums">{metricas.vistas}</span>
              <span className="sr-only">vistas</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ThumbsUp size={16} aria-hidden="true" />
              <span className="tabular-nums">{metricas.likes}</span>
              <span className="sr-only">me gusta</span>
            </span>
          </p>
        )}
      </div>
    </article>
  );
}
