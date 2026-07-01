/**
 * GIAE DuplicateDetector
 * Detecta duplicados REALES, evitando falsos positivos por nombres parecidos.
 * Criterios:
 * 1) Duplicado exacto: mismo hash SHA-256 del contenido.
 * 2) Duplicado casi exacto: similitud normalizada >= umbral configurado.
 * 3) NUNCA marca duplicado solo por nombre parecido.
 */
export class DuplicateDetector {
  constructor(options = {}) {
    this.options = {
      exactOnly: options.exactOnly ?? true,
      similarityThreshold: options.similarityThreshold ?? 0.98,
      minSizeBytes: options.minSizeBytes ?? 80,
      ignorePatterns: options.ignorePatterns ?? [
        '.git/',
        'node_modules/',
        'dist/',
        'build/',
        '.wrangler/',
        '.cache/',
        'README',
        'CHANGELOG',
        'LICENSE'
      ]
    };
  }

  shouldIgnore(path = '') {
    return this.options.ignorePatterns.some((pattern) => path.includes(pattern));
  }

  normalizeContent(content = '') {
    return String(content)
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .trim();
  }

  async sha256(text) {
    const data = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  similarity(a = '', b = '') {
    if (!a && !b) return 1;
    if (!a || !b) return 0;
    if (a === b) return 1;

    const max = Math.max(a.length, b.length);
    const min = Math.min(a.length, b.length);
    if (min / max < 0.85) return 0;

    let same = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i += 1) {
      if (a[i] === b[i]) same += 1;
    }
    return same / max;
  }

  async detect(files = []) {
    const candidates = files
      .filter((file) => file && file.path && !this.shouldIgnore(file.path))
      .filter((file) => String(file.content || '').length >= this.options.minSizeBytes)
      .map((file) => ({
        ...file,
        normalized: this.normalizeContent(file.content || '')
      }));

    const byHash = new Map();
    for (const file of candidates) {
      const hash = await this.sha256(file.normalized);
      if (!byHash.has(hash)) byHash.set(hash, []);
      byHash.get(hash).push({ path: file.path, size: file.normalized.length, hash });
    }

    const exactDuplicates = [...byHash.values()].filter((group) => group.length > 1);

    const nearDuplicates = [];
    if (!this.options.exactOnly) {
      for (let i = 0; i < candidates.length; i += 1) {
        for (let j = i + 1; j < candidates.length; j += 1) {
          const score = this.similarity(candidates[i].normalized, candidates[j].normalized);
          if (score >= this.options.similarityThreshold && candidates[i].normalized !== candidates[j].normalized) {
            nearDuplicates.push({
              files: [candidates[i].path, candidates[j].path],
              similarity: Number(score.toFixed(4)),
              status: 'requires_human_review'
            });
          }
        }
      }
    }

    return {
      exactDuplicates,
      nearDuplicates,
      summary: {
        scannedFiles: candidates.length,
        exactDuplicateGroups: exactDuplicates.length,
        nearDuplicatePairs: nearDuplicates.length,
        mode: this.options.exactOnly ? 'exact_hash_only' : 'exact_hash_plus_reviewable_similarity'
      }
    };
  }
}
