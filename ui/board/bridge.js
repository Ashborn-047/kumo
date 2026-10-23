// ============================================================
// bridge.js — Board ↔ Native Bridge
// Replaces the original webkit.messageHandlers.mb bridge
// from mochiboard with Electron's contextBridge IPC.
// Only ~30 lines changed from the original. Everything else
// in ui/board/ is copied verbatim from mochiboard.
// ============================================================

(() => {
  // Are we inside the Electron app?
  const native = !!(window.goo);

  const waiting = new Map();
  let seq = 0;

  // Listen for replies from main process
  if (native) {
    window.goo.onBoardReply?.((id, ok, value) => {
      const w = waiting.get(id);
      if (!w) return;
      waiting.delete(id);
      ok ? w.res(value) : w.rej(new Error(value));
    });
  }

  // Send a call to main process and await reply
  const call = (op, args = {}) => {
    if (!native) return browserFallback(op, args);
    return new Promise((res, rej) => {
      const id = ++seq;
      waiting.set(id, { res, rej });
      window.goo.boardCall({ id, op, args });
    });
  };

  // ── Browser fallback (dev mode / web demo) ──────────────────
  const LS = 'goo:board:';
  const browserFallback = async (op, args) => {
    switch (op) {
      case 'list':   return JSON.parse(localStorage.getItem(LS + 'index') || '[]');
      case 'load':   { const s = localStorage.getItem(LS + args.id); return s ? JSON.parse(s) : null; }
      case 'save':   {
        localStorage.setItem(LS + args.board.id, JSON.stringify(args.board));
        const idx = JSON.parse(localStorage.getItem(LS + 'index') || '[]').filter(b => b.id !== args.board.id);
        idx.unshift({ id: args.board.id, name: args.board.name, updated: Date.now() });
        localStorage.setItem(LS + 'index', JSON.stringify(idx));
        return true;
      }
      case 'delete': {
        localStorage.removeItem(LS + args.id);
        localStorage.setItem(LS + 'index', JSON.stringify(JSON.parse(localStorage.getItem(LS + 'index') || '[]').filter(b => b.id !== args.id)));
        return true;
      }
      default: return null;
    }
  };

  // ── Public API (complete shape expected by Mochiboard app.js) ───
  const mb = {
    // Board CRUD
    list:        ()              => call('list'),
    load:        (id)            => call('load', { id }),
    save:        (board)         => call('save', { board }),
    remove:      (id)            => call('delete', { id }),
    folders:     ()              => call('folders'),
    saveFolders: (f)             => call('saveFolders', { folders: f }),
    reveal:      ()              => call('reveal'),

    // AI & Canvas Generation
    ask:         (prompt, context) => call('ai:ask', { prompt, context }),
    rewrite:     (text, style)   => call('ai:ask', { prompt: `Rewrite in ${style} style: ${text}` }),

    // Fonts & System
    fonts:       ()              => Promise.resolve(['DM Sans', 'Inter', 'Segoe UI', 'Helvetica Neue', 'Georgia', 'Arial', 'Courier New']),
    openURL:     (url)           => window.goo ? window.goo.action('url.open', { url }) : window.open(url, '_blank'),
    getURL:      null,
    web:         false,
    native:      true,

    // Features / Placeholders
    connections: ()              => Promise.resolve({ claude: true, mobbin: false, higgs: false }),
    usage:       ()              => Promise.resolve({ tokens: 0, cost: 0 }),
    resetUsage:  ()              => Promise.resolve(),
    linkPreview: (url)           => Promise.resolve({ title: url, desc: '' }),
    fetchImage:  (url)           => Promise.resolve(null),
    speechAuth:  ()              => Promise.resolve(false),
    transcribe:  ()              => Promise.resolve(''),
    exportRect:  ()              => Promise.resolve(null),
    drawFill:    ()              => Promise.resolve(null),
    saveFile:    (b64, name)     => Promise.resolve(name),
    docPDF:      ()              => Promise.resolve(null),
    updateCheck: ()              => Promise.resolve(false),
    updateNow:   ()              => Promise.resolve(),
    version:     ()              => Promise.resolve('0.1.0'),
  };

  window.mb = mb;
  window.MB = mb;
})();
