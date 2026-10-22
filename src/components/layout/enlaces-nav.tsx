"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "./nav-links";

/** ¿El enlace corresponde a la página actual? «Inicio» solo en «/»; los demás, también en sus subpáginas. */
export const esActual = (href: string, ruta: string) =>
  href === "/" ? ruta === "/" : ruta === href || ruta.startsWith(`${href}/`);

/** Menú de escritorio: la página actual va en una pastilla morada (campaña). */
export function EnlacesNav() {
  const ruta = usePathname();
  return (
    <ul className="flex items-center gap-0.5 xl:gap-1">
      {NAV_LINKS.map((l) => (
        <li key={l.href} className="shrink-0">
          <Link
            href={l.href}
            aria-current={esActual(l.href, ruta) ? "page" : undefined}
            className="rounded-full px-2.5 py-2 font-display text-sm font-semibold whitespace-nowrap text-tinta transition-colors duration-150 hover:text-rojo aria-[current=page]:bg-morado-activo aria-[current=page]:text-papel xl:px-3.5 xl:text-[0.9375rem]"
          >
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
