import type { MetadataRoute } from "next";
import { siteUrl } from "@/env";
import { getDocumentoSlugs, getPostSlugs } from "@/lib/api";

/** Sitemap con las páginas públicas, cada noticia y cada documento. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const url = (ruta: string) => new URL(ruta, base).toString();
  const [noticias, documentos] = await Promise.all([getPostSlugs(), getDocumentoSlugs()]);

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/noticias"), changeFrequency: "daily", priority: 0.8 },
    { url: url("/documentos"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/conoce-el-pdul"), changeFrequency: "monthly", priority: 0.7 },
    ...noticias.map(({ slug, publicadoEl }) => ({
      url: url(`/noticias/${slug}`),
      lastModified: publicadoEl,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...documentos.map(({ slug, fecha }) => ({
      url: url(`/documentos/${slug}`),
      lastModified: fecha,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
