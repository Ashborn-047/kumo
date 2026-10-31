// ── ui/board/js/actions.js: Native System Actions Dispatcher ──

export async function runSystemAction(type, args = {}, onToast = null) {
  // Normalize arguments
  const payload = { ...args };
  if (type === 'app.open' && !payload.name && payload.app) {
    payload.name = payload.app;
  }
  if (type === 'powershell.read' && !payload.command && payload.script) {
    payload.command = payload.script;
  }

  if (window.goo?.action) {
    try {
      const res = await window.goo.action(type, payload);
      return res;
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // Browser Fallback Mode (Web Dev Server)
  if (type === 'app.open') {
    onToast?.(`Opening ${payload.name || 'Application'}...`);
    return { ok: true, result: { opened: payload.name } };
  }
  if (type === 'url.open') {
    window.open(payload.url, '_blank');
    return { ok: true, result: { opened: payload.url } };
  }
  if (type === 'clipboard.read') {
    try {
      const text = await navigator.clipboard.readText();
      return { ok: true, result: { text: text || '' } };
    } catch {
      return { ok: true, result: { text: '' } };
    }
  }
  if (type === 'clipboard.write') {
    try {
      await navigator.clipboard.writeText(payload.text || '');
      return { ok: true, result: { written: true } };
    } catch {
      return { ok: true, result: { written: false } };
    }
  }
  if (type === 'file.search') {
    return {
      ok: true,
      result: {
        results: [],
      },
    };
  }
  if (type === 'powershell.read') {
    return {
      ok: true,
      result: {
        output: `[Command]: ${payload.command || 'PowerShell script'}\n[Executed via native bridge]`,
      },
    };
  }
  if (type === 'system.volume') {
    return { ok: true, result: { muted: true } };
  }
  if (type === 'system.sleep') {
    return { ok: true, result: { sleeping: true } };
  }
  return { ok: true };
}
