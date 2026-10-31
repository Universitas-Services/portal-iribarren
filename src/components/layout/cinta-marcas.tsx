import Image from "next/image";

/**
 * PDUL YA, el alcalde, los lemas de la gestión y la Alcaldía (archivos del cliente, 22-10-2026).
 * Cada uno tiene su versión para el modo oscuro en /brand/oscuro (derivada del original,
 * aprobada el 30-10-2026; se reemplaza si el diseñador entrega la oficial).
 */
const MARCAS = [
  { src: "/brand/pdul-ya-horizontal-divisor.png", alt: "PDUL YA", ancho: 1200, alto: 402 },
  { src: "/brand/yanys-aguero.png", alt: "Yanys Agüero, Alcalde", ancho: 512, alto: 240 },
  {
    src: "/brand/iribarren-para-la-vida.png",
    alt: "Iribarren para la Vida",
    ancho: 745,
    alto: 240,
  },
  { src: "/brand/gente-que-resuelve.png", alt: "Gente que Resuelve", ancho: 330, alto: 240 },
  {
    src: "/brand/alcaldia-iribarren.png",
    alt: "Alcaldía Bolivariana de Iribarren",
    ancho: 755,
    alto: 240,
  },
];

/**
 * Cinta de logos del pie: repartidos a lo ancho de la pantalla y en movimiento continuo de
 * derecha a izquierda, siempre activa. Solo se queda quieta con «reducir movimiento» del sistema.
 */
export function CintaMarcas() {
  return (
    <div className="cinta-marcas-marco overflow-hidden">
      <div className="cinta-marcas flex w-max">
        {[0, 1].map((copia) => (
          <ul
            key={copia}
            aria-label={copia === 0 ? "PDUL YA y gestión municipal" : undefined}
            aria-hidden={copia === 1 ? true : undefined}
            className="flex min-w-screen shrink-0 items-center justify-around gap-14 px-6 sm:gap-20 sm:px-10"
          >
            {MARCAS.map((m) => (
              <li key={m.src} className="shrink-0">
                <Image
                  src={m.src}
                  alt={copia === 0 ? m.alt : ""}
                  width={m.ancho}
                  height={m.alto}
                  className="h-12 w-auto sm:h-16 oscuro:hidden"
                />
                <Image
                  src={m.src.replace("/brand/", "/brand/oscuro/")}
                  alt={copia === 0 ? m.alt : ""}
                  width={m.ancho}
                  height={m.alto}
                  loading="lazy"
                  className="hidden h-12 w-auto sm:h-16 oscuro:block"
                />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
