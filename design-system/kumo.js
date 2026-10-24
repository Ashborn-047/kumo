// ─────────────────────────────────────────────────────────────
// KUMO DESIGN SYSTEM — JS HELPERS (kumo.js)
// ─────────────────────────────────────────────────────────────

export const PALETTES = {
  sky:    { bg: '#dcedff', deep: '#8cc1ff', ink: '#164273' },
  butter: { bg: '#fff5c8', deep: '#f3d96a', ink: '#614e05' },
  blush:  { bg: '#ffecec', deep: '#ff9ec4', ink: '#701c38' },
  mint:   { bg: '#dcf5e7', deep: '#7ad3a3', ink: '#115332' },
  lilac:  { bg: '#eadfff', deep: '#b89bff', ink: '#482387' },
  peach:  { bg: '#ffe9d6', deep: '#ffb48a', ink: '#78340d' },
};

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.remove('kumo-dark', 'kumo-light');
  document.body.classList.add(`kumo-${theme}`);
  localStorage.setItem('kumo-theme', theme);
}

export function toggleTheme() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  setTheme(next);
  return next;
}
