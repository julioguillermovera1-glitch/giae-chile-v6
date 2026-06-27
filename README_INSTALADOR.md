# Instalador de Servidor – GIAE Chile v1.0

**Creador y Autor Principal:** Julio Vera Concha

Este paquete prepara GIAE Chile para ser publicado en servidor local, Windows Server, Linux/Nginx o Cloudflare Pages.

## Regla de oro

GIAE Chile no debe plagiar código, textos, diseños, imágenes ni documentación.
Todo debe ser propio o contar con licencia compatible y registro.

## Estructura del paquete

```txt
public/      Archivos públicos del sistema
scripts/     Instaladores y verificador
docs/        Documentación base del proyecto
config/      Configuración futura
```

## Instalación rápida con Node

```bash
npm install
npm start
```

Luego abrir:

```txt
http://localhost:8080
```

## Windows Server / IIS

Ejecutar PowerShell como administrador:

```powershell
Set-ExecutionPolicy RemoteSigned -Scope Process
.\scripts\instalar_windows.ps1
```

Luego crear un sitio en IIS apuntando a:

```txt
C:\giae-chile
```

## Linux / Nginx

```bash
chmod +x scripts/instalar_linux_nginx.sh
./scripts/instalar_linux_nginx.sh
```

## Verificación

```bash
npm test
```

## Nota importante

Este instalador no cambia la lógica eléctrica ni normativa.
Solo prepara el proyecto para publicación ordenada en servidor.
