import { Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { getProcess } from "@/lib/api";
import { ETIQUETA_FASE } from "@/lib/proceso";

/**
 * Los 7 hitos del proceso en línea de tiempo vertical, con el actual marcado. En versión
 * compacta (recuadro «¿En qué va el proceso?» de Conoce) se omiten las descripciones.
 */
export async function FasesPdul({ compacto = false }: { compacto?: boolean }) {
  const { fases, faseActual, ejemplo } = await getProcess();
  return (
    <>
      <ol className="space-y-1">
        {fases.map((f, i) => {
          const hecha = i < faseActual;
          const enCurso = i === faseActual;
          return (
            <li
              key={f.id}
              className={`relative flex gap-4 last:pb-0 ${compacto ? "pb-3" : "pb-6"}`}
            >
              {i < fases.length - 1 && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-[1.1rem] w-0.5 ${compacto ? "top-9" : "top-10"} ${hecha ? "bg-rojo" : "bg-linea"}`}
                />
              )}
              <span
                aria-hidden="true"
                className={`relative grid size-9 shrink-0 place-items-center rounded-full font-display text-sm font-extrabold ${
                  hecha
                    ? "bg-rojo text-papel"
                    : enCurso
                      ? "pulso border-4 border-rojo bg-papel text-rojo"
                      : "border-2 border-linea bg-papel text-tinta/60"
                }`}
              >
                {hecha ? <Check size={16} /> : i + 1}
              </span>
              <div className="pt-1">
                <p className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-display font-extrabold ${compacto ? "text-base" : "text-lg"} ${enCurso ? "text-rojo" : "text-noche"}`}
                  >
                    {f.nombre}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-display text-xs font-bold ${
                      enCurso
                        ? "bg-rojo text-papel"
                        : hecha
                          ? "bg-rojo/10 text-rojo"
                          : "bg-superficie text-tinta/80"
                    }`}
                  >
                    <span className="sr-only">Estado: </span>
                    {ETIQUETA_FASE[f.estado]}
                  </span>
                </p>
                {!compacto && <p className="mt-1 leading-relaxed text-tinta">{f.descripcion}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      {ejemplo && (
        <p className="mt-6 text-sm text-tinta/75">
          Fase actual de ejemplo, pendiente de confirmar.
        </p>
      )}
    </>
  );
}

export function FasesSkeleton({ compacto = false }: { compacto?: boolean }) {
  return (
    <div aria-hidden="true" className={compacto ? "space-y-3" : "space-y-6"}>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48" />
            {!compacto && <Skeleton className="mt-2 h-4 w-4/5" />}
          </div>
        </div>
      ))}
    </div>
  );
}
