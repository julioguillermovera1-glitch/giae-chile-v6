// Router de APIs para D1 + R2

import {
  createProject,
  getUserProjects,
  saveCadPlan,
  loadCadPlan,
  uploadFile,
  getProjectFiles,
  logChange,
  createUser,
  getUserByEmail,
  healthCheck
} from "./api-d1-r2.js";

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

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

export async function handleApiRoutes(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/giae/, "");
  const method = request.method;

  // Health check
  if (path === "/health" && method === "GET") {
    const health = await healthCheck(env);
    return json({ status: "ok", checks: health });
  }

  // Usuarios - Crear
  if (path === "/usuarios" && method === "POST") {
    const data = await readJson(request);
    const result = await createUser(env, data);
    return json(result, { status: result.success ? 201 : 400 });
  }

  // Usuarios - Obtener por email
  if (path.match(/^\/usuarios\/(.+)$/) && method === "GET") {
    const email = decodeURIComponent(path.split("/")[2]);
    const result = await getUserByEmail(env, email);
    return json(result, { status: result.success ? 200 : 404 });
  }

  // Proyectos - Crear
  if (path === "/proyectos" && method === "POST") {
    const data = await readJson(request);
    const userId = url.searchParams.get("user_id");
    if (!userId) return json({ error: "user_id requerido" }, { status: 400 });
    const result = await createProject(env, userId, data);
    return json(result, { status: result.success ? 201 : 400 });
  }

  // Proyectos - Obtener del usuario
  if (path === "/proyectos" && method === "GET") {
    const userId = url.searchParams.get("user_id");
    if (!userId) return json({ error: "user_id requerido" }, { status: 400 });
    const result = await getUserProjects(env, userId);
    return json(result, { status: result.success ? 200 : 400 });
  }

  // Planos CAD - Guardar
  if (path === "/planos" && method === "POST") {
    const data = await readJson(request);
    const projectId = url.searchParams.get("project_id");
    if (!projectId) return json({ error: "project_id requerido" }, { status: 400 });
    const result = await saveCadPlan(env, projectId, data);
    return json(result, { status: result.success ? 201 : 400 });
  }

  // Planos CAD - Cargar
  if (path.match(/^\/planos\/(.+)$/) && method === "GET") {
    const planId = path.split("/")[2];
    const result = await loadCadPlan(env, planId);
    return json(result, { status: result.success ? 200 : 404 });
  }

  // Archivos - Listar
  if (path.match(/^\/archivos\/proyecto\/(.+)$/) && method === "GET") {
    const projectId = path.split("/")[3];
    const result = await getProjectFiles(env, projectId);
    return json(result, { status: result.success ? 200 : 400 });
  }

  // Archivos - Subir
  if (path === "/archivos/upload" && method === "POST") {
    const projectId = url.searchParams.get("project_id");
    if (!projectId) return json({ error: "project_id requerido" }, { status: 400 });
    
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file) return json({ error: "archivo requerido" }, { status: 400 });

    const result = await uploadFile(env, projectId, file);
    return json(result, { status: result.success ? 201 : 400 });
  }

  // Historial - Registrar
  if (path === "/historial" && method === "POST") {
    const data = await readJson(request);
    const { userId, projectId, action, description } = data;
    const result = await logChange(env, userId, projectId, action, description);
    return json(result, { status: result.success ? 201 : 400 });
  }

  // Ruta no encontrada
  return json({ error: "Ruta no encontrada" }, { status: 404 });
}
