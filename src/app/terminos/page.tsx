import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/cuenta/documento-legal";

export const metadata: Metadata = { title: "Términos de uso" };

export default function TerminosPage() {
  return (
    <DocumentoLegal
      titulo="Términos de uso"
      contenido={[
        "Qué es el portal PDUL YA y qué trámites no gestiona (son de la DPCU).",
        "Requisitos para crear una cuenta como persona natural u organización.",
        "Cómo se reciben, revisan y responden las opiniones y propuestas, y qué significa el folio.",
        "Por qué un aporte enviado no se puede editar ni eliminar.",
        "Normas de convivencia y motivos para suspender una cuenta.",
      ]}
    />
  );
}
