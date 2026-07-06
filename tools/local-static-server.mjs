#!/usr/bin/env node
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const port = Number(process.argv[2] || process.env.GIAE_PORT || 8787);
const host = process.env.GIAE_HOST || '127.0.0.1';
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jsonc': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.pdf': 'application/pdf'
};

function resolveFile(rawUrl){
  const url = new URL(rawUrl, 'http://127.0.0.1');
  let pathname = decodeURIComponent(url.pathname);
  if(pathname === '/') pathname = '/index.html';
  let file = path.normalize(path.join(root, pathname));
  if(!file.startsWith(root)) return null;
  if(fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if(!fs.existsSync(file)) file = path.join(root, 'index.html');
  return file;
}

const server = http.createServer((request, response) => {
  try{
    const file = resolveFile(request.url || '/');
    if(!file){
      response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Forbidden');
      return;
    }
    const ext = path.extname(file).toLowerCase();
    response.setHeader('Content-Type', types[ext] || 'application/octet-stream');
    response.setHeader('Cache-Control', 'no-cache');
    fs.createReadStream(file).pipe(response);
  }catch(error){
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(String(error?.message || error));
  }
});

server.listen(port, host, () => {
  console.log('GIAE local server: http://' + host + ':' + port + '/');
});
