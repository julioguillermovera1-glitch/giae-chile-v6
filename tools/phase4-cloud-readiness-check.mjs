#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const args = process.argv.slice(2);
const writeIndex = args.indexOf('--write');
const reportTarget = writeIndex >= 0 ? (args[writeIndex + 1] || 'docs/data/producto/fase-4-cloud-last-report.json') : null;
const checks = [];
const full = file => path.join(root, file);
const exists = file => fs.existsSync(full(file));
const read = file => fs.readFileSync(full(file), 'utf8');
const add = (id, name, ok, detail, level = 'alto', evidence = []) => checks.push({ id, name, ok: Boolean(ok), level, detail, evidence });
function checkJs(file){ const result = spawnSync(process.execPath, ['--check', full(file)], { encoding: 'utf8' }); return { ok: result.status === 0, output: (result.stderr || result.stdout || '').trim() }; }
function json(file){ return JSON.parse(read(file)); }
function has(file, text){ return exists(file) && read(file).includes(text); }

add('engine-existe', 'Motor cloud existe', exists('core/cloud/cloudWorkspaceEngine.js'), 'core/cloud/cloudWorkspaceEngine.js', 'critico');
add('modulo-existe', 'Modulo nube existe', exists('modules/nube/nube.js'), 'modules/nube/nube.js', 'critico');
add('datos-cloud', 'Datos cloud existen', exists('data/cloud/cloud-contract.json') && exists('data/cloud/d1-schema.json') && exists('data/cloud/r2-assets.json'), 'data/cloud', 'critico');
add('registro-menu', 'Modulo registrado en menu', has('core/moduleRegistry.js', 'id: "nube"') && has('core/moduleRegistry.js', '../modules/nube/nube.js'), 'core/moduleRegistry.js', 'critico');
add('admin-integrado', 'Administracion reconoce Fase 4', has('modules/administracion/administracion.js', 'Fase 4 activa') && has('modules/administracion/administracion.js', 'Nube y licencias'), 'Panel administrador', 'alto');
add('sw-cache', 'PWA cachea Fase 4', has('sw.js', './modules/nube/nube.js') && has('sw.js', './core/cloud/cloudWorkspaceEngine.js') && has('sw.js', './data/cloud/cloud-contract.json'), 'sw.js', 'alto');
const engineSyntax = checkJs('core/cloud/cloudWorkspaceEngine.js');
const moduleSyntax = checkJs('modules/nube/nube.js');
add('js-valido', 'JavaScript cloud valido', engineSyntax.ok && moduleSyntax.ok, 'engine + modulo', 'critico', [engineSyntax.output, moduleSyntax.output].filter(Boolean));
try{
  const engine = await import(pathToFileURL(full('core/cloud/cloudWorkspaceEngine.js')).href + '?t=' + Date.now());
  const state = { profile: 'administrador', admin: { users: [{ name: 'Admin', email: 'admin@giae.local' }], company: { name: 'GIAE Chile' } }, currentProject: { id: 'GIAE-DEMO', name: 'Proyecto demo', history: [{ action: 'demo' }] } };
  const readiness = engine.buildCloudReadiness(state);
  const item = engine.queueProjectSync(state, { action: 'Prueba Fase 4', operation: 'project.upsert' });
  add('engine-readiness', 'Motor genera readiness y cola sync', readiness.score >= 90 && item.envelope?.schema === 'giae.cloud.sync-envelope.v1', readiness.status + ' / ' + readiness.score + '%', 'critico', [readiness, item]);
}catch(error){ add('engine-readiness', 'Motor genera readiness y cola sync', false, String(error.message || error), 'critico'); }
try{
  const contract = json('data/cloud/cloud-contract.json');
  const d1 = json('data/cloud/d1-schema.json');
  const r2 = json('data/cloud/r2-assets.json');
  add('contrato-valido', 'Contrato Worker/D1/R2 valido', contract.worker?.endpoints?.length >= 7 && d1.tablas?.length >= 8 && r2.buckets?.length >= 4, `${contract.worker?.endpoints?.length || 0} endpoints / ${d1.tablas?.length || 0} tablas / ${r2.buckets?.length || 0} buckets`, 'alto');
}catch(error){ add('contrato-valido', 'Contrato Worker/D1/R2 valido', false, String(error.message || error), 'alto'); }
add('docs-fase4', 'Docs y datos Fase 4 presentes', exists('docs/FASE_4_NUBE_USUARIOS_LICENCIAS_GIAE.md') && exists('docs/data/producto/fase-4-cloud.json'), 'docs fase 4', 'alto');
add('readme-fase4', 'README documenta Fase 4', has('README.md', 'Fase 4 nube') && has('README.md', 'tools/phase4-cloud-readiness-check.mjs'), 'README', 'medio');
add('wrangler-presente', 'Wrangler mantiene publicacion Cloudflare', exists('wrangler.jsonc') && has('wrangler.jsonc', 'assets'), 'wrangler.jsonc', 'medio');
add('sin-promesa-excesiva', 'Fase 4 declara limites honestos', has('docs/FASE_4_NUBE_USUARIOS_LICENCIAS_GIAE.md', 'No autentica usuarios reales todavia') && has('docs/FASE_4_NUBE_USUARIOS_LICENCIAS_GIAE.md', 'No guarda tokens ni secretos'), 'limites declarados', 'alto');

const criticalFails = checks.filter(check => !check.ok && check.level === 'critico');
const highFails = checks.filter(check => !check.ok && check.level === 'alto');
const okCount = checks.filter(check => check.ok).length;
const score = Math.round((okCount / checks.length) * 100);
const status = criticalFails.length ? 'bloqueado' : highFails.length ? 'con_observaciones' : 'apto_para_prueba_manual';
const report = { schema: 'giae.diagnostico.fase4-cloud.v1', generatedAt: new Date().toISOString(), score, status, root, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, checks };
console.log('GIAE Chile - Diagnostico Fase 4 cloud');
console.log('Estado: ' + status + ' | Puntaje: ' + score + '%');
for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){ const target = full(reportTarget); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8'); console.log('Reporte escrito en ' + reportTarget); }
process.exit(criticalFails.length ? 1 : 0);