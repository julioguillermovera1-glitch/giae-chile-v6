# GIAE Chile v3.2.5.3 – Fix Botones

**Creador y Autor Principal:** Julio Vera Concha

## Objetivo

Restaurar respuesta de botones, menú lateral y accesos rápidos sin tocar el archivo principal `js/app.js`.

## Cambios

- Se agrega `js/giae-fix-botones.js`.
- Se actualiza `index.html` e `indice.html` para cargar el parche.
- Se agrega cache busting `?v=3.2.5.3`.
- Se mantiene `wrangler.jsonc`.
- No se usa `_redirects`.

## Despliegue

Usar en Cloudflare Worker:

```txt
npx wrangler deploy
```

## Prueba rápida

Después de publicar, probar:

1. Menú lateral.
2. Accesos rápidos.
3. Botón Proyecto.
4. Botón Cargas.
5. Botón Unilineal.
