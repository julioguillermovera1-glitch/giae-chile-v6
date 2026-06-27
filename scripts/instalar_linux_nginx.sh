#!/usr/bin/env bash
set -e

DESTINO="${1:-/var/www/giae-chile}"
SITIO="/etc/nginx/sites-available/giae-chile"
SITIO_ACTIVO="/etc/nginx/sites-enabled/giae-chile"

echo "Instalador GIAE Chile v1.0 para Linux/Nginx"
echo "Creador y autor principal: Julio Vera Concha"
echo "Regla de oro: prohibido plagiar. Solo código y documentación propia o con licencia."

ORIGEN="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -d "$ORIGEN/public" ]; then
  echo "ERROR: No se encontró la carpeta public."
  exit 1
fi

sudo mkdir -p "$DESTINO"
sudo cp -R "$ORIGEN/public/"* "$DESTINO/"
sudo chown -R www-data:www-data "$DESTINO"

if ! command -v nginx >/dev/null 2>&1; then
  echo "Nginx no está instalado. Instalando..."
  sudo apt update
  sudo apt install -y nginx
fi

sudo tee "$SITIO" >/dev/null <<NGINX
server {
    listen 80;
    server_name _;

    root $DESTINO;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|svg|webp|ico|json)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
NGINX

sudo ln -sf "$SITIO" "$SITIO_ACTIVO"
sudo nginx -t
sudo systemctl reload nginx

echo "GIAE Chile instalado en $DESTINO"
echo "Abre la IP del servidor en el navegador."
