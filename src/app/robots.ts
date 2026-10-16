import type { MetadataRoute } from "next";
import { siteUrl } from "@/env";

/** El contenido público se indexa; las áreas de cuenta del ciudadano no. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/mi-cuenta/", "/api/"] },
    sitemap: new URL("/sitemap.xml", siteUrl()).toString(),
  };
}
