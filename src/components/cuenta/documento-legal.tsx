import Link from "next/link";
import { getTextoLegal } from "@/lib/api";
import { TITULO_TEXTO_LEGAL, type TipoTextoLegal } from "@/lib/api/types";
import { MarcoCuenta } from "./marco-cuenta";
import { CuerpoTextoLegal, DatosVersion } from "./texto-legal";

/**
 * Términos de uso y política de datos: la versión vigente que publica un Administrador desde
 * plataforma-admin. Mientras no hay texto aprobado, se ve el contenido provisional, marcado.
 */
export async function DocumentoLegal({ tipo }: { tipo: TipoTextoLegal }) {
  const texto = await getTextoLegal(tipo);
  const titulo = TITULO_TEXTO_LEGAL[tipo];
  return (
    <MarcoCuenta
      migas={[{ href: "/", label: "Inicio" }, { label: titulo }]}
      titulo={titulo}
      bajada={texto ? <DatosVersion texto={texto} /> : undefined}
      ancho="max-w-2xl"
    >
      {texto ? (
        <CuerpoTextoLegal texto={texto} />
      ) : (
        <p className="leading-relaxed text-tinta">
          No pudimos cargar el texto en este momento. Vuelve a intentarlo en unos minutos.
        </p>
      )}
      <Link href="/registro" className="mt-8 inline-block font-semibold text-rojo hover:underline">
        Volver al registro
      </Link>
    </MarcoCuenta>
  );
}
