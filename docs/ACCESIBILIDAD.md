# Accesibilidad (WCAG 2.1 AA) y pruebas E2E

Backlog 3.13. Fecha de la auditoría: 18 de octubre de 2026.

## Cómo se comprueba

| Prueba                        | Qué cubre                                                                                                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/flujo-ciudadano.spec.ts` | Registro → verificar el correo → completar el perfil → enviar una propuesta formal → ver el cambio de estado y el comentario del revisor                                                                             |
| `e2e/accesibilidad.spec.ts`   | axe-core con las reglas WCAG 2.0 y 2.1 A y AA en 40 pantallas y estados: públicas, con sesión (las 5 cuentas de demostración), errores de formulario, selector abierto, diálogo de confirmación y calendario abierto |
| `e2e/teclado.spec.ts`         | Lo que axe no mide: «Saltar al contenido», foco visible, carrusel con pausa, diálogo con Escape y retorno del foco, selector solo con teclado y reflujo a 320 px                                                     |

Todo corre en dos tamaños: escritorio y teléfono de 375 px.

```bash
pnpm test:e2e                                   # todo (levanta o reutiliza pnpm dev)
pnpm exec playwright test e2e/accesibilidad.spec.ts --project=movil
pnpm exec playwright test --ui                  # modo interactivo
```

La primera vez hay que instalar el navegador: `pnpm exec playwright install chromium`.

### Por qué corre contra `next dev`

Mientras no exista plataforma-api, el flujo depende del simulador de desarrollo:

- el enlace de verificación aparece en pantalla, en el recuadro «Solo en desarrollo»;
- el Revisor se simula con `POST /api/desarrollo/participaciones/{folio}/estado`, que aplica las mismas transiciones que el admin (`TRANSICIONES` en `src/lib/auth/servicio.ts`) y responde 404 en producción.

Cuando llegue la API, la E2E leerá el enlace desde un buzón de pruebas (por ejemplo Mailpit) y el cambio de estado se hará con la API del admin; las pantallas no cambian.

### Por qué axe corre con `prefers-reduced-motion: reduce`

Las entradas ligadas al scroll (`.revelar`, `animation-timeline: view()`) dejan semitransparente el contenido que aún no se ha desplazado, y axe lo mediría a mitad del fundido. Con movimiento reducido el portal muestra todo en su estado final, que es lo que se ve tras desplazarse.

## Hallazgos de la auditoría y correcciones

axe encontró solo problemas de **contraste (1.4.3)**; el resto de reglas pasó en todas las pantallas.

| Dónde                                                                    | Antes                                   | Después                                                                           |
| ------------------------------------------------------------------------ | --------------------------------------- | --------------------------------------------------------------------------------- |
| Texto «Selecciona…» del selector propio y del rango de fechas            | `text-tinta/60` (3,7:1)                 | `text-tinta/70` (4,9:1)                                                           |
| Placeholders de campos y buscadores                                      | `text-tinta/45` o el gris del navegador | `text-tinta/70`                                                                   |
| Días de la semana del calendario                                         | `text-tinta/60`                         | `text-tinta/75`                                                                   |
| Botones de formato de noticias y categorías de documentos sin resultados | `opacity-50` (hasta 1,2:1)              | Texto `tinta/75–80` y borde punteado: siguen distinguiéndose sin perder contraste |
| Chip de categoría sobre tarjetas rojas o con foto                        | `bg-papel/20` (4,3:1 sobre rojo)        | `bg-noche/30`                                                                     |
| «Aportes de ejemplo» y «Documentos de ejemplo»                           | `text-tinta/55–60`                      | `text-tinta/75`                                                                   |
| Número de las fases futuras (Conoce) y nombre de fase del termómetro     | `text-tinta/60–65`                      | `text-tinta/75`                                                                   |
| Conteo por estado en Documentos                                          | `opacity-70` sobre `tinta/80`           | Sin opacidad                                                                      |

Regla práctica: sobre blanco o `superficie`, el texto en `tinta` no baja de **/70** (y de /75 si es pequeño sobre `superficie`).

## Texto alternativo

Toda imagen describe lo que muestra (`alt` de `Imagen` en `src/lib/api/types.ts`): portadas del mosaico y de las tarjetas, fotos de galería, banners, portada de video, la foto del hero y los logotipos. Las vistas previas de archivos dicen «Vista previa de <nombre>». La auditoría falla si una imagen del encabezado o del contenido queda con `alt` vacío; al cargar noticias desde el admin, el campo de texto alternativo debe ser obligatorio.

## Carrusel del Inicio (2.2.2)

Rota cada 7 s y se detiene con el puntero o el foco dentro. El punto activo se llena como barra de progreso y se congela en pausa. «Pausar» lo detiene; «Reanudar» avanza enseguida y sigue rotando aunque el puntero esté encima, hasta que salga. Con movimiento reducido no rota.

## Revisión manual (lo que ninguna herramienta cubre)

Hecho:

- teclado en los flujos de registro, ingreso, perfil y participación; foco visible en todo el Inicio;
- diálogos nativos (`<dialog>`): el foco entra en «Cancelar», Escape cierra y el foco vuelve al botón que lo abrió;
- el carrusel se pausa y se maneja con teclado; con movimiento reducido no avanza solo;
- reflujo a 320 px sin scroll horizontal en las páginas públicas y el registro;
- `lang="es"`, títulos por página y enlace para saltar al contenido.

Pendiente de revisar con un lector de pantalla real (NVDA en Windows y VoiceOver en iOS):

- anuncios de `aria-live` al filtrar listados y al copiar el folio;
- lectura del selector propio en la hoja inferior del teléfono;
- el visor de PDF de la Gaceta (el PDF en sí no es accesible: conviene ofrecer también el texto).

Fuera del alcance de axe y por decidir con diseño:

- los puntos inactivos del carrusel (`opacity-45`) sobre fotos claras pueden quedar bajo 3:1 (1.4.11);
- a unos 800 px de ancho, «Conoce el PDUL» del menú principal se parte en tres líneas.
