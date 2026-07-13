const GIAE_CACHE_VERSION = 'giae-chile-v1-flujo-2026-07-13-cad-inventario-ventanas';
const GIAE_APP_SHELL = [
  "./",
  "./assets/icons/giae-icon-192.png",
  "./assets/icons/giae-icon-512.png",
  "./assets/icons/giae-icon.svg",
  "./core/architecture/ArchitectureReport.js",
  "./core/architecture/DuplicateDetector.js",
  "./core/architecture/ObsoleteReferenceDetector.js",
  "./core/architecture/index.js",
  "./core/audit/integralAuditEngine.js",
  "./core/calculations.js",
  "./core/cad/cadEngine.js",
  "./core/commercial/budgetEngine.js",
  "./core/componentLibrary.js",
  "./core/cloud/cloudWorkspaceEngine.js",
  "./core/document-intelligence/documentIntelligenceEngine.js",
  "./core/documentationEngine.js",
  "./core/engineering/connectionEngine.js",
  "./core/engineering/electricalEngine.js",
  "./core/engineering/groundingEngine.js",
  "./core/engineering/loadEngine.js",
  "./core/engineering/panelEngine.js",
  "./core/engineering/phaseBalanceEngine.js",
  "./core/inspector/ConsistencyEvidence.js",
  "./core/inspector/DocumentConsistencyEngine.js",
  "./core/inspector/GIAEInspector.js",
  "./core/inspector/InspectorActionPlan.js",
  "./core/inspector/InspectorConsistency.js",
  "./core/inspector/InspectorEngine.js",
  "./core/inspector/InspectorReport.js",
  "./core/inspector/InspectorRuleBridge.js",
  "./core/inspector/InspectorScore.js",
  "./core/inspector/index.js",
  "./core/main.js",
  "./core/moduleRegistry.js",
  "./core/norma-chile/coberturaEngine.js",
  "./core/norma-chile/normaChile.js",
  "./core/norma-chile/reglaEngine.js",
  "./core/normative-analyzer/NormativeAnalyzer.js",
  "./core/normative-analyzer/index.js",
  "./core/normative-engine/RIC18DocumentValidator.js",
  "./core/normative-engine/RIC18EvidenceGenerator.js",
  "./core/normative-engine/RIC18RuleProvider.js",
  "./core/normative-engine/RuleEvidence.js",
  "./core/normative-engine/RuleExtractor.js",
  "./core/normative-engine/RuleMapper.js",
  "./core/normative-engine/RuleResolver.js",
  "./core/normative-engine/index.js",
  "./core/normative/engine.js",
  "./core/normative/index.js",
  "./core/normative/reportGenerator.js",
  "./core/normative/ruleLoader.js",
  "./core/normative/schema.js",
  "./core/normative/validator.js",
  "./core/normativeGuard.js",
  "./core/projectEngine.js",
  "./core/pwa.js",
  "./core/rule-engine/RuleEngine.js",
  "./core/rule-engine/RuleExecutor.js",
  "./core/rule-engine/RuleLoader.js",
  "./core/rule-engine/RuleLogger.js",
  "./core/rule-engine/RuleRegistry.js",
  "./core/rule-engine/RuleValidator.js",
  "./core/rule-engine/index.js",
  "./core/store.js",
  "./core/technicalLibrary.js",
  "./core/workflow/guidedWorkflowEngine.js",
  "./css/platform.css",
  "./data/architecture/architecture-policy.json",
  "./data/biblioteca-tecnica.json",
  "./data/cad/electrical-symbols.json",
  "./data/cloud/cloud-contract.json",
  "./data/cloud/d1-schema.json",
  "./data/cloud/r2-assets.json",
  "./data/commercial/default-commercial-settings.json",
  "./data/componentes-electricos.json",
  "./data/data/norma-chile/metadata/ric19.info.json",
  "./data/data/norma-chile/rules/ric-19.json",
  "./data/distribuidoras-base.json",
  "./data/distribuidoras.json",
  "./data/document-intelligence/document-types.json",
  "./data/documentos-sec.json",
  "./data/inspector/checklist-presec.json",
  "./data/inspector/consistency-rules.json",
  "./data/modulos.json",
  "./data/norma-chile/analyzer/analyzer-config.json",
  "./data/norma-chile/catalogo-normativo.json",
  "./data/norma-chile/catalogos/catalogo-normativo.json",
  "./data/norma-chile/definiciones/definiciones-base.json",
  "./data/norma-chile/definiciones/diccionario-normativo-v11.json",
  "./data/norma-chile/definitions/base.definitions.json",
  "./data/norma-chile/ds8-articulos-index.json",
  "./data/norma-chile/extractor/extractor-config.json",
  "./data/norma-chile/fuentes-normativas.json",
  "./data/norma-chile/fuentes/decreto8-local-intake.json",
  "./data/norma-chile/metadata/ric-18.info.json",
  "./data/norma-chile/reglas/ds8/reglas-ds8-base.json",
  "./data/norma-chile/reglas/ric/indice-ric-1-19.json",
  "./data/norma-chile/reglas/ric/reglas-norma-chile-v11.json",
  "./data/norma-chile/reglas/ric/reglas-ric18-v13.json",
  "./data/norma-chile/relaciones/ds8-ric-motores-v12.json",
  "./data/norma-chile/relaciones/motores-reglas.json",
  "./data/norma-chile/relations/engine-relations.json",
  "./data/norma-chile/rules/ds8.base.json",
  "./data/norma-chile/rules/ds8.json",
  "./data/norma-chile/rules/index.json",
  "./data/norma-chile/rules/ric-18.json",
  "./data/norma-chile/rules/ric-18.seed.json",
  "./data/norma-chile/rules/ric-19.seed.json",
  "./data/norma-chile/rules/ric01.json",
  "./data/norma-chile/rules/ric02.json",
  "./data/norma-chile/rules/ric03.json",
  "./data/norma-chile/rules/ric04.json",
  "./data/norma-chile/rules/ric05.json",
  "./data/norma-chile/rules/ric06.json",
  "./data/norma-chile/rules/ric07.json",
  "./data/norma-chile/rules/ric08.json",
  "./data/norma-chile/rules/ric09.json",
  "./data/norma-chile/rules/ric10.json",
  "./data/norma-chile/rules/ric11.json",
  "./data/norma-chile/rules/ric12.json",
  "./data/norma-chile/rules/ric13.json",
  "./data/norma-chile/rules/ric14.json",
  "./data/norma-chile/rules/ric15.json",
  "./data/norma-chile/rules/ric16.json",
  "./data/norma-chile/rules/ric17.json",
  "./data/norma-chile/rules/ric18.base.json",
  "./data/norma-chile/rules/ric18.json",
  "./data/norma-chile/rules/ric19.json",
  "./data/norma-chile/schemas/regla-norma-chile.schema.json",
  "./data/norma-chile/schemas/rule.schema.json",
  "./data/norma-chile/tablas/cobertura-normativa-v11.json",
  "./data/norma-chile/tablas/cobertura-normativa-v12.json",
  "./data/norma-chile/tablas/documentos-ric18-v13.json",
  "./data/norma-chile/versions/norma-chile.version.json",
  "./data/rules/ds8/rules.json",
  "./data/rules/iec/rules.json",
  "./data/rules/personalizadas/rules.json",
  "./data/rules/ric/ric1/reglas-ric1-inicial.json",
  "./data/rules/ric/ric3/reglas-ric3-inicial.json",
  "./data/rules/ric/ric4/reglas-ric4-inicial.json",
  "./data/rules/ric/ric5/reglas-ric5-inicial.json",
  "./data/rules/ric/ric6/reglas-ric6-inicial.json",
  "./data/rules/ric/rules.json",
  "./data/workflow/guided-flow.json",
  "./docs/data/producto/documentos-producto.json",
  "./docs/data/producto/fase-1-publicable-last-report.json",
  "./docs/data/producto/fase-1-publicable.json",
  "./docs/data/producto/fase-2-instalable.json",
  "./docs/data/producto/fase-2-installable-last-report.json",
  "./docs/data/producto/fase-3-documental.json",
  "./docs/data/producto/fase-3-documental-last-report.json",
  "./docs/data/producto/fase-4-cloud.json",
  "./docs/data/producto/fase-4-cloud-last-report.json",
  "./docs/data/producto/fase-5-cad.json",
  "./docs/data/producto/fase-5-cad-last-report.json",
  "./docs/data/producto/product-manifest.json",
  "./docs/data/producto/roadmap-6-fases.json",
  "./docs/data/producto/vision-giae-2.json",
  "./index.html",
  "./manifest.webmanifest",
  "./modules/administracion/administracion.js",
  "./modules/auditoria/auditoria.js",
  "./modules/balance/balance.js",
  "./modules/biblioteca/biblioteca.js",
  "./modules/cad-electrico/cad-electrico.js",
  "./modules/cargas/cargas.js",
  "./modules/componentes/componentes.js",
  "./modules/cuadro-carga/cuadro-carga.js",
  "./modules/dashboard/dashboard.js",
  "./modules/documentacion/documentacion.js",
  "./modules/educacion/educacion.js",
  "./modules/empalme/empalme.js",
  "./modules/giae-inspector/inspector.js",
  "./modules/gpe.js",
  "./modules/nube/nube.js",
  "./modules/lector-documental/lector-documental.js",
  "./modules/norma-chile/norma-chile.js",
  "./modules/normativo/normativo.js",
  "./modules/presupuesto/presupuesto.js",
  "./modules/proyecto/proyecto.js",
  "./modules/flujo-guiado/flujo-guiado.js",
  "./modules/proyectos/proyectos.js",
  "./modules/tableros/tableros.js",
  "./modules/tierra/tierra.js",
  "./modules/unilineal/unilineal.js",
  "./modules/usuarios/usuarios.js",
  "./offline.html"
];
const OFFLINE_URL = './offline.html';

