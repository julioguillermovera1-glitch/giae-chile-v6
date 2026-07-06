# Propuesta para llevar GIAE Chile a primera version publicable

Fecha: 2026-07-06  
Autor intelectual y director del proyecto: Julio Guillermo Vera  
Alcance: repositorio giae-chile-v6

## Regla principal de originalidad

GIAE Chile debe crecer como obra propia. Para evitar plagio y codigo redundante:

- No copiar codigo desde internet, repositorios, foros, videos, ejemplos comerciales ni respuestas de otras IA.
- No pegar bloques de codigo generados en otros contextos, aunque sean funcionales. Cada pieza nueva debe nacer desde los requisitos de GIAE, el estilo del repositorio y una implementacion propia.
- Usar documentacion oficial solo para entender APIs, formatos o restricciones tecnicas, no para copiar implementaciones.
- Si se usa una libreria abierta, debe quedar registrada con licencia, finalidad y motivo tecnico en THIRD_PARTY_LICENSES.md.
- No duplicar motores, tablas, formularios ni reglas. Si dos modulos necesitan lo mismo, debe existir una fuente comun en core/ o data/.
- Todo calculo electrico debe separar: dato ingresado, supuesto usado, regla aplicada, resultado preliminar y verificacion real.

## Diagnostico resumido

El proyecto ya tiene una base valiosa:

- 21 modulos registrados y todos con archivo presente.
- Arquitectura modular real en core/ y modules/.
- Motores activos para proyecto, cargas, ingenieria, tablero, tierra, empalme, presupuesto, documentacion y auditoria.
- JSON validos y JavaScript sin errores de sintaxis.
- Base normativa RIC inicial amplia y politica de no inventar.
- Estructura Cloudflare preparada con wrangler.jsonc.

Pero todavia no esta listo como version publica:

- No hay instalador PC ni app movil empaquetada.
- No hay manifest, service worker ni estructura PWA instalable.
- No hay backend real de usuarios, licencias, empresas ni sincronizacion.
- El panel de usuarios es visual/local; la autenticacion real queda pendiente.
- DS8 existe como fuente permitida, pero sus reglas activas estan vacias o pendientes.
- Los datos normativos estan repartidos en varias rutas: data/, docs/data/ y data/data/.
- js/app.js conserva una version historica grande de casi 1 MB; no parece ser la entrada activa, pero aumenta ruido y riesgo de mantenimiento.
- La documentacion oficial de version, changelog, licencias y estado real aun esta fragmentada.
- No existe suite de pruebas automatizadas ni checklist de publicacion.

## Objetivo de la primera version publicable

Publicar una version honesta, estable y util, no una version que prometa mas de lo que puede validar.

Nombre sugerido:

GIAE Chile v1.0 Publicable - Edicion Local Inteligente

Debe permitir:

- Crear y guardar proyectos electricos locales.
- Ingresar cargas y generar cuadro de carga preliminar.
- Proponer tablero, empalme, puesta a tierra, presupuesto y documentacion base.
- Auditar el proyecto con trazabilidad y advertencias claras.
- Exportar respaldo .giae.
- Funcionar en navegador y quedar preparada para instalacion PC/celular mediante PWA o empaquetado posterior.

No debe prometer aun:

- Declaracion SEC automatica final.
- Cumplimiento DS8 completo si las reglas no estan cargadas.
- Sincronizacion multiusuario real.
- Licenciamiento productivo.
- App Store / Play Store lista.
- Reemplazo del instalador autorizado, SEC, distribuidora o mediciones reales.

## Fase 0 - Congelar base y limpiar riesgo

Prioridad: muy alta.

Acciones:

- Definir una sola entrada activa: index.html + core/main.js + css/platform.css.
- Marcar js/app.js y css/styles.css como legado o moverlos a una carpeta historica si no son usados por la version nueva.
- Mantener indice.html solo si cumple una funcion real; si es copia de index.html, dejarlo documentado como alias o retirarlo.
- Mantener README.md, CHANGELOG.md, NOTICE.md, THIRD_PARTY_LICENSES.md y docs/ORIGINALIDAD.md alineados con el estado real.
- Crear un checklist de publicacion con pruebas minimas.
- Prohibir nuevas funciones hasta cerrar esta estabilizacion.

Resultado esperado:

- Repositorio entendible.
- Menos ruido historico.
- Menos riesgo de editar el archivo equivocado.

## Fase 1 - Producto local publicable

Prioridad: muy alta.

Acciones:

