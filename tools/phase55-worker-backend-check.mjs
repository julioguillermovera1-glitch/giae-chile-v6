#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const writeIndex = args.indexOf('--write');
const reportTarget = writeIndex >= 0 ? (args[writeIndex + 1] || 'docs/data/producto/fase-5-5-worker-backend-last-report.json') : null;
const checks = [];
const full = file => path.join(root, file);
const exists = file => fs.existsSync(full(file));
const read = file => fs.readFileSync(full(file), 'utf8');
const add = (id, name, ok, detail, level = 'alto', evidence = []) => checks.push({ id, name, ok: Boolean(ok), level, detail, evidence });
function checkJs(file){ const result = spawnSync(process.execPath, ['--check', full(file)], { encoding: 'utf8' }); return { ok: result.status === 0, output: (result.stderr || result.stdout || '').trim() }; }
function jsonc(file){ return JSON.parse(read(file).replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')); }
function has(file, text){ return exists(file) && read(file).includes(text); }
function hasPlaceholder(value){ return JSON.stringify(value || {}).includes('REEMPLAZAR_'); }
function hasR2Set(config){ const buckets = Array.isArray(config?.r2_buckets) ? config.r2_buckets : []; const bindings = new Set(buckets.map(bucket => bucket.binding)); return ['GIAE_PROJECT_BACKUPS','GIAE_PROJECT_DOCUMENTS','GIAE_BRAND_ASSETS','GIAE_FIELD_MEDIA'].every(binding => bindings.has(binding)); }
function hasD1Set(config, requireRealId = false){ const databases = Array.isArray(config?.d1_databases) ? config.d1_databases : []; return databases.some(db => db.binding === 'GIAE_DB' && (!requireRealId || (db.database_id && !String(db.database_id).includes('REEMPLAZAR')))); }

add('worker-existe', 'Worker API existe', exists('src/worker.js'), 'src/worker.js', 'critico');
add('package-existe', 'package.json existe', exists('package.json'), 'package.json', 'critico');
add('migration-existe', 'Migracion D1 existe', exists('migrations/0001_giae_cloud_core.sql'), 'migrations/0001_giae_cloud_core.sql', 'critico');
add('assetsignore-existe', 'Assets ignore existe', exists('.assetsignore') && has('.assetsignore', 'wrangler*.jsonc'), '.assetsignore excluye configuracion sensible', 'alto');
const workerSyntax = exists('src/worker.js') ? checkJs('src/worker.js') : { ok:false, output:'missing' };
add('worker-js-valido', 'Worker JavaScript valido', workerSyntax.ok, 'node --check src/worker.js', 'critico', [workerSyntax.output].filter(Boolean));
let activeD1Ready = false;
let activeR2Ready = false;
let templateD1Ready = false;
let templateR2Ready = false;
try{
  const wrangler = jsonc('wrangler.jsonc');
  activeD1Ready = hasD1Set(wrangler, true);
  activeR2Ready = hasR2Set(wrangler);
  add('wrangler-worker', 'Wrangler usa Worker con Assets', wrangler.main === 'src/worker.js' && wrangler.assets?.binding === 'ASSETS' && Array.isArray(wrangler.assets?.run_worker_first), 'main + ASSETS + run_worker_first', 'critico');
  add('wrangler-deploy-safe', 'Wrangler publicable sin placeholders activos', !hasPlaceholder(wrangler), 'sin database_id de ejemplo activo', 'critico');
  add('wrangler-bindings-mode', 'Modo D1/R2 declarado', Boolean(wrangler.vars?.GIAE_BINDINGS_MODE || activeD1Ready), wrangler.vars?.GIAE_BINDINGS_MODE || 'bindings activos', 'medio');
}catch(error){
  add('wrangler-worker', 'Wrangler usa Worker con Assets', false, String(error.message || error), 'critico');
  add('wrangler-deploy-safe', 'Wrangler publicable sin placeholders activos', false, 'wrangler no parsea', 'critico');
}
try{
  const template = jsonc('wrangler.bindings.example.jsonc');
  templateD1Ready = hasD1Set(template, false);
  templateR2Ready = hasR2Set(template);
  add('wrangler-bindings-template', 'Plantilla D1/R2 existe', templateD1Ready && templateR2Ready && hasPlaceholder(template), 'wrangler.bindings.example.jsonc', 'alto');
}catch(error){
  add('wrangler-bindings-template', 'Plantilla D1/R2 existe', false, String(error.message || error), 'alto');
}
add('wrangler-d1-r2-route', 'D1/R2 activos o plantillados', (activeD1Ready && activeR2Ready) || (templateD1Ready && templateR2Ready), activeD1Ready ? 'bindings activos en wrangler.jsonc' : 'bindings listos en plantilla segura', 'alto');
const sql = exists('migrations/0001_giae_cloud_core.sql') ? read('migrations/0001_giae_cloud_core.sql') : '';
for(const table of ['companies','users','roles','licenses','projects','project_revisions','file_assets','audit_events','sync_queue']) add('table-' + table, 'Tabla D1 ' + table, sql.includes('CREATE TABLE IF NOT EXISTS ' + table), table, 'critico');
add('worker-endpoints', 'Worker declara endpoints GIAE', has('src/worker.js', '/api/giae/health') && has('src/worker.js', 'syncProject') && has('src/worker.js', 'licenseCheck'), 'health + sync + license', 'alto');
add('worker-assets', 'Worker conserva frontend PWA', has('src/worker.js', 'env.ASSETS.fetch(request)'), 'ASSETS fallback', 'critico');
add('worker-secret', 'Worker bloquea escrituras sin secreto', has('src/worker.js', 'GIAE_API_TOKEN') && has('src/worker.js', 'Escritura bloqueada'), 'GIAE_API_TOKEN', 'alto');
add('docs-backend', 'Docs backend presentes', exists('docs/FASE_5_5_BACKEND_WORKER_GIAE.md') && exists('docs/data/producto/fase-5-5-worker-backend.json'), 'docs fase 5.5', 'alto');
add('readme-backend', 'README documenta backend Worker', has('README.md', 'Fase 5.5 backend Worker') && has('README.md', 'wrangler.bindings.example.jsonc'), 'README', 'medio');
const criticalFails = checks.filter(check => !check.ok && check.level === 'critico');
const highFails = checks.filter(check => !check.ok && check.level === 'alto');
const okCount = checks.filter(check => check.ok).length;
const score = Math.round((okCount / checks.length) * 100);
let status = 'apto_para_deploy_worker_assets';
if(criticalFails.length) status = 'bloqueado';
else if(activeD1Ready && activeR2Ready) status = 'apto_para_cloudflare_con_d1_r2';
else if(highFails.length) status = 'publicable_con_observaciones';
const report = { schema: 'giae.diagnostico.fase55-worker-backend.v1', generatedAt: new Date().toISOString(), score, status, root, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, bindings: { activeD1Ready, activeR2Ready, templateD1Ready, templateR2Ready }, checks };
console.log('GIAE Chile - Diagnostico Fase 5.5 Worker Backend');
console.log('Estado: ' + status + ' | Puntaje: ' + score + '%');
for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){ const target = full(reportTarget); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8'); console.log('Reporte escrito en ' + reportTarget); }
process.exit(criticalFails.length ? 1 : 0);