"use client";

import "leaflet/dist/leaflet.css";
import type * as Leaflet from "leaflet";
import { ExternalLink, Link2, LocateFixed, Loader2, MapPin, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CENTRO_BARQUISIMETO,
  coordenadasDeEnlace,
  dentroDeIribarren,
  enlaceGoogleMaps,
  esEnlaceCorto,
  esEnlaceMaps,
  formatoCoordenadas,
  LIMITES_IRIBARREN,
  type Ubicacion,
} from "@/lib/ubicacion";
import { resolverEnlaceMapaAccion } from "@/lib/ubicacion-acciones";

/*
 * Mapa gratuito (Leaflet + teselas de OpenStreetMap, con su atribución) para marcar dónde aplica
 * un aporte. Alternativas al mapa, para teclado y lector de pantalla: buscar una dirección
 * (Nominatim, al pulsar: su política no admite autocompletar), usar la ubicación del navegador o
 * pegar un enlace de Google Maps. Las coordenadas viajan en dos campos ocultos del formulario.
 */

const TESELAS = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const ATRIBUCION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a>';
const LIMITES: Leaflet.LatLngBoundsExpression = [
  [LIMITES_IRIBARREN.sur, LIMITES_IRIBARREN.oeste],
  [LIMITES_IRIBARREN.norte, LIMITES_IRIBARREN.este],
];

const PIN_HTML = `<svg width="34" height="44" viewBox="0 0 34 44" aria-hidden="true"><path d="M17 43s14-14.6 14-25.5C31 8.9 24.7 2 17 2S3 8.9 3 17.5C3 28.4 17 43 17 43z" fill="#c32026" stroke="#fff" stroke-width="3"/><circle cx="17" cy="17" r="5.5" fill="#fff"/></svg>`;

const pin = (L: typeof Leaflet) =>
  L.divIcon({ html: PIN_HTML, className: "", iconSize: [34, 44], iconAnchor: [17, 43] });

type Resultado = { nombre: string; punto: Ubicacion };

const claseBoton =
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-linea bg-papel px-4 font-display text-sm font-bold text-noche transition-colors hover:border-noche/40 disabled:opacity-60";
const claseEntrada =
  "h-11 w-full min-w-0 rounded-xl border border-linea bg-papel px-4 text-noche outline-none placeholder:text-tinta/70 hover:border-noche/40 focus-visible:border-rojo";

