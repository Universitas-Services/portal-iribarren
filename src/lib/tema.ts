/*
 * Tema del portal (claro, oscuro o el del sistema). La preferencia vive solo en el navegador
 * (localStorage): no hace falta cuenta ni backend. Un script en el <head> la aplica antes del
 * primer pintado, así no hay parpadeo y el layout sigue siendo estático
 * (node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md).
 */

export const PREFERENCIAS_TEMA = ["claro", "oscuro", "sistema"] as const;
export type PreferenciaTema = (typeof PREFERENCIAS_TEMA)[number];
export type Tema = "claro" | "oscuro";

export const CLAVE_TEMA = "tema";
const CONSULTA_OSCURO = "(prefers-color-scheme: dark)";

/** Lo guardado, o «claro» si no hay nada o es un valor que el portal no conoce. */
export const preferenciaDe = (valor: unknown): PreferenciaTema =>
  (PREFERENCIAS_TEMA as readonly unknown[]).includes(valor) ? (valor as PreferenciaTema) : "claro";

/** El tema que se ve: «sistema» sigue la configuración del dispositivo. */
export const temaEfectivo = (preferencia: PreferenciaTema, sistemaOscuro: boolean): Tema =>
  preferencia === "sistema" ? (sistemaOscuro ? "oscuro" : "claro") : preferencia;

/** El script del <head>: la misma regla que `temaEfectivo`, sin dependencias. */
export const SCRIPT_TEMA = `(function(){try{var p=localStorage.getItem("${CLAVE_TEMA}");var o=p==="oscuro"||(p==="sistema"&&matchMedia("${CONSULTA_OSCURO}").matches);document.documentElement.setAttribute("data-tema",o?"oscuro":"claro")}catch(e){}})()`;

/* ---------- En el navegador ---------- */

const EVENTO = "cambio-de-tema";

/** La preferencia guardada (sin acceso a localStorage, «claro»). */
export function leerPreferencia(): PreferenciaTema {
  try {
    return preferenciaDe(localStorage.getItem(CLAVE_TEMA));
  } catch {
    return "claro";
  }
}

export const sistemaOscuro = () => matchMedia(CONSULTA_OSCURO).matches;

/** Pone el tema en <html>. */
export function aplicarTema(preferencia: PreferenciaTema) {
  document.documentElement.setAttribute("data-tema", temaEfectivo(preferencia, sistemaOscuro()));
}

/** Guarda la preferencia, la aplica y avisa a los selectores abiertos. */
export function guardarPreferencia(preferencia: PreferenciaTema) {
  try {
    localStorage.setItem(CLAVE_TEMA, preferencia);
  } catch {
    // Sin almacenamiento (modo privado estricto): el tema vale hasta recargar.
  }
  aplicarTema(preferencia);
  window.dispatchEvent(new Event(EVENTO));
}

/**
 * Para useSyncExternalStore: los selectores (escritorio y móvil) se enteran de un cambio hecho en
 * el otro, en otra pestaña o, con «sistema», en la configuración del dispositivo.
 */
export function suscribirTema(aviso: () => void) {
  const consulta = matchMedia(CONSULTA_OSCURO);
  const sistema = () => {
    if (leerPreferencia() === "sistema") aplicarTema("sistema");
    aviso();
  };
  window.addEventListener(EVENTO, aviso);
  window.addEventListener("storage", sistema);
  consulta.addEventListener("change", sistema);
  return () => {
    window.removeEventListener(EVENTO, aviso);
    window.removeEventListener("storage", sistema);
    consulta.removeEventListener("change", sistema);
  };
}
