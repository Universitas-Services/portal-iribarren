import "server-only";
import { z } from "zod";

/**
 * Variables de entorno del servidor (BFF). Nunca se envían al navegador:
 * las credenciales del portal no deben llevar el prefijo NEXT_PUBLIC_.
 */
const envSchema = z.object({
  API_URL: z.url("API_URL debe ser una URL válida."),
  PORTAL_CLIENT_ID: z.string().min(1, "Falta PORTAL_CLIENT_ID."),
  /** Opcional: si se envía, la API lo verifica; nunca se envía desde el navegador. */
  PORTAL_CLIENT_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

/**
 * Valida las variables al primer uso (no al importar), para que `next build`
 * funcione sin `.env` y el error aparezca en la primera petición que las necesite.
 */
export function env(): Env {
  if (!cached) {
    const parsed = envSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(`Variables de entorno inválidas:\n${z.prettifyError(parsed.error)}`);
    }
    cached = parsed.data;
  }
  return cached;
}

/**
 * URL pública del portal, para metadatos, Open Graph y sitemap. No es secreta y tiene
 * valor por defecto, así que no exige las variables del BFF.
 */
export function siteUrl(): URL {
  const parsed = z.url().safeParse(process.env.SITE_URL);
  return new URL(parsed.success ? parsed.data : "http://localhost:3000");
}
