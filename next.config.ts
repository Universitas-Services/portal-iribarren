import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // La participación lleva hasta 5 imágenes y un documento de 2 MB cada uno, más el margen
      // del multipart. Con plataforma-api los archivos irán directo a Storage.
      bodySizeLimit: "13mb",
    },
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
