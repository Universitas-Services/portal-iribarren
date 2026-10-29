import { ArrowLeft, ArrowRight, Building2, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormRegistroNatural, FormRegistroOrganizacion } from "@/components/cuenta/formularios";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { getTextoLegal } from "@/lib/api";
import { soloInvitados } from "@/lib/auth/sesion";

export const metadata: Metadata = {
  title: "Regístrate",
  description: "Crea tu cuenta para opinar y enviar propuestas al PDUL de Iribarren.",
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const OPCIONES = [
  {
    tipo: "natural",
    titulo: "Persona natural",
    texto:
      "Vecinas y vecinos de Iribarren que quieren opinar y enviar propuestas a título personal.",
    Icon: UserRound,
  },
  {
    tipo: "organizacion",
    titulo: "Organización",
    texto:
      "Consejos comunales, comunas, gremios, universidades, cámaras, empresas y fundaciones que participan como entidad.",
    Icon: Building2,
  },
] as const;

export default function RegistroPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Regístrate" }]}
      titulo="Crea tu cuenta"
      bajada="Con tu cuenta puedes opinar sobre las noticias, enviar propuestas formales y seguir la respuesta de cada una."
      ancho="max-w-2xl"
    >
      <Suspense fallback={<FormularioSkeleton campos={5} />}>
        <Paso searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

/** Los textos vigentes, para leerlos en el modal del registro. */
async function textosRegistro() {
  const [TERMINOS, POLITICA_DATOS] = await Promise.all([
    getTextoLegal("TERMINOS"),
    getTextoLegal("POLITICA_DATOS"),
  ]);
  return { TERMINOS, POLITICA_DATOS };
}

async function Paso({ searchParams }: { searchParams: SearchParams }) {
  await soloInvitados();
  const tipo = (await searchParams).tipo;

  if (tipo === "natural" || tipo === "organizacion") {
    const opcion = OPCIONES.find((o) => o.tipo === tipo)!;
    return (
      <>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-linea pb-5">
          <p className="flex items-center gap-3 font-display text-lg font-extrabold text-noche">
            <span className="grid size-10 place-items-center rounded-full bg-rojo/10 text-rojo">
              <opcion.Icon size={20} aria-hidden="true" />
            </span>
            {opcion.titulo}
          </p>
          <Link
            href="/registro"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta hover:text-rojo"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Cambiar tipo de cuenta
          </Link>
        </div>
        {tipo === "natural" ? (
          <FormRegistroNatural textos={await textosRegistro()} />
        ) : (
          <FormRegistroOrganizacion textos={await textosRegistro()} />
        )}
        <p className="mt-6 text-center text-sm text-tinta">
          ¿Ya tienes cuenta?{" "}
          <Link href="/ingresar" className="font-semibold text-rojo hover:underline">
            Inicia sesión
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="font-display text-xl font-extrabold text-noche">¿Cómo vas a participar?</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {OPCIONES.map(({ tipo, titulo, texto, Icon }) => (
          <li key={tipo}>
            <Link
              href={`/registro?tipo=${tipo}`}
              className="group flex h-full flex-col rounded-2xl border-2 border-linea p-5 transition-[border-color,transform,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-rojo hover:shadow-tarjeta"
            >
              <span className="grid size-12 place-items-center rounded-full bg-rojo/10 text-rojo transition-colors group-hover:bg-rojo group-hover:text-papel">
                <Icon size={24} aria-hidden="true" />
              </span>
              <span className="mt-4 font-display text-lg font-extrabold text-noche">{titulo}</span>
              <span className="mt-1.5 flex-1 text-sm leading-relaxed text-tinta">{texto}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-bold text-rojo">
                Continuar
                <ArrowRight
                  size={16}
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center text-sm text-tinta">
        ¿Ya tienes cuenta en este u otro portal de alcaldía?{" "}
        <Link href="/ingresar" className="font-semibold text-rojo hover:underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
