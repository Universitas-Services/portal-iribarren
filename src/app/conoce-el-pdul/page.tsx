import {
  ArrowRight,
  Ban,
  Database,
  Droplets,
  Landmark,
  Leaf,
  Network,
  Scale,
  UsersRound,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { FaseProcedimiento } from "@/components/conoce/fase-procedimiento";
import { FasesPdul, FasesSkeleton } from "@/components/conoce/fases";
import { Indice, type SeccionIndice } from "@/components/conoce/indice";
import { EncabezadoPagina } from "@/components/layout/encabezado-pagina";
import { getUsuario } from "@/lib/auth/sesion";
import {
  ANTECEDENTES,
  CIFRAS,
  COMPONENTES,
  FASES,
  INSTANCIAS,
  LINEA_TIEMPO,
  LLAMADO,
  MARCO_INTRO,
  OBJETIVOS,
  PROCEDIMIENTO_INTRO,
  QUE_ES,
} from "@/lib/conoce/contenido";
import { BannerCampana } from "@/components/campana/banner-campana";
import { Skeleton } from "@/components/ui/skeleton";
import { getMarcoLegal } from "@/lib/api";

export const metadata: Metadata = {
  title: "Conoce el PDUL",
  description:
    "Qué es el Plan de Desarrollo Urbano Local de Iribarren, sus componentes, antecedentes, marco legal, procedimiento de elaboración y objetivos 2026–2046.",
};

const SECCIONES: SeccionIndice[] = [
  { id: "que-es", label: "¿Qué es un PDUL?" },
  { id: "componentes", label: "Componentes" },
  { id: "antecedentes", label: "Antecedentes" },
  { id: "marco-legal", label: "Marco legal" },
  { id: "procedimiento", label: "Procedimiento" },
  { id: "objetivos", label: "Objetivos" },
  { id: "instancias", label: "Instancias" },
  { id: "alcance", label: "¿Qué no gestiona?" },
];

const ICONO_INSTANCIA: Record<(typeof INSTANCIAS)[number]["clave"], LucideIcon> = {
  alcalde: Landmark,
  concejo: UsersRound,
  comision: ClipboardList,
};

const ICONO_OBJETIVO: Record<(typeof OBJETIVOS)[number]["clave"], LucideIcon> = {
  juridica: Scale,
  policentrica: Network,
  justicia: Droplets,
  resiliencia: Leaf,
  digital: Database,
};

const FUERA_DE_ALCANCE = [
  "Constancia de adecuación de Variables Urbanas Fundamentales",
  "Consulta de Zonificación",
  "Certificado de entrega de obra (habitabilidad)",
  "Certificación Urbanística",
];

function Seccion({ id, titulo, children }: { id: string; titulo: string; children: ReactNode }) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className="revelar scroll-mt-36 rounded-tarjeta bg-papel p-6 shadow-tarjeta sm:p-10 lg:scroll-mt-28"
    >
      <h2
        id={`${id}-titulo`}
        className="font-display text-2xl font-extrabold text-noche sm:text-3xl"
      >
        {titulo}
      </h2>
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
        bajada="El futuro urbano de Barquisimeto se planifica hoy. Conoce el Plan de Desarrollo Urbano Local (PDUL) de Iribarren para el período 2026–2046: qué es, cuáles son sus antecedentes, cómo se formula y qué propone para orientar el crecimiento de la ciudad, organizar los usos del suelo y mejorar la calidad de vida de sus habitantes."
      />

      <div className="relative z-10 mx-auto -mt-16 grid max-w-7xl grid-cols-[minmax(0,1fr)] gap-8 px-4 pb-24 sm:px-6 lg:-mt-20 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:px-8">
        <aside className="sticky top-16 z-20 -mx-4 bg-superficie/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-28 lg:mx-0 lg:mt-24 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Indice secciones={SECCIONES} />
        </aside>

        <div className="min-w-0 space-y-8">
          <Seccion id="que-es" titulo="¿Qué es un PDUL y por qué es crucial para Barquisimeto?">
            <div className="prosa">
              {QUE_ES.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {CIFRAS.map(([n, texto]) => (
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

          <Seccion id="componentes" titulo="Los tres componentes del PDUL">
            <ol className="grid gap-4 lg:grid-cols-3">
              {COMPONENTES.map((c, i) => (
                <li key={c.titulo} className="flex flex-col rounded-2xl border border-linea p-5">
                  <span
                    aria-hidden="true"
                    className="font-display text-5xl leading-none font-extrabold text-rojo/20"
                  >
                    {i + 1}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-extrabold text-noche">
                    {c.titulo}
                  </h3>
                  <p className="mt-2 leading-relaxed text-tinta">{c.texto}</p>
                  {c.lista && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {c.lista.map((l) => (
                        <li
                          key={l}
                          className="rounded-full bg-superficie px-3 py-1 text-sm font-semibold text-noche"
                        >
                          {l}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </Seccion>

          <Seccion id="antecedentes" titulo="Antecedentes urbanos: ¿por qué un nuevo PDUL ahora?">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="prosa">
                {ANTECEDENTES.map((p) => (
                  <p key={p.slice(0, 24)}>{p}</p>
                ))}
              </div>
              <div>
                <ol className="relative space-y-5 border-l-2 border-linea pl-6">
                  {LINEA_TIEMPO.map(({ fecha, texto }) => (
                    <li key={fecha} className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute top-1.5 -left-[2.05rem] size-3.5 rounded-full bg-rojo ring-4 ring-papel"
                      />
                      <p className="font-display font-extrabold text-noche">{fecha}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-tinta">{texto}</p>
                    </li>
                  ))}
                </ol>
                <p className="mt-6 rounded-2xl bg-noche p-5 text-papel">
                  <span className="block font-display text-3xl font-extrabold">27.146 ha</span>
                  <span className="mt-1 block text-sm text-papel/80">
                    de la poligonal urbana original de 2003, ya superadas por la ciudad
                  </span>
                </p>
              </div>
            </div>
          </Seccion>

          <Seccion id="marco-legal" titulo="Naturaleza jurídica y marco legal del PDUL">
            <div className="prosa">
              {MARCO_INTRO.map((t) => (
                <p key={t}>{t}</p>
              ))}
            </div>
            <Suspense fallback={<Skeleton className="mt-6 h-64 rounded-2xl" />}>
              <ListaMarcoLegal />
            </Suspense>
          </Seccion>

          <Seccion id="procedimiento" titulo="Procedimiento de elaboración">
            <p className="prosa">{PROCEDIMIENTO_INTRO}</p>
            <ol className="mt-6 space-y-4">
              {FASES.map((f, i) => (
                <FaseProcedimiento
                  key={f.numero}
                  numero={f.numero}
                  nombre={f.nombre}
                  duracion={f.duracion}
                  abiertaAlInicio={i === 0}
                >
                  <p className="font-display text-sm font-bold text-noche">¿En qué consiste?</p>
                  <p className="mt-1 leading-relaxed text-tinta">{f.consiste}</p>
                  <p className="mt-5 font-display text-sm font-bold text-noche">
                    Hitos y entregables clave
                  </p>
                  <ul className="mt-2 space-y-3">
                    {f.hitos.map((h) => (
                      <li key={h.titulo} className="flex gap-3">
                        <span
                          aria-hidden="true"
                          className="mt-2.5 size-1.5 shrink-0 rounded-full bg-rojo"
                        />
                        <div className="min-w-0 leading-relaxed text-tinta">
                          <strong className="font-semibold text-noche">{h.titulo}</strong>
                          {h.texto && <>: {h.texto}</>}
                          {h.subhitos && (
                            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                              {h.subhitos.map((s) => (
                                <div key={s.titulo} className="rounded-2xl bg-superficie p-4">
                                  <p className="font-display font-extrabold text-rojo">
                                    {s.titulo}
                                  </p>
                                  <p className="mt-1 text-sm leading-relaxed">{s.texto}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </FaseProcedimiento>
              ))}
            </ol>

            <div className="mt-8 rounded-2xl bg-superficie p-5 sm:p-6">
              <h3 className="font-display text-lg font-extrabold text-noche">
                ¿En qué va el proceso?
              </h3>
              <p className="mt-1 mb-5 text-sm text-tinta">
                Los hitos del proceso y el punto en que se encuentra hoy.
              </p>
              <Suspense fallback={<FasesSkeleton compacto />}>
                <FasesPdul compacto />
              </Suspense>
            </div>
          </Seccion>

          <Seccion id="objetivos" titulo="Objetivos estratégicos del PDUL Iribarren (2026–2046)">
            <ol className="grid gap-4 sm:grid-cols-2">
              {OBJETIVOS.map(({ clave, titulo, texto }, i) => {
                const Icon = ICONO_OBJETIVO[clave];
                return (
                  <li
                    key={clave}
                    className={`rounded-2xl border border-linea p-5 ${i === OBJETIVOS.length - 1 ? "sm:col-span-2" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-naranja/15 text-rojo-oscuro">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span className="font-display text-sm font-bold text-tinta/70">
                        Objetivo {i + 1}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-lg font-extrabold text-noche">
                      {titulo}
                    </h3>
                    <p className="mt-1.5 leading-relaxed text-tinta">{texto}</p>
                  </li>
                );
              })}
            </ol>
          </Seccion>

          <Seccion id="instancias" titulo="Instancias y aspectos organizativos">
            <p className="prosa">
              Las competencias del Alcalde, del Concejo Municipal y de la Comisión Técnica
              Organizadora en la elaboración del PDUL, según el artículo 2 del Decreto N° 48-2026.
            </p>
            <ul className="mt-6 grid gap-4 lg:grid-cols-3">
              {INSTANCIAS.map(({ clave, titulo, competencias }) => {
                const Icon = ICONO_INSTANCIA[clave];
                return (
                  <li key={clave} className="flex flex-col rounded-2xl border border-linea p-5">
                    <span className="grid size-11 place-items-center rounded-full bg-naranja/15 text-rojo-oscuro">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-lg font-extrabold text-noche">
                      {titulo}
                    </h3>
                    {competencias.length ? (
                      <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed text-tinta">
                        {competencias.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 rounded-xl border border-dashed border-linea bg-superficie px-3 py-2 text-sm text-tinta/75">
                        Contenido en espera: competencias según el artículo 2 del Decreto N°
                        48-2026.
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </Seccion>

          <BannerCampana />

          <Seccion id="alcance" titulo="¿Qué no gestiona este portal?">
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
              {LLAMADO.titulo}
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-papel/90">{LLAMADO.texto}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Suspense fallback={<BotonLlamado href="/registro" texto="Regístrate y participa" />}>
                <LlamadoSegunSesion />
              </Suspense>
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

function BotonLlamado({ href, texto }: { href: string; texto: string }) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-papel px-5 font-display font-bold text-rojo transition-transform duration-150 active:scale-[0.97]"
    >
      {texto}
      <ArrowRight size={18} aria-hidden="true" />
    </Link>
  );
}

/** Con sesión, el botón va directo a participar; sin sesión, al registro (módulo de identidad). */
async function LlamadoSegunSesion() {
  const u = await getUsuario();
  return u ? (
    <BotonLlamado href="/participa" texto="Participa en el PDUL" />
  ) : (
    <BotonLlamado href="/registro" texto="Regístrate y participa" />
  );
}

/** Ítems del Marco legal que la alcaldía tiene activos en el admin, en su orden. */
async function ListaMarcoLegal() {
  const items = await getMarcoLegal();
  return (
    <ol className="mt-6">
      {items.map(({ titulo, descripcion, boton }, i) => (
        <li key={`${i}-${titulo}`} className="relative pb-4 pl-14 last:pb-0">
          {i < items.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute top-12 bottom-0 left-[1.2rem] w-0.5 bg-gradient-to-b from-rojo to-rojo/20"
            />
          )}
          <span
            aria-hidden="true"
            className="absolute top-0 left-0 grid size-10 place-items-center rounded-full bg-rojo font-display font-extrabold text-papel"
          >
            {i + 1}
          </span>
          <div className="rounded-2xl border border-linea p-5">
            <h3 className="font-display text-lg font-extrabold text-noche">{titulo}</h3>
            <p className="mt-1.5 leading-relaxed whitespace-pre-line text-tinta">{descripcion}</p>
            {boton && (
              <Link
                href={boton.href}
                className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-rojo/10 px-4 font-display text-sm font-bold text-rojo transition-colors hover:bg-rojo/15"
              >
                {boton.texto}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
