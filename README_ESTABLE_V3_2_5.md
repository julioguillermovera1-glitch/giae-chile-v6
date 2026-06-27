# GIAE Chile v3.2.5 – Limpieza Segura

**Creador y Autor Principal:** Julio Vera Concha  
**Base:** GIAE Chile v3.2.4 Pantalla Única Responsiva

## Objetivo

Esta versión estabiliza la base recuperada sin cambiar la lógica principal del sistema.

## Cambios aplicados

- Se retiró `indice.html` únicamente si era duplicado exacto de `index.html`.
- Se agregaron `_redirects` y `_headers` para Cloudflare Pages.
- Se agregó auditoría de limpieza.
- Se mantiene intacto `js/app.js`.
- Se mantiene intacto `css/styles.css`.
- Se mantiene intacta la lógica eléctrica y normativa.

## Cloudflare Pages

Usar:

```txt
Build command: vacío
Build output directory: /
Root directory: /
```

## Regla de oro

GIAE Chile no debe plagiar código, textos, diseños, documentación ni lógica. Todo debe ser propio o contar con licencia compatible y registro.

## Flujo recomendado

1. Subir esta carpeta a un repositorio nuevo o rama estable.
2. Probar localmente.
3. Publicar en Cloudflare.
4. No agregar nuevas funciones hasta confirmar estabilidad.
