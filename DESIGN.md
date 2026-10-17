# Design

Sistema visual del portal PDUL YA (Alcaldía de Iribarren). La fuente de verdad de los valores es `src/app/globals.css` (`@theme`); este documento explica cómo usarlos.

## Dirección

Maqueta de la Guía de Identidad Urbana llevada a un tablero vivo: hero oscuro a sangre con el titular rector y, montado encima, un **bento asimétrico** de tarjetas blancas donde conviven el avance del plan, la participación, los anuncios y los accesos. Bloques de distinto tamaño, nada de secciones apiladas de borde a borde ni franjas decorativas. Movimiento al servicio del contenido: entradas al hacer scroll, el termómetro que se llena, carriles horizontales.

## Color

| Token                            | Valor                          | Uso                                                                         |
| -------------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| `rojo`                           | `#C32026`                      | Acción principal, fase en curso, marca                                      |
| `rojo-oscuro`                    | `#A61C00`                      | Hover de rojo, fondos de anuncio                                            |
| `naranja`                        | `#F39200`                      | Acentos, 404, íconos sobre fondo oscuro. Nunca texto blanco encima          |
| `amarillo`                       | `#ECA52B`                      | «PDUL YA:» del hero, anuncios cálidos (texto `noche`)                       |
| `noche`                          | `#232A36`                      | Hero, mensaje del alcalde, títulos                                          |
| `tinta`                          | `#333333`                      | Texto de cuerpo (`tinta/70` como mínimo para secundarios sobre blanco)      |
| `papel` / `superficie` / `linea` | `#FFF` / `#F7F7F8` / `#E5E7EB` | Tarjetas / fondo de página / bordes                                         |
| `exito` / `exito-oscuro`         | `#28A745` / `#1D6E33`          | Sello «oficial»: punto con `exito`, texto con `exito-oscuro` (contraste AA) |
| `plata`, `gris`                  |                                | Divisores. `gris` no pasa AA como texto sobre blanco                        |

## Tipografía

Montserrat (`font-display`, 600–800) para títulos, botones y cifras; Roboto (`font-sans`, 400–700) para el cuerpo. Titulares grandes con `clamp()` y `tracking` negativo; h1–h3 con `text-wrap: balance`.

## Forma y profundidad

- Tarjetas: `rounded-tarjeta` (1.25rem) + `shadow-tarjeta`; al pasar el cursor, `-translate-y-1` + `shadow-elevada`.
- Botones: `rounded-xl`, alto mínimo 48 px, `active:scale-[0.97]`.
- Íconos: `lucide-react`; en tarjetas de color, un ícono grande de trazo fino (`strokeWidth={1}`) y baja opacidad como textura. Redes sociales en `src/components/icons.tsx`.

## Retícula

- Contenedor `max-w-7xl` con `px-4 sm:px-6 lg:px-8`.
- Bento: 12 columnas en `lg`, 6 en `md` con `grid-flow-dense`, una columna en móvil (orden: termómetro → opinión → anuncios → accesos → mensaje).
- El bento se superpone al hero (`-mt-24 lg:-mt-32`, `z-10`).

## Movimiento (`globals.css`)

Todo bajo `prefers-reduced-motion: no-preference`; las animaciones ligadas al scroll, además, bajo `@supports (animation-timeline: view())`, así que sin soporte el contenido queda visible y quieto.

- `.revelar`: entrada al entrar en pantalla.
- `.hero-fondo`: leve acercamiento del fondo con el scroll.
- `.cascada`: hijos que entran escalonados.
- `.llenar`: barra del termómetro.
- `.pulso`: fase en curso.
- `.flotar`: isotipo.
- Easing: `ease-out-expo`.

## Componentes

- Layout:
  - un solo encabezado, `SiteHeader` (PDUL YA, navegación y botones), con `MobileNav`;
  - `SiteFooter` claro: PDUL YA a la izquierda; logo de la Alcaldía, alcalde y marcas de gestión a la derecha (el logo no se lee sobre fondo oscuro).
  - El mensaje del alcalde vive en el bento del Inicio (`MayorTile`).
- Inicio (`src/components/home/`):
  - `Hero`: acepta `foto`; mientras no haya foto usa el fondo `.patron-urbano`.
  - `Tile`
  - `ThermometerTile`
  - `OpinionTile`, `AccessTile`, `MayorTile`
  - `BannersTile`/`BannerCarousel`: autoplay de 7 s, pausa con hover, foco o un botón.
  - `NewsRail` + `RailControls`
  - `ActorsSection`, `ValuesSection`
- Noticias (`src/components/noticias/`):
  - `EncabezadoPagina`: banda oscura con migas y título; el contenido se monta encima, como en el Inicio.
  - `FiltrosNoticias`: búsqueda, categoría y fechas sincronizadas con la URL, más pestañas por formato con conteos; funcionan sin JavaScript.
  - `MosaicoNoticias`: cada formato tiene pieza y tamaño propios (galería 2×2, video 2×2, foto 1×2, texto 2×1, documento 1×1). `src/lib/noticias/mosaico.ts` las acomoda en 4 columnas (2 en tablet) y estira las vecinas para que nunca queden huecos. En teléfono, una columna.
  - Detalle por formato: `FiguraNoticia`, `Galeria` (visor con `<dialog>`, teclado y deslizamiento), `ReproductorVideo` (archivo con `<video>` nativo y subtítulos; YouTube sin cookies que solo carga al pulsar reproducir; Instagram se abre en Instagram), `BloquePuntos` («Puntos de análisis» de la plantilla) y `BotonNoticia`, `VisorDocumento` + `VistaPdf` (solo si el navegador tiene visor de PDF) y `CuerpoNoticia` (`.prosa`, HTML saneado en el servidor).
  - `NewsCard`: tarjeta uniforme para el carril del Inicio y «Más noticias».
  - Toda foto que no sea de la Alcaldía muestra `CreditoImagen` (autor, licencia y fuente).
- Compartidos de listado (`src/components/listado/`): `SelectorFechas` (rango con atajos y calendario en español sobre react-day-picker, estilizado con los tokens; hoja inferior en teléfono, Esc y clic fuera cierran), `Paginacion` (recibe la función que arma cada URL) y `TransicionListado`/`ZonaResultados` (los resultados anteriores quedan atenuados mientras cargan los nuevos). `EncabezadoPagina` vive en `src/components/layout/`.
- Documentos (`src/components/documentos/`): `FiltrosDocumentos` (columna fija en escritorio, `<details>` plegable en teléfono, funciona sin JavaScript), `FilaDocumento` (hoja con sello de color, datos del archivo y descarga directa), `SelloEstado` (verde `exito-oscuro` para oficial, amarillo para borrador). El detalle reutiliza `VisorDocumento` y suma el historial de versiones.
- Conoce el PDUL (`src/components/conoce/`): `Indice` (marca la sección visible con `IntersectionObserver`; carril horizontal en teléfono) y `FasesPdul` (línea de tiempo de las 7 fases con la actual marcada).
- Estados:
  - `src/components/ui/skeleton.tsx` (`Skeleton`, `SkeletonText`, `SkeletonCard`, `LoadingStatus`);
  - skeletons a medida en `home/skeletons.tsx`;
  - `app/loading.tsx`, `app/not-found.tsx`, `app/error.tsx`.

## Pendientes de marca

Fotos propias de la Alcaldía (el hero usa por ahora una foto CC BY-SA con crédito), logos de Yanys Agüero, Iribarren para la Vida y Gente que Resuelve, y el texto oficial del alcalde.
