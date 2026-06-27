# GIAE Chile v3.2.5.2 – Restauración Funcional

**Creador y Autor Principal:** Julio Vera Concha  
**Base:** GIAE Chile v3.2.4 Pantalla Única Responsiva

## Objetivo

Restaurar funcionamiento completo manteniendo `index.html` e `indice.html`, porque el manifiesto interno del sistema los reconoce.

## Cambios aplicados

- Se conserva `index.html`.
- Se conserva/restaura `indice.html`.
- Se elimina `_redirects` porque provocó error de bucle infinito en Cloudflare Workers.
- Se elimina `_headers` para evitar incompatibilidades con Worker.
- Se mantiene `js/app.js` sin modificar.
- Se mantiene `css/styles.css` sin modificar.
- Se agrega `.assetsignore`.
- Se agrega `wrangler.jsonc`.

## Despliegue Cloudflare Worker

Usar:

```txt
npx wrangler deploy
```

## Importante

No borrar `indice.html` todavía. Aunque sea igual a `index.html`, el sistema lo tiene registrado internamente.
