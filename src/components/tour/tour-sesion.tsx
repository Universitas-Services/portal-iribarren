import { cuentaDeSesion } from "@/lib/auth/servicio";
import { almacen, getUsuario, idSesion } from "@/lib/auth/sesion";
import { textosPendientes } from "@/lib/auth/textos-legales";
import { Tour } from "./tour";

/**
 * La brújula del recorrido con los datos de la sesión. Lee la cookie, así que va dentro de un
 * <Suspense> cuyo respaldo es la brújula sin sesión (como la zona de cuenta del encabezado).
 */
export async function TourSesion() {
  const u = await getUsuario();
  // Con textos legales por aceptar, primero ese modal: el recorrido espera al siguiente ingreso.
  const bloqueada =
    !!u?.tourPendiente &&
    (await textosPendientes(cuentaDeSesion(almacen(), await idSesion()))).length > 0;
  return <Tour conSesion={!!u} pendiente={!!u?.tourPendiente && !bloqueada} />;
}
