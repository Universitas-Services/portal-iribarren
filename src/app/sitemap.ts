import type { MetadataRoute } from "next";
import { siteUrl } from "@/env";
import { getPostSlugs } from "@/lib/api";

/** Sitemap con las páginas públicas y cada noticia publicada. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const url = (ruta: string) => new URL(ruta, base).toString();
  const noticias = await getPostSlugs();

  return [
    { url: url("/"), changeFrequency: "weekly", priority: 1 },
    { url: url("/noticias"), changeFrequency: "daily", priority: 0.8 },
    ...noticias.map(({ slug, publicadoEl }) => ({
      url: url(`/noticias/${slug}`),
      lastModified: publicadoEl,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
