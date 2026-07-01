const COMPONENT_LIBRARY_URL = "data/componentes-electricos.json";
let cache = null;

export async function loadComponentLibrary(){
  if(cache) return cache;
  const response = await fetch(COMPONENT_LIBRARY_URL, { cache: "no-store" });
  if(!response.ok) throw new Error("No se pudo cargar la BUCE.");
  cache = await response.json();
  return cache;
}

export function flattenComponents(library){
  const familias = library?.familias || {};
  return Object.entries(familias).flatMap(([familia, items]) => (items || []).map(item => ({ ...item, familia })));
}

export async function getComponentSummary(){
  const library = await loadComponentLibrary();
  const items = flattenComponents(library);
  const review = items.filter(item => String(item.estado || "").includes("revision") || String(item.estado || "").includes("revisión")).length;
  const validated = items.filter(item => String(item.estado || "").includes("validado")).length;
  return {
    name: library.meta?.nombre || "BUCE",
    version: library.meta?.version || "sin versión",
    families: Object.keys(library.familias || {}).length,
    components: items.length,
    symbols: Object.keys(library.simbolos || {}).length,
    review,
    validated
  };
}

export function searchComponents(library, query="", filters={}){
  const normalizedQuery = String(query || "").trim().toLowerCase();
  return flattenComponents(library).filter(item => {
    const text = JSON.stringify(item).toLowerCase();
    const matchQuery = !normalizedQuery || text.includes(normalizedQuery);
    const matchFamily = !filters.familia || filters.familia === "todos" || item.familia === filters.familia;
    const matchUse = !filters.uso || filters.uso === "todos" || (item.usaEn || []).includes(filters.uso) || (item.uso || []).includes(filters.uso);
    const matchStatus = !filters.estado || filters.estado === "todos" || String(item.estado || "").toLowerCase().includes(String(filters.estado).toLowerCase());
    return matchQuery && matchFamily && matchUse && matchStatus;
  });
}

export function getComponentById(library, id){
  return flattenComponents(library).find(item => item.id === id) || null;
}

export function getSymbol(library, symbolId){
  return library?.simbolos?.[symbolId] || null;
}
