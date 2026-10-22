import "server-only";
import { crearAlmacenInteracciones, type AlmacenInteracciones } from "./interacciones";

const globalConInteracciones = globalThis as typeof globalThis & {
  __pdulInteracciones?: AlmacenInteracciones;
};

/** Un solo almacén por proceso, aunque Next recargue los módulos en desarrollo. */
export const almacenInteracciones = (): AlmacenInteracciones =>
  (globalConInteracciones.__pdulInteracciones ??= crearAlmacenInteracciones());
