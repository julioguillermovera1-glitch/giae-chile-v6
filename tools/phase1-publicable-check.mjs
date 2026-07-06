#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const writeIndex = args.indexOf('--write');
const reportTarget = writeIndex >= 0 ? (args[writeIndex + 1] || 'docs/data/producto/fase-1-publicable-last-report.json') : null;
const ignoredParts = new Set(['.git']);
const textExtensions = new Set(['.html', '.js', '.mjs', '.css', '.md', '.json', '.jsonc']);
const checks = [];
function rel(file){ return file.split(path.sep).join('/'); }
function full(file){ return path.join(root, file); }
function exists(file){ return fs.existsSync(full(file)); }
function read(file){ return fs.readFileSync(full(file), 'utf8'); }
function add(id, name, ok, detail, level = 'medio', evidence = []){ checks.push({ id, name, ok: Boolean(ok), level, detail, evidence }); }
function listFiles(dir){
  const base = full(dir); if(!fs.existsSync(base)) return [];
  const output = [];
  const walk = current => { for(const entry of fs.readdirSync(current, { withFileTypes: true })){ if(ignoredParts.has(entry.name)) continue; const next = path.join(current, entry.name); if(entry.isDirectory()) walk(next); else output.push(rel(path.relative(root, next))); } };
  walk(base); return output;
}
function stripJsonComments(text){ return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\s)\/\/.*$/gm, '$1'); }
function parseModuleRegistry(){ const source = read('core/moduleRegistry.js'); const paths = []; const regex = /id:\s*['"]([^'"]+)['"][\s\S]*?path:\s*['"]([^'"]+)['"]/g; let match; while((match = regex.exec(source))){ paths.push({ id: match[1], importPath: match[2] }); } return paths; }
function resolveModulePath(importPath){ return rel(path.normalize(path.join('core', importPath))); }
function checkJsSyntax(files){ const failures = []; for(const file of files){ const result = spawnSync(process.execPath, ['--check', full(file)], { encoding: 'utf8' }); if(result.status !== 0) failures.push({ file, error: (result.stderr || result.stdout || '').trim().slice(0, 500) }); } return failures; }
function checkJson(files){ const failures = []; for(const file of files){ try{ const text = file.endsWith('.jsonc') ? stripJsonComments(read(file)) : read(file); JSON.parse(text); }catch(error){ failures.push({ file, error: String(error.message || error).slice(0, 300) }); } } return failures; }
function scanText(files, pattern){ const hits = []; for(const file of files){ if(pattern.test(read(file))) hits.push(file); } return hits; }
const officialFiles = ['index.html', 'core/main.js', 'css/platform.css'];
add('entrada-oficial', 'Entrada oficial disponible', officialFiles.every(exists), officialFiles.join(', '), 'critico', officialFiles);
if(exists('index.html')){ const index = read('index.html'); add('index-conecta-core', 'index.html conecta app nueva', index.includes('css/platform.css') && index.includes('core/main.js'), 'Debe cargar css/platform.css y core/main.js', 'critico'); }
add('legado-identificado', 'Legado identificado', exists('js/app.js') && exists('css/styles.css') && exists('README.md') && read('README.md').toLowerCase().includes('legado'), 'js/app.js y css/styles.css quedan tratados como legado', 'medio');
const modules = parseModuleRegistry();
const missingModules = []; const missingRender = [];
for(const item of modules){ const file = resolveModulePath(item.importPath); if(!exists(file)) missingModules.push({ id: item.id, file }); else if(!/export\s+(async\s+)?function\s+render\s*\(/.test(read(file))) missingRender.push({ id: item.id, file }); }
add('modulos-rutas', 'Rutas de modulos existentes', missingModules.length === 0 && modules.length > 0, modules.length + ' modulo(s) revisados', 'critico', missingModules);
add('modulos-render', 'Modulos exportan render', missingRender.length === 0 && modules.length > 0, modules.length + ' modulo(s) con contrato de render', 'critico', missingRender);
const jsFiles = listFiles('.').filter(file => ['.js', '.mjs'].includes(path.extname(file)));
const jsFailures = checkJsSyntax(jsFiles); add('js-sintaxis', 'Sintaxis JavaScript valida', jsFailures.length === 0, jsFiles.length + ' archivo(s) JS/MJS revisados', 'critico', jsFailures);
const jsonFiles = listFiles('.').filter(file => ['.json', '.jsonc'].includes(path.extname(file)));
const jsonFailures = checkJson(jsonFiles); add('json-valido', 'JSON y JSONC validos', jsonFailures.length === 0, jsonFiles.length + ' archivo(s) de datos revisados', 'critico', jsonFailures);
const productFiles = ['docs/ROADMAP_6_FASES_GIAE_CHILE.md', 'docs/FASE_1_PUBLICABLE_GIAE.md', 'docs/data/producto/product-manifest.json', 'docs/data/producto/roadmap-6-fases.json', 'docs/data/producto/fase-1-publicable.json'];
add('producto-fase1', 'Documentos y datos de Fase 1 presentes', productFiles.every(exists), productFiles.join(', '), 'alto', productFiles.filter(file => !exists(file)));
const htmlFiles = ['index.html', 'indice.html'].filter(exists); const externalAssetHits = [];
for(const file of htmlFiles){ const matches = [...read(file).matchAll(/<(script|link)[^>]+(?:src|href)=['"](https?:\/\/[^'"]+)['"][^>]*>/gi)]; matches.forEach(match => externalAssetHits.push({ file, tag: match[1], url: match[2] })); }
add('sin-assets-remotos', 'Sin scripts o estilos remotos en entrada', externalAssetHits.length === 0, externalAssetHits.length ? 'Revisar dependencias externas' : 'Entradas sin dependencias remotas activas', 'alto', externalAssetHits);
const textFiles = listFiles('.').filter(file => textExtensions.has(path.extname(file)));
const mojibake = scanText(textFiles, /[\uFFFD]/); add('texto-legible', 'Texto sin caracteres de reemplazo', mojibake.length === 0, mojibake.length ? 'Hay archivos con caracteres corruptos' : 'No se detecto caracter de reemplazo UTF-8', 'medio', mojibake.slice(0, 50));
const ds8ScanFiles = textFiles.filter(file => !['tools/phase1-publicable-check.mjs', 'core/store.js'].includes(file));
const ds8BadHits = scanText(ds8ScanFiles, /Decreto\s+de\s+Ley\s+N|DL8/gi); add('ds8-normalizado', 'DS8 sin denominacion antigua activa', ds8BadHits.length === 0, ds8BadHits.length ? 'Revisar referencias DL8/Decreto de Ley fuera de migracion interna' : 'No se detectaron referencias antiguas fuera de migracion interna', 'medio', ds8BadHits.slice(0, 50));
const readme = exists('README.md') ? read('README.md') : ''; add('readme-publicable', 'README declara estado publicable honesto', /fase de depuracion/i.test(readme) && /no copiar/i.test(readme), 'README debe evitar prometer version final', 'alto');
const criticalFails = checks.filter(check => !check.ok && check.level === 'critico'); const highFails = checks.filter(check => !check.ok && check.level === 'alto'); const okCount = checks.filter(check => check.ok).length; const score = Math.round((okCount / checks.length) * 100); const status = criticalFails.length ? 'bloqueado' : highFails.length ? 'con_observaciones' : 'apto_para_prueba_manual';
const report = { schema: 'giae.diagnostico.fase1-publicable.v1', generatedAt: new Date().toISOString(), score, status, root, summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length }, checks };
console.log('GIAE Chile - Diagnostico Fase 1 publicable'); console.log('Estado: ' + status + ' | Puntaje: ' + score + '%'); for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){ const target = full(reportTarget); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8'); console.log('Reporte escrito en ' + reportTarget); }
process.exit(criticalFails.length ? 1 : 0);

