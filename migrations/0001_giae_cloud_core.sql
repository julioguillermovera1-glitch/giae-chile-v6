-- GIAE Cloud Core - D1 schema v1
-- Ejecutar con: wrangler d1 migrations apply giae-db --remote

CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, rut TEXT, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'activo', brand_json TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS roles (id TEXT PRIMARY KEY, company_id TEXT NOT NULL DEFAULT 'global', name TEXT NOT NULL, permissions_json TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'activo', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, email TEXT NOT NULL, name TEXT NOT NULL, role_id TEXT, status TEXT NOT NULL DEFAULT 'activo', last_seen_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(company_id, email));
CREATE TABLE IF NOT EXISTS licenses (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, plan TEXT NOT NULL, seats INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'preparacion_local', valid_until TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS projects (id TEXT PRIMARY KEY, company_id TEXT NOT NULL, owner_user_id TEXT, name TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'En desarrollo', meta_json TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS project_revisions (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 1, hash TEXT NOT NULL, summary_json TEXT, author_user_id TEXT, r2_key TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS file_assets (id TEXT PRIMARY KEY, project_id TEXT, kind TEXT NOT NULL, r2_binding TEXT NOT NULL, r2_key TEXT NOT NULL, sha256 TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS audit_events (id TEXT PRIMARY KEY, company_id TEXT, project_id TEXT, user_id TEXT, action TEXT NOT NULL, detail_json TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS sync_queue (id TEXT PRIMARY KEY, project_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pendiente', operation TEXT NOT NULL, payload_hash TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, processed_at TEXT);
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_projects_company ON projects(company_id);
CREATE INDEX IF NOT EXISTS idx_revisions_project ON project_revisions(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_files_project ON file_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_audit_project ON audit_events(project_id, created_at);
CREATE INDEX IF NOT EXISTS idx_sync_project ON sync_queue(project_id, status);
INSERT OR IGNORE INTO roles (id, company_id, name, permissions_json, status) VALUES
('owner', 'global', 'Administrador empresa', '["workspace.manage","license.manage","user.manage","project.read","project.write","file.write","audit.read"]', 'activo'),
('supervisor', 'global', 'Supervisor tecnico', '["project.read","project.write","file.write","audit.read"]', 'activo'),
('installer', 'global', 'Instalador autorizado', '["project.read","project.write","file.write"]', 'activo'),
('quote', 'global', 'Cotizador', '["project.read","budget.write"]', 'activo'),
('readonly', 'global', 'Solo lectura', '["project.read"]', 'activo'),
('student', 'global', 'Estudiante', '["learning.read","demo.write"]', 'activo');