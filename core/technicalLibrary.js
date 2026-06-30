const DEFAULT_PATH = "./data/biblioteca-tecnica.json";
let cache = null;

export async function loadTechnicalLibrary(){
  if(cache) return cache;
  const response = await fetch(DEFAULT_PATH, { cache: "no-store" });
  if(!response.ok) throw new Error("No se pudo cargar la Base de Conocimiento GIAE.");
  cache = await response.json();
  return cache;
}

export function clearTechnicalLibraryCache(){ cache = null; }

export async function getTechnicalCategory(category){
  const library = await loadTechnicalLibrary();
  return library.categorias?.[category] || [];
}

export function flattenKnowledge(library){
  const categories = library?.categorias || {};
  return Object.entries(categories).flatMap(([category, items]) => Array.isArray(items) ? items.map(item => ({ ...item, categoria: item.categoria || category })) : []);
}

export function normalizeText(value=""){
  return String(value).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function searchKnowledge(library, query="", filters={}){
  const q = normalizeText(query).trim();
  return flattenKnowledge(library).filter(item => {
    const categoryOk = !filters.category || filters.category === "todos" || item.categoria === filters.category;
    const estado = String(item.estado_conocimiento || item.estado_normativo || item.estado || "sin_estado");
    const estadoOk = !filters.estado || filters.estado === "todos" || normalizeText(estado).includes(normalizeText(filters.estado));
    const text = normalizeText([item.id, item.nombre, item.descripcion, item.uso, item.uso_referencial, item.observacion, item.fuente_normativa, item.categoria].join(" "));
    const textOk = !q || text.includes(q);
    return categoryOk && estadoOk && textOk;
  });
}

export async function getTechnicalSummary(){
  const library = await loadTechnicalLibrary();
  const categories = library.categorias || {};
  const all = flattenKnowledge(library);
  const pending = all.filter(item => {
    const value = normalizeText(item.estado_conocimiento || item.estado_normativo || item.estado || "");
    return value.includes("pendiente") || value.includes("requiere") || value.includes("revision") || value.includes("revisión");
  }).length;
  return {
    name: library.meta?.nombre || "Base de Conocimiento GIAE",
    version: library.meta?.version || "sin versión",
    categories: Object.keys(categories).length,
    totalItems: all.length,
    pending,
    validated: all.length - pending,
    references: library.referenciasAutorizadas?.length || 0
  };
}

export function findNearestBreaker(currentA, library){
  const items = library?.categorias?.proteccionesTermomagneticas || [];
  const sorted = items.map(item => Number(item.corriente_A)).filter(Boolean).sort((a,b)=>a-b);
  return sorted.find(value => value >= Number(currentA || 0)) || sorted.at(-1) || null;
}
