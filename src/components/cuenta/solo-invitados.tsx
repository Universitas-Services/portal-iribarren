import { soloInvitados } from "@/lib/auth/sesion";

/**
 * Para las páginas de invitado sin otra parte dinámica: va dentro de un <Suspense> y, si hay
 * sesión abierta, lleva a `destino`.
 */
export async function SoloInvitados({ destino }: { destino?: string }) {
  await soloInvitados(destino);
  return null;
}
