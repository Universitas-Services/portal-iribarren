"use client";

import { RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/** Estado de error compartido por todas las páginas (Next 16: `retry` vuelve a pedir los datos). */
export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : undefined;

  return (
    <section aria-labelledby="error-titulo" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <div className="rounded-tarjeta bg-papel p-8 shadow-tarjeta sm:p-12">
        <h1 id="error-titulo" className="font-display text-3xl font-extrabold text-noche">
          Algo no cargó como debía
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-tinta">
          Tuvimos un problema al mostrar esta página. Vuelve a intentarlo; si sigue fallando, espera
          unos minutos.
        </p>
        {digest && (
          <p className="mt-3 text-sm text-tinta/70">
            Código de referencia: <span className="font-mono">{digest}</span>
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => retry()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-rojo px-6 font-display font-bold text-papel transition-[background-color,transform] duration-150 hover:bg-rojo-oscuro active:scale-[0.97]"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Reintentar
          </button>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-noche px-6 font-display font-bold text-noche transition-[background-color,color] duration-150 hover:bg-noche hover:text-papel"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
