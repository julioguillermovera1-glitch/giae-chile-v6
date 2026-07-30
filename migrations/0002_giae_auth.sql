-- Agrega soporte de login real a la tabla users existente.
-- No destructivo: usa ALTER TABLE ADD COLUMN sobre la tabla ya creada en 0001.
-- account_type: 'empresa' | 'independiente' | 'super_admin'.
-- password_hash: formato "salt:hexdigest" (SHA-256 con sal, ver src/worker.js).
-- permissions_json: array JSON de permisos ("project.manage", etc.).

ALTER TABLE users ADD COLUMN password_hash TEXT;
ALTER TABLE users ADD COLUMN account_type TEXT NOT NULL DEFAULT 'empresa';
ALTER TABLE users ADD COLUMN permissions_json TEXT NOT NULL DEFAULT '[]';

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_account_type ON users(account_type);
