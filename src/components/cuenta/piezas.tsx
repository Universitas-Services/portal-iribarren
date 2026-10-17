"use client";

import { AlertCircle, Check, FileText, ImageIcon, Upload, X } from "lucide-react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { formatearPeso } from "@/lib/formato";
import { archivoSchema } from "@/lib/validation/common";
import { claseCampo } from "./campos";

/*
 * Piezas de los formularios de perfil y participación: archivo con vista previa, selector,
 * diálogo de confirmación y progreso del perfil.
 */

const claseEtiqueta = "mb-1.5 block font-display text-sm font-bold text-noche";

function Error({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={`${id}-error`} className="mt-1.5 flex items-start gap-1.5 text-sm text-rojo">
      <AlertCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
      {error}
    </p>
  );
}

type Seleccion = { nombre: string; tamano: number; tipo: string; url?: string };

/**
 * Archivo con arrastrar y soltar. Valida en el navegador el tipo (PDF, JPG o PNG) y el tamaño
 * (2 MB) con el mismo esquema del servidor; si no pasa, no se adjunta. Muestra una vista previa.
 */
export function CampoArchivo({
  id,
  name = id,
  etiqueta,
  ayuda = "PDF, JPG o PNG de hasta 2 MB.",
  error,
  actual,
  requerido = false,
  onCambio,
}: {
  id: string;
  name?: string;
  etiqueta: string;
  ayuda?: string;
  error?: string;
  /** Archivo ya cargado: al elegir otro se sube como versión nueva. */
  actual?: { nombre: string; version: number };
  requerido?: boolean;
  onCambio?: (hay: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState<Seleccion | null>(null);
  const [local, setLocal] = useState<string>();
  const [encima, setEncima] = useState(false);
  const mostrado = local ?? error;

  // Libera la URL de la miniatura al cambiarla o al salir.
  useEffect(() => () => (sel?.url ? URL.revokeObjectURL(sel.url) : undefined), [sel]);

  function tomar(archivo: File | undefined) {
    if (!archivo) return;
    const r = archivoSchema().safeParse(archivo);
    if (!r.success) {
      if (input.current) input.current.value = "";
      setSel(null);
      setLocal(
        r.error.issues[0]?.message === "Formato no permitido."
          ? `«${archivo.name}» no es PDF, JPG ni PNG.`
          : `«${archivo.name}» pesa ${formatearPeso(archivo.size)}; el máximo es 2 MB.`,
      );
      onCambio?.(false);
      return;
    }
    setLocal(undefined);
    setSel({
      nombre: archivo.name,
      tamano: archivo.size,
      tipo: archivo.type,
      url: archivo.type.startsWith("image/") ? URL.createObjectURL(archivo) : undefined,
    });
    onCambio?.(true);
  }

  function quitar() {
    if (input.current) input.current.value = "";
    setSel(null);
    setLocal(undefined);
    onCambio?.(false);
    input.current?.focus();
  }

  return (
    <div>
      <p id={`${id}-etiqueta`} className={claseEtiqueta}>
        {etiqueta}
        {!requerido && <span className="font-normal text-tinta/70"> (opcional)</span>}
      </p>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          setEncima(true);
        }}
        onDragLeave={() => setEncima(false)}
        onDrop={(e) => {
          e.preventDefault();
          setEncima(false);
          const archivo = e.dataTransfer.files[0];
          if (archivo && input.current) {
            const dt = new DataTransfer();
            dt.items.add(archivo);
            input.current.files = dt.files;
          }
          tomar(archivo);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors has-[:focus-visible]:border-rojo has-[:focus-visible]:bg-rojo/5 ${
          mostrado
            ? "border-rojo bg-rojo/5"
            : encima
              ? "border-rojo bg-rojo/5"
              : "border-linea hover:border-noche/40"
        } ${sel ? "hidden" : ""}`}
      >
        <Upload size={24} aria-hidden="true" className="text-rojo" />
        <span className="font-semibold text-noche">
          {actual ? "Elige un archivo para reemplazarlo" : "Elige un archivo o arrástralo aquí"}
        </span>
        <span className="text-sm text-tinta/70">{ayuda}</span>
        <input
          ref={input}
          id={id}
          name={name}
          type="file"
          accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
          aria-labelledby={`${id}-etiqueta`}
          aria-describedby={mostrado ? `${id}-error` : undefined}
          aria-invalid={mostrado ? true : undefined}
          onChange={(e) => tomar(e.target.files?.[0])}
          className="sr-only"
        />
      </label>

      {sel && (
        <div className="flex items-center gap-4 rounded-2xl border border-linea p-3">
          {sel.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local (blob:)
            <img src={sel.url} alt="" className="size-16 shrink-0 rounded-xl object-cover" />
          ) : (
            <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-rojo/10 text-rojo">
              <FileText size={28} aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-noche">{sel.nombre}</p>
            <p className="flex items-center gap-1.5 text-sm text-exito-oscuro">
              <Check size={14} aria-hidden="true" />
              {sel.tipo === "application/pdf" ? "PDF" : "Imagen"} · {formatearPeso(sel.tamano)}
            </p>
          </div>
          <button
            type="button"
            onClick={quitar}
            className="grid size-11 shrink-0 place-items-center rounded-xl text-tinta/70 hover:bg-superficie hover:text-rojo"
          >
            <X size={20} aria-hidden="true" />
            <span className="sr-only">Quitar {sel.nombre}</span>
          </button>
        </div>
      )}

      {actual && !sel && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-tinta/80">
          {/\.(jpe?g|png)$/i.test(actual.nombre) ? (
            <ImageIcon size={15} aria-hidden="true" />
          ) : (
            <FileText size={15} aria-hidden="true" />
          )}
          Cargado: <span className="font-semibold text-noche">{actual.nombre}</span> · versión{" "}
          {actual.version}
        </p>
      )}
      <Error id={id} error={mostrado} />
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  etiqueta: string;
  /** Textos, o pares valor/texto cuando el valor no es lo que se muestra. */
  opciones: readonly (string | { valor: string; texto: string })[];
  vacio?: string;
  error?: string;
  ayuda?: string;
};

export function CampoSelect({
  id,
  etiqueta,
  opciones,
  vacio = "Selecciona una opción",
  error,
  ayuda,
  className = "",
  ...select
}: SelectProps) {
  const describe = [error && `${id}-error`, ayuda && `${id}-ayuda`].filter(Boolean).join(" ");
  return (
    <div className={className}>
      <label htmlFor={id} className={claseEtiqueta}>
        {etiqueta}
      </label>
      <select
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describe || undefined}
        className={claseCampo(error)}
        {...select}
      >
        <option value="">{vacio}</option>
        {opciones.map((o) => {
          const { valor, texto } = typeof o === "string" ? { valor: o, texto: o } : o;
          return (
            <option key={valor} value={valor}>
              {texto}
            </option>
          );
        })}
      </select>
      {ayuda && !error && (
        <p id={`${id}-ayuda`} className="mt-1.5 text-sm text-tinta/70">
          {ayuda}
        </p>
      )}
      <Error id={id} error={error} />
    </div>
  );
}

/**
 * Diálogo modal nativo: el navegador atrapa el foco, Escape lo cierra y el resto de la página
 * queda inerte. Al cerrarse, el foco vuelve al control que lo abrió.
 */
export function Dialogo({
  abierto,
  onCerrar,
  titulo,
  children,
}: {
  abierto: boolean;
  onCerrar: () => void;
  titulo: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierto && !d.open) d.showModal();
    if (!abierto && d.open) d.close();
  }, [abierto]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={idTitulo}
      onClose={onCerrar}
      onClick={(e) => {
        // Clic en el fondo: cierra.
        if (e.target === ref.current) onCerrar();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-tarjeta bg-papel p-0 text-tinta shadow-elevada backdrop:bg-noche/60"
    >
      <div className="p-6 sm:p-8">
        <h2 id={idTitulo} className="font-display text-xl font-extrabold text-noche">
          {titulo}
        </h2>
        {children}
      </div>
    </dialog>
  );
}

/** Progreso del perfil: barra y lista de pasos con su estado. */
export function Progreso({ pasos }: { pasos: { titulo: string; hecho: boolean }[] }) {
  const hechos = pasos.filter((p) => p.hecho).length;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <p className="font-display font-extrabold text-noche">
          {hechos === pasos.length ? "Perfil completo" : "Completa tu perfil"}
        </p>
        <p className="text-sm text-tinta/80 tabular-nums">
          {hechos} de {pasos.length} pasos
        </p>
      </div>
      <div
        role="progressbar"
        aria-label="Avance del perfil"
        aria-valuemin={0}
        aria-valuemax={pasos.length}
        aria-valuenow={hechos}
        aria-valuetext={`${hechos} de ${pasos.length} pasos`}
        className="mt-2 flex gap-1.5"
      >
        {pasos.map((p) => (
          <span
            key={p.titulo}
            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${p.hecho ? "bg-exito" : "bg-linea"}`}
          />
        ))}
      </div>
      <ol className="mt-4 space-y-2">
        {pasos.map((p, i) => (
          <li key={p.titulo} className="flex items-center gap-3 text-sm">
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${
                p.hecho ? "bg-exito text-papel" : "bg-superficie text-noche ring-1 ring-linea"
              }`}
            >
              {p.hecho ? <Check size={14} aria-hidden="true" /> : i + 1}
            </span>
            <span className={p.hecho ? "text-tinta/80" : "font-semibold text-noche"}>
              {p.titulo}
            </span>
            <span className="sr-only">{p.hecho ? "(hecho)" : "(pendiente)"}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