/** Mapa base con Leaflet cargado en el cliente (usa `window`). */
function useMapa(
  contenedor: React.RefObject<HTMLDivElement | null>,
  opciones: { interactivo: boolean; inicial?: Ubicacion; alElegir?: (p: Ubicacion) => void },
) {
  const mapa = useRef<Leaflet.Map | null>(null);
  const marcador = useRef<Leaflet.Marker | null>(null);
  const lib = useRef<typeof Leaflet | null>(null);
  const [listo, setListo] = useState(false);
  const alElegir = useRef(opciones.alElegir);
  useEffect(() => {
    alElegir.current = opciones.alElegir;
  });

  useEffect(() => {
    let vivo = true;
    void import("leaflet").then((L) => {
      if (!vivo || !contenedor.current || mapa.current) return;
      lib.current = L;
      const m = L.map(contenedor.current, {
        center: opciones.inicial ?? CENTRO_BARQUISIMETO,
        zoom: opciones.inicial ? 16 : 13,
        minZoom: 11,
        maxBounds: LIMITES,
        maxBoundsViscosity: 0.8,
        scrollWheelZoom: false,
        dragging: opciones.interactivo || !L.Browser.mobile,
        zoomControl: true,
      });
      L.tileLayer(TESELAS, { attribution: ATRIBUCION, maxZoom: 19 }).addTo(m);
      // Atribución neutra: solo el nombre de la librería (sin la bandera que trae por defecto).
      m.attributionControl.setPrefix(
        '<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>',
      );
      if (opciones.inicial) {
        marcador.current = L.marker(opciones.inicial, {
          icon: pin(L),
          draggable: opciones.interactivo,
          keyboard: false,
        }).addTo(m);
      }
      if (opciones.interactivo) {
        m.on("click", (e: Leaflet.LeafletMouseEvent) =>
          alElegir.current?.({ lat: e.latlng.lat, lng: e.latlng.lng }),
        );
      }
      mapa.current = m;
      setListo(true);
    });
    return () => {
      vivo = false;
      mapa.current?.remove();
      mapa.current = null;
      marcador.current = null;
    };
    // El mapa se crea una sola vez; los cambios de punto se aplican con `colocar`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Coloca (o quita) el pin y centra el mapa en él. */
  function colocar(p: Ubicacion | null, centrar = true) {
    const L = lib.current;
    const m = mapa.current;
    if (!L || !m) return;
    if (!p) {
      marcador.current?.remove();
      marcador.current = null;
      return;
    }
    if (!marcador.current) {
      marcador.current = L.marker(p, { icon: pin(L), draggable: true, keyboard: false }).addTo(m);
      marcador.current.on("dragend", () => {
        const ll = marcador.current!.getLatLng();
        alElegir.current?.({ lat: ll.lat, lng: ll.lng });
      });
    } else marcador.current.setLatLng(p);
    if (centrar) m.setView(p, Math.max(m.getZoom(), 16));
  }

  return { listo, colocar };
}

/** Selector de ubicación del formulario de participación. */
export function SelectorUbicacion({
  inicial,
  obligatorio,
  error,
}: {
  inicial?: Ubicacion;
  obligatorio: boolean;
  error?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const [punto, setPunto] = useState<Ubicacion | undefined>(inicial);
  const [aviso, setAviso] = useState<string>();
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [enlace, setEnlace] = useState("");
  const [ocupado, setOcupado] = useState<"buscar" | "enlace" | "gps" | null>(null);
  const ultimaBusqueda = useRef(0);

  function elegir(p: Ubicacion, centrar = false) {
    if (!dentroDeIribarren(p)) {
      setAviso(
        "Ese punto está fuera del Municipio Iribarren. Marca un lugar dentro del municipio.",
      );
      return;
    }
    setAviso(undefined);
    setPunto(p);
    mapa.colocar(p, centrar);
  }

  const mapa = useMapa(contenedor, {
    interactivo: true,
    inicial,
    alElegir: (p) => elegir(p),
  });

  async function buscar() {
    const q = busqueda.trim();
    if (q.length < 3) return setAviso("Escribe al menos 3 letras para buscar.");
    // Política de Nominatim: como máximo una consulta por segundo.
    const espera = 1100 - (Date.now() - ultimaBusqueda.current);
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaBusqueda.current = Date.now();
    setOcupado("buscar");
    setAviso(undefined);
    try {
      const { sur, norte, oeste, este } = LIMITES_IRIBARREN;
      const url =
        "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=ve&bounded=1" +
        `&viewbox=${oeste},${norte},${este},${sur}&q=${encodeURIComponent(q)}`;
      const r = await fetch(url, { headers: { "Accept-Language": "es" } });
      const datos = (await r.json()) as { display_name: string; lat: string; lon: string }[];
      const lista = datos.map((d) => ({
        nombre: d.display_name.split(",").slice(0, 3).join(","),
        punto: { lat: Number(d.lat), lng: Number(d.lon) },
      }));
      setResultados(lista);
      if (!lista.length)
        setAviso("No encontramos esa dirección. Prueba con otra o marca el punto.");
    } catch {
      setAviso("La búsqueda no está disponible ahora. Marca el punto en el mapa.");
    } finally {
      setOcupado(null);
    }
  }

  async function usarEnlace() {
    const url = esEnlaceMaps(enlace);
    if (!url) return setAviso("Pega un enlace de Google Maps.");
    setAviso(undefined);
    const directo = coordenadasDeEnlace(enlace);
    if (directo) return elegir(directo, true);
    if (!esEnlaceCorto(url))
      return setAviso(
        "Ese enlace no trae coordenadas. En Google Maps, toca el punto, luego «Compartir» y copia el enlace.",
      );
    setOcupado("enlace");
    const r = await resolverEnlaceMapaAccion(enlace);
    setOcupado(null);
    if (r.ok) elegir(r.ubicacion, true);
    else setAviso(r.mensaje);
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) return setAviso("Tu navegador no permite compartir la ubicación.");
    setOcupado("gps");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOcupado(null);
        elegir({ lat: pos.coords.latitude, lng: pos.coords.longitude }, true);
      },
      () => {
        setOcupado(null);
        setAviso("No pudimos obtener tu ubicación. Revisa el permiso del navegador.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  const mensaje = aviso ?? error;

  return (
    <fieldset id="ubicacion" aria-describedby="ubicacion-ayuda" className="min-w-0 scroll-mt-28">
      <legend className="mb-1.5 font-display text-sm font-bold text-noche">
        Ubicación en el mapa{" "}
        <span className="font-normal text-tinta/75">
          {obligatorio ? "(obligatoria)" : "(opcional)"}
        </span>
      </legend>
      <p id="ubicacion-ayuda" className="mb-3 text-sm text-tinta/80">
        Marca en el mapa dónde aplica tu aporte: toca el lugar o arrastra el marcador. También
        puedes buscar una dirección o pegar un enlace de Google Maps.
      </p>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="ubicacion-buscar" className="sr-only">
          Buscar una dirección en Iribarren
        </label>
        <input
          id="ubicacion-buscar"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void buscar();
            }
          }}
          placeholder="Buscar dirección, por ejemplo «Parque Ayacucho»"
          className={claseEntrada}
        />
        <button
          type="button"
          onClick={() => void buscar()}
          disabled={!!ocupado}
          className={claseBoton}
        >
          {ocupado === "buscar" ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <Search size={16} aria-hidden="true" />
          )}
          Buscar
        </button>
      </div>

      {resultados.length > 0 && (
        <ul
          aria-label="Resultados de la búsqueda"
          className="mb-3 divide-y divide-linea overflow-hidden rounded-xl border border-linea bg-papel"
        >
          {resultados.map((r) => (
            <li key={`${r.punto.lat},${r.punto.lng}`}>
              <button
                type="button"
                onClick={() => {
                  elegir(r.punto, true);
                  setResultados([]);
                }}
                className="flex w-full items-start gap-2 px-4 py-2.5 text-left text-sm text-noche hover:bg-superficie"
              >
                <MapPin size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-rojo" />
                {r.nombre}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* `isolate`: los paneles de Leaflet (z-index 400–1000) quedan debajo del encabezado. */}
      <div
        ref={contenedor}
        role="application"
        aria-label="Mapa de Iribarren: toca un lugar para marcarlo"
        className={`isolate h-72 w-full overflow-hidden rounded-2xl border bg-superficie ${
          mensaje && !punto ? "border-rojo" : "border-linea"
        }`}
      />
      {!mapa.listo && <p className="mt-2 text-sm text-tinta/70">Cargando el mapa…</p>}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <label htmlFor="ubicacion-enlace" className="sr-only">
          Enlace de Google Maps
        </label>
        <input
          id="ubicacion-enlace"
          type="url"
          inputMode="url"
          value={enlace}
          onChange={(e) => setEnlace(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void usarEnlace();
            }
          }}
          placeholder="O pega un enlace de Google Maps"
          className={claseEntrada}
        />
        <button
          type="button"
          onClick={() => void usarEnlace()}
          disabled={!!ocupado}
          className={claseBoton}
        >
          {ocupado === "enlace" ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <Link2 size={16} aria-hidden="true" />
          )}
          Usar enlace
        </button>
        <button type="button" onClick={usarMiUbicacion} disabled={!!ocupado} className={claseBoton}>
          {ocupado === "gps" ? (
            <Loader2 size={16} aria-hidden="true" className="animate-spin" />
          ) : (
            <LocateFixed size={16} aria-hidden="true" />
          )}
          Mi ubicación
        </button>
      </div>

      <div aria-live="polite" className="mt-3 text-sm">
        {mensaje && (
          <p id="ubicacion-error" className="text-rojo">
            {mensaje}
          </p>
        )}
        {punto && (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-tinta">
            <span className="inline-flex items-center gap-1.5 font-semibold text-noche">
              <MapPin size={16} aria-hidden="true" className="text-rojo" />
              Punto marcado: {formatoCoordenadas(punto)}
            </span>
            <a
              href={enlaceGoogleMaps(punto)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-rojo underline"
            >
              Ver en Google Maps
              <ExternalLink size={14} aria-hidden="true" />
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
            <button
              type="button"
              onClick={() => {
                setPunto(undefined);
                mapa.colocar(null);
              }}
              className="inline-flex items-center gap-1 font-semibold text-tinta/80 underline hover:text-noche"
            >
              <X size={14} aria-hidden="true" />
              Quitar
            </button>
          </p>
        )}
      </div>

      <input type="hidden" name="latitud" value={punto ? punto.lat.toFixed(6) : ""} />
      <input type="hidden" name="longitud" value={punto ? punto.lng.toFixed(6) : ""} />
    </fieldset>
  );
}

/** Mapa de solo lectura con el punto del aporte (detalle en «Mis participaciones»). */
export function MapaPunto({ punto }: { punto: Ubicacion }) {
  const contenedor = useRef<HTMLDivElement>(null);
  useMapa(contenedor, { interactivo: false, inicial: punto });
  return (
    <div>
      <div
        ref={contenedor}
        role="img"
        aria-label={`Mapa con el punto del aporte: ${formatoCoordenadas(punto)}`}
        className="isolate h-56 w-full overflow-hidden rounded-2xl border border-linea bg-superficie"
      />
      <p className="mt-2 flex flex-wrap items-center gap-x-3 text-sm text-tinta">
        <span>{formatoCoordenadas(punto)}</span>
        <a
          href={enlaceGoogleMaps(punto)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-rojo underline"
        >
          Ver en Google Maps
          <ExternalLink size={14} aria-hidden="true" />
          <span className="sr-only"> (se abre en otra pestaña)</span>
        </a>
      </p>
    </div>
  );
}
