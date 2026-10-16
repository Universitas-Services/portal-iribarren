# portal-iribarren

Portal ciudadano de la Alcaldía de Iribarren para el proceso del PDUL. Los visitantes consultan noticias, documentos y propuestas publicadas; los ciudadanos registrados completan su perfil, envían opiniones y propuestas, y siguen su estado.

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

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Servidor de desarrollo en el puerto 3000 |
| `pnpm build` | Compilación de producción |
| `pnpm start` | Sirve la compilación en el puerto 3000 |
| `pnpm lint` | ESLint |

## Variables de entorno

Ver [`.env.example`](.env.example). Los archivos `.env*` no se suben al repositorio, salvo `.env.example`.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS · ESLint. Código fuente en `src/`, con el alias `@/*`.

## Vincular con GitHub

```bash
git remote add origin https://github.com/<usuario-u-organizacion>/portal-iribarren.git
git push -u origin main
```
