# portal-iribarren

Portal ciudadano de la Alcaldía de Iribarren para el proceso del PDUL. Los visitantes consultan noticias, documentos y propuestas publicadas; los ciudadanos registrados completan su perfil, envían opiniones y propuestas, y siguen su estado.

> **¿Retomas el proyecto en otro equipo o en una conversación nueva?** Lee primero [`docs/CONTEXTO.md`](docs/CONTEXTO.md): estado, decisiones, pendientes del portal y del admin, y el contrato supuesto con la API.

La aplicación no llama a la API desde el navegador: lo hace desde su propio servidor Next.js (BFF), que se identifica ante `plataforma-api` con las credenciales del portal (`PORTAL_CLIENT_ID` y `PORTAL_CLIENT_SECRET`).

## Requisitos

- Node.js 24 o superior
- pnpm 12

## Puesta en marcha

```bash
pnpm install
cp .env.example .env.local   # completa los valores
pnpm dev                     # http://localhost:3000
```

| Comando          | Qué hace                                                             |
| ---------------- | -------------------------------------------------------------------- |
| `pnpm dev`       | Servidor de desarrollo en el puerto 3000                             |
| `pnpm build`     | Compilación de producción                                            |
| `pnpm start`     | Sirve la compilación en el puerto 3000                               |
| `pnpm lint`      | ESLint, sin advertencias permitidas                                  |
| `pnpm typecheck` | Chequeo de tipos de TypeScript                                       |
| `pnpm test`      | Pruebas unitarias con Vitest (`pnpm test:watch` en modo observación) |
| `pnpm test:e2e`  | E2E y auditoría WCAG 2.1 AA con Playwright y axe (ver abajo)         |
| `pnpm format`    | Formatea todo con Prettier (`pnpm format:check` solo verifica)       |

Al hacer commit, Husky ejecuta lint-staged: ESLint y Prettier sobre los archivos modificados.

## Variables de entorno

Ver [`.env.example`](.env.example). Los archivos `.env*` no se suben al repositorio, salvo `.env.example`.

**Para el despliegue de demostración en Netlify** (mientras no exista plataforma-api):

| Variable         | Valor                      | Para qué                                                                                                                             |
| ---------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `SESION_SECRETO` | Una cadena larga aleatoria | Firma la cookie de sesión: cualquier instancia de la función la valida, así no hay parpadeos ni salidas de sesión al navegar.        |
| `DEMO`           | `1`                        | El registro entra directo sin el paso del correo, los enlaces de recuperación se ven en pantalla y aparece la cinta de demostración. |

Limitación conocida: los aportes que se envían en la demo siguen en la memoria de cada instancia y pueden reiniciarse. La sesión y el perfil viajan firmados en la cookie y no se pierden.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Zod · ESLint · Prettier · Vitest. Código fuente en `src/`, con el alias `@/*`.

- **Validaciones:** `src/lib/validation/common.ts` reúne las reglas compartidas (cédula, RIF, teléfono, correo, contraseña y archivos) y debe mantenerse idéntico en `plataforma-admin` y `portal-iribarren`. Los formularios de este proyecto están en `src/lib/validation/schemas.ts`.
- **Variables de entorno:** `src/env.ts` las valida con Zod en el servidor (`env()`), y solo se importa desde código de servidor.

## Estados de carga, error y 404

- Toda página nueva lleva su `loading.tsx` con un skeleton de la misma forma que el contenido (primitivas en `src/components/ui/skeleton.tsx`).
- Los bloques que piden datos se envuelven en `<Suspense>` con su propio skeleton, para que la página cargue por partes (ver `src/app/page.tsx`).
- Las rutas inexistentes usan `src/app/not-found.tsx` y los fallos `src/app/error.tsx` (con «Reintentar»).
- Para ver los skeletons con los datos de ejemplo, define `MOCK_DELAY_MS=1500` en `.env.local` (solo en desarrollo).

## Cuenta del ciudadano (simulada)

Mientras no exista `plataforma-api`, el registro, el acceso, el perfil y la participación usan una autenticación simulada en memoria (`src/lib/auth/`), con las mismas reglas de `/portal/auth/*`. Se reinicia al reiniciar el servidor.

