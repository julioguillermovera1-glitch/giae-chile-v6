const API_PREFIX = "/api/giae";
const R2_BINDINGS = ["GIAE_PROJECT_BACKUPS", "GIAE_PROJECT_DOCUMENTS", "GIAE_BRAND_ASSETS", "GIAE_FIELD_MEDIA"];
const ALL_PERMISSIONS = ["project.manage", "inventory.view", "inventory.manage", "users.manage", "docs.view", "budget.view"];
const DEFAULT_COMPANY_ID = "giae-default";
const DEFAULT_ADMIN_EMAIL = "administrador@giae.cl";
const DEFAULT_ADMIN_PASSWORD = "Vwe6PTk5KgW";
const ACCOUNT_TYPES_BY_MODE = { administrador: "super_admin", independiente: "independiente", pueblos: "pueblos", empresa: "empresa" };
const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(data, init = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status: init.status || 200,
    headers: { ...JSON_HEADERS, ...(init.headers || {}) }
  });
}

function text(message, status = 200) {
  return new Response(message, {
    status,
    headers: { "content-type": "text/plain; charset=utf-8" }
  });
}

async function readJson(request) {
  const body = await request.text();
  if (!body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error("JSON invalido");
  }
}

function now() {
  return new Date().toISOString();
}

function uid(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function hasBinding(env, name) {
  return Boolean(env && env[name]);
}

function hasDb(env) {
  return hasBinding(env, "GIAE_DB");
}

function envStatus(env) {
  return {
    environment: env?.GIAE_ENV || "production",
    bindingsMode: env?.GIAE_BINDINGS_MODE || "unknown",
    assets: hasBinding(env, "ASSETS"),
    d1: hasDb(env),
    r2: Object.fromEntries(R2_BINDINGS.map(name => [name, hasBinding(env, name)])),
    writeSecretConfigured: Boolean(env?.GIAE_API_TOKEN)
  };
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function randomSalt() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function hashPasswordWithSalt(password, salt) {
  const digest = await sha256Hex(`${salt}:${password}`);
  return `${salt}:${digest}`;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const salt = stored.split(":")[0];
  const computed = await hashPasswordWithSalt(password, salt);
  return computed === stored;
}

async function ensureDefaultCompanyAndAdmin(env) {
  const createdAt = now();
  await env.GIAE_DB.prepare(
    "INSERT INTO companies (id, name, status, created_at, updated_at) VALUES (?, ?, 'activo', ?, ?) ON CONFLICT(id) DO NOTHING"
  ).bind(DEFAULT_COMPANY_ID, "GIAE Chile", createdAt, createdAt).run();

  const existingAdmin = await env.GIAE_DB.prepare(
    "SELECT id FROM users WHERE account_type = 'super_admin' LIMIT 1"
  ).first();
  if (existingAdmin) return;

  const salt = randomSalt();
  const passwordHash = await hashPasswordWithSalt(DEFAULT_ADMIN_PASSWORD, salt);
  await env.GIAE_DB.prepare(
    `INSERT INTO users (id, company_id, email, name, role_id, status, account_type, password_hash, permissions_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'super_admin', 'Activo', 'super_admin', ?, ?, ?, ?)`
  ).bind(uid("user"), DEFAULT_COMPANY_ID, DEFAULT_ADMIN_EMAIL, "Super administrador", passwordHash, JSON.stringify(ALL_PERMISSIONS), createdAt, createdAt).run();
}

function requireWriteAuth(request, env) {
  if (!env?.GIAE_API_TOKEN) {
    return {
      ok: false,
      response: json({ ok: false, error: "GIAE_API_TOKEN no configurado como secreto del Worker. Escritura bloqueada por seguridad." }, { status: 503 })
    };
  }
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (token !== env.GIAE_API_TOKEN) {
    return { ok: false, response: json({ ok: false, error: "No autorizado" }, { status: 401 }) };
  }
  return { ok: true };
}

async function writeAudit(env, event) {
  if (!hasDb(env)) return null;
  const auditId = event.id || uid("audit");
  await env.GIAE_DB.prepare(
    "INSERT INTO audit_events (id, company_id, project_id, user_id, action, detail_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ).bind(
    auditId,
    event.companyId || "local-company",
    event.projectId || null,
    event.userId || null,
    event.action || "evento",
    JSON.stringify(event.detail || {}),
    event.createdAt || now()
  ).run();
  return auditId;
}

async function health(env) {
  return json({
    ok: true,
    service: "GIAE Worker API",
    schema: "giae.worker.health.v1",
    generatedAt: now(),
    apiBase: API_PREFIX,
    bindings: envStatus(env),
    endpoints: [
      "GET /api/giae/health",
      "POST /api/giae/auth/login",
      "POST /api/giae/auth/users",
      "GET /api/giae/auth/users",
      "GET /api/giae/normativa/reglas",
      "GET /api/giae/normativa/documentos",
      "POST /api/giae/session/start",
      "POST /api/giae/license/check",
      "GET /api/giae/workspaces/:workspaceId",
      "GET /api/giae/projects/:projectId",
      "POST /api/giae/projects/:projectId/sync",
      "POST /api/giae/files/presign",
      "GET /api/giae/audit"
    ]
  });
}

async function startSession(request, env) {
  const payload = await readJson(request);
  return json({
    ok: true,
    schema: "giae.worker.session.v1",
    sessionId: uid("session"),
    profile: payload.profile || "sin_perfil",
    authMode: env?.GIAE_API_TOKEN ? "token_worker" : "preparacion_sin_escritura",
    writeEnabled: Boolean(env?.GIAE_API_TOKEN),
    createdAt: now(),
    note: "Sesion tecnica inicial. La autenticacion comercial fuerte queda para Fase 6."
  });
}

async function licenseCheck(request, env) {
  const payload = await readJson(request);
  if (!hasDb(env)) {
    return json({ ok: true, status: "preparacion_sin_d1", plan: payload.plan || "local-preparacion", seats: 1, source: "fallback" });
  }
  const companyId = payload.companyId || "local-company";
  const row = await env.GIAE_DB.prepare(
    "SELECT status, plan, seats, valid_until FROM licenses WHERE company_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(companyId).first();
  return json({
    ok: true,
    status: row?.status || "sin_licencia_activa",
    plan: row?.plan || "local-preparacion",
    seats: row?.seats || 1,
    validUntil: row?.valid_until || "",
    source: row ? "d1" : "fallback"
  });
}

async function login(request, env) {
  if (!hasDb(env)) return json({ ok: false, error: "Base de datos no disponible" }, { status: 503 });
  const payload = await readJson(request);
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const mode = payload.mode || "empresa";
  if (!email || !password) return json({ ok: false, error: "Correo y contraseña requeridos" }, { status: 400 });

  await ensureDefaultCompanyAndAdmin(env);

  const expectedType = ACCOUNT_TYPES_BY_MODE[mode] || "empresa";
  const user = await env.GIAE_DB.prepare(
    "SELECT * FROM users WHERE lower(email) = ? AND status = 'Activo'"
  ).bind(email).first();

  if (!user || user.account_type !== expectedType) {
    return json({ ok: false, error: "Credenciales inválidas o usuario inactivo" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return json({ ok: false, error: "Credenciales inválidas o usuario inactivo" }, { status: 401 });

  let permissions = [];
  try { permissions = JSON.parse(user.permissions_json || "[]"); } catch { permissions = []; }
  if (user.account_type === "super_admin" || !permissions.length) permissions = ALL_PERMISSIONS;

  await env.GIAE_DB.prepare("UPDATE users SET last_seen_at = ? WHERE id = ?").bind(now(), user.id).run();
  await writeAudit(env, { companyId: user.company_id, userId: user.id, action: "auth.login", detail: { email, mode } });

  return json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, accountType: user.account_type, role: user.role_id || "proyectos", permissions, companyId: user.company_id }
  });
}

async function upsertUser(request, env) {
  const auth = requireWriteAuth(request, env);
  if (!auth.ok) return auth.response;
  if (!hasDb(env)) return json({ ok: false, error: "Base de datos no disponible" }, { status: 503 });

  const payload = await readJson(request);
  const email = String(payload.email || "").trim().toLowerCase();
  if (!email) return json({ ok: false, error: "Correo requerido" }, { status: 400 });
  const accountType = ["independiente", "pueblos", "super_admin"].includes(payload.accountType) ? payload.accountType : "empresa";
  const createdAt = now();

  const existing = await env.GIAE_DB.prepare("SELECT * FROM users WHERE lower(email) = ?").bind(email).first();

  let passwordHash = existing?.password_hash || null;
  if (payload.password) {
    const salt = randomSalt();
    passwordHash = await hashPasswordWithSalt(payload.password, salt);
  }
  if (!passwordHash) return json({ ok: false, error: "Se requiere una contraseña para una cuenta nueva" }, { status: 400 });

  let permissions = Array.isArray(payload.permissions) && payload.permissions.length ? payload.permissions : null;
  if (!permissions) permissions = existing ? (JSON.parse(existing.permissions_json || "[]").length ? JSON.parse(existing.permissions_json) : ALL_PERMISSIONS) : ALL_PERMISSIONS;

  const id = existing?.id || uid("user");
  const companyId = existing?.company_id || payload.companyId || DEFAULT_COMPANY_ID;
  const name = payload.name || existing?.name || "Usuario";
  const status = payload.status || existing?.status || "Activo";
  const roleId = payload.role || existing?.role_id || "proyectos";

  await env.GIAE_DB.prepare(
    `INSERT INTO users (id, company_id, email, name, role_id, status, account_type, password_hash, permissions_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET name=excluded.name, status=excluded.status, account_type=excluded.account_type, password_hash=excluded.password_hash, permissions_json=excluded.permissions_json, role_id=excluded.role_id, updated_at=excluded.updated_at`
  ).bind(id, companyId, email, name, roleId, status, accountType, passwordHash, JSON.stringify(permissions), existing?.created_at || createdAt, createdAt).run();

  await writeAudit(env, { companyId, userId: id, action: "user.upsert", detail: { email, accountType } });

  return json({ ok: true, user: { id, name, email, accountType, status, role: roleId, permissions } });
}

async function listUsers(request, env) {
  const auth = requireWriteAuth(request, env);
  if (!auth.ok) return auth.response;
  if (!hasDb(env)) return json({ ok: false, error: "Base de datos no disponible" }, { status: 503 });
  const rows = await env.GIAE_DB.prepare(
    "SELECT id, company_id, email, name, role_id, status, account_type, permissions_json, last_seen_at, created_at FROM users ORDER BY created_at DESC"
  ).all();
  const users = (rows.results || []).map(row => ({
    id: row.id,
    companyId: row.company_id,
    email: row.email,
    name: row.name,
    role: row.role_id,
    status: row.status,
    accountType: row.account_type,
    permissions: (() => { try { return JSON.parse(row.permissions_json || "[]"); } catch { return []; } })(),
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at
  }));
  return json({ ok: true, users });
}

function mapNormativeRow(row) {
  return {
    id: row.id,
    documento: row.documento,
    numeral: row.numeral,
    categoria: row.categoria,
    tipo: row.tipo,
    criticidad: row.criticidad,
    titulo: row.titulo,
    verifica: row.verifica,
    correccion: row.correccion,
    validacion: (() => { try { return JSON.parse(row.validacion_json || "{}"); } catch { return {}; } })(),
    evidencia: (() => { try { return JSON.parse(row.evidencia_json || "{}"); } catch { return {}; } })(),
    motores: (() => { try { return JSON.parse(row.motores_json || "[]"); } catch { return []; } })(),
    baseNormativa: row.base_normativa,
    estado: row.estado
  };
}

// Publico y de solo lectura: contenido normativo, no datos de usuarios. Solo
// devuelve lo que ya esta realmente cargado en D1 - documentos sin extraer
// simplemente no aparecen, nunca se inventa contenido para completar.
async function normativeSearch(request, env) {
  if (!hasDb(env)) return json({ ok: false, error: "Base de datos no disponible" }, { status: 503 });
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") || "").trim();
  const documento = (url.searchParams.get("documento") || "").trim();
  const categoria = (url.searchParams.get("categoria") || "").trim();
  const conditions = [];
  const binds = [];
  if (documento) { conditions.push("documento LIKE ?"); binds.push(`%${documento}%`); }
  if (categoria) { conditions.push("categoria LIKE ?"); binds.push(`%${categoria}%`); }
  if (q) { conditions.push("(titulo LIKE ? OR verifica LIKE ? OR categoria LIKE ? OR correccion LIKE ?)"); binds.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`); }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const stmt = env.GIAE_DB.prepare(`SELECT * FROM normative_rules ${where} ORDER BY documento, numeral LIMIT 30`);
  const rows = await (binds.length ? stmt.bind(...binds) : stmt).all();
  return json({ ok: true, reglas: (rows.results || []).map(mapNormativeRow) });
}

// Lista que documentos normativos ya tienen reglas reales cargadas, para que
// el Chat IA (u otro consumidor) pueda decir con honestidad que documentos
// todavia no estan disponibles, en vez de fingir que los conoce todos.
async function normativeDocuments(env) {
  if (!hasDb(env)) return json({ ok: false, error: "Base de datos no disponible" }, { status: 503 });
  const rows = await env.GIAE_DB.prepare(
    "SELECT documento, COUNT(*) as total FROM normative_rules GROUP BY documento ORDER BY documento"
  ).all();
  return json({ ok: true, documentos: (rows.results || []).map(row => ({ documento: row.documento, totalReglas: row.total })) });
}

async function workspaceRead(env, workspaceId) {
  if (!hasDb(env)) {
    return json({ ok: true, workspace: { id: workspaceId, name: "GIAE Chile", mode: "sin_d1" }, users: [], roles: [] });
  }
  const workspace = await env.GIAE_DB.prepare("SELECT * FROM companies WHERE id = ?").bind(workspaceId).first();
  const users = await env.GIAE_DB.prepare(
    "SELECT id, email, name, role_id, status, last_seen_at FROM users WHERE company_id = ? ORDER BY name"
  ).bind(workspaceId).all();
  const roles = await env.GIAE_DB.prepare(
    "SELECT id, name, permissions_json, status FROM roles WHERE company_id = ? OR company_id = 'global' ORDER BY name"
  ).bind(workspaceId).all();
  return json({ ok: true, workspace: workspace || { id: workspaceId, name: "Workspace no registrado" }, users: users.results || [], roles: roles.results || [] });
}

async function projectRead(env, projectId) {
  if (!hasDb(env)) return json({ ok: false, error: "D1 no configurado" }, { status: 503 });
  const project = await env.GIAE_DB.prepare("SELECT * FROM projects WHERE id = ?").bind(projectId).first();
  if (!project) return json({ ok: false, error: "Proyecto no encontrado" }, { status: 404 });
  const revision = await env.GIAE_DB.prepare(
    "SELECT * FROM project_revisions WHERE project_id = ? ORDER BY created_at DESC LIMIT 1"
  ).bind(projectId).first();
  return json({ ok: true, project, latestRevision: revision || null });
}

async function syncProject(request, env, projectId) {
  const auth = requireWriteAuth(request, env);
  if (!auth.ok) return auth.response;
  if (!hasDb(env)) return json({ ok: false, error: "D1 no configurado" }, { status: 503 });

  const payload = await readJson(request);
  const envelope = payload.envelope || payload;
  const project = envelope.projectSnapshot || envelope.project || {};
  const companyId = envelope.companyId || project.companyId || "local-company";
  const revisionId = uid("rev");
  const createdAt = now();
  const serialized = JSON.stringify(envelope);
  const hash = await sha256Hex(serialized);
  const projectName = project.name || envelope.projectName || "Proyecto GIAE";
  const status = project.status || "En desarrollo";
  const backupKey = `projects/${projectId}/revisions/${revisionId}.giae.json`;

  await env.GIAE_DB.prepare(
    "INSERT INTO companies (id, name, status, created_at, updated_at) VALUES (?, ?, 'activo', ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at"
  ).bind(companyId, project.company || envelope.companyName || "GIAE Chile", createdAt, createdAt).run();

  await env.GIAE_DB.prepare(
    "INSERT INTO projects (id, company_id, owner_user_id, name, status, meta_json, updated_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name = excluded.name, status = excluded.status, meta_json = excluded.meta_json, updated_at = excluded.updated_at"
  ).bind(projectId, companyId, envelope.authorUserId || null, projectName, status, JSON.stringify({ client: project.client || "", source: "sync" }), createdAt, createdAt).run();

  await env.GIAE_DB.prepare(
    "INSERT INTO project_revisions (id, project_id, revision, hash, summary_json, author_user_id, r2_key, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  ).bind(revisionId, projectId, envelope.revision || 1, hash, JSON.stringify({ name: projectName, status }), envelope.authorUserId || null, backupKey, createdAt).run();

  if (env.GIAE_PROJECT_BACKUPS) {
    await env.GIAE_PROJECT_BACKUPS.put(backupKey, serialized, {
      httpMetadata: { contentType: "application/json; charset=utf-8" },
      customMetadata: { projectId, revisionId, hash }
    });
    await env.GIAE_DB.prepare(
      "INSERT INTO file_assets (id, project_id, kind, r2_binding, r2_key, sha256, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
    ).bind(uid("file"), projectId, "project_backup", "GIAE_PROJECT_BACKUPS", backupKey, hash, createdAt).run();
  }

  await env.GIAE_DB.prepare(
    "INSERT INTO sync_queue (id, project_id, status, operation, payload_hash, created_at, processed_at) VALUES (?, ?, 'procesado', 'project.upsert', ?, ?, ?)"
  ).bind(uid("sync"), projectId, hash, createdAt, createdAt).run();

  await writeAudit(env, { companyId, projectId, userId: envelope.authorUserId || null, action: "project.sync", detail: { revisionId, hash, backupKey } });
  return json({ ok: true, projectId, revisionId, hash, backupKey, r2Saved: Boolean(env.GIAE_PROJECT_BACKUPS) });
}

async function filePrepare(request, env) {
  const auth = requireWriteAuth(request, env);
  if (!auth.ok) return auth.response;
  const payload = await readJson(request);
  const projectId = payload.projectId || "sin-proyecto";
  const kind = payload.kind || "documents";
  const cleanName = String(payload.fileName || "archivo.bin").replace(/[^a-z0-9._-]+/gi, "-");
  const binding = kind === "brand" ? "GIAE_BRAND_ASSETS" : kind === "field_media" ? "GIAE_FIELD_MEDIA" : "GIAE_PROJECT_DOCUMENTS";
  return json({ ok: true, binding, key: `${kind}/${projectId}/${Date.now()}-${cleanName}`, method: "PUT via Worker endpoint futuro", note: "No se entregan credenciales R2 al navegador." });
}

async function auditSearch(request, env) {
  if (!hasDb(env)) return json({ ok: false, error: "D1 no configurado" }, { status: 503 });
  const url = new URL(request.url);
  const projectId = url.searchParams.get("projectId");
  const limit = Math.min(Number(url.searchParams.get("limit") || 50), 100);
  const query = projectId
    ? env.GIAE_DB.prepare("SELECT * FROM audit_events WHERE project_id = ? ORDER BY created_at DESC LIMIT ?").bind(projectId, limit)
    : env.GIAE_DB.prepare("SELECT * FROM audit_events ORDER BY created_at DESC LIMIT ?").bind(limit);
  const rows = await query.all();
  return json({ ok: true, results: rows.results || [] });
}

async function routeApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname;
  if (path === `${API_PREFIX}/health` && request.method === "GET") return health(env);
  if (path === `${API_PREFIX}/auth/login` && request.method === "POST") return login(request, env);
  if (path === `${API_PREFIX}/auth/users` && request.method === "POST") return upsertUser(request, env);
  if (path === `${API_PREFIX}/auth/users` && request.method === "GET") return listUsers(request, env);
  if (path === `${API_PREFIX}/normativa/reglas` && request.method === "GET") return normativeSearch(request, env);
  if (path === `${API_PREFIX}/normativa/documentos` && request.method === "GET") return normativeDocuments(env);
  if (path === `${API_PREFIX}/session/start` && request.method === "POST") return startSession(request, env);
  if (path === `${API_PREFIX}/license/check` && request.method === "POST") return licenseCheck(request, env);
  if (path.startsWith(`${API_PREFIX}/workspaces/`) && request.method === "GET") return workspaceRead(env, decodeURIComponent(path.split("/").pop() || "workspace-local"));
  if (path.startsWith(`${API_PREFIX}/projects/`) && path.endsWith("/sync") && request.method === "POST") return syncProject(request, env, decodeURIComponent(path.split("/")[4] || "sin-proyecto"));
  if (path.startsWith(`${API_PREFIX}/projects/`) && request.method === "GET") return projectRead(env, decodeURIComponent(path.split("/").pop() || "sin-proyecto"));
  if (path === `${API_PREFIX}/files/presign` && request.method === "POST") return filePrepare(request, env);
  if (path === `${API_PREFIX}/audit` && request.method === "GET") return auditSearch(request, env);
  return json({ ok: false, error: "Endpoint no encontrado", path, method: request.method }, { status: 404 });
}

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      if (url.pathname === `${API_PREFIX}/bindings` && request.method === "GET") return json({ ok: true, bindings: envStatus(env) });
      if (url.pathname.startsWith(`${API_PREFIX}/`)) return routeApi(request, env);
      if (env.ASSETS) return env.ASSETS.fetch(request);
      return text("GIAE Worker API activo. Binding ASSETS no configurado.");
    } catch (error) {
      return json({ ok: false, error: error?.message || String(error) }, { status: 500 });
    }
  }
};