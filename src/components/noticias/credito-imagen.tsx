import type { Imagen } from "@/lib/api/types";

/** Crédito exigido por las licencias CC BY y CC BY-SA: autor, licencia y enlace a la fuente. */
export function CreditoImagen({
  credito,
  className = "",
}: {
  credito: Imagen["credito"];
  className?: string;
}) {
  if (!credito) return null;
  return (
    <span className={className}>
      Foto:{" "}
      <a href={credito.fuente} target="_blank" rel="noopener noreferrer" className="underline">
        {credito.autor}
      </a>{" "}
      · {credito.licencia}
    </span>
  );
}
