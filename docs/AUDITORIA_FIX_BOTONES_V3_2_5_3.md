# Auditoría – Fix Botones GIAE v3.2.5.3

**Creador y Autor Principal:** Julio Vera Concha

## Problema reportado

Los botones y accesos rápidos no respondían correctamente después de la corrección Worker.

## Corrección aplicada

Se agregó un archivo externo:

```txt
js/giae-fix-botones.js
```

Este archivo reengancha los eventos de:

```txt
.nav-btn
.quick
```

También intenta regenerar menú, accesos rápidos, motores y RIC si quedan vacíos.

## Archivos tocados

- `index.html`
- `indice.html`
- `js/giae-fix-botones.js`
- `wrangler.jsonc`
- `.assetsignore`

## Archivos no modificados

```txt
js/app.js
css/styles.css
data/
assets/
```

## Nota

No se tocó la lógica eléctrica ni normativa.
