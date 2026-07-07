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

add('worker-existe', 'Worker API existe', exists('src/worker.js'), 'src/worker.js', 'critico');
add('package-existe', 'package.json existe', exists('package.json'), 'package.json', 'critico');
add('migration-existe', 'Migracion D1 existe', exists('migrations/0001_giae_cloud_core.sql'), 'migrations/0001_giae_cloud_core.sql', 'critico');
add('assetsignore-existe', 'Assets ignore existe', exists('.assetsignore'), '.assetsignore', 'alto');
const workerSyntax = exists('src/worker.js') ? checkJs('src/worker.js') : { ok:false, output:'missing' };
add('worker-js-valido', 'Worker JavaScript valido', workerSyntax.ok, 'node --check src/worker.js', 'critico', [workerSyntax.output].filter(Boolean));
try{
  const wrangler = jsonc('wrangler.jsonc');
  add('wrangler-worker', 'Wrangler usa Worker con Assets', wrangler.main === 'src/worker.js' && wrangler.assets?.binding === 'ASSETS' && Array.isArray(wrangler.assets?.run_worker_first), 'main + ASSETS + run_worker_first', 'critico');
  add('wrangler-d1-r2', 'Wrangler declara D1 y R2', wrangler.d1_databases?.some(db => db.binding === 'GIAE_DB') && (wrangler.r2_buckets || []).length >= 4, 'GIAE_DB + 4 buckets R2', 'alto');
  add('placeholder-d1-visible', 'D1 database_id queda claramente pendiente', String(wrangler.d1_databases?.[0]?.database_id || '').includes('REEMPLAZAR'), 'placeholder explicito', 'medio');
}catch(error){ add('wrangler-worker', 'Wrangler usa Worker con Assets', false, String(error.message || error), 'critico'); add('wrangler-d1-r2', 'Wrangler declara D1 y R2', false, 'wrangler no parsea', 'alto'); }
const sql = exists('migrations/0001_giae_cloud_core.sql') ? read('migrations/0001_giae_cloud_core.sql') : '';
for(const table of ['companies','users','roles','licenses','projects','project_revisions','file_assets','audit_events','sync_queue']) add('table-' + table, 'Tabla D1 ' + table, sql.includes('CREATE TABLE IF NOT EXISTS ' + table), table, 'critico');
add('worker-endpoints', 'Worker declara endpoints GIAE', has('src/worker.js', '/api/giae/health') && has('src/worker.js', 'syncProject') && has('src/worker.js', 'licenseCheck'), 'health + sync + license', 'alto');
add('worker-assets', 'Worker conserva frontend PWA', has('src/worker.js', 'env.ASSETS.fetch(request)'), 'ASSETS fallback', 'critico');
add('worker-secret', 'Worker bloquea escrituras sin secreto', has('src/worker.js', 'GIAE_API_TOKEN') && has('src/worker.js', 'Escritura bloqueada'), 'GIAE_API_TOKEN', 'alto');
add('docs-backend', 'Docs backend presentes', exists('docs/FASE_5_5_BACKEND_WORKER_GIAE.md') && exists('docs/data/producto/fase-5-5-worker-backend.json'), 'docs fase 5.5', 'alto');
add('readme-backend', 'README documenta backend Worker', has('README.md', 'Fase 5.5 backend Worker') && has('README.md', 'tools/phase55-worker-backend-check.mjs'), 'README', 'medio');
const criticalFails = checks.filter(check => !check.ok && check.level === 'critico');
const highFails = checks.filter(check => !check.ok && check.level === 'alto');
const okCount = checks.filter(check => check.ok).length;
const score = Math.round((okCount / checks.length) * 100);
const status = criticalFails.length ? 'bloqueado' : highFails.length ? 'con_observaciones' : 'apto_para_configurar_cloudflare';
const report = { schema: 'giae.diagnostico.fase55-worker-backend.v1', generatedAt: new Date().toISOString(), score, status, root, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, checks };
console.log('GIAE Chile - Diagnostico Fase 5.5 Worker Backend');
console.log('Estado: ' + status + ' | Puntaje: ' + score + '%');
for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){ const target = full(reportTarget); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8'); console.log('Reporte escrito en ' + reportTarget); }
process.exit(criticalFails.length ? 1 : 0);