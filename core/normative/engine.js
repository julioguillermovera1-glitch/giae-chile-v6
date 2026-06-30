import { loadNormativeRules } from "./ruleLoader.js";
import { evaluateRule } from "./validator.js";

let cache = null;

export async function getNormativeEngine(){
  if(!cache) cache = await loadNormativeRules();
  return cache;
}

export function resetNormativeCache(){ cache = null; }

export async function normativeSummary(){
  const { rules, diagnostics } = await getNormativeEngine();
  const bySource = rules.reduce((acc, rule) => { acc[rule.fuente] = (acc[rule.fuente] || 0) + 1; return acc; }, {});
  const byStatus = rules.reduce((acc, rule) => { acc[rule.estado] = (acc[rule.estado] || 0) + 1; return acc; }, {});
  return { total: rules.length, bySource, byStatus, diagnostics };
}

export async function evaluateNormative(context = {}, options = {}){
  const { rules } = await getNormativeEngine();
  const moduleId = options.moduleId || context.modulo || "general";
  const category = options.category || context.categoria || "";
  const applicable = rules.filter(rule => {
    const moduleMatch = !rule.aplicaA.length || rule.aplicaA.includes(moduleId) || rule.aplicaA.includes("general");
    const categoryMatch = !category || rule.categoria === category || rule.categoria === "General";
    const sourceAllowed = !options.sources || options.sources.includes(rule.fuente);
    const includeDraft = options.includeDraft === true || rule.estado !== "borrador";
    return moduleMatch && categoryMatch && sourceAllowed && includeDraft && rule.estado !== "obsoleta";
  });
  const results = applicable.map(rule => ({ rule, evaluation: evaluateRule(rule, context) }));
  const critical = results.filter(r => r.evaluation.result === "no_cumple" && r.evaluation.severity === "critico").length;
  const warnings = results.filter(r => r.evaluation.result === "no_cumple" || r.evaluation.result === "requiere_revision").length;
  const insufficient = results.filter(r => r.evaluation.result === "informacion_insuficiente").length;
  const status = critical ? "no_cumple" : warnings ? "requiere_revision" : insufficient ? "informacion_insuficiente" : "cumple";
  return { status, moduleId, category, evaluated: results.length, results };
}

export async function validateRulePackage(rules = []){
  const { validateRule } = await import("./schema.js");
  return rules.map(validateRule);
}
