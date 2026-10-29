import "server-only";
import { getTextoLegal } from "@/lib/api";
import { TIPOS_TEXTO_LEGAL, type TextoLegal, type TipoTextoLegal } from "@/lib/api/types";
import type { Cuenta } from "./servicio";

/*
 * Aceptación de los textos legales (R15). Al registrarse se guarda la versión que la persona vio;
 * cuando un Administrador publica una nueva, la cuenta queda bloqueada hasta aceptarla.
 */

export async function textosVigentes(): Promise<Record<TipoTextoLegal, TextoLegal | null>> {
  const [TERMINOS, POLITICA_DATOS] = await Promise.all(TIPOS_TEXTO_LEGAL.map(getTextoLegal));
  return { TERMINOS: TERMINOS ?? null, POLITICA_DATOS: POLITICA_DATOS ?? null };
}

/**
 * Los textos que la cuenta debe aceptar de nuevo. Sin dato de lo aceptado (la API aún no lo
 * informa) o sin texto vigente (no se pudo leer), no se bloquea a nadie.
 */
export async function textosPendientes(c: Cuenta | undefined): Promise<TextoLegal[]> {
  if (!c?.textosAceptados) return [];
  const vigentes = await textosVigentes();
  return TIPOS_TEXTO_LEGAL.flatMap((t) => {
    const v = vigentes[t];
    return v && c.textosAceptados?.[t] !== v.version ? [v] : [];
  });
}

/**
 * Las versiones que la persona vio en el formulario, si siguen vigentes. Si alguna cambió mientras
 * llenaba el formulario, null: tiene que volver a leerla.
 */
export async function versionesVistasVigentes(
  fd: FormData,
): Promise<Partial<Record<TipoTextoLegal, string>> | null> {
  const vistas = {
    TERMINOS: String(fd.get("versionTerminos") ?? ""),
    POLITICA_DATOS: String(fd.get("versionPoliticaDatos") ?? ""),
  };
  const vigentes = await textosVigentes();
  const aceptadas: Partial<Record<TipoTextoLegal, string>> = {};
  for (const t of TIPOS_TEXTO_LEGAL) {
    const v = vigentes[t];
    if (!v) continue;
    if (vistas[t] !== v.version) return null;
    aceptadas[t] = v.version;
  }
  return aceptadas;
}

/** Mensaje de las acciones bloqueadas por un texto pendiente. */
export const MENSAJE_TEXTOS_PENDIENTES =
  "Se actualizaron los términos de uso o la política de datos: acéptalos para continuar.";
