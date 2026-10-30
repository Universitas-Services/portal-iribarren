/**
 * Las opciones de un desplegable con el valor que la persona ya tenía, aunque la alcaldía lo
 * haya desactivado: así no se pierde al editar otra cosa del formulario.
 */
export const conActual = (opciones: readonly string[], actual?: string) =>
  actual && !opciones.includes(actual) ? [...opciones, actual] : [...opciones];

/** Si un valor elegido está en la lista vigente (sin importar mayúsculas ni espacios). */
export const enLista = (opciones: readonly string[], valor?: string) =>
  !!valor && opciones.some((o) => o.trim().toLowerCase() === valor.trim().toLowerCase());

/** Un filtro de la URL con un valor que no está en la lista vigente se descarta (sin error). */
export function soloDeLista<T extends object, K extends keyof T>(
  filtros: T,
  campo: K,
  opciones: readonly string[],
): T {
  const v = filtros[campo];
  return typeof v === "string" && !enLista(opciones, v)
    ? { ...filtros, [campo]: undefined }
    : filtros;
}
