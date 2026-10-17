import type { Metadata } from "next";
import { DocumentoLegal } from "@/components/cuenta/documento-legal";

export const metadata: Metadata = { title: "Política de tratamiento de datos" };

export default function PoliticaDatosPage() {
  return (
    <DocumentoLegal
      titulo="Política de tratamiento de datos personales"
      contenido={[
        "Qué datos se piden (identidad, contacto y documentos) y para qué se usan.",
        "Quién puede ver tus documentos: solo el personal revisor de la alcaldía.",
        "Cuándo se muestra tu nombre en una propuesta publicada (solo si lo autorizas).",
        "Cuánto tiempo se conservan los datos y cómo solicitar la baja de la cuenta.",
        "Cómo se comparten tus datos entre portales de distintas alcaldías.",
      ]}
    />
  );
}
