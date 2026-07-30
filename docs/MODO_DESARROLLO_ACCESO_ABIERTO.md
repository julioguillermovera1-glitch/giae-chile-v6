# Modo desarrollo: acceso abierto

Fecha: 2026-07-29

## Que hace

Existe una sola bandera en `core/main.js`:

```js
const GIAE_DEV_ACCESO_ABIERTO = true;
```

Cuando esta en `true`:

1. **No pide claves.** Los perfiles "Empresa" y "Pueblos tecnicos" entran directo, sin el
   panel de correo y contrasena. Antes exigian credenciales que solo un administrador
   podia crear, asi que si no habias creado usuarios quedabas fuera de tu propio modulo.
2. **Muestra los 28 modulos** en el menu, incluidos los marcados `hiddenInMenu` (que
   normalmente solo aparecen al avanzar por el flujo guiado) y los de administracion.
3. **Muestra una franja naranja fija abajo** recordando que el modo esta activo.

Cuando esta en `false`, GIAE vuelve exactamente al comportamiento original. No se borro
nada de la logica de acceso: sigue completa y funcionando.

## Como desactivarlo antes de publicar

Cambiar la bandera a `false` en `core/main.js`:

```js
const GIAE_DEV_ACCESO_ABIERTO = false;
```

La franja naranja desaparece sola y vuelven a pedirse las credenciales.

## Por que se hizo asi y no borrando el login

Borrar la logica de acceso habria significado reescribirla despues, con riesgo de perder
el manejo de permisos por rol (`hasCompanyPermission`) que ya funciona. Una bandera unica
es reversible con una linea y deja rastro visible en pantalla, asi que no se puede
publicar por accidente sin notarlo.

## Advertencia importante

Este proyecto se despliega a Cloudflare con `npm run deploy`. **Si publicas con la bandera
en `true`, cualquier persona con la URL entra a todos los modulos, incluidos los de
administracion, sin ninguna clave.** Revisa siempre esta bandera antes de desplegar.

La proteccion del backend es independiente y no se toco: las rutas de escritura del Worker
siguen bloqueadas sin el secreto `GIAE_API_TOKEN`. Esta bandera solo afecta a la interfaz.

## Hallazgo relacionado

`core/main.js` ya etiquetaba el perfil como `"Pueblos tecnicos - acceso libre"`, pero el
codigo lo mandaba a un login con credenciales. La etiqueta y el comportamiento se
contradecian, y contradecian tambien la definicion del producto: el modulo de formacion
comunitaria para pueblos indigenas es gratuito y abierto a todos los pueblos.

**Decision pendiente:** cuando se desactive el modo desarrollo, hay que resolver si
"Pueblos tecnicos" vuelve a pedir clave o queda como acceso libre permanente igual que
"Aula educativa". Si el modulo es gratuito como esta definido, lo coherente es dejarlo
libre y sacarlo de la lista de perfiles con login en `core/main.js`. Esto tambien importa
para CONADI: ver `docs/ANALISIS_CONADI_2026_07_29.md`.
