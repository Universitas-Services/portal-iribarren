import { ArrowRight, FileText, House, MessageSquareText, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

const SALIDAS = [
  { href: "/", label: "Ir al inicio", Icon: House },
  { href: "/noticias", label: "Ver noticias", Icon: Newspaper },
  { href: "/documentos", label: "Consultar documentos", Icon: FileText },
  { href: "/participa", label: "Enviar una propuesta", Icon: MessageSquareText },
];

export default function NotFound() {
  return (
    <section aria-labelledby="no-encontrada" className="patron-urbano relative overflow-hidden">
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-28">
        <div className="cascada text-papel">
          <p className="font-display text-[clamp(5rem,16vw,10rem)] leading-none font-extrabold tracking-[-0.05em] text-naranja">
            404
          </p>
          <h1 id="no-encontrada" className="mt-2 font-display text-3xl font-extrabold sm:text-5xl">
            Esta calle todavía no está en el plan
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-papel/85">
            La página que buscas no existe, cambió de dirección o aún estamos construyéndola. Desde
            aquí puedes seguir por cualquiera de estos caminos:
          </p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {SALIDAS.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex min-h-14 items-center gap-3 rounded-xl bg-papel px-4 font-display font-bold text-noche shadow-tarjeta transition-[transform,box-shadow] duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-elevada active:scale-[0.97]"
                >
                  <span className="grid size-9 place-items-center rounded-full bg-rojo/10 text-rojo">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  {label}
                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                    className="ml-auto text-rojo transition-transform duration-200 ease-out-expo group-hover:translate-x-1"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <Image
          src="/brand/pdul-ya-isotipo.png"
          alt="Isotipo de PDUL YA"
          width={512}
          height={588}
          className="flotar mx-auto hidden w-full max-w-sm drop-shadow-2xl lg:block"
        />
      </div>
    </section>
  );
}
