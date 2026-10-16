import {
  ArrowRight,
  Factory,
  GraduationCap,
  HardHat,
  House,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

type Sector = { nombre: string; detalle: string; Icon: LucideIcon };

/** Art. 7 del Decreto 48-2026: los cinco sectores convocados al Registro municipal de actores. */
const PRINCIPAL: Sector = {
  nombre: "Poder Popular",
  detalle: "Comunas, consejos comunales, Comités de Tierras Urbanas y mesas técnicas.",
  Icon: UsersRound,
};

const SECTORES: Sector[] = [
  {
    nombre: "Gremios técnicos y profesionales",
    detalle: "Ingenieros, arquitectos, abogados y economistas.",
    Icon: HardHat,
  },
  {
    nombre: "Sector académico y científico",
    detalle: "UCLA, UPTAEB, UNEXPO, UFT, UNEFA, UBV y más.",
    Icon: GraduationCap,
  },
  {
    nombre: "Sector económico y productivo",
    detalle: "Cámaras, PyMEs y COMDIBAR.",
    Icon: Factory,
  },
  {
    nombre: "Ciudadanía en general",
    detalle: "Vecinas y vecinos domiciliados en Iribarren.",
    Icon: House,
  },
];

export function ActorsSection() {
  return (
    <section aria-labelledby="actores-titulo" className="revelar">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <h2
          id="actores-titulo"
          className="font-display text-[clamp(2rem,4.6vw,3.5rem)] leading-[1.04] font-extrabold tracking-[-0.03em] text-noche"
        >
          La ciudad que planificamos <span className="text-rojo">juntos.</span>
        </h2>
        <p className="text-lg leading-relaxed text-tinta lg:pb-2">
          El Registro municipal de actores reúne a los cinco sectores convocados por el Decreto
          48-2026. Inscríbete como organización o participa como vecino.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
        <div className="revelar relative flex flex-col overflow-hidden rounded-tarjeta bg-rojo p-7 text-papel shadow-tarjeta sm:col-span-2 lg:row-span-2">
          <PRINCIPAL.Icon
            aria-hidden="true"
            strokeWidth={1}
            className="pointer-events-none absolute -top-6 -right-6 size-56 text-papel/10"
          />
          <span className="grid size-14 place-items-center rounded-full bg-papel/15">
            <PRINCIPAL.Icon size={28} aria-hidden="true" />
          </span>
          <h3 className="mt-auto pt-16 font-display text-3xl font-extrabold">{PRINCIPAL.nombre}</h3>
          <p className="mt-2 max-w-sm text-lg leading-relaxed text-papel/90">{PRINCIPAL.detalle}</p>
          <Link
            href="/registro"
            className="group mt-6 inline-flex min-h-12 items-center gap-2 self-start rounded-xl bg-papel px-5 font-display font-bold text-rojo transition-transform duration-150 active:scale-[0.97]"
          >
            Inscribe a tu organización
            <ArrowRight
              size={18}
              aria-hidden="true"
              className="transition-transform duration-200 ease-out-expo group-hover:translate-x-1"
            />
          </Link>
        </div>

        {SECTORES.map(({ nombre, detalle, Icon }) => (
          <div
            key={nombre}
            className="revelar flex flex-col rounded-tarjeta bg-papel p-6 shadow-tarjeta transition-[transform,box-shadow] duration-300 ease-out-expo hover:-translate-y-1 hover:shadow-elevada"
          >
            <span className="grid size-11 place-items-center rounded-full bg-naranja/15 text-rojo-oscuro">
              <Icon size={22} aria-hidden="true" />
            </span>
            <h3 className="mt-5 font-display text-lg leading-tight font-extrabold text-noche">
              {nombre}
            </h3>
            <p className="mt-2 leading-relaxed text-tinta">{detalle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
