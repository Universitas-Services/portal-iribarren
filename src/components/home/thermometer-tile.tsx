import { Check } from "lucide-react";
import { getProcess } from "@/lib/api";
import { ETIQUETA_FASE } from "@/lib/proceso";
import { Tile } from "./tile";

type Estado = "cumplida" | "actual" | "proxima";

/** Termómetro del proceso: las 7 fases siempre presentes; la línea se llena hasta la actual. */
export async function ThermometerTile({ className = "" }: { className?: string }) {
  const { fases, faseActual, ejemplo } = await getProcess();
  const actual = fases[faseActual];
  const avance = fases.length > 1 ? faseActual / (fases.length - 1) : 0;
  const estadoDe = (i: number): Estado =>
    i < faseActual ? "cumplida" : i === faseActual ? "actual" : "proxima";

  return (
    <Tile aria-labelledby="proceso-titulo" className={`bg-papel p-6 sm:p-8 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="max-w-md">
          <h2 id="proceso-titulo" className="font-display text-2xl font-extrabold text-noche">
            ¿En qué etapa está el PDUL?
          </h2>
          {actual && (
            <p className="mt-2 leading-relaxed text-tinta">
              <span className="font-display font-bold text-noche">{actual.nombre}:</span>{" "}
              {actual.descripcion}
            </p>
          )}
        </div>
        <p className="font-display leading-none font-extrabold text-rojo" aria-hidden="true">
          <span className="text-6xl tracking-[-0.05em] tabular-nums">{faseActual + 1}</span>
          <span className="ml-1 text-2xl text-tinta/55 tabular-nums">/{fases.length}</span>
        </p>
      </div>
      <p className="sr-only">
        Fase {faseActual + 1} de {fases.length}
      </p>

      <ol className="relative mt-8 grid gap-4 md:grid-cols-7 md:gap-2">
        {/* Rieles: vertical en móvil, horizontal desde md. */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[1.0625rem] w-1 rounded-full bg-linea md:top-[1.0625rem] md:right-[calc(100%/14)] md:bottom-auto md:left-[calc(100%/14)] md:h-1 md:w-auto"
        >
          <div
            className="llenar hidden h-full origin-left rounded-full bg-rojo md:block"
            style={{ width: `${avance * 100}%` }}
          />
          <div
            className="h-full w-full origin-top rounded-full bg-rojo md:hidden"
            style={{ height: `${avance * 100}%` }}
          />
        </div>

        {fases.map((fase, i) => {
          const estado = estadoDe(i);
          return (
            <li
              key={fase.id}
              aria-current={estado === "actual" ? "step" : undefined}
              className="relative flex items-center gap-4 md:flex-col md:items-center md:gap-3 md:text-center"
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-bold tabular-nums ${
                  estado === "cumplida"
                    ? "bg-rojo text-papel"
                    : estado === "actual"
                      ? "pulso border-4 border-rojo bg-papel text-rojo"
                      : "border-2 border-linea bg-papel text-tinta/70"
                }`}
              >
                {estado === "cumplida" ? (
                  <Check size={18} strokeWidth={3} aria-hidden="true" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={`font-display text-sm leading-snug ${
                  estado === "actual"
                    ? "font-extrabold text-rojo"
                    : estado === "cumplida"
                      ? "font-bold text-noche"
                      : "font-semibold text-tinta/70"
                }`}
              >
                {fase.nombre}
                <span
                  className={`mt-0.5 block font-sans text-xs font-normal ${
                    estado === "actual" ? "text-rojo" : "text-tinta/75"
                  }`}
                >
                  <span className="sr-only">: </span>
                  {ETIQUETA_FASE[fase.estado]}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      {ejemplo && (
        <p className="mt-6 text-sm text-tinta/70">
          Fase actual de ejemplo, pendiente de confirmar.
        </p>
      )}
    </Tile>
  );
}
