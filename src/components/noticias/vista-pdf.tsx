"use client";

import { useSyncExternalStore } from "react";

const sinSuscripcion = () => () => {};

/**
 * Vista previa del PDF dentro de la página. Solo se monta en escritorio y si el navegador
 * declara un visor de PDF (`navigator.pdfViewerEnabled`); si no, la ficha ya ofrece abrirlo
 * en otra pestaña o descargarlo, sin dejar un recuadro vacío.
 */
export function VistaPdf({ url, nombre }: { url: string; nombre: string }) {
  const puede = useSyncExternalStore(
    sinSuscripcion,
    () => navigator.pdfViewerEnabled === true,
    () => false,
  );
  if (!puede) return null;
  return (
    <iframe
      src={`${url}#view=FitH`}
      title={`Vista previa de ${nombre}`}
      className="hidden h-[80vh] max-h-[56rem] w-full border-t border-linea bg-superficie lg:block"
    />
  );
}
