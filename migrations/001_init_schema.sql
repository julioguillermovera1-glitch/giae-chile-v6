-- GIAE Chile v6 - Esquema SQL inicial (D1 - SQLite)
-- Tablas para usuarios, proyectos, planos CAD y archivos

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  empresa TEXT,
  licencia TEXT NOT NULL DEFAULT 'trial',
  estado TEXT NOT NULL DEFAULT 'activo',
  rol TEXT NOT NULL DEFAULT 'usuario',
  fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
  fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS proyectos (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  usuario_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL DEFAULT 'residencial',
  estado TEXT NOT NULL DEFAULT 'borrador',
  fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
  fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planos_cad (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  proyecto_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  escala TEXT DEFAULT '1:50',
  unidades TEXT DEFAULT 'mm',
  estado TEXT NOT NULL DEFAULT 'borrador',
  r2_path TEXT,
  contenido_json TEXT,
  fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
  fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS archivos (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  proyecto_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  r2_path TEXT NOT NULL,
  tamaño INTEGER,
  descripcion TEXT,
  fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS historial_cambios (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  usuario_id TEXT NOT NULL,
  proyecto_id TEXT,
  plano_id TEXT,
  accion TEXT NOT NULL,
  descripcion TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE SET NULL,
  FOREIGN KEY (plano_id) REFERENCES planos_cad(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS licencias (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  usuario_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  modulos TEXT,
  fecha_inicio TEXT NOT NULL DEFAULT (datetime('now')),
  fecha_expiracion TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_licencia ON usuarios(licencia);
CREATE INDEX IF NOT EXISTS idx_proyectos_usuario ON proyectos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_planos_proyecto ON planos_cad(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_archivos_proyecto ON archivos(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_historial_usuario ON historial_cambios(usuario_id);
CREATE INDEX IF NOT EXISTS idx_historial_proyecto ON historial_cambios(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_licencias_usuario ON licencias(usuario_id);
