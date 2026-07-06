#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const args = process.argv.slice(2);
const writeIndex = args.indexOf('--write');
const reportTarget = writeIndex >= 0 ? (args[writeIndex + 1] || 'docs/data/producto/fase-5-cad-last-report.json') : null;
const checks = [];
const full = file => path.join(root, file);
const exists = file => fs.existsSync(full(file));
const read = file => fs.readFileSync(full(file), 'utf8');
const add = (id, name, ok, detail, level = 'alto', evidence = []) => checks.push({ id, name, ok: Boolean(ok), level, detail, evidence });
function checkJs(file){ const result = spawnSync(process.execPath, ['--check', full(file)], { encoding: 'utf8' }); return { ok: result.status === 0, output: (result.stderr || result.stdout || '').trim() }; }
function json(file){ return JSON.parse(read(file)); }
function has(file, text){ return exists(file) && read(file).includes(text); }

add('engine-existe', 'Motor CAD existe', exists('core/cad/cadEngine.js'), 'core/cad/cadEngine.js', 'critico');
add('modulo-existe', 'Modulo CAD existe', exists('modules/cad-electrico/cad-electrico.js'), 'modules/cad-electrico/cad-electrico.js', 'critico');
add('simbolos-existen', 'Biblioteca simbolos CAD existe', exists('data/cad/electrical-symbols.json'), 'data/cad/electrical-symbols.json', 'critico');
add('registro-menu', 'Modulo registrado en menu', has('core/moduleRegistry.js', 'id: "cad-electrico"') && has('core/moduleRegistry.js', '../modules/cad-electrico/cad-electrico.js'), 'core/moduleRegistry.js', 'critico');
add('admin-integrado', 'Administracion reconoce Fase 5', has('modules/administracion/administracion.js', 'Fase 5 activa') && has('modules/administracion/administracion.js', 'cad-electrico'), 'Panel administrador', 'alto');
add('sw-cache', 'PWA cachea CAD', has('sw.js', './modules/cad-electrico/cad-electrico.js') && has('sw.js', './core/cad/cadEngine.js') && has('sw.js', './data/cad/electrical-symbols.json'), 'sw.js', 'alto');
const engineSyntax = checkJs('core/cad/cadEngine.js');
const moduleSyntax = checkJs('modules/cad-electrico/cad-electrico.js');
add('js-valido', 'JavaScript CAD valido', engineSyntax.ok && moduleSyntax.ok, 'engine + modulo', 'critico', [engineSyntax.output, moduleSyntax.output].filter(Boolean));
try{
  const engine = await import(pathToFileURL(full('core/cad/cadEngine.js')).href + '?t=' + Date.now());
  const doc = engine.buildCadFromProject({ id: 'GIAE-CAD-DEMO', name: 'Proyecto CAD demo', supplyType: 'monofasico', loads: [{ id: 'C01', name: 'Luz living', type: 'Alumbrado', powerW: 100 }, { id: 'C02', name: 'Enchufe cocina', type: 'Enchufes', powerW: 900 }] });
  const validation = engine.validateCadDocument(doc);
  const pack = engine.createCadExportPackage({ id: 'GIAE-CAD-DEMO', name: 'Proyecto CAD demo' }, doc);
  add('engine-genera', 'Motor genera plano CAD valido', validation.score === 100 && validation.status === 'listo_para_revision' && pack.fileType === 'GIAE_CAD_PLAN', validation.status + ' / ' + validation.score + '% / ' + doc.entities.length + ' entidades', 'critico', [validation]);
}catch(error){ add('engine-genera', 'Motor genera plano CAD valido', false, String(error.message || error), 'critico'); }
try{
  const data = json('data/cad/electrical-symbols.json');
  add('simbolos-validos', 'Simbolos y capas validos', Array.isArray(data.layers) && data.layers.length >= 8 && Array.isArray(data.symbols) && data.symbols.length >= 8, `${data.layers?.length || 0} capas / ${data.symbols?.length || 0} simbolos`, 'alto');
}catch(error){ add('simbolos-validos', 'Simbolos y capas validos', false, String(error.message || error), 'alto'); }
add('docs-fase5', 'Docs y datos Fase 5 presentes', exists('docs/FASE_5_CAD_ELECTRICO_GIAE.md') && exists('docs/data/producto/fase-5-cad.json'), 'docs fase 5', 'alto');
add('readme-fase5', 'README documenta Fase 5', has('README.md', 'Fase 5 CAD electrico') && has('README.md', 'tools/phase5-cad-check.mjs'), 'README', 'medio');
add('sin-copia-autocad', 'Fase 5 declara no copiar AutoCAD', has('docs/FASE_5_CAD_ELECTRICO_GIAE.md', 'No copia AutoCAD') && has('data/cad/electrical-symbols.json', 'No copia bloques CAD propietarios'), 'limite declarado', 'alto');
add('exportacion-documentada', 'Exportacion .giaecad documentada', has('docs/FASE_5_CAD_ELECTRICO_GIAE.md', '.giaecad') && has('core/cad/cadEngine.js', 'GIAE_CAD_PLAN'), 'formato propio', 'alto');

const criticalFails = checks.filter(check => !check.ok && check.level === 'critico');
const highFails = checks.filter(check => !check.ok && check.level === 'alto');
const okCount = checks.filter(check => check.ok).length;
const score = Math.round((okCount / checks.length) * 100);
const status = criticalFails.length ? 'bloqueado' : highFails.length ? 'con_observaciones' : 'apto_para_prueba_manual';
const report = { schema: 'giae.diagnostico.fase5-cad.v1', generatedAt: new Date().toISOString(), score, status, root, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, checks };
console.log('GIAE Chile - Diagnostico Fase 5 CAD');
console.log('Estado: ' + status + ' | Puntaje: ' + score + '%');
for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){ const target = full(reportTarget); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8'); console.log('Reporte escrito en ' + reportTarget); }
process.exit(criticalFails.length ? 1 : 0);