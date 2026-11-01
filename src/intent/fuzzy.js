// ============================================================
// src/intent/fuzzy.js — Fuzzy Matching & Conversational Normalization
// ============================================================

const systemScanner = require('../system-scanner');
const { APP_ALIASES } = require('./patterns');

function levenshtein(a, b) {
  const matrix = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));
  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return matrix[a.length][b.length];
}

function normalizeConversationalText(text) {
  if (!text) return '';
  let s = text.toLowerCase().trim();

  // Strip conversational polite prefixes & openers
  s = s.replace(/^(?:hey|hi|hello|ok|okay|yo)?\s*(?:kumo|mochi|assistant)?\s*[,;:]?\s*/i, '');
  s = s.replace(/^(?:can\s+you\s+please|could\s+you\s+please|would\s+you\s+mind|can\s+you|could\s+you|would\s+you|will\s+you|how\s+about\s+we|how\s+about|why\s+don't\s+you|please|i\s+want\s+to|i\s+need\s+to|i'd\s+like\s+to|help\s+me|let's|let\s+us|go\s+ahead\s+and|just|tell\s+me|give\s+me)\s+/i, '');

  // Strip conversational suffixes & trailing clauses
  s = s.replace(/[,;]?\s*(?:and\s+do\s+something|and\s+then\b.*|and\s+also\b.*|and\s+give\b.*|right\s+now|for\s+me|if\s+you\s+can|quickly|asap|please)\s*$/i, '');

  return s.trim();
}

function resolveFuzzyAppName(raw) {
  if (!raw) return '';
  let clean = raw.toLowerCase().trim();

  // Strip compound conversational clauses
  clean = clean.replace(/[,;]?\s*(?:and\s+then|and\s+do\s+something|and\s+give\s+.*|and\s+also|and|then|please|for\s+me)\b.*/i, '').trim();

  // Strip trailing punctuation
  clean = clean.replace(/[.,;!?]+$/, '').trim();

  // 1. Direct alias match
  if (APP_ALIASES[clean]) return APP_ALIASES[clean];

  // 2. Fuzzy alias match
  for (const [alias, real] of Object.entries(APP_ALIASES)) {
    if (clean === alias) return real;
    if (alias.length >= 4 && Math.abs(clean.length - alias.length) <= 2) {
      if (levenshtein(clean, alias) <= 2) return real;
    }
  }

  // 3. Match against all 155+ scanned host apps dynamically
  try {
    const caps = systemScanner.getCapabilitiesSync();
    if (caps && caps.categories) {
      let bestMatch = null;
      for (const cat of Object.keys(caps.categories)) {
        for (const app of caps.categories[cat]) {
          const appName = (app.name || '').toLowerCase();
          const appId = (app.appId || '').toLowerCase();
          if (appName === clean) return app.name;

          // Word subset match
          const words = appName.split(/\s+/);
          if (words.some(w => w === clean)) return app.name;

          if (appName.includes(clean) || (clean.length >= 4 && appId.includes(clean))) {
            if (!bestMatch) bestMatch = app.name;
          }
          if (clean.length >= 5 && levenshtein(clean, appName) <= 2) {
            return app.name;
          }
        }
      }
      if (bestMatch) return bestMatch;
    }
  } catch {}

  return clean;
}

module.exports = {
  levenshtein,
  normalizeConversationalText,
  resolveFuzzyAppName,
};

