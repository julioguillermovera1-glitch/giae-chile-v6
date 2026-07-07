#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const args = process.argv.slice(2);
const writeIndex = args.indexOf('--write');
const reportTarget = writeIndex >= 0 ? (args[writeIndex + 1] || 'docs/data/producto/fase-5-6-flujo-guiado-last-report.json') : null;
const checks = [];
const full = file => path.join(root, file);
const exists = file => fs.existsSync(full(file));
const read = file => fs.readFileSync(full(file), 'utf8');
const add = (id, name, ok, detail, level = 'alto', evidence = []) => checks.push({ id, name, ok: Boolean(ok), level, detail, evidence });
function has(file, text){ return exists(file) && read(file).includes(text); }
function json(file){ return JSON.parse(read(file)); }
function checkJs(file){ const result = spawnSync(process.execPath, ['--check', full(file)], { encoding: 'utf8' }); return { ok: result.status === 0, output: (result.stderr || result.stdout || '').trim() }; }

add('engine-existe', 'Motor de flujo existe', exists('core/workflow/guidedWorkflowEngine.js'), 'core/workflow/guidedWorkflowEngine.js', 'critico');
add('data-existe', 'Definicion de etapas existe', exists('data/workflow/guided-flow.json'), 'data/workflow/guided-flow.json', 'critico');
add('modulo-existe', 'Modulo Flujo guiado existe', exists('modules/flujo-guiado/flujo-guiado.js'), 'modules/flujo-guiado/flujo-guiado.js', 'critico');
add('registro-menu', 'Modulo registrado en menu', has('core/moduleRegistry.js', 'id: "flujo-guiado"') && has('core/moduleRegistry.js', '../modules/flujo-guiado/flujo-guiado.js'), 'core/moduleRegistry.js', 'critico');
add('store-conectado', 'Store calcula guidedWorkflow', has('core/store.js', 'evaluateGuidedWorkflow') && has('core/store.js', 'p.guidedWorkflow'), 'core/store.js', 'critico');
add('estado-superior', 'Barra superior muestra flujo', has('core/main.js', 'Flujo:') && has('core/main.js', 'guidedWorkflow'), 'core/main.js', 'alto');
add('admin-integrado', 'Administracion reconoce Fase 5.6', has('modules/administracion/administracion.js', 'Fase 5.6 activa') && has('modules/administracion/administracion.js', 'flujo-guiado'), 'Panel administrador', 'alto');
add('dashboard-integrado', 'Dashboard abre flujo guiado', has('modules/dashboard/dashboard.js', 'flujo-guiado'), 'modules/dashboard/dashboard.js', 'medio');
add('sw-cache', 'PWA cachea flujo guiado', has('sw.js', './core/workflow/guidedWorkflowEngine.js') && has('sw.js', './modules/flujo-guiado/flujo-guiado.js') && has('sw.js', './data/workflow/guided-flow.json'), 'sw.js', 'alto');
const engineSyntax = exists('core/workflow/guidedWorkflowEngine.js') ? checkJs('core/workflow/guidedWorkflowEngine.js') : { ok:false, output:'missing' };
const moduleSyntax = exists('modules/flujo-guiado/flujo-guiado.js') ? checkJs('modules/flujo-guiado/flujo-guiado.js') : { ok:false, output:'missing' };
add('js-valido', 'JavaScript flujo valido', engineSyntax.ok && moduleSyntax.ok, 'engine + modulo', 'critico', [engineSyntax.output, moduleSyntax.output].filter(Boolean));
try{
  const data = json('data/workflow/guided-flow.json');
  add('etapas-validas', 'Flujo tiene etapas oficiales', Array.isArray(data.steps) && data.steps.length >= 14 && data.steps[0].id === 'proyecto' && data.steps.at(-1).id === 'exportacion', `${data.steps?.length || 0} etapas`, 'critico');
}catch(error){ add('etapas-validas', 'Flujo tiene etapas oficiales', false, String(error.message || error), 'critico'); }
try{
  const engine = await import(pathToFileURL(full('core/workflow/guidedWorkflowEngine.js')).href + '?t=' + Date.now());
  const blocked = engine.evaluateGuidedWorkflow({ name: 'Proyecto sin nombre', loads: [] });
  const ready = engine.evaluateGuidedWorkflow({ id:'demo', name:'Proyecto demo', code:'P-1', client:'Cliente', address:'Direccion', commune:'Comuna', region:'Region', supplyType:'monofasico', voltage:'220 V', distributor:'cge', serviceType:'instalacion-nueva', loads:[{ name:'Luz', powerW:100, quantity:1, type:'Alumbrado' }], loadBoard:[{ id:'C01' }], protections:[{ id:'P01' }], panelEngine:{ observations:[] }, grounding:{ measurementOhm:10 }, connectionEngine:{ status:'validado_preliminar', observations:[] }, cad2d:{ entities:[{ id:'E1' }], validation:{ score:100, issues:[] } }, unilineal:{ ready:true }, documentationEngine:{ requiredNow:[{ result:'listo' }], futureDocuments:[] }, integralAudit:{ score:100, issues:[], status:'sin_observaciones' }, budget:[{ item:'Material' }], commercialEngine:{ summary:{ total:1 } } });
  add('engine-evalua', 'Motor detecta bloqueos y avance', blocked.status === 'bloqueado' && blocked.blockers.length > 0 && ready.score >= 90, `bloqueado=${blocked.blockers.length} ready=${ready.score}%`, 'critico');
}catch(error){ add('engine-evalua', 'Motor detecta bloqueos y avance', false, String(error.message || error), 'critico'); }
add('docs-fase56', 'Docs Fase 5.6 presentes', exists('docs/FASE_5_6_FLUJO_GUIADO_GIAE.md') && exists('docs/ESPECIFICACION_MAESTRA_GIAE_CHILE.md') && exists('docs/FLUJO_GUIADO_GIAE_V1.md') && exists('docs/data/producto/fase-5-6-flujo-guiado.json'), 'docs fase 5.6', 'alto');
add('readme-fase56', 'README documenta Fase 5.6', has('README.md', 'Fase 5.6 flujo maestro guiado') && has('README.md', 'tools/phase56-guided-flow-check.mjs'), 'README', 'medio');
add('limite-honesto', 'Docs declaran limite profesional', has('docs/FASE_5_6_FLUJO_GUIADO_GIAE.md', 'No reemplaza') && has('docs/ESPECIFICACION_MAESTRA_GIAE_CHILE.md', 'No reemplaza'), 'limite honesto', 'alto');

const criticalFails = checks.filter(check => !check.ok && check.level === 'critico');
const highFails = checks.filter(check => !check.ok && check.level === 'alto');
const okCount = checks.filter(check => check.ok).length;
const score = Math.round((okCount / checks.length) * 100);
const status = criticalFails.length ? 'bloqueado' : highFails.length ? 'con_observaciones' : 'apto_para_prueba_manual';
const report = { schema: 'giae.diagnostico.fase56-flujo-guiado.v1', generatedAt: new Date().toISOString(), score, status, root, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, checks };
console.log('GIAE Chile - Diagnostico Fase 5.6 Flujo Guiado');
console.log('Estado: ' + status + ' | Puntaje: ' + score + '%');
for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){ const target = full(reportTarget); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8'); console.log('Reporte escrito en ' + reportTarget); }
process.exit(criticalFails.length ? 1 : 0);