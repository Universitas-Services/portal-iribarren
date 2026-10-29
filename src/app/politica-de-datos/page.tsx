import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/cuenta/documento-legal";

export const metadata: Metadata = { title: "Política de tratamiento de datos" };

export default function PoliticaDatosPage() {
  return <DocumentoLegal tipo="POLITICA_DATOS" />;
}
