import { Download, ExternalLink, FileText } from "lucide-react";
import Image from "next/image";
import type { Adjunto, Imagen } from "@/lib/api/types";
import { formatearPeso, plural } from "@/lib/formato";
import { CreditoImagen } from "./credito-imagen";
import { VistaPdf } from "./vista-pdf";

/** Cuerpo de la noticia. El HTML ya llega saneado desde `src/lib/api` (getPost). */
export function CuerpoNoticia({ html }: { html: string }) {
  return <div className="prosa" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Formato IMAGEN: una foto a todo el ancho con su descripción y crédito. */
export function FiguraNoticia({ imagen }: { imagen: Imagen }) {
  return (
    <figure className="overflow-hidden rounded-tarjeta bg-papel shadow-elevada">
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
        <span>{imagen.alt}</span>
        <CreditoImagen credito={imagen.credito} />
      </figcaption>
    </figure>
  );
}

/**
 * Formato DOCUMENTO: ficha con abrir y descargar. En escritorio, si el navegador tiene visor
 * de PDF, el documento además se lee aquí mismo (ver VistaPdf).
 */
export function VisorDocumento({ adjunto }: { adjunto: Adjunto }) {
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
      className="overflow-hidden rounded-tarjeta bg-papel shadow-elevada"
    >
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-rojo/10 text-rojo">
            <FileText size={28} aria-hidden="true" />
          </span>
          <div>
            <h2
              id="documento-adjunto"
              className="font-display text-lg leading-snug font-extrabold text-noche"
            >
              {adjunto.nombre}
            </h2>
            <p className="mt-1 text-sm text-tinta/75">{detalle}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={adjunto.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${boton} bg-noche text-papel hover:bg-tinta`}
          >
            <ExternalLink size={18} aria-hidden="true" />
            Abrir
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
          <a
            href={adjunto.url}
            download
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
