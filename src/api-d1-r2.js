// APIs para D1 + R2 en GIAE Chile v6

/**
 * API de Proyectos - Crear nuevo proyecto
 */
export async function createProject(env, userId, data) {
  try {
    const { nombre, descripcion, tipo } = data;
    const projectId = crypto.randomUUID();
    
    const result = await env.DB.prepare(`
      INSERT INTO proyectos (id, usuario_id, nombre, descripcion, tipo)
      VALUES (?, ?, ?, ?, ?)
    `).bind(projectId, userId, nombre, descripcion || "", tipo || "residencial").run();
    
    return { success: true, projectId, message: "Proyecto creado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Proyectos - Obtener proyectos del usuario
 */
export async function getUserProjects(env, userId) {
  try {
    const result = await env.DB.prepare(`
      SELECT id, nombre, descripcion, tipo, estado, fecha_creacion, fecha_actualizacion
      FROM proyectos
      WHERE usuario_id = ?
      ORDER BY fecha_actualizacion DESC
    `).bind(userId).all();
    
    return { success: true, projects: result.results || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Planos CAD - Guardar plano en D1 + R2
 */
export async function saveCadPlan(env, projectId, planData) {
  try {
    const { nombre, escala, unidades, contenido } = planData;
    const planId = crypto.randomUUID();
    const r2Path = `cad/${projectId}/${planId}.giaecad`;
    
    // Guardar en D1
    await env.DB.prepare(`
      INSERT INTO planos_cad (id, proyecto_id, nombre, escala, unidades, r2_path, contenido_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(planId, projectId, nombre, escala || "1:50", unidades || "mm", r2Path, JSON.stringify(contenido)).run();
    
    // Guardar en R2
    await env.R2.put(r2Path, JSON.stringify(contenido, null, 2), {
      httpMetadata: {
        contentType: "application/json",
        cacheControl: "max-age=3600"
      }
    });
    
    return { success: true, planId, r2Path, message: "Plano guardado en D1 + R2" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Planos CAD - Cargar plano desde R2
 */
export async function loadCadPlan(env, planId) {
  try {
    const result = await env.DB.prepare(`
      SELECT id, proyecto_id, nombre, escala, unidades, r2_path, contenido_json
      FROM planos_cad
      WHERE id = ?
    `).bind(planId).first();
    
    if (!result) {
      return { success: false, error: "Plano no encontrado" };
    }
    
    // Intentar cargar desde R2 primero
    let contenido = null;
    if (result.r2_path) {
      try {
        const obj = await env.R2.get(result.r2_path);
        if (obj) {
          contenido = await obj.json();
        }
      } catch (e) {
        // Fallback a contenido_json en D1
        contenido = JSON.parse(result.contenido_json || "{}");
      }
    } else {
      contenido = JSON.parse(result.contenido_json || "{}");
    }
    
    return { 
      success: true, 
      plan: {
        id: result.id,
        projectId: result.proyecto_id,
        nombre: result.nombre,
        escala: result.escala,
        unidades: result.unidades,
        contenido
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Archivos - Subir archivo a R2
 */
export async function uploadFile(env, projectId, file, metadata = {}) {
  try {
    const fileId = crypto.randomUUID();
    const r2Path = `archivos/${projectId}/${fileId}-${file.name}`;
    const fileData = await file.arrayBuffer();
    
    // Guardar en R2
    await env.R2.put(r2Path, fileData, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: "max-age=7200"
      }
    });
    
    // Registrar en D1
    await env.DB.prepare(`
      INSERT INTO archivos (id, proyecto_id, nombre, tipo, r2_path, tamaño, descripcion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      fileId, 
      projectId, 
      file.name, 
      file.type, 
      r2Path, 
      fileData.byteLength,
      metadata.descripcion || ""
    ).run();
    
    return { 
      success: true, 
      fileId, 
      r2Path, 
      message: "Archivo subido a R2" 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Archivos - Obtener archivos del proyecto
 */
export async function getProjectFiles(env, projectId) {
  try {
    const result = await env.DB.prepare(`
      SELECT id, nombre, tipo, r2_path, tamaño, descripcion, fecha_creacion
      FROM archivos
      WHERE proyecto_id = ?
      ORDER BY fecha_creacion DESC
    `).bind(projectId).all();
    
    return { success: true, files: result.results || [] };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Historial - Registrar cambio
 */
export async function logChange(env, userId, projectId, action, description = "") {
  try {
    await env.DB.prepare(`
      INSERT INTO historial_cambios (usuario_id, proyecto_id, accion, descripcion)
      VALUES (?, ?, ?, ?)
    `).bind(userId, projectId, action, description).run();
    
    return { success: true, message: "Cambio registrado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Usuarios - Crear usuario
 */
export async function createUser(env, userData) {
  try {
    const { email, nombre, empresa, licencia } = userData;
    const userId = crypto.randomUUID();
    
    const result = await env.DB.prepare(`
      INSERT INTO usuarios (id, email, nombre, empresa, licencia)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, email, nombre, empresa || "", licencia || "trial").run();
    
    return { success: true, userId, message: "Usuario creado" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * API de Usuarios - Obtener usuario por email
 */
export async function getUserByEmail(env, email) {
  try {
    const result = await env.DB.prepare(`
      SELECT id, email, nombre, empresa, licencia, estado, rol, fecha_creacion
      FROM usuarios
      WHERE email = ?
    `).bind(email).first();
    
    if (!result) {
      return { success: false, error: "Usuario no encontrado" };
    }
    
    return { success: true, user: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Health check - Verificar conexiones D1 + R2
 */
export async function healthCheck(env) {
  const checks = {
    db: false,
    r2: false,
    worker: true
  };
  
  try {
    await env.DB.prepare("SELECT 1").run();
    checks.db = true;
  } catch (e) {
    checks.db_error = e.message;
  }
  
  try {
    await env.R2.list({ limit: 1 });
    checks.r2 = true;
  } catch (e) {
    checks.r2_error = e.message;
  }
  
  return checks;
}
