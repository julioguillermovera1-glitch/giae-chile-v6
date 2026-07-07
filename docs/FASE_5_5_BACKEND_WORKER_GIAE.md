# Fase 5.5 - Backend Worker real para GIAE

## Objetivo

Convertir GIAE desde una PWA estatica pura hacia una aplicacion hibrida: frontend PWA + Cloudflare Worker API + D1 + R2.

## Decision tecnica

Se mantiene la interfaz actual, `index.html`, `sw.js` y la instalacion PWA. Se agrega un Worker real en `src/worker.js` para atender `/api/giae/*` y usar bindings de Cloudflare.

## Archivos agregados

- `src/worker.js`: API Worker real.
- `migrations/0001_giae_cloud_core.sql`: esquema D1 inicial.
- `package.json`: scripts Wrangler.
- `.assetsignore`: evita subir codigo backend como asset estatico.
- `tools/phase55-worker-backend-check.mjs`: diagnostico local.

## Endpoints iniciales

- `GET /api/giae/health`
- `POST /api/giae/session/start`
- `POST /api/giae/license/check`
- `GET /api/giae/workspaces/:workspaceId`
- `GET /api/giae/projects/:projectId`
- `POST /api/giae/projects/:projectId/sync`
- `POST /api/giae/files/presign`
- `GET /api/giae/audit`

## Bindings esperados

- D1: `GIAE_DB`
- R2: `GIAE_PROJECT_BACKUPS`
- R2: `GIAE_PROJECT_DOCUMENTS`
- R2: `GIAE_BRAND_ASSETS`
- R2: `GIAE_FIELD_MEDIA`
- Assets: `ASSETS`

## Seguridad

El navegador no guarda secretos. Las rutas de escritura quedan bloqueadas si no existe el secreto `GIAE_API_TOKEN` en Cloudflare.

Comando recomendado:

```text
wrangler secret put GIAE_API_TOKEN
```

## Pendiente obligatorio antes de desplegar en produccion

En `wrangler.jsonc`, reemplazar:

```text
REEMPLAZAR_CON_DATABASE_ID_D1
```

por el `database_id` real de la base D1 creada en Cloudflare.

## Limite honesto

Esta etapa crea backend real y migracion inicial. Login completo, sesiones fuertes, usuarios comerciales y razonamiento IA quedan para Fase 6.