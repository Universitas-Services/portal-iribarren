import { ArrowUpRight, Clapperboard, Download, FileText, Images, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/lib/api/types";
import {
  duracionLegible,
  formatearDuracion,
  formatearFecha,
  formatearPeso,
  plural,
} from "@/lib/formato";
import { acomodarMosaico, type Celda } from "@/lib/noticias/mosaico";
import { CATEGORIA, EtiquetaEjemplo } from "./news-card";
import type { CSSProperties } from "react";

/*
 * Mosaico del listado: cada formato tiene su propia pieza y su propio tamaño base, y conviven
 * en una retícula de 4 columnas (2 en tablet, 1 en teléfono). `acomodarMosaico` decide la
 * posición de cada pieza y estira las vecinas para que no queden huecos.
 *   GALERIA   2×2  collage de fotos
 *   IMAGEN    1×2  foto vertical a sangre; el resumen aparece al pasar el cursor
 *   TEXTO     2×1  franja de color con tipografía grande
 *   DOCUMENTO 1×1  hoja con esquina doblada y descarga directa
 *   VIDEO     2×2  portada a sangre con botón de reproducir y duración
 */

/** La posición va en variables CSS para poder cambiarla según el ancho de pantalla. */
const ubicacion = (sm: Celda, lg: Celda) =>
  ({
    "--sm-col": `${sm.col} / span ${sm.w}`,
    "--sm-row": `${sm.row} / span ${sm.h}`,
    "--lg-col": `${lg.col} / span ${lg.w}`,
    "--lg-row": `${lg.row} / span ${lg.h}`,
  }) as CSSProperties;

const pieza =
  "group relative overflow-hidden rounded-tarjeta shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-elevada focus-within:-translate-y-1 focus-within:shadow-elevada";

function Meta({ post, claro = false }: { post: PostSummary; claro?: boolean }) {
  return (
    <p
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${claro ? "text-papel/85" : "text-tinta/75"}`}
    >
      <span
        className={`rounded-full px-2.5 py-0.5 font-display font-bold ${
          claro ? "bg-noche/30 text-papel backdrop-blur-sm" : "bg-rojo/10 text-rojo"
        }`}
      >
        {post.categoria}
      </span>
      {post.ejemplo && <EtiquetaEjemplo claro={claro} />}
      {post.parroquia && <span>{post.parroquia}</span>}
      <span aria-hidden="true">·</span>
      <time dateTime={post.publicadoEl}>{formatearFecha(post.publicadoEl)}</time>
    </p>
  );
}

/** Enlace que cubre toda la pieza; los botones secundarios van por encima con `relative z-10`. */
function EnlaceTitulo({ post, className }: { post: PostSummary; className: string }) {
  return (
    <h2 className={className}>
      <Link href={`/noticias/${post.slug}`} className="after:absolute after:inset-0">
        {post.titulo}
      </Link>
    </h2>
  );
}

function PiezaImagen({ post, prioridad }: { post: PostSummary; prioridad: boolean }) {
  return (
    <article className={`${pieza} h-[26rem] bg-noche sm:h-full`}>
      {post.portada && (
        <Image
          src={post.portada.src}
          alt={post.portada.alt}
          fill
          sizes="(min-width: 1024px) 300px, (min-width: 640px) 50vw, 100vw"
          loading={prioridad ? "eager" : "lazy"}
          fetchPriority={prioridad ? "high" : "auto"}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.06]"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(0deg,rgb(35_42_54/0.95)_0%,rgb(35_42_54/0.55)_45%,rgb(35_42_54/0)_75%)]"
      />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <Meta post={post} claro />
        <EnlaceTitulo
          post={post}
          className="mt-2 line-clamp-5 font-display text-xl leading-snug font-extrabold text-papel"
        />
        {/* El resumen se despliega al pasar el cursor o con el foco; en táctil queda visible. */}
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-papel/85 transition-[max-height,opacity] duration-500 ease-out-expo [@media(hover:hover)]:max-h-0 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-focus-within:max-h-24 [@media(hover:hover)]:group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:max-h-24 [@media(hover:hover)]:group-hover:opacity-100">
          {post.resumen}
        </p>
      </div>
    </article>
  );
}

function PiezaVideo({ post, prioridad }: { post: PostSummary; prioridad: boolean }) {
  return (
    <article className={`${pieza} h-[24rem] bg-noche sm:h-full`}>
      {post.portada && (
        <Image
          src={post.portada.src}
          alt={post.portada.alt}
          fill
          sizes="(min-width: 1024px) 620px, (min-width: 640px) 100vw, 100vw"
          loading={prioridad ? "eager" : "lazy"}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
        />
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(0deg,rgb(35_42_54/0.95)_0%,rgb(35_42_54/0.35)_45%,rgb(35_42_54/0.15)_100%)]"
      />
      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-noche/75 px-3 py-1 font-display text-xs font-bold text-papel backdrop-blur-sm">
        <Clapperboard size={14} aria-hidden="true" />
        Video
        {post.duracionSeg ? (
          <>
            {" · "}
            <span aria-hidden="true">{formatearDuracion(post.duracionSeg)}</span>
            <span className="sr-only">{duracionLegible(post.duracionSeg)}</span>
          </>
        ) : null}
      </span>
      {/* Botón de reproducir decorativo: toda la pieza lleva al video. */}
      <span
        aria-hidden="true"
        className="absolute top-[32%] left-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-rojo text-papel shadow-elevada ring-8 ring-papel/20 transition-[transform,box-shadow] duration-300 ease-out-expo group-hover:scale-110 group-hover:ring-papel/30 sm:top-[40%] sm:size-18"
      >
        <Play size={26} className="translate-x-0.5" fill="currentColor" />
      </span>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <Meta post={post} claro />
        <EnlaceTitulo
          post={post}
          className="mt-3 max-w-xl font-display text-2xl leading-tight font-extrabold text-papel sm:text-3xl"
        />
        <p className="mt-2 line-clamp-2 max-w-xl text-papel/85">{post.resumen}</p>
      </div>
    </article>
  );
}

function PiezaGaleria({ post }: { post: PostSummary }) {
  const fotos = post.miniaturas ?? (post.portada ? [post.portada] : []);
  const [principal, ...resto] = fotos;
  const extra = (post.conteoImagenes ?? fotos.length) - fotos.length;
  return (
    <article className={`${pieza} h-[28rem] bg-noche sm:h-full`}>
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1">
        {principal && (
          <div className="relative col-span-2 row-span-2 overflow-hidden">
            <Image
              src={principal.src}
              alt={principal.alt}
              fill
              sizes="(min-width: 1024px) 420px, (min-width: 640px) 66vw, 66vw"
              className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.05]"
            />
          </div>
        )}
        {resto.slice(0, 2).map((foto, i) => (
          <div key={foto.src} className="relative overflow-hidden">
            <Image
              src={foto.src}
              alt={foto.alt}
              fill
              sizes="(min-width: 1024px) 210px, 33vw"
              className={`object-cover transition-transform duration-700 ease-out-expo ${
                i === 0 ? "group-hover:scale-[1.1]" : "group-hover:scale-[1.1] group-hover:delay-75"
              }`}
            />
            {i === 1 && extra > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-0 grid place-items-center bg-noche/60 font-display text-2xl font-extrabold text-papel"
              >
                +{extra}
              </span>
            )}
          </div>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(0deg,rgb(35_42_54/0.95)_0%,rgb(35_42_54/0.4)_40%,rgb(35_42_54/0)_65%)]"
      />
      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-noche/75 px-3 py-1 font-display text-xs font-bold text-papel backdrop-blur-sm">
        <Images size={14} aria-hidden="true" />
        Galería · {plural(post.conteoImagenes ?? fotos.length, "foto", "fotos")}
      </span>
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <Meta post={post} claro />
        <EnlaceTitulo
          post={post}
          className="mt-3 max-w-xl font-display text-2xl leading-tight font-extrabold text-papel sm:text-3xl"
        />
        <p className="mt-2 line-clamp-2 max-w-xl text-papel/85">{post.resumen}</p>
      </div>
    </article>
  );
}

function PiezaTexto({ post }: { post: PostSummary }) {
  const c = CATEGORIA[post.categoria];
  const oscuro = Boolean(c.textoOscuro);
  const Icono = c.Icon;
  return (
    <article className={`${pieza} flex h-full flex-col justify-between p-6 sm:p-7 ${c.fondo}`}>
      <Icono
        aria-hidden="true"
        strokeWidth={1}
        className={`pointer-events-none absolute -right-4 -bottom-8 size-44 transition-transform duration-700 ease-out-expo group-hover:scale-110 group-hover:-rotate-6 @[36rem]:-right-8 @[36rem]:size-80 ${c.icono}`}
      />
      <Meta post={post} claro={!oscuro} />
      <div className="relative mt-4">
        <EnlaceTitulo
          post={post}
          className={`line-clamp-3 max-w-2xl font-display text-xl leading-tight font-extrabold @[28rem]:line-clamp-2 @[28rem]:text-2xl @[40rem]:text-3xl ${
            oscuro ? "text-noche" : "text-papel"
          }`}
        />
        <p
          className={`mt-2 line-clamp-2 max-w-xl text-sm leading-relaxed sm:line-clamp-1 ${
            oscuro ? "text-noche/85" : "text-papel/85"
          }`}
        >
          {post.resumen}
        </p>
      </div>
      <ArrowUpRight
        aria-hidden="true"
        size={22}
        className={`absolute top-6 right-6 transition-transform duration-200 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
          oscuro ? "text-noche" : "text-papel"
        }`}
      />
    </article>
  );
}

function PiezaDocumento({ post }: { post: PostSummary }) {
  const url = post.adjunto?.url;
  const detalle = [
    post.adjunto?.paginas ? plural(post.adjunto.paginas, "pág.", "págs.") : null,
    post.adjunto ? formatearPeso(post.adjunto.pesoBytes) : null,
  ]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className={`${pieza} flex h-full flex-col bg-papel p-5`}>
      {/* Esquina doblada de la hoja. */}
      <span
        aria-hidden="true"
        className="absolute top-0 right-0 size-9 rounded-bl-lg bg-[linear-gradient(225deg,var(--color-superficie)_50%,var(--color-linea)_50%)] transition-[width,height] duration-300 ease-out-expo group-hover:size-12"
      />
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-rojo px-2 py-1 font-display text-xs font-extrabold tracking-wide text-papel">
          <FileText size={14} aria-hidden="true" />
          PDF
        </span>
        <span className="text-xs text-tinta/75">{detalle}</span>
      </div>
      <EnlaceTitulo
        post={post}
        className="mt-3 line-clamp-3 font-display text-base leading-snug font-extrabold text-noche group-hover:text-rojo"
      />
      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        <p className="text-xs text-tinta/75">
          <span className="font-display font-bold text-rojo">{post.categoria}</span>
          <br />
          <time dateTime={post.publicadoEl}>{formatearFecha(post.publicadoEl)}</time>
        </p>
        {url && (
          <a
            href={url}
            download
            className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-noche text-papel transition-[background-color,transform] duration-150 hover:bg-rojo active:scale-[0.92]"
          >
            <Download size={18} aria-hidden="true" />
            <span className="sr-only">Descargar «{post.titulo}»</span>
          </a>
        )}
      </div>
    </article>
  );
}

export function MosaicoNoticias({ items }: { items: PostSummary[] }) {
  const formatos = items.map((p) => p.formato);
  const enTablet = acomodarMosaico(formatos, 2);
  const enEscritorio = acomodarMosaico(formatos, 4);
  return (
    <ul className="grid gap-4 sm:auto-rows-[12rem] sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
      {items.map((post, i) => (
        <li
          key={post.slug}
          style={ubicacion(enTablet[i]!, enEscritorio[i]!)}
          className="revelar @container sm:[grid-column:var(--sm-col)] sm:[grid-row:var(--sm-row)] lg:[grid-column:var(--lg-col)] lg:[grid-row:var(--lg-row)]"
        >
          {post.formato === "GALERIA" ? (
            <PiezaGaleria post={post} />
          ) : post.formato === "IMAGEN" ? (
            <PiezaImagen post={post} prioridad={i < 2} />
          ) : post.formato === "VIDEO" ? (
            <PiezaVideo post={post} prioridad={i < 2} />
          ) : post.formato === "DOCUMENTO" ? (
            <PiezaDocumento post={post} />
          ) : (
            <PiezaTexto post={post} />
          )}
        </li>
      ))}
    </ul>
  );
}
