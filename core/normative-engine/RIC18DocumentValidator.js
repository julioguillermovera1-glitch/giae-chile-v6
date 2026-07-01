// GIAE Sprint 0.9.0.009
// Validador documental inicial para reglas RIC 18.

function getValueByPath(source, path) {
  if (!source || !path) return undefined;
  return String(path).split('.').reduce((acc, key) => acc?.[key], source);
}

function exists(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'string') return value.trim().length > 0;
  return value !== undefined && value !== null && value !== false;
}

export class RIC18DocumentValidator {
  validate(project = {}, rule) {
    const validation = rule?.validacion || {};

    switch (validation.tipo) {
      case 'existencia_documento':
        return this.validateExists(project, validation.campo, rule);
      case 'documentos_requeridos':
        return this.validateRequiredDocuments(project, validation.campos || [], rule);
      case 'contenido_memoria':
      case 'contenido_tecnico':
        return this.validateFields(project, validation.campos || [], rule);
      case 'condicional_memoria':
        return this.validateConditionalMemory(project, rule);
      case 'condicional':
        return this.validateConditional(project, validation, rule);
      case 'revision_formal':
        return this.validateExists(project, validation.campo, rule);
      default:
        return this.result('warning', rule, 'Tipo de validación no implementado.', []);
    }
  }

  validateExists(project, field, rule) {
    const value = getValueByPath(project, field) ?? project.documentos?.[field];
    return exists(value)
      ? this.result('ok', rule, 'Evidencia encontrada.', [])
      : this.result('fail', rule, rule?.evidencia?.si_falta || 'No se encontró evidencia.', [field]);
  }

  validateRequiredDocuments(project, fields, rule) {
    const missing = fields.filter((field) => !exists(project.documentos?.[field] ?? getValueByPath(project, field)));
    return missing.length === 0
      ? this.result('ok', rule, 'Documentos mínimos encontrados.', [])
      : this.result('fail', rule, rule?.evidencia?.si_falta || 'Faltan documentos requeridos.', missing);
  }

  validateFields(project, fields, rule) {
    const missing = fields.filter((field) => !exists(getValueByPath(project, field) ?? project.datosTecnicos?.[field] ?? project.memoria?.[field]));
    return missing.length === 0
      ? this.result('ok', rule, 'Contenido técnico encontrado.', [])
      : this.result('fail', rule, rule?.evidencia?.si_falta || 'Faltan campos técnicos.', missing);
  }

  validateConditionalMemory(project, rule) {
    const requires = Boolean(
      project.potenciaDeclaradaKw > 10 ||
      project.tipoProyecto === 'edificio' ||
      project.tipoProyecto === 'conjunto_habitacional' ||
      project.localReunionPersonas === true ||
      project.ambienteExplosivo === true ||
      project.empalmeMediaTension === true
    );

    if (!requires) return this.result('ok', rule, 'No se activa exigencia condicional de memoria explicativa.', []);
    return this.validateExists(project, 'memoriaExplicativa', rule);
  }

  validateConditional(project, validation, rule) {
    // Evaluación segura y limitada por casos conocidos del RIC 18.
    if (validation.condicion === 'numeroCuadrosCarga > 1') {
      const active = Number(project.numeroCuadrosCarga || project.cuadrosCarga?.length || 0) > 1;
      if (!active) return this.result('ok', rule, 'No se activa condición.', []);
      return this.validateExists(project, validation.campo, rule);
    }
    if (validation.condicion === 'requiereMemoriaExplicativa === true') {
      if (project.requiereMemoriaExplicativa !== true) return this.result('ok', rule, 'No se activa condición.', []);
      return this.validateExists(project, validation.campo, rule);
    }
    return this.result('warning', rule, 'Condición no implementada en validador.', []);
  }

  result(status, rule, message, missing = []) {
    return {
      status,
      ruleId: rule?.id,
      criticidad: rule?.criticidad || 'media',
      categoria: rule?.categoria,
      documento: rule?.documento,
      numeral: rule?.numeral,
      message,
      missing,
      recommendation: rule?.correccion || null
    };
  }
}

export default RIC18DocumentValidator;
