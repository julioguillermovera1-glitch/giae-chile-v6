# GIAE Chile v1.3.1 PWA limpio

Versión limpia para reemplazar la raíz del repositorio completo.

## Correcciones principales
- Service Worker robusto: no falla si un archivo secundario no responde.
- Offline HTML incluido y cacheado con respaldo interno.
- Manifest PWA corregido con rutas absolutas.
- `index.html` e `indice.html` quedan sincronizados.
- Mantiene assets, funciones API, Motor RIC, Auditoría Inteligente, Exportación y estructura PWA.

## Cómo subir
1. Entrar a GitHub en la rama `principal`.
2. Subir el contenido completo de esta carpeta, reemplazando archivos existentes.
3. Confirmar cambios.
4. Esperar despliegue de Cloudflare.
5. Probar:
   - `/`
   - `/manifest.json`
   - `/service-worker.js`
   - `/offline.html`
   - `/assets/giae-logo.svg`

Creado y desarrollado por Julio Vera Concha · © 2026
