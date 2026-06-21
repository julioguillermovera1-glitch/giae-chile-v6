# GIAE Chile v6.1.1 Cloudflare Clean Deploy

**GIAE Chile**  
**Gestor Inteligente de Análisis para Empalmes**

Autor: Julio Vera Concha © 2026.

## Objetivo

Solucionar definitivamente el problema de despliegue en Cloudflare Workers.

## Problema anterior

Cloudflare intentaba subir `node_modules` como si fuera parte del sitio público, generando el error:

`Asset too large: node_modules/workerd/bin/workerd 119 MiB`

## Solución aplicada

La aplicación ahora queda dentro de la carpeta `public/`.

Cloudflare solo publicará:

- `public/index.html`
- `public/assets/`
- `public/css/`
- `public/data/`
- `public/js/`

Los archivos de configuración quedan fuera de `public/`:

- `package.json`
- `wrangler.jsonc`
- `.assetsignore`

## Configuración Cloudflare recomendada

Repositorio: `giae-chile-v6`  
Rama: `principal`

Comando de compilación:

`echo GIAE`

Comando de despliegue:

`npx wrangler deploy`

Comando de rama no productiva:

`npx wrangler versions upload`

Directorio raíz:

`/`

## Archivos/carpetas a subir

- `public/`
- `package.json`
- `wrangler.jsonc`
- `.assetsignore`
- `README.md`
- `VERSIONES.txt`
