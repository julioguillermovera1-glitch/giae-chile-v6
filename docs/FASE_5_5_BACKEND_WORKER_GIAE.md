# Fase 5.5 - Backend Worker real para GIAE

## Objetivo

Convertir GIAE desde una PWA estatica pura hacia una aplicacion hibrida: frontend PWA + Cloudflare Worker API + D1 + R2.

## Decision tecnica

Se mantiene la interfaz actual, `index.html`, `sw.js` y la instalacion PWA. Se agrega un Worker real en `src/worker.js` para atender `/api/giae/*`.

El despliegue actual queda en modo seguro: Worker + Static Assets publicables, sin activar bindings D1/R2 con valores de ejemplo. Esto evita que Cloudflare rechace la publicacion mientras aun falta pegar el `database_id` real de D1.

## Archivos agregados

- `src/worker.js`: API Worker real.
- `migrations/0001_giae_cloud_core.sql`: esquema D1 inicial.
- `package.json`: scripts Wrangler.
- `.assetsignore`: evita subir codigo backend y configuracion como asset estatico.
- `wrangler.bindings.example.jsonc`: plantilla D1/R2 para activar cuando existan los recursos reales.
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

## Bindings preparados

- Assets activo: `ASSETS`
- D1 preparado: `GIAE_DB`
- R2 preparado: `GIAE_PROJECT_BACKUPS`
- R2 preparado: `GIAE_PROJECT_DOCUMENTS`
- R2 preparado: `GIAE_BRAND_ASSETS`
- R2 preparado: `GIAE_FIELD_MEDIA`

`wrangler.jsonc` queda listo para publicar el Worker y la PWA. La plantilla `wrangler.bindings.example.jsonc` conserva los bindings de D1/R2 sin activarlos todavia.

## Activacion D1/R2

Cuando Cloudflare entregue el `database_id` real de D1:

1. Copiar los bloques `d1_databases` y `r2_buckets` desde `wrangler.bindings.example.jsonc` hacia `wrangler.jsonc`.
2. Reemplazar `REEMPLAZAR_CON_DATABASE_ID_D1` por el ID real.
3. Cambiar `GIAE_BINDINGS_MODE` desde `pending` a `active`.
4. Crear el secreto `GIAE_API_TOKEN` en Cloudflare.
5. Ejecutar la migracion D1 remota.

Comando recomendado para el secreto:

```text
wrangler secret put GIAE_API_TOKEN
```

## Seguridad

El navegador no guarda secretos. Las rutas de escritura quedan bloqueadas si no existe el secreto `GIAE_API_TOKEN` en Cloudflare.

## Limite honesto

Esta etapa crea backend real y migracion inicial. Login completo, sesiones fuertes, usuarios comerciales y razonamiento IA quedan para Fase 6.