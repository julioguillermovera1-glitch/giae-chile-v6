# GIAE Chile v3.2.5.1 – Corrección Cloudflare Worker

**Creador y Autor Principal:** Julio Vera Concha

## Problema corregido

Cloudflare Worker falló porque el archivo `_redirects` contenía:

```txt
/* /index.html 200
```

En Workers Static Assets esa regla puede generar un bucle infinito.

## Cambios

- Se eliminó `_redirects`.
- Se eliminó `_headers`.
- Se agregó `.assetsignore`.
- Se agregó `wrangler.jsonc`.

## Cómo desplegar en Cloudflare Worker

Usar el comando actual:

```txt
npx wrangler deploy
```

## Importante

No agregar nuevamente `_redirects` mientras se publique como Worker.
Si se usa Cloudflare Pages, se puede revisar otra configuración distinta.