- Convertir GIAE en PWA instalable: manifest, iconos propios, pantalla offline y service worker propio.
- Mantener exportacion/importacion .giae como respaldo principal.
- Agregar pantalla de estado del proyecto con semaforo real: datos, cargas, cuadro, tablero, tierra, empalme, documentacion, presupuesto y auditoria.
- Agregar modo publicable local que oculte funciones no terminadas o las marque como futuras.
- Revisar textos visibles para que no prometan 100% operativo donde aun hay pendientes.

Resultado esperado:

- La pagina puede instalarse desde Chrome/Edge como app.
- En celular se puede usar como PWA inicial.
- El usuario entiende que es una herramienta tecnica preliminar y honesta.

## Fase 2 - Inteligencia tecnica responsable

Prioridad: alta.

Acciones:

- Crear un Engine Bus interno para que los motores compartan resultados sin recalcular de mas.
- Estandarizar todos los motores con el mismo contrato: inputs, assumptions, summary, materials, normativeTrace, observations, confidence y requiresFieldVerification.
- Mejorar cada motor por orden: cargas, conductores, tableros, tierra, empalme, documentacion, presupuesto y auditoria.
- Agregar explicacion tecnica por resultado: por que propone esto.
- Separar calculo preliminar de validacion final en todos los modulos.

Resultado esperado:

- GIAE empieza a sentirse realmente inteligente, pero sin inventar cumplimiento.

## Fase 3 - Norma Chile y DS8

Prioridad: alta.

Acciones:

- Definir una unica carpeta oficial para reglas activas.
- Dejar las demas como legacy, docs o fuentes.
- Completar reglas DS8 base con estructura propia, sin copiar texto legal completo.
- Cruzar cada regla con documento, apartado referencial, motor que la usa, datos requeridos, mensaje al usuario y nivel de confianza.
- Mantener NCh4 solo como referencia historica excluida.
- Crear cobertura visible: RIC cargado, reglas activas, reglas pendientes y modulos afectados.

Resultado esperado:

- GIAE puede decir con claridad que reglas tiene implementadas y cuales no.

## Fase 4 - Nube, usuarios y licencias

Prioridad: media-alta, despues de estabilizar la app local.

Acciones:

- Implementar API propia en Cloudflare Workers.
- Usar D1 para usuarios, empresas, roles, licencias, proyectos y auditoria de cambios.
- Usar R2 para respaldos .giae, logos, imagenes, informes y evidencias de terreno.
- Crear autenticacion real: administrador, empresa, instalador, estudiante y aula gratuita.
- Separar permisos por rol.
- Mantener modo local/offline aunque exista nube.

Resultado esperado:

- Plataforma multiusuario real, no solo localStorage.

## Fase 5 - Instalador PC y celular

Prioridad: media, despues de tener PWA estable.

Ruta recomendada:

1. Primero PWA instalable.
2. Luego empaquetado escritorio.
3. Luego app movil.

Opciones:

- PC Windows: PWA instalada desde Edge/Chrome como primera etapa; luego empaquetado dedicado con tecnologia revisada por licencia.
- Celular Android: PWA instalable como primera version; luego empaquetado Android si se justifica.
- iPhone: PWA desde Safari como primera etapa; App Store solo cuando haya backend, privacidad y soporte listos.

Resultado esperado:

- Instalacion realista sin quemar etapas ni prometer tiendas antes de tiempo.

## Fase 6 - Control de calidad

Prioridad: permanente.

Pruebas minimas antes de publicar:

- Sintaxis JavaScript completa.
- JSON valido.
- Prueba de crear proyecto.
- Prueba de agregar cargas.
- Prueba de cuadro de carga.
- Prueba de tierra con y sin medicion real.
- Prueba de presupuesto.
- Prueba de auditoria.
- Prueba de exportar e importar .giae.
- Prueba movil 390 px.
- Prueba escritorio 1366 px.
- Revision de textos: nada debe prometer cumplimiento final si falta dato o medicion.
- Revision de originalidad local.

## Decision recomendada

La mejor ruta no es agregar mas funciones de inmediato. La mejor ruta es:

1. Congelar una base publicable.
2. Limpiar legado y duplicidad.
3. Hacer PWA instalable.
4. Fortalecer motores y reglas.
5. Recien despues construir nube, licencias e instaladores avanzados.

GIAE Chile ya tiene corazon de producto. Ahora necesita disciplina de version, trazabilidad normativa y control de calidad para que la primera publicacion sea creible.
