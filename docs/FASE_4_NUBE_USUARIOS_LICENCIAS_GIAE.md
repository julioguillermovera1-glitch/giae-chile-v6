# Fase 4 - Nube, usuarios, licencias y colaboracion GIAE

## Objetivo

Iniciar la base cloud-ready de GIAE sin romper el modo local. La app debe poder preparar paquetes de sincronizacion, declarar roles, licencias, contrato API y destinos Cloudflare antes de activar autenticacion real.

## Alcance implementado

- Motor propio en `core/cloud/cloudWorkspaceEngine.js`.
- Modulo visual `modules/nube/nube.js` registrado en el menu Proyecto.
- Contrato Worker/D1/R2 en `data/cloud/cloud-contract.json`.
- Modelo D1 en `data/cloud/d1-schema.json`.
- Politica de archivos R2 en `data/cloud/r2-assets.json`.
- Cola local de sincronizacion con paquetes `.giae` portables.
- Estado de licencia local preparatorio sin guardar secretos.
- Diagnostico automatico en `tools/phase4-cloud-readiness-check.mjs`.

## Decision tecnica

La Fase 4 no conecta aun una cuenta real ni guarda tokens en el navegador. GIAE prepara el contrato y los paquetes; Cloudflare Worker debe validar sesion, licencia, permisos y escritura final.

## Contrato previsto

- Workers: API propia bajo `/api/giae`.
- D1: usuarios, empresas, roles, licencias, proyectos, revisiones, indices de archivos, auditoria y cola.
- R2: respaldos `.giae`, documentos, logos, plantillas, fotos, planos y evidencias.

## Limites honestos

- No autentica usuarios reales todavia.
- No valida pagos ni licencias reales todavia.
- No escribe en D1 ni R2 todavia.
- No guarda tokens ni secretos en cliente.
- No reemplaza el respaldo `.giae`; lo mantiene como formato portable.

## Criterio de salida de esta base

La fase queda lista para prueba manual cuando:

- El modulo Nube y licencias aparece en GIAE.
- El motor genera readiness cloud y paquetes sync.
- Los datos de contrato D1/R2/Worker son JSON valido.
- El service worker cachea los archivos nuevos.
- El diagnostico Fase 4 entrega 100%.