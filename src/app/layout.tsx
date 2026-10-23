import type { Metadata, Viewport } from "next";
import { Montserrat, Roboto } from "next/font/google";
import { AgenteIus } from "@/components/layout/agente-ius";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { siteUrl } from "@/env";
import { esDemo } from "@/lib/auth/sesion";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  // La cursiva destaca «Pensando en grande» en el titular del inicio.
  style: ["normal", "italic"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: {
    default: "PDUL YA · Planificación Urbana Participativa para la Ciudad Humana",
    template: "%s · PDUL YA",
  },
  description:
    "Portal oficial del Plan de Desarrollo Urbano Local de Iribarren: avances, documentos y participación ciudadana. La ciudad que planificamos juntos.",
  applicationName: "PDUL YA",
  openGraph: {
    title: "PDUL YA · La ciudad que planificamos juntos",
    description:
      "Plan de Desarrollo Urbano Local de Iribarren: infórmate y participa en el Barquisimeto del futuro.",
    locale: "es_VE",
    type: "website",
    images: [{ url: "/brand/pdul-ya-horizontal.png", width: 1200, height: 401, alt: "PDUL YA" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#2e134d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${montserrat.variable} ${roboto.variable} antialiased`}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#contenido"
          className="sr-only z-50 bg-tinta px-4 py-3 font-medium text-papel focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Saltar al contenido
        </a>
        {esDemo && (
          <aside
            aria-label="Entorno de demostración"
            className="bg-noche px-4 py-1.5 text-center text-xs font-medium text-papel print:hidden"
          >
            Entorno de demostración: los datos de ejemplo se reinician de vez en cuando.
          </aside>
        )}
        <SiteHeader />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        <AgenteIus />
      </body>
    </html>
  );
}
