// ── ui/board/js/icons.js: Clean SVG Vector Icons ──

export const ICONS = {
  // Navigation & Categories
  grid: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="5.5" height="5.5" rx="1.5"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.5"/><rect x="3" y="11.5" width="5.5" height="5.5" rx="1.5"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.5"/></svg>`,
  system: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2L4 11h6l-1 7 7-9h-6l1-7z"/></svg>`,
  writer: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3.5l2.5 2.5-9 9H5v-2.5l9-9z"/><path d="M3 17.5h14"/></svg>`,
  code: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 7L3.5 10l3 3M13.5 7l3 3-3 3M11 4.5l-2 11"/></svg>`,
  design: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3a7 7 0 1 0 0 14c1 0 1.6-.7 1.6-1.5 0-.9-.6-1.2-.6-2 0-.9.7-1.5 1.6-1.5H15a2 2 0 0 0 2-2C17 6 13.9 3 10 3z"/><circle cx="6.5" cy="9" r=".8" fill="currentColor"/><circle cx="9" cy="6.5" r=".8" fill="currentColor"/><circle cx="12.5" cy="7" r=".8" fill="currentColor"/></svg>`,
  notes: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13.5 3.5L16.5 6.5l-2 2-1-1-4 4 1 1-1 1-3.5-3.5 1-1 1 1 4-4-1-1 2-2zM4.5 15.5l3-1"/></svg>`,

  // Global & Search
  search: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg>`,
  sparkle: `<svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5l1.8 4.7 4.7 1.8-4.7 1.8L10 15.5l-1.8-4.7-4.7-1.8 4.7-1.8L10 2.5z"/></svg>`,
  plus: `<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 4v12M4 10h12"/></svg>`,
  minimize: `<svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10h12"/></svg>`,
  close: `<svg viewBox="0 0 20 20" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 5l10 10M15 5L5 15"/></svg>`,

  // App Launcher Tiles
  spotify: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M7.5 9.5c3-1 6-.5 9 1.5M8 12.5c2.5-.8 5-.4 7.5 1.2M9 15.5c2-.5 4-.2 5.5.8"/></svg>`,
  vscode: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16.5 3l4.5 3.5v11L16.5 21l-8-5.5L3 18.5V5.5L8.5 8.5l8-5.5z"/><path d="M16.5 8.5L8.5 15.5M8.5 8.5l8 7"/></svg>`,
  chrome: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3.5"/><path d="M12 2.5a9.5 9.5 0 0 1 8.2 4.8L12 12M2.5 12h9.5M8.3 18.2l4.8-4.8"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 9l3 3-3 3M13 15h4"/></svg>`,
  explorer: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H9l2.5 2.5H19A2.5 2.5 0 0 1 21.5 9v9A2.5 2.5 0 0 1 19 20.5H5.5A2.5 2.5 0 0 1 3 18V6.5z"/></svg>`,
  notepad: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
  clipboard: `<svg viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="5.5" width="11" height="12" rx="2"/><path d="M7.5 4a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v1.5H7.5V4z"/></svg>`,

  // Action Pills
  play: `<svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor"><path d="M6 4.5l10 5.5-10 5.5v-11z"/></svg>`,
  debug: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="11" r="4"/><path d="M10 7V4M7 5l1.5 2M13 5l-1.5 2M4 11h2M14 11h2M5 16l2-2M15 16l-2-2"/></svg>`,
  refresh: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5v3.2h-3.2"/></svg>`,
  copy: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="6.5" width="9" height="9" rx="1.5"/><path d="M4.5 13.5v-8a1.5 1.5 0 0 1 1.5-1.5h8"/></svg>`,
  check: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10.5l4 4 8-8"/></svg>`,
  briefcase: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6.5" width="14" height="10" rx="2"/><path d="M7 6.5V4.5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 4.5v2"/></svg>`,
  chat: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3V7a2 2 0 0 1 2-2z"/></svg>`,
  flame: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2.5c1.5 2.5 4 4.5 4 8a5 5 0 1 1-10 0c0-2.5 1.5-4.5 3-6 0 2.5 1.5 3.5 3 3.5-1-2.5 0-4.5 0-5.5z"/></svg>`,
  list: `<svg viewBox="0 0 20 20" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5.5h9M7 10h9M7 14.5h9M3.5 5.5h.5M3.5 10h.5M3.5 14.5h.5"/></svg>`,
};
