#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const args = process.argv.slice(2);
const writeIndex = args.indexOf('--write');
const reportTarget = writeIndex >= 0 ? (args[writeIndex + 1] || 'docs/data/producto/fase-3-documental-last-report.json') : null;
const checks = [];
const full = file => path.join(root, file);
const exists = file => fs.existsSync(full(file));
const read = file => fs.readFileSync(full(file), 'utf8');
const add = (id, name, ok, detail, level = 'alto', evidence = []) => checks.push({ id, name, ok: Boolean(ok), level, detail, evidence });
function checkJs(file){ const result = spawnSync(process.execPath, ['--check', full(file)], { encoding: 'utf8' }); return { ok: result.status === 0, output: (result.stderr || result.stdout || '').trim() }; }
function json(file){ return JSON.parse(read(file)); }
function has(file, text){ return exists(file) && read(file).includes(text); }

add('engine-existe', 'Motor documental existe', exists('core/document-intelligence/documentIntelligenceEngine.js'), 'core/document-intelligence/documentIntelligenceEngine.js', 'critico');
add('modulo-existe', 'Modulo lector documental existe', exists('modules/lector-documental/lector-documental.js'), 'modules/lector-documental/lector-documental.js', 'critico');
add('tipos-existen', 'Tipos documentales existen', exists('data/document-intelligence/document-types.json'), 'data/document-intelligence/document-types.json', 'critico');
add('registro-menu', 'Modulo registrado en menu', has('core/moduleRegistry.js', 'lector-documental') && has('core/moduleRegistry.js', '../modules/lector-documental/lector-documental.js'), 'core/moduleRegistry.js', 'critico');
add('admin-integrado', 'Administracion reconoce Fase 3', has('modules/administracion/administracion.js', 'Fase 3 activa') && has('modules/administracion/administracion.js', 'lector-documental'), 'Panel administrador', 'alto');
add('sw-cache', 'PWA cachea lector documental', has('sw.js', './modules/lector-documental/lector-documental.js') && has('sw.js', './core/document-intelligence/documentIntelligenceEngine.js'), 'sw.js', 'alto');
const engineSyntax = checkJs('core/document-intelligence/documentIntelligenceEngine.js');
const moduleSyntax = checkJs('modules/lector-documental/lector-documental.js');
add('js-valido', 'JavaScript documental valido', engineSyntax.ok && moduleSyntax.ok, 'engine + modulo', 'critico', [engineSyntax.output, moduleSyntax.output].filter(Boolean));
try{
  const engine = await import(pathToFileURL(full('core/document-intelligence/documentIntelligenceEngine.js')).href + '?t=' + Date.now());
  const analysis = engine.analyzeDocumentContent({ text: 'Proyecto prueba con memoria tecnica RIC DS8 potencia tablero conductor cliente', file: { name: 'memoria.txt', type: 'text/plain', size: 80 }, hash: 'demo' });
  add('engine-analiza', 'Motor analiza documento demo', analysis.classification.id === 'memoria_tecnica' && analysis.signals.length >= 3, analysis.classification.id + ' / ' + analysis.signals.length + ' senales', 'critico', [analysis]);
}catch(error){ add('engine-analiza', 'Motor analiza documento demo', false, String(error.message || error), 'critico'); }
try{
  const data = json('data/document-intelligence/document-types.json');
  add('tipos-validos', 'Tipos documentales validos', Array.isArray(data.tipos) && data.tipos.length >= 5, String(data.tipos?.length || 0) + ' tipos', 'alto');
}catch(error){ add('tipos-validos', 'Tipos documentales validos', false, String(error.message || error), 'alto'); }
add('docs-fase3', 'Docs y datos Fase 3 presentes', exists('docs/FASE_3_INTELIGENCIA_DOCUMENTAL_GIAE.md') && exists('docs/data/producto/fase-3-documental.json'), 'docs fase 3', 'alto');
add('readme-fase3', 'README documenta Fase 3', has('README.md', 'Fase 3 inteligencia documental') && has('README.md', 'tools/phase3-document-intelligence-check.mjs'), 'README', 'medio');
add('sin-promesa-excesiva', 'Fase 3 declara limites honestos', has('docs/FASE_3_INTELIGENCIA_DOCUMENTAL_GIAE.md', 'No hace OCR todavia') && has('docs/FASE_3_INTELIGENCIA_DOCUMENTAL_GIAE.md', 'No certifica cumplimiento final'), 'limites declarados', 'alto');

const criticalFails = checks.filter(check => !check.ok && check.level === 'critico');
const highFails = checks.filter(check => !check.ok && check.level === 'alto');
const okCount = checks.filter(check => check.ok).length;
const score = Math.round((okCount / checks.length) * 100);
const status = criticalFails.length ? 'bloqueado' : highFails.length ? 'con_observaciones' : 'apto_para_prueba_manual';
const report = { schema: 'giae.diagnostico.fase3-documental.v1', generatedAt: new Date().toISOString(), score, status, root, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, checks };
console.log('GIAE Chile - Diagnostico Fase 3 documental');
console.log('Estado: ' + status + ' | Puntaje: ' + score + '%');
for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){ const target = full(reportTarget); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8'); console.log('Reporte escrito en ' + reportTarget); }
process.exit(criticalFails.length ? 1 : 0);

