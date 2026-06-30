import { normalizeRule, validateRule } from "./schema.js";

const RULE_MANIFEST = [
  "data/rules/ric/rules.json",
  "data/rules/iec/rules.json",
  "data/rules/ds8/rules.json",
  "data/rules/personalizadas/rules.json"
];

async function fetchJson(path){
  try{
    const response = await fetch(path, { cache: "no-store" });
    if(!response.ok) return [];
    const data = await response.json();
    if(Array.isArray(data)) return data;
    if(Array.isArray(data.reglas)) return data.reglas;
    return [];
  }catch(error){
    console.warn("No se pudo cargar reglas normativas:", path, error);
    return [];
  }
}

export async function loadNormativeRules(){
  const groups = await Promise.all(RULE_MANIFEST.map(fetchJson));
  const map = new Map();
  const diagnostics = [];
  groups.flat().forEach(raw => {
    const validation = validateRule(raw);
    const rule = normalizeRule(raw);
    if(rule.id){
      if(map.has(rule.id)) diagnostics.push({ level: "advertencia", message: `Regla duplicada: ${rule.id}. Se conserva la última.` });
      map.set(rule.id, rule);
    }
    if(!validation.ok || validation.warnings.length){
      diagnostics.push({ id: rule.id || "sin-id", level: validation.ok ? "advertencia" : "critico", errors: validation.errors, warnings: validation.warnings });
    }
  });
  return { rules: [...map.values()].sort((a,b) => a.prioridad - b.prioridad || a.id.localeCompare(b.id)), diagnostics };
}

export function importRulesFromText(text){
  const parsed = JSON.parse(text);
  const items = Array.isArray(parsed) ? parsed : parsed.reglas;
  if(!Array.isArray(items)) throw new Error("El archivo debe contener un arreglo de reglas o una propiedad 'reglas'.");
  return items.map(item => validateRule(item));
}
