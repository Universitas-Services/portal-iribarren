import { z } from "zod";
import { TIPOS_TEXTO_LEGAL } from "@/lib/api/types";
import { almacen, esDesarrollo } from "@/lib/auth/sesion";
import {
  publicarTextoLegalSimulado,
  reiniciarTextosLegalesSimulados,
} from "@/lib/mocks/textos-legales";

/*
 * Solo en desarrollo: simula a un Administrador de plataforma-admin publicando una versión nueva
 * de un texto legal, para ver el pedido de aceptarlo otra vez y para las pruebas E2E. En
 * producción responde 404.
 *
 *   POST   /api/desarrollo/textos-legales   { "tipo": "TERMINOS", "nota": "Qué cambió" }
 *     publica una versión nueva para todas las cuentas;
 *   POST   /api/desarrollo/textos-legales   { "tipo": "TERMINOS", "correo": "x@y.com" }
 *     solo esa cuenta queda con una versión anterior aceptada (no afecta a las demás pruebas);
 *   DELETE /api/desarrollo/textos-legales   vuelve a las versiones iniciales.
 */

const cuerpoSchema = z.object({
  tipo: z.enum(TIPOS_TEXTO_LEGAL),
  nota: z.string().min(1).max(500).optional(),
  correo: z.string().email().optional(),
});

export async function POST(request: Request) {
  if (!esDesarrollo) return new Response(null, { status: 404 });
  const cuerpo = cuerpoSchema.safeParse(await request.json().catch(() => null));
  if (!cuerpo.success) return Response.json({ estado: "DATOS_INVALIDOS" }, { status: 400 });
  const { tipo, nota, correo } = cuerpo.data;
  if (correo) {
    const c = [...almacen().cuentas.values()].find((x) => x.correo === correo.toLowerCase());
    if (!c) return Response.json({ estado: "NO_EXISTE" }, { status: 404 });
    c.textosAceptados = { ...c.textosAceptados, [tipo]: "version-anterior" };
    c.actualizadaEl = Date.now();
    return Response.json({ estado: "OK" });
  }
  return Response.json(publicarTextoLegalSimulado(tipo, nota ?? "Versión de prueba."));
}

export async function DELETE() {
  if (!esDesarrollo) return new Response(null, { status: 404 });
  reiniciarTextosLegalesSimulados();
  return new Response(null, { status: 204 });
}
