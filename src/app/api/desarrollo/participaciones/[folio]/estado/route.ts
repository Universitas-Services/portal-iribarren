import { z } from "zod";
import { ESTADOS_PARTICIPACION } from "@/lib/api/types";
import { cambiarEstadoParticipacion } from "@/lib/auth/servicio";
import { almacen, esDesarrollo } from "@/lib/auth/sesion";
import { usaApi } from "@/lib/plataforma-api/cliente";

/*
 * Solo en desarrollo: simula al Revisor de plataforma-admin cambiando el estado de una
 * participación, para recorrer el seguimiento y para las pruebas E2E. En producción responde 404.
 *
 *   POST /api/desarrollo/participaciones/IRI-2026-0008/estado
 *   { "estado": "EN_REVISION", "comentario": "opcional; obligatorio al rechazar" }
 */

const cuerpoSchema = z.object({
  estado: z.enum(ESTADOS_PARTICIPACION),
  comentario: z.string().max(1000).optional(),
});

const ESTADO_HTTP = {
  OK: 200,
  NO_EXISTE: 404,
  TRANSICION_INVALIDA: 409,
  FALTA_MOTIVO: 422,
  SIN_SEGUIMIENTO: 409,
} as const;

export async function POST(request: Request, { params }: { params: Promise<{ folio: string }> }) {
  // Con plataforma-api los estados los cambia el Revisor en el admin: aquí no hay nada que hacer.
  if (!esDesarrollo || usaApi()) return new Response(null, { status: 404 });
  const { folio } = await params;
  const cuerpo = cuerpoSchema.safeParse(await request.json().catch(() => null));
  if (!cuerpo.success) return Response.json({ estado: "DATOS_INVALIDOS" }, { status: 400 });
  const r = cambiarEstadoParticipacion(
    almacen(),
    folio,
    cuerpo.data.estado,
    cuerpo.data.comentario,
  );
  return Response.json(r, { status: ESTADO_HTTP[r.estado] });
}
