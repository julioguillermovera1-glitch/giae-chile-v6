# GIAE Chile v1.0 · Plan de almacenamiento en nube

## Estado actual
La Etapa 2.7 implementa una biblioteca local de proyectos en el navegador y exportación/importación `.giae`. Esto permite trabajar sin backend mientras se desarrolla la plataforma.

## Producción en Cloudflare

### Cloudflare D1
Se usará para datos estructurados:
- usuarios
- empresas
- roles y permisos
- licencias
- metadatos de proyectos
- historial de actividad
- índice de archivos almacenados

### Cloudflare R2
Se usará para archivos:
- respaldos `.giae`
- logos de empresa
- plantillas de cotización
- informes PDF
- imágenes de materiales
- adjuntos de proyectos

### Cloudflare Workers
Se usará como API:
- autenticar usuarios
- guardar proyectos
- abrir proyectos
- sincronizar cambios
- registrar historial
- aplicar permisos por perfil

## Regla de diseño
El archivo `.giae` seguirá existiendo aunque el proyecto esté en la nube. Debe servir como respaldo portable y formato de intercambio entre instaladores, empresas y estudiantes.

## Base Fase 4 incorporada

La Fase 4 agrega una capa local cloud-ready:

- `core/cloud/cloudWorkspaceEngine.js` prepara readiness, licencia, roles, contrato y cola sync.
- `modules/nube/nube.js` permite revisar y descargar contrato o paquete de sincronizacion.
- `data/cloud/cloud-contract.json` declara endpoints Worker, bindings D1/R2 y roles.
- `data/cloud/d1-schema.json` declara el modelo de tablas.
- `data/cloud/r2-assets.json` declara la politica de archivos.

No se deben guardar tokens ni secretos en el navegador. La autenticacion real, validacion de licencia y escritura en D1/R2 quedan para el Worker.