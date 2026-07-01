// GIAE Inspector Técnico · Integración de consistencia con el Inspector
// Sprint 0.9.0.012

import { DocumentConsistencyEngine } from './DocumentConsistencyEngine.js';
import { ConsistencyEvidence } from './ConsistencyEvidence.js';

export class InspectorConsistency {
  constructor({ rules = [] } = {}) {
    this.engine = new DocumentConsistencyEngine({ rules });
  }

  setRules(rules = []) {
    this.engine.setRules(rules);
    return this;
  }

  inspect(project = {}, options = {}) {
    const consistency = this.engine.run(project, options);
    const observations = consistency.observations.map(result => ConsistencyEvidence.toObservation(result));

    return {
      ...consistency,
      observations
    };
  }
}

export default InspectorConsistency;
