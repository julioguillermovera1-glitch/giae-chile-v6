param(
  [string]$Destino = "C:\giae-chile",
  [int]$Puerto = 8080
)

Write-Host "Instalador GIAE Chile v1.0 para Windows Server" -ForegroundColor Green
Write-Host "Creador y autor principal: Julio Vera Concha"
Write-Host "Regla de oro: prohibido plagiar. Solo código y documentación propia o con licencia."

$Origen = Split-Path -Parent $PSScriptRoot
$PublicOrigen = Join-Path $Origen "public"

if (!(Test-Path $PublicOrigen)) {
  Write-Host "ERROR: No se encontró la carpeta public." -ForegroundColor Red
  exit 1
}

if (!(Test-Path $Destino)) {
  New-Item -ItemType Directory -Path $Destino | Out-Null
}

Copy-Item -Path (Join-Path $PublicOrigen "*") -Destination $Destino -Recurse -Force

Write-Host ""
Write-Host "Archivos copiados en: $Destino" -ForegroundColor Green

Write-Host ""
Write-Host "Opción IIS:"
Write-Host "1) Abrir Administrador de IIS."
Write-Host "2) Crear sitio apuntando a: $Destino"
Write-Host "3) Puerto sugerido: $Puerto"
Write-Host "4) Documento predeterminado: index.html"

Write-Host ""
Write-Host "Opción rápida con Node:"
Write-Host "cd $Origen"
Write-Host "npm install"
Write-Host "npm start"

Write-Host ""
Write-Host "Instalación preparada."
