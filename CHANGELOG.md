# Changelog

## v2.9.0
- Agrega Auditoría Legal y Técnica.

## v3.2.5 – Limpieza Segura
- Base: v3.2.4 Pantalla Única Responsiva.
- Limpieza controlada sin tocar lógica eléctrica ni normativa.
- Se retira `indice.html` solo si es duplicado exacto de `index.html`.
- Se agregan archivos mínimos para despliegue estático en Cloudflare.
- Se documenta autoría y regla antiplagio.
- Fecha: 2026-06-27.

## v3.2.5.1 – Corrección Cloudflare Worker
- Se elimina `_redirects` porque Cloudflare Workers Static Assets lo rechazó por bucle infinito.
- Se elimina `_headers` para evitar reglas incompatibles en Worker.
- Se agrega `.assetsignore` para no subir `.git`, `.wrangler`, `node_modules` ni ZIP.
- Se agrega `wrangler.jsonc` explícito para Worker Static Assets.
- Fecha: 2026-06-27.
