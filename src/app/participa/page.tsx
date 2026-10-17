import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { randomUUID } from "node:crypto";
import { Suspense } from "react";
import { FormularioSkeleton, MarcoCuenta } from "@/components/cuenta/marco-cuenta";
import { FormParticipacion } from "@/components/cuenta/participacion";
import { getLatestPosts } from "@/lib/api";
import type { TipoParticipacion } from "@/lib/api/types";
import { getUsuario } from "@/lib/auth/sesion";

export const metadata: Metadata = {
  title: "Participa",
  description: "Envía tu opinión o una propuesta formal al PDUL de Iribarren.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/** Atajos que llegan desde otras páginas: ?tipo=opinion-noticia&noticia=slug, ?tipo=propuesta. */
const TIPO_URL: Record<string, TipoParticipacion> = {
  opinion: "OPINION_GENERAL",
  "opinion-noticia": "OPINION_NOTICIA",
  propuesta: "PROPUESTA_FORMAL",
};

/*
 * Formulario de participación (backlog 3.10; v3, formulario 3). Sin sesión lleva a iniciar
 * sesión con el aviso; con el perfil incompleto el envío queda bloqueado y dice qué falta.
 */
export default function ParticipaPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: "Participa" }]}
      titulo="Participa en el PDUL"
      bajada="Envía una opinión general, opina sobre una noticia o presenta una propuesta formal. Cada aporte recibe un folio único."
      ancho="max-w-3xl"
    >
      <Suspense fallback={<FormularioSkeleton campos={5} />}>
        <Contenido searchParams={searchParams} />
      </Suspense>
    </MarcoCuenta>
  );
}

async function Contenido({ searchParams }: { searchParams: SearchParams }) {
  const u = await getUsuario();
  if (!u) redirect("/ingresar?volver=/participa&motivo=participar");
  // La clave de idempotencia es única por visita: se genera siempre al pedir la página.
  await connection();
  const sp = await searchParams;
  const posts = await getLatestPosts(50);
  const noticias = posts.map((p) => ({ slug: p.slug, titulo: p.titulo }));
  const noticia = typeof sp.noticia === "string" ? sp.noticia : undefined;
  const tipo =
    (typeof sp.tipo === "string" && TIPO_URL[sp.tipo]) ||
    (noticia ? "OPINION_NOTICIA" : "OPINION_GENERAL");

  return (
    <FormParticipacion
      noticias={noticias}
      tipoInicial={tipo}
      noticiaInicial={noticias.some((n) => n.slug === noticia) ? noticia : undefined}
      puedeEnviar={u.puedeParticipar}
      faltantes={u.faltantes}
      // Una clave por formulario abierto: un doble clic o un reintento no crean dos folios.
      idempotencia={randomUUID()}
      autor={u.nombre}
    />
  );
}
