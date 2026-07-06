#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const args = process.argv.slice(2);
const writeIndex = args.indexOf('--write');
const reportTarget = writeIndex >= 0 ? (args[writeIndex + 1] || 'docs/data/producto/fase-2-installable-last-report.json') : null;
const checks = [];
const full = file => path.join(root, file);
const exists = file => fs.existsSync(full(file));
const read = file => fs.readFileSync(full(file), 'utf8');
const add = (id, name, ok, detail, level = 'alto', evidence = []) => checks.push({ id, name, ok: Boolean(ok), level, detail, evidence });

function json(file){ return JSON.parse(read(file)); }
function has(file, text){ return exists(file) && read(file).includes(text); }
function checkJs(file){
  const result = spawnSync(process.execPath, ['--check', full(file)], { encoding: 'utf8' });
  return { ok: result.status === 0, output: (result.stderr || result.stdout || '').trim() };
}

add('manifest-existe', 'Manifest PWA existe', exists('manifest.webmanifest'), 'manifest.webmanifest', 'critico');
if(exists('manifest.webmanifest')){
  const manifest = json('manifest.webmanifest');
  add('manifest-identidad', 'Manifest tiene identidad de app', manifest.name === 'GIAE Chile' && manifest.short_name === 'GIAE', 'name y short_name definidos', 'critico');
  add('manifest-display', 'Manifest usa modo instalable', ['standalone','fullscreen','minimal-ui'].includes(manifest.display), 'display=' + manifest.display, 'critico');
  add('manifest-start-scope', 'Manifest tiene start_url y scope', Boolean(manifest.start_url && manifest.scope), 'start_url=' + manifest.start_url + ' scope=' + manifest.scope, 'critico');
  const icons = Array.isArray(manifest.icons) ? manifest.icons : [];
  const missingIcons = icons.map(icon => icon.src).filter(src => !exists(src));
  add('manifest-iconos', 'Manifest referencia iconos existentes', icons.length >= 3 && missingIcons.length === 0, icons.length + ' icono(s)', 'critico', missingIcons);
}
add('index-manifest', 'index.html enlaza manifest e iconos', has('index.html','manifest.webmanifest') && has('index.html','apple-touch-icon') && has('index.html','theme-color'), 'manifest, theme-color y apple-touch-icon', 'critico');
add('pwa-registro', 'Registro PWA incorporado', has('core/main.js','registerGiaePwa') && has('core/pwa.js','navigator.serviceWorker.register'), 'core/main.js + core/pwa.js', 'critico');
add('service-worker', 'Service worker propio existe', exists('sw.js') && has('sw.js','GIAE_CACHE_VERSION') && has('sw.js',"self.addEventListener('fetch'") && has('sw.js','offline.html'), 'sw.js con cache, fetch y offline', 'critico');
add('offline-page', 'Pagina offline existe y es local', exists('offline.html') && has('offline.html','GIAE Chile sin conexion') && !/https?:\/\//i.test(read('offline.html')), 'offline.html sin dependencias remotas', 'alto');
add('icono-svg', 'Icono SVG propio existe', exists('assets/icons/giae-icon.svg') && fs.statSync(full('assets/icons/giae-icon.svg')).size > 200, 'assets/icons/giae-icon.svg', 'alto');
add('icono-png-192', 'Icono PNG 192 existe', exists('assets/icons/giae-icon-192.png') && fs.statSync(full('assets/icons/giae-icon-192.png')).size > 200, 'assets/icons/giae-icon-192.png', 'alto');
add('icono-png-512', 'Icono PNG 512 existe', exists('assets/icons/giae-icon-512.png') && fs.statSync(full('assets/icons/giae-icon-512.png')).size > 200, 'assets/icons/giae-icon-512.png', 'alto');
const pwaSyntax = checkJs('core/pwa.js');
const swSyntax = checkJs('sw.js');
add('js-pwa-valido', 'JavaScript PWA valido', pwaSyntax.ok && swSyntax.ok, 'core/pwa.js y sw.js', 'critico', [pwaSyntax.output, swSyntax.output].filter(Boolean));
add('docs-fase2', 'Documentos y datos de Fase 2 presentes', exists('docs/FASE_2_INSTALABLE_GIAE.md') && exists('docs/data/producto/fase-2-instalable.json'), 'docs fase 2', 'alto');
add('servidor-local', 'Servidor local de prueba existe', exists('tools/local-static-server.mjs') && checkJs('tools/local-static-server.mjs').ok, 'tools/local-static-server.mjs', 'alto');
add('readme-fase2', 'README declara Fase 2 como instalable local en proceso', has('README.md','Fase 2 instalable local') && has('README.md','no reemplaza la prueba manual'), 'README con limites honestos', 'medio');
add('sin-assets-remotos', 'Entrada sin scripts o estilos remotos', !/<(script|link)[^>]+(?:src|href)=["']https?:\/\//i.test(read('index.html')), 'index.html sin scripts/estilos remotos', 'alto');

const criticalFails = checks.filter(check => !check.ok && check.level === 'critico');
const highFails = checks.filter(check => !check.ok && check.level === 'alto');
const okCount = checks.filter(check => check.ok).length;
const score = Math.round((okCount / checks.length) * 100);
const status = criticalFails.length ? 'bloqueado' : highFails.length ? 'con_observaciones' : 'apto_para_prueba_manual';
const report = {
  schema: 'giae.diagnostico.fase2-instalable.v1',
  generatedAt: new Date().toISOString(),
  score,
  status,
  root,
  summary: { total: checks.length, ok: okCount, failed: checks.length - okCount, criticalFails: criticalFails.length, highFails: highFails.length },
  checks
};

console.log('GIAE Chile - Diagnostico Fase 2 instalable');
console.log('Estado: ' + status + ' | Puntaje: ' + score + '%');
for(const check of checks) console.log((check.ok ? '[OK] ' : '[REVISAR] ') + check.name + ' - ' + check.detail);
if(reportTarget){
  const target = full(reportTarget);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', 'utf8');
  console.log('Reporte escrito en ' + reportTarget);
}
process.exit(criticalFails.length ? 1 : 0);

