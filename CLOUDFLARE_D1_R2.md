# D1 + R2 en GIAE Chile v6

## ✅ Configuración completada

### D1 - Base de datos SQL (SQLite)
- ✅ Configurado en `wrangler.jsonc`
- ✅ Binding: `DB`
- ✅ Tablas: usuarios, proyectos, planos_cad, archivos, historial_cambios, licencias

### R2 - Almacenamiento de archivos
- ✅ Configurado en `wrangler.jsonc`
- ✅ Binding: `R2`
- ✅ Bucket: `giae-storage`

---

## 🚀 Instalación en Cloudflare

### 1. Crear D1
```bash
wrangler d1 create giae-production
wrangler d1 create giae-dev
```

### 2. Crear R2
```bash
wrangler r2 bucket create giae-storage-prod
wrangler r2 bucket create giae-storage-dev
```

### 3. Ejecutar migrations SQL
```bash
wrangler d1 migrations apply giae-production
wrangler d1 migrations apply giae-dev
```

### 4. Desplegar
```bash
wrangler deploy --env production
```

---

## 📡 APIs disponibles

Base URL: `/api/giae`

### Usuarios
- **POST** `/usuarios` - Crear usuario
- **GET** `/usuarios/{email}` - Obtener usuario

### Proyectos
- **POST** `/proyectos?user_id=xxx` - Crear proyecto
- **GET** `/proyectos?user_id=xxx` - Listar proyectos del usuario

### Planos CAD
- **POST** `/planos?project_id=xxx` - Guardar plano (D1 + R2)
- **GET** `/planos/{plan_id}` - Cargar plano desde R2

### Archivos
- **POST** `/archivos/upload?project_id=xxx` - Subir archivo a R2
- **GET** `/archivos/proyecto/{project_id}` - Listar archivos del proyecto

### Historial
- **POST** `/historial` - Registrar cambio

### Health Check
- **GET** `/health` - Verificar estado D1 + R2

---

## 💾 Estructura de datos

### Usuarios
```javascript
{
  id: string,
  email: string,
  nombre: string,
  empresa: string,
  licencia: "trial" | "pro" | "enterprise",
  estado: "activo" | "suspendido",
  rol: "usuario" | "admin"
}
```

### Proyectos
```javascript
{
  id: string,
  usuario_id: string,
  nombre: string,
  descripcion: string,
  tipo: "residencial" | "comercial" | "industrial",
  estado: "borrador" | "activo" | "finalizado"
}
```

### Planos CAD
```javascript
{
  id: string,
  proyecto_id: string,
  nombre: string,
  escala: "1:50",
  unidades: "mm" | "cm" | "m",
  r2_path: "cad/proyecto-id/plan-id.giaecad",
  contenido_json: {...}
}
```

---

## 🔌 Integración en frontend

Ejemplo para guardar un plano CAD:

```javascript
// En modules/cad-electrico/cad-electrico.js
async function saveCadToCloudflare(projectId, cadDocument) {
  const response = await fetch("/api/giae/planos?project_id=" + projectId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      nombre: cadDocument.name,
      escala: cadDocument.scale,
      unidades: cadDocument.units,
      contenido: cadDocument
    })
  });
  
  const result = await response.json();
  if (result.success) {
    console.log("✅ Plano guardado en D1 + R2:", result.planId);
  }
}
```

---

## 🛡️ Seguridad

- ✅ Bindings seguros en Cloudflare
- ✅ CORS configurado para APIs
- ✅ Validación de entrada en todas las rutas
- ✅ Índices SQL para performance
- ✅ R2 con control de acceso

---

## 📊 Performance

- D1: SQLite optimizado con índices
- R2: Almacenamiento distribuido global
- Cache: 1 hora para archivos estáticos
- Queries preparadas para evitar SQL injection

---

## ⚙️ Próximos pasos

1. Conectar módulos de GIAE a las APIs
2. Implementar autenticación con usuarios D1
3. Sincronización automática de planos
4. Sistema de respaldo a R2
5. Auditoría en historial_cambios
