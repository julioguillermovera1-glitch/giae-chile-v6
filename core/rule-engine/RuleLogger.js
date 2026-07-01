/**
 * GIAE RuleLogger
 * Registro local de evaluaciones normativas.
 */
export class RuleLogger {
  constructor(storageKey = 'giae_rule_engine_log') {
    this.storageKey = storageKey;
  }

  log(entry) {
    const current = this.getAll();
    current.unshift({ ...entry, loggedAt: new Date().toISOString() });
    localStorage.setItem(this.storageKey, JSON.stringify(current.slice(0, 500)));
  }

  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    } catch {
      return [];
    }
  }

  clear() {
    localStorage.removeItem(this.storageKey);
  }
}
