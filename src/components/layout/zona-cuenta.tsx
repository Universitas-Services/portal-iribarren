import { ClipboardList, LogOut, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { cerrarSesionAccion } from "@/lib/auth/acciones";
import { getUsuario } from "@/lib/auth/sesion";
import { MenuUsuario } from "./menu-usuario";

/*
 * Zona de cuenta del encabezado. Lee la cookie de sesión, así que siempre va dentro de un
 * <Suspense> cuyo respaldo es el estado sin sesión: el resto del layout sigue siendo estático.
 */

export function AccesoEscritorio() {
  return (
    <div className="flex items-center gap-1 xl:gap-2">
      <Link
        href="/ingresar"
        className="px-2 py-2 font-display text-sm font-semibold whitespace-nowrap text-tinta hover:underline xl:px-3 xl:text-[0.9375rem]"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/registro"
        className="rounded-xl bg-rojo px-4 py-2.5 font-display text-sm font-bold whitespace-nowrap text-papel transition-[background-color,transform] duration-150 ease-out-expo hover:bg-rojo-oscuro active:scale-[0.97] xl:px-5 xl:text-[0.9375rem]"
      >
        Regístrate
      </Link>
    </div>
  );
}

export function AccesoMovil() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Link
        href="/ingresar"
        className="grid min-h-12 place-items-center rounded-xl border border-tinta font-display font-semibold text-tinta"
      >
        Iniciar sesión
      </Link>
      <Link
        href="/registro"
        className="grid min-h-12 place-items-center rounded-xl bg-rojo font-display font-bold text-papel active:scale-[0.97]"
      >
        Regístrate
      </Link>
    </div>
  );
}

export async function CuentaEscritorio() {
  const u = await getUsuario();
  return u ? <MenuUsuario nombre={u.nombre} corto={u.corto} /> : <AccesoEscritorio />;
}

export async function CuentaMovil() {
  const u = await getUsuario();
  if (!u) return <AccesoMovil />;
  return (
    <div className="rounded-2xl bg-superficie p-4">
      <p className="text-sm text-tinta/75">Sesión iniciada como</p>
      <p className="truncate font-display font-extrabold text-noche">{u.nombre}</p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link
          href="/mi-cuenta/participaciones"
          className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-papel font-display font-semibold text-noche ring-1 ring-linea"
        >
          <ClipboardList size={18} aria-hidden="true" className="text-rojo" />
          Mis participaciones
        </Link>
        <Link
          href="/mi-cuenta/seguridad"
          className="col-span-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-papel font-display font-semibold text-noche ring-1 ring-linea"
        >
          <ShieldCheck size={18} aria-hidden="true" className="text-rojo" />
          Seguridad y contraseña
        </Link>
        <Link
          href="/mi-cuenta"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-papel font-display font-semibold text-noche ring-1 ring-linea"
        >
          <UserRound size={18} aria-hidden="true" className="text-rojo" />
          Mi cuenta
        </Link>
        <form action={cerrarSesionAccion}>
          <button
            type="submit"
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-papel font-display font-semibold text-noche ring-1 ring-linea"
          >
            <LogOut size={18} aria-hidden="true" className="text-rojo" />
            Salir
          </button>
        </form>
      </div>
    </div>
  );
}
