import { ClipboardList, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";

export type PestanaCuenta = "perfil" | "seguridad" | "participaciones";

const PESTANAS = [
  { clave: "perfil", href: "/mi-cuenta", label: "Perfil", corto: "Perfil", Icon: UserRound },
  {
    clave: "seguridad",
    href: "/mi-cuenta/seguridad",
    label: "Seguridad",
    corto: "Seguridad",
    Icon: ShieldCheck,
  },
  {
    clave: "participaciones",
    href: "/mi-cuenta/participaciones",
    label: "Mis participaciones",
    // A 375 px las tres pestañas caben con la etiqueta corta y sin iconos.
    corto: "Participaciones",
    Icon: ClipboardList,
  },
] as const;

/** Secciones de «Mi cuenta». Va sobre la tarjeta de contenido, en la banda oscura. */
export function PestanasCuenta({ activa }: { activa: PestanaCuenta }) {
  return (
    <nav aria-label="Secciones de mi cuenta" className="mb-4">
      <ul className="flex [scrollbar-width:none] gap-1 overflow-x-auto rounded-2xl bg-papel p-1.5 shadow-tarjeta [&::-webkit-scrollbar]:hidden">
        {PESTANAS.map(({ clave, href, label, corto, Icon }) => {
          const actual = clave === activa;
          return (
            <li key={clave} className="flex-1 shrink-0">
              <Link
                href={href}
                aria-current={actual ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-2.5 font-display text-sm font-bold whitespace-nowrap transition-colors sm:px-3 ${
                  actual ? "bg-noche text-papel" : "text-noche hover:bg-superficie"
                }`}
              >
                <Icon
                  size={16}
                  aria-hidden="true"
                  className={`hidden sm:block ${actual ? "text-amarillo" : "text-rojo"}`}
                />
                {corto === label ? (
                  label
                ) : (
                  <>
                    <span aria-hidden="true" className="sm:hidden">
                      {corto}
                    </span>
                    <span className="sr-only sm:not-sr-only">{label}</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
