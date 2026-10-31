import { ArrowRight, Download, ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Adjunto, Imagen, PuntosAnalisis } from "@/lib/api/types";
import { formatearPeso, plural } from "@/lib/formato";
import { CreditoImagen } from "./credito-imagen";
import { VistaPdf } from "./vista-pdf";

/** Cuerpo de la noticia. El HTML ya llega saneado desde `src/lib/api` (getPost). */
export function CuerpoNoticia({ html }: { html: string }) {
  return <div className="prosa" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** «Puntos de análisis» de la plantilla: título a la izquierda y explicación a la derecha. */
export function BloquePuntos({ puntos }: { puntos: PuntosAnalisis }) {
  return (
    <section aria-labelledby="puntos-analisis" className="mt-10 border-t border-linea pt-8">
      <h2 id="puntos-analisis" className="font-display text-xl font-extrabold text-fuerte">
        {puntos.titulo || "Puntos de análisis"}
      </h2>
      <dl className="mt-6 divide-y divide-linea">
        {puntos.items.map((p, i) => (
          <div
            key={p.titulo}
            className="grid gap-2 py-5 first:pt-0 last:pb-0 sm:grid-cols-[14rem_1fr] sm:gap-8"
          >
            <dt className="flex items-start gap-3 font-display font-extrabold text-fuerte">
              <span
                aria-hidden="true"
                className="grid size-7 shrink-0 place-items-center rounded-full bg-rojo text-xs text-papel"
              >
                {i + 1}
              </span>
              {p.titulo}
            </dt>
            <dd className="leading-relaxed text-tinta">{p.texto}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Botón opcional de la plantilla; si apunta fuera del portal, se abre en otra pestaña. */
export function BotonNoticia({ boton }: { boton: { texto: string; href: string } }) {
  const externo = /^https?:\/\//.test(boton.href);
  const clase =
    "mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-rojo px-5 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.97]";
  return externo ? (
    <a href={boton.href} target="_blank" rel="noopener noreferrer" className={clase}>
      {boton.texto}
      <ExternalLink size={18} aria-hidden="true" />
      <span className="sr-only">(se abre en otra pestaña)</span>
    </a>
  ) : (
    <Link href={boton.href} className={clase}>
      {boton.texto}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}

/** Formato IMAGEN: una foto a todo el ancho con su descripción y crédito. */
export function FiguraNoticia({ imagen }: { imagen: Imagen }) {
  return (
    <figure className="overflow-hidden rounded-tarjeta bg-tarjeta shadow-elevada">
      <Image
        src={imagen.src}
        alt={imagen.alt}
        width={imagen.ancho}
        height={imagen.alto}
        sizes="(min-width: 896px) 864px, 100vw"
        loading="eager"
        fetchPriority="high"
        className="h-auto w-full"
      />
      <figcaption className="flex flex-wrap justify-between gap-x-4 gap-y-1 px-5 py-3 text-sm text-tinta/75">
        <span>
          {imagen.ilustrativa && <span className="font-semibold">Foto ilustrativa · </span>}
          {imagen.alt}
        </span>
        <CreditoImagen credito={imagen.credito} />
      </figcaption>
    </figure>
  );
}

/**
 * Formato DOCUMENTO: ficha con abrir y descargar. En escritorio, si el navegador tiene visor
 * de PDF, el documento además se lee aquí mismo (ver VistaPdf).
 */
export function VisorDocumento({
  adjunto,
  descargaUrl,
  bajarUrl,
  titulo,
}: {
  adjunto: Adjunto;
  /** Enlace que cuenta la descarga (documentos del repositorio con la API, guía R8). */
  descargaUrl?: string;
  /**
   * Enlace que baja el archivo cuando está en otro sitio (el atributo `download` no sirve ahí);
   * «Abrir» sigue usando `adjunto.url`. Es el soporte de un aporte con la API (R19).
   */
  bajarUrl?: string;
  /** Rótulo sobre el nombre del archivo, p. ej. «Documento de soporte». */
  titulo?: string;
}) {
  const detalle = [
    "PDF",
    formatearPeso(adjunto.pesoBytes),
    adjunto.paginas ? plural(adjunto.paginas, "página", "páginas") : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const boton =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-display font-bold transition-[background-color,transform] duration-150 active:scale-[0.97]";

  return (
    <section
      aria-labelledby="documento-adjunto"
      className="overflow-hidden rounded-tarjeta bg-tarjeta shadow-elevada"
    >
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-rojo/10 text-enlace">
            <FileText size={28} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            {titulo && <p className="text-sm text-tinta/75">{titulo}</p>}
            <h2
              id="documento-adjunto"
              className="font-display text-lg leading-snug font-extrabold [overflow-wrap:anywhere] text-fuerte"
            >
              {adjunto.nombre}
            </h2>
            <p className="mt-1 text-sm text-tinta/75">{detalle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={descargaUrl ?? adjunto.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${boton} bg-noche text-papel hover:bg-morado-activo`}
          >
            <ExternalLink size={18} aria-hidden="true" />
            Abrir
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
          <a
            href={descargaUrl ?? bajarUrl ?? adjunto.url}
            download={descargaUrl || bajarUrl ? undefined : true}
            className={`${boton} bg-rojo text-papel hover:bg-rojo-oscuro`}
          >
            <Download size={18} aria-hidden="true" />
            Descargar
          </a>
        </div>
      </div>

      <VistaPdf url={adjunto.url} nombre={adjunto.nombre} />
    </section>
  );
}
