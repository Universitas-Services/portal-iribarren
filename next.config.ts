import type { NextConfig } from "next";
import redireccionesV4 from "./src/lib/noticias/redirecciones-v4.json";

/** Los medios de las noticias llegan como URL absolutas de la API (guía R6). */
const api = process.env.API_URL ? new URL(process.env.API_URL) : undefined;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // La participación lleva hasta 5 imágenes y un documento de 2 MB cada uno, más el margen
      // del multipart. Con plataforma-api los archivos irán directo a Storage.
      bodySizeLimit: "13mb",
    },
  },
  images: {
    remotePatterns: api
      ? [
          {
            protocol: api.protocol.replace(":", "") as "http" | "https",
            hostname: api.hostname,
            // Sin puerto cuando es el de siempre: Netlify convierte el patrón y un puerto vacío
            // lo deja sin coincidir. Netlify también lo declara en netlify.toml.
            ...(api.port ? { port: api.port } : {}),
            pathname: `${api.pathname.replace(/\/+$/, "")}/media/**`,
          },
        ]
      : [],
  },
  /*
   * Las 9 noticias de la v4 cambiaron de dirección al cargarlas en la API, que arma el slug con
   * el título. El script scripts/cargar-noticias-v4.mts deja aquí el slug viejo → el nuevo, para
   * que los enlaces que ya circulan sigan funcionando.
   */
  async redirects() {
    return Object.entries(redireccionesV4 as Record<string, string>).map(([viejo, nuevo]) => ({
      source: `/noticias/${viejo}`,
      destination: `/noticias/${nuevo}`,
      permanent: true,
    }));
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
