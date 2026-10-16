import type { ReactNode } from "react";

/** Piel común de los bloques del tablero: tarjeta blanca, esquinas suaves, sombra con desplazamiento. */
export function Tile({
  children,
  className = "",
  as: Tag = "section",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
} & Record<`aria-${string}`, string | undefined>) {
  return (
    <Tag className={`revelar rounded-tarjeta shadow-tarjeta ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
