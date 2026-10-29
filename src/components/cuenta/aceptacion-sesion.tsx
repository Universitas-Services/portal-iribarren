import { textosPendientes } from "@/lib/auth/textos-legales";
import { cuentaDeSesion } from "@/lib/auth/servicio";
import { almacen, idSesion } from "@/lib/auth/sesion";
import { ModalReaceptar } from "./reaceptar";

/**
 * Pedido de aceptar los textos legales actualizados (R15). Lee la sesión, así que va en el
 * layout dentro de un <Suspense> sin respaldo: sin sesión o sin nada pendiente, no pinta nada.
 */
export async function AceptacionSesion() {
  const pendientes = await textosPendientes(cuentaDeSesion(almacen(), await idSesion()));
  return pendientes.length > 0 ? <ModalReaceptar pendientes={pendientes} /> : null;
}
