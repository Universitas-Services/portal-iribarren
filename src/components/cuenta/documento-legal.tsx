import { FileClock } from "lucide-react";
import Link from "next/link";
import { MarcoCuenta } from "./marco-cuenta";

/**
 * Términos de uso y política de datos. Los borradores los prepara el equipo de documentación
 * para revisión legal; mientras tanto la página explica qué contendrá y no inventa el texto.
 */
export function DocumentoLegal({ titulo, contenido }: { titulo: string; contenido: string[] }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: titulo }]}
      titulo={titulo}
      ancho="max-w-2xl"
    >
      <p className="flex items-start gap-3 rounded-2xl bg-amarillo/15 p-4 text-sm leading-relaxed text-noche ring-1 ring-amarillo/60 ring-inset">
        <FileClock size={20} aria-hidden="true" className="mt-0.5 shrink-0" />
        El texto definitivo está en preparación por el equipo de documentación y pasará por revisión
        legal antes de publicarse.
      </p>
      <h2 className="mt-8 font-display text-lg font-extrabold text-noche">Qué incluirá</h2>
      <ul className="prosa mt-3">
        {contenido.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>
      <Link href="/registro" className="mt-8 inline-block font-semibold text-rojo hover:underline">
        Volver al registro
      </Link>
    </MarcoCuenta>
  );
}
