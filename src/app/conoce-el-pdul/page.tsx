import {
  ArrowRight,
  Ban,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  Map,
  Scale,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { FasesPdul, FasesSkeleton } from "@/components/conoce/fases";
import { Indice, type SeccionIndice } from "@/components/conoce/indice";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";

export const metadata: Metadata = {
  title: "Conoce el PDUL",
  description:
    "Qué es el Plan de Desarrollo Urbano Local de Iribarren, sus antecedentes, objetivos, fases y marco legal.",
};

const SECCIONES: SeccionIndice[] = [
  { id: "que-es", label: "¿Qué es el PDUL?" },
  { id: "antecedentes", label: "Antecedentes" },
  { id: "objetivos", label: "Objetivos" },
  { id: "fases", label: "Las 7 fases" },
  { id: "marco-legal", label: "Marco legal" },
  { id: "alcance", label: "Qué no gestiona" },
];

/** Los compromisos del Decreto 48-2026, según la Propuesta de Gestión Ciudadana v3. */
const OBJETIVOS: { titulo: string; texto: string; Icon: LucideIcon }[] = [
  {
    titulo: "Construcción participativa",
    texto:
      "El plan no se redactará a puerta cerrada: saldrá de las oficinas para debatirse en la calle con todos los sectores.",
    Icon: UsersRound,
  },
  {
    titulo: "Rigor técnico y seguridad jurídica",
    texto:
      "Estudios de suelo, riesgo sísmico e hídrico y reglas claras como motor para reactivar la inversión privada.",
    Icon: GraduationCap,
  },
  {
    titulo: "Justicia social y equilibrio territorial",
    texto:
      "Equilibrar el desarrollo del centro con la atención a las parroquias periféricas: una justicia social que no se negocia, sino que se formaliza.",
    Icon: Map,
  },
  {
    titulo: "Cero papel y trazabilidad",
    texto:
      "Recepción digital de propuestas con folio, acuse y respuesta motivada, y una bitácora que no se puede modificar.",
    Icon: ShieldCheck,
  },
];

const MARCO: {
  nombre: string;
  texto: string;
  Icon: LucideIcon;
  enlace?: { href: string; label: string };
}[] = [
  {
    nombre: "Decreto 48-2026",
    texto:
      "Decreto del alcalde que activa la formulación del nuevo PDUL y crea el Registro municipal de actores.",
    Icon: Landmark,
    enlace: { href: "/documentos/decreto-48-2026", label: "Ver en el repositorio" },
  },
  {
    nombre: "Ordenanza del PDUL de Barquisimeto (2003)",
    texto:
      "Promulgada el 28 de agosto de 2003 en Gaceta Municipal N° 1.803 Extraordinario, con vigencia hasta 2016 según su Artículo 150.",
    Icon: FileText,
  },
  {
    nombre: "Sentencia N° 928/2018 de la Sala Constitucional del TSJ",
    texto:
      "Del 17 de diciembre de 2018: acordó la aplicación ultractiva y provisional del plan de 2003 y la obligación de sancionar una nueva Ordenanza.",
    Icon: Scale,
    enlace: { href: "/noticias/marco-jurisprudencial-pdul", label: "Leer el análisis" },
  },
  {
    nombre: "Ley Orgánica de Ordenación Urbanística",
    texto:
      "Ley nacional que regula los planes de desarrollo urbano local y la participación de la comunidad en su elaboración.",
    Icon: Scale,
  },
  {
    nombre: "Ordenanza de Gobierno Electrónico",
    texto:
      "Norma municipal que respalda la atención y la participación de la ciudadanía a través de medios digitales.",
    Icon: FileText,
  },
  {
    nombre: "Lineamientos de la OAC (Contraloría General de la República)",
    texto:
      "Parámetros de atención al ciudadano: acuse de recibo, respuesta motivada y conservación de la memoria del proceso.",
    Icon: ShieldCheck,
  },
];

const ANTECEDENTES = [
  {
    fecha: "28 de agosto de 2003",
    texto:
      "Se promulga la Ordenanza sobre el PDUL de la Ciudad de Barquisimeto (Gaceta Municipal N° 1.803 Extraordinario).",
  },
  {
    fecha: "2016",
    texto: "Vence la vigencia del plan, fijada hasta ese año por su Artículo 150.",
  },
  {
    fecha: "17 de diciembre de 2018",
    texto:
      "La Sala Constitucional del TSJ (Sentencia N° 928) acuerda cautelarmente la aplicación ultractiva del plan vencido, como medida provisoria.",
  },
  {
    fecha: "2021",
    texto:
      "La Sentencia N° 0171/2021 ratifica que la ultractividad no exime al Municipio de formular y sancionar una nueva Ordenanza.",
  },
  {
    fecha: "14 de septiembre de 2026",
    texto:
      "En el 474.º aniversario de Barquisimeto, el alcalde Yanys Agüero presenta el Decreto N.º 48-2026, que inicia el nuevo PDUL a 20 años (hasta 2046).",
  },
];

const FUERA_DE_ALCANCE = [
  "Licencias de construcción",
  "Certificaciones de zonificación",
  "Variables urbanas fundamentales",
  "Permisos de edificación",
];

function Seccion({
  id,
  titulo,
  children,
  provisional = false,
}: {
  id: string;
  titulo: string;
  children: ReactNode;
  provisional?: boolean;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className="revelar scroll-mt-36 rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-10 lg:scroll-mt-28"
    >
      <div className="flex flex-wrap items-center gap-3">
        <h2
          id={`${id}-titulo`}
          className="font-display text-2xl font-extrabold text-noche sm:text-3xl"
        >
          {titulo}
        </h2>
        {provisional && (
          <span className="rounded-full bg-amarillo/25 px-2.5 py-0.5 font-display text-xs font-bold text-noche">
            Texto provisional
          </span>
        )}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function ConocePage() {
  return (
    <>
      <EncabezadoPagina
        migas={[{ href: "/", label: "Inicio" }, { label: "Conoce el PDUL" }]}
        titulo="Conoce el PDUL"
        bajada="El Plan de Desarrollo Urbano Local es la hoja de ruta para el crecimiento de la ciudad. Aquí te contamos qué es, de dónde viene, qué busca y cómo puedes participar."
      />

      <div className="relative z-10 mx-auto -mt-16 grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-24 sm:px-6 lg:-mt-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:px-8">
        <aside className="sticky top-16 z-20 -mx-4 bg-superficie/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-28 lg:mx-0 lg:mt-24 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Indice secciones={SECCIONES} />
        </aside>

        <div className="min-w-0 space-y-8">
          <Seccion id="que-es" titulo="¿Qué es el PDUL?">
            <div className="prosa">
              <p>
                Es el plan que define cómo debe crecer el municipio Iribarren: dónde se puede
                construir, qué servicios y espacios públicos hacen falta y cómo se mueve la ciudad.
                Una vez aprobado por la Cámara Municipal, se convierte en la norma que orienta el
                desarrollo urbano de Barquisimeto.
              </p>
              <p>
                Este portal es su ventana a la ciudadanía: aquí se publican los avances y los
                documentos, y se reciben opiniones y propuestas con un folio y una respuesta. La
                consulta pública formal durará 60 días, pero las propuestas se reciben desde ahora.
              </p>
            </div>
            <dl className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ["10", "parroquias en el diagnóstico"],
                ["7", "fases hasta su vigencia"],
                ["20", "años de horizonte, hasta 2046"],
              ].map(([n, texto]) => (
                <div key={texto} className="rounded-2xl bg-superficie p-5">
                  <dt className="sr-only">{texto}</dt>
                  <dd>
                    <span className="block font-display text-4xl font-extrabold text-rojo">
                      {n}
                    </span>
                    <span className="mt-1 block text-sm text-tinta">{texto}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Seccion>

          <Seccion id="antecedentes" titulo="Antecedentes">
            <ol className="relative space-y-6 border-l-2 border-linea pl-6">
              {ANTECEDENTES.map(({ fecha, texto }) => (
                <li key={fecha} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute top-1.5 -left-[2.05rem] size-3.5 rounded-full bg-rojo ring-4 ring-papel"
                  />
                  <p className="font-display font-extrabold text-noche">{fecha}</p>
                  <p className="mt-1 leading-relaxed text-tinta">{texto}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-sm text-tinta/75">
              Iribarren acumula una deuda de 8 años en planificación urbana: el plan venció en 2016
              y su prórroga judicial culminó en 2018.
            </p>
          </Seccion>

          <Seccion id="objetivos" titulo="Objetivos">
            <ul className="grid gap-4 sm:grid-cols-2">
              {OBJETIVOS.map(({ titulo, texto, Icon }) => (
                <li key={titulo} className="rounded-2xl border border-linea p-5">
                  <span className="grid size-11 place-items-center rounded-full bg-naranja/15 text-rojo-oscuro">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-lg font-extrabold text-noche">{titulo}</h3>
                  <p className="mt-1.5 leading-relaxed text-tinta">{texto}</p>
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion id="fases" titulo="Las 7 fases">
            <Suspense fallback={<FasesSkeleton />}>
              <FasesPdul />
            </Suspense>
          </Seccion>

          <Seccion id="marco-legal" titulo="Marco legal">
            <ul className="space-y-4">
              {MARCO.map(({ nombre, texto, Icon, enlace }) => (
                <li
                  key={nombre}
                  className="flex flex-col gap-4 rounded-2xl border border-linea p-5 sm:flex-row sm:items-center"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-noche text-papel">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-extrabold text-noche">{nombre}</h3>
                    <p className="mt-1 leading-relaxed text-tinta">{texto}</p>
                  </div>
                  {enlace ? (
                    <Link
                      href={enlace.href}
                      className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl bg-rojo/10 px-4 font-display text-sm font-bold text-rojo transition-colors hover:bg-rojo/15 sm:self-center"
                    >
                      {enlace.label}
                      <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  ) : (
                    <span className="inline-flex shrink-0 items-center gap-1.5 self-start text-xs text-tinta/70 sm:self-center">
                      <ExternalLink size={14} aria-hidden="true" />
                      Enlace oficial pendiente
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Seccion>

          <Seccion id="alcance" titulo="Qué no gestiona este portal">
            <p className="prosa">
              El portal PDUL YA es exclusivo del Plan de Desarrollo Urbano Local. Estos trámites
              siguen en la Dirección de Planificación y Control Urbano (DPCU) de la Alcaldía:
            </p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {FUERA_DE_ALCANCE.map((t) => (
                <li key={t} className="flex items-center gap-3 rounded-xl bg-superficie px-4 py-3">
                  <Ban size={18} aria-hidden="true" className="shrink-0 text-rojo" />
                  <span className="text-noche">{t}</span>
                </li>
              ))}
            </ul>
          </Seccion>

          <section
            aria-labelledby="participa-titulo"
            className="revelar relative overflow-hidden rounded-tarjeta bg-rojo p-6 text-papel shadow-tarjeta sm:p-10"
          >
            <h2 id="participa-titulo" className="font-display text-2xl font-extrabold sm:text-3xl">
              El plan se construye con tu voz
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-papel/90">
              Envía una opinión o una propuesta formal, o revisa los documentos que sustentan cada
              fase.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/participa"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-papel px-5 font-display font-bold text-rojo transition-transform duration-150 active:scale-[0.97]"
              >
                Participar
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href="/documentos"
                className="inline-flex min-h-12 items-center justify-center rounded-xl px-5 font-display font-bold text-papel ring-2 ring-papel/60 transition-colors ring-inset hover:bg-papel/10"
              >
                Ver documentos
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
