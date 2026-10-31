import { Map, ShieldCheck, UsersRound, type LucideIcon } from "lucide-react";

const VALORES: { nombre: string; detalle: string; Icon: LucideIcon; circulo: string }[] = [
  {
    nombre: "Ciudadanía",
    detalle: "Participación activa y corresponsable.",
    Icon: UsersRound,
    circulo: "bg-rojo text-papel",
  },
  {
    nombre: "Planificación",
    detalle: "Orden, desarrollo y sostenibilidad.",
    Icon: Map,
    circulo: "bg-naranja text-noche",
  },
  {
    nombre: "Transparencia",
    detalle: "Gestión abierta y confiable.",
    Icon: ShieldCheck,
    circulo: "bg-noche text-papel",
  },
];

/** Valores de marca de la guía. */
export function ValuesSection() {
  return (
    <section aria-labelledby="valores-titulo" className="revelar">
      <h2 id="valores-titulo" className="sr-only">
        Nuestros valores
      </h2>
      <ul className="grid gap-4 rounded-tarjeta bg-tarjeta p-6 shadow-tarjeta sm:grid-cols-3 sm:p-8">
        {VALORES.map(({ nombre, detalle, Icon, circulo }) => (
          <li key={nombre} className="flex items-center gap-4">
            <span className={`grid size-14 shrink-0 place-items-center rounded-full ${circulo}`}>
              <Icon size={26} aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-lg font-extrabold text-fuerte">
                {nombre}
              </span>
              <span className="text-tinta">{detalle}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