- Rutas: `/registro`, `/registro/revisa-tu-correo`, `/verificar`, `/ingresar`, `/unirme`, `/recuperar`, `/restablecer`, `/mi-cuenta` (perfil), `/mi-cuenta/seguridad` (contraseña y cuenta), `/participa` y `/participa/enviada`.
- Los archivos se validan en el navegador y en el servidor, pero el simulador solo guarda su nombre, tipo y peso. Perfil: PDF, JPG o PNG de hasta 2 MB. Participación: hasta 5 fotos (JPG, PNG o WebP de 2 MB), un enlace de video de YouTube o Instagram y un documento de soporte (obligatorio en la propuesta formal).
- En desarrollo, el enlace que en producción llega por correo aparece en un recuadro «Solo en desarrollo».
- El perfil queda **verificado automáticamente** al completarse. El Revisor del admin no verifica perfiles: coteja los documentos de identidad del autor al evaluar cada opinión o propuesta.
- Cuentas de demostración (contraseña `Iribarren#2026`):

| Correo                  | Caso                                                   |
| ----------------------- | ------------------------------------------------------ |
| `ana@ejemplo.com`       | Persona verificada, perfil completo: puede participar  |
| `jose@ejemplo.com`      | Persona con el perfil vacío: recorre el asistente      |
| `rosa@ejemplo.com`      | Perfil a medias: tiene el teléfono, falta la cédula    |
| `luis@ejemplo.com`      | Correo sin verificar                                   |
| `carla@ejemplo.com`     | Cuenta de otra alcaldía: pasa por «Unirme a Iribarren» |
| `contacto@cardones.org` | Organización con perfil incompleto                     |

- Enlaces de ejemplo: `/verificar?token=demo-vencido` y `/verificar?token=demo-usado`.
- Hay 7 participaciones de ejemplo (`IRI-2026-0001` a `0007`): 5 de Ana en todos los estados, para ver «Mis participaciones» (`/mi-cuenta/participaciones`), y 3 publicadas, para la galería pública `/propuestas`. Los aportes nuevos siguen desde `IRI-2026-0008` y la numeración vuelve a empezar al reiniciar el servidor.

## Pruebas E2E y accesibilidad

`e2e/` tiene el flujo completo del ciudadano (registro → verificar → perfil → propuesta → cambio de estado), la auditoría WCAG 2.1 AA con axe-core y las pruebas de teclado y reflujo, en escritorio y a 375 px. Corren contra `pnpm dev` (lo levantan o reutilizan el que esté abierto). La primera vez: `pnpm exec playwright install chromium`. Detalle, hallazgos y revisión manual en [`docs/ACCESIBILIDAD.md`](docs/ACCESIBILIDAD.md).

En desarrollo, `POST /api/desarrollo/participaciones/{folio}/estado` con `{ "estado": "EN_REVISION", "comentario": "…" }` simula al Revisor del admin (en producción responde 404).

## Integración continua

`.github/workflows/ci.yml` se ejecuta en cada pull request y en cada push a `main`: Prettier, ESLint, TypeScript, Vitest y `next build`, y en un trabajo aparte las pruebas de Playwright (con su informe como artefacto). Dependabot propone actualizaciones semanales de dependencias y de acciones.

## Herramientas de diseño para Claude Code

El repositorio incluye, en `.claude/`, skills y un servidor MCP que Claude Code carga al abrir el proyecto:

| Herramienta                                                                      | Para qué                                                                           |
| -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `emil-design-eng` ([Emil Kowalski](https://github.com/emilkowalski/skills))      | Criterios de animación, curvas, duraciones y microinteracciones                    |
| `design-taste-frontend` ([Taste Skill](https://github.com/Leonxlnx/taste-skill)) | Dirección de arte contra el diseño genérico, pensada para páginas públicas         |
| `impeccable` ([Impeccable](https://github.com/pbakaus/impeccable))               | Jerarquía, espaciado, tipografía y auditorías de diseño; incluye agentes revisores |
| Playwright MCP (`.mcp.json`)                                                     | Permite a Claude abrir el sitio en un navegador, probarlo y tomar capturas         |

Impeccable también instala hooks que revisan la UI tras cada edición. Son configuración personal (`.claude/settings.local.json`, fuera del repositorio): quien los quiera debe ejecutar una vez, dentro del proyecto:

```bash
npx impeccable@4.6.0 install --project --providers=claude -y
```

Las versiones de las skills quedan registradas en `skills-lock.json`. Para actualizarlas: `npx skills update -p` y `npx impeccable update`.

## Vincular con GitHub

```bash
git remote add origin https://github.com/<usuario-u-organizacion>/portal-iribarren.git
git push -u origin main
```
