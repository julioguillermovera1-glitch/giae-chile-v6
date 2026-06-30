const DEFAULT_PATH = "./data/biblioteca-tecnica.json";
let cache = null;

export async function loadTechnicalLibrary(){
  if(cache) return cache;
  const response = await fetch(DEFAULT_PATH, { cache: "no-store" });
  if(!response.ok) throw new Error("No se pudo cargar la Biblioteca Técnica GIAE.");
  cache = await response.json();
  return cache;
}

export function clearTechnicalLibraryCache(){ cache = null; }

export async function getTechnicalCategory(category){
  const library = await loadTechnicalLibrary();
  return library.categorias?.[category] || [];
}

export async function getTechnicalSummary(){
  const library = await loadTechnicalLibrary();
  const categories = library.categorias || {};
  const totalItems = Object.values(categories).reduce((sum, items) => sum + (Array.isArray(items) ? items.length : 0), 0);
  const pending = Object.values(categories).flat().filter(item => String(item.estado_normativo || item.estado || "").includes("pendiente") || String(item.estado_normativo || item.estado || "").includes("requiere")).length;
  return {
    name: library.meta?.nombre || "Biblioteca Técnica GIAE",
    version: library.meta?.version || "sin versión",
    categories: Object.keys(categories).length,
    totalItems,
    pending,
    references: library.referenciasAutorizadas?.length || 0
  };
}

export function findNearestBreaker(currentA, library){
  const items = library?.categorias?.proteccionesTermomagneticas || [];
  const sorted = items.map(item => Number(item.corriente_A)).filter(Boolean).sort((a,b)=>a-b);
  return sorted.find(value => value >= Number(currentA || 0)) || sorted.at(-1) || null;
}
