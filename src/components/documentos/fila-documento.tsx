import { Download, FileText } from "lucide-react";
import Link from "next/link";
import type { Documento } from "@/lib/api/types";
import { fechaVigente } from "@/lib/documentos/consultas";
import { formatearFecha, formatearPeso, plural } from "@/lib/formato";
import { SelloEstado } from "./sello-estado";

/**
 * Expediente del repositorio: hoja con su sello de estado, datos de archivo y acciones.
 * Toda la fila abre el detalle; «Descargar» va por encima con su propio enlace.
 */
export function FilaDocumento({ documento: d }: { documento: Documento }) {
  const detalle = [
    `v${d.version}`,
    d.archivo.paginas ? plural(d.archivo.paginas, "pág.", "págs.") : null,
    formatearPeso(d.archivo.pesoBytes),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group relative grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 rounded-tarjeta bg-papel p-5 shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-out-expo focus-within:shadow-elevada hover:-translate-y-0.5 hover:shadow-elevada sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-x-5 sm:p-6">
      {/* Hoja con la esquina doblada y un sello de color con el estado. */}
      <div
        aria-hidden="true"
        className="relative grid h-14 w-11 shrink-0 place-items-center self-start rounded-md bg-superficie sm:h-16 sm:w-13 sm:self-center"
      >
        <span className="absolute top-0 right-0 size-4 rounded-bl-md bg-[linear-gradient(225deg,var(--color-papel)_50%,var(--color-linea)_50%)]" />
        <FileText size={24} className="text-tinta/60" />
        <span
          className={`absolute -right-1.5 -bottom-1.5 size-4 rounded-full ring-2 ring-papel ${
            d.estado === "OFICIAL" ? "bg-exito" : "bg-amarillo"
          }`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <SelloEstado estado={d.estado} corto />
          <span className="text-xs font-semibold text-rojo">{d.categoria}</span>
        </div>
        <h2 className="mt-2 font-display text-lg leading-snug font-extrabold text-noche">
          <Link
            href={`/documentos/${d.slug}`}
            className="group-hover:text-rojo after:absolute after:inset-0"
          >
            {d.titulo}
          </Link>
        </h2>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-tinta">{d.descripcion}</p>
        <p className="mt-2 text-xs text-tinta/75">
          {detalle} · {d.actualizadoEl ? "Actualizado el " : "Publicado el "}
          <time dateTime={fechaVigente(d)}>{formatearFecha(fechaVigente(d))}</time>
        </p>
      </div>

      <a
        href={d.archivo.url}
        download
        className="relative z-10 col-start-2 inline-flex min-h-11 shrink-0 items-center justify-center gap-2 justify-self-start rounded-xl bg-noche px-4 font-display text-sm font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo active:scale-[0.97] sm:col-start-3"
      >
        <Download size={16} aria-hidden="true" />
        Descargar
        <span className="sr-only">«{d.titulo}»</span>
      </a>
    </article>
  );
}