self.addEventListener('install', event => {
  event.waitUntil(caches.open(GIAE_CACHE_VERSION).then(cache => cache.addAll(GIAE_APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== GIAE_CACHE_VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.origin !== self.location.origin) return;
  if(request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if(/\.(js|css|html)$/i.test(url.pathname)) {
    event.respondWith(networkFirstStatic(request));
    return;
  }
  event.respondWith(cacheFirstStatic(request));
});

function normalizedRequest(request){
  const url = new URL(request.url);
  url.search = '';
  return new Request(url.toString(), { credentials: 'same-origin' });
}

async function networkFirstStatic(request){
  const cache = await caches.open(GIAE_CACHE_VERSION);
  const cacheKey = normalizedRequest(request);
  try{
    const response = await fetch(request);
    if(response && response.ok) await cache.put(cacheKey, response.clone());
    return response;
  }catch(error){
    return (await cache.match(cacheKey, { ignoreSearch: true })) || cache.match(OFFLINE_URL);
  }
}
async function cacheFirstStatic(request){
  const cache = await caches.open(GIAE_CACHE_VERSION);
  const cacheKey = normalizedRequest(request);
  const cached = await cache.match(cacheKey, { ignoreSearch: true });
  if(cached) return cached;
  try{
    const response = await fetch(request);
    if(response && response.ok) await cache.put(cacheKey, response.clone());
    return response;
  }catch(error){
    return cache.match(OFFLINE_URL);
  }
}

async function networkFirstNavigation(request){
  const cache = await caches.open(GIAE_CACHE_VERSION);
  try{
    const response = await fetch(request);
    if(response && response.ok) await cache.put('./index.html', response.clone());
    return response;
  }catch(error){
    return (await cache.match('./index.html')) || (await cache.match(OFFLINE_URL));
  }
}
