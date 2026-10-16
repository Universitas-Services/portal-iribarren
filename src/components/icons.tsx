import type { SVGProps } from "react";

/**
 * Íconos de marcas sociales (lucide-react ya no incluye logos de marcas).
 * El resto de los íconos del portal vienen de lucide-react.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function Instagram({ size = 24, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <path d="M16 11.4A4 4 0 1 1 12.6 8a4 4 0 0 1 3.4 3.4zM17.5 6.5h.01" />
    </svg>
  );
}
