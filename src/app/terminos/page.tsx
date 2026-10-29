import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/cuenta/documento-legal";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TerminosPage() {
  return <DocumentoLegal tipo="TERMINOS" />;
}
