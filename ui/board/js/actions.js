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
      return { ok: true, result: { text } };
    } catch {
      return { ok: true, result: { text: 'git commit -m "feat(spatial): tactile glassmorphic nodes"' } };
    }
  }
  if (type === 'clipboard.write') {
    try {
      await navigator.clipboard.writeText(payload.text);
      return { ok: true, result: { written: true } };
    } catch {
      return { ok: true };
    }
  }
  if (type === 'file.search') {
    return {
      ok: true,
      result: {
        results: [
          `C:\\Users\\Desktop\\${payload.query || 'project'}-notes.md`,
          `C:\\Users\\Downloads\\${payload.query || 'report'}-final.pdf`,
        ],
      },
    };
  }
  if (type === 'powershell.read') {
    return {
      ok: true,
      result: {
        output: `[Output for: ${payload.command || 'PowerShell script'}]\n[OK] Command executed successfully.\n[READY] Infinite canvas coordinator ready.`,
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
