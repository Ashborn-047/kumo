// ── ui/board/js/actions.js: Native System Actions Dispatcher ──

export async function runSystemAction(type, args = {}, onToast = null) {
  if (window.goo?.action) {
    try {
      const res = await window.goo.action(type, args);
      return res;
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // Browser Fallback Mode (Web Dev Server)
  if (type === 'app.open') {
    onToast?.(`🚀 Simulated: Opening ${args.name}`);
    return { ok: true, result: { opened: args.name } };
  }
  if (type === 'url.open') {
    window.open(args.url, '_blank');
    return { ok: true, result: { opened: args.url } };
  }
  if (type === 'clipboard.read') {
    try {
      const text = await navigator.clipboard.readText();
      return { ok: true, result: { text } };
    } catch {
      return { ok: true, result: { text: 'Clipboard sample text' } };
    }
  }
  if (type === 'clipboard.write') {
    try {
      await navigator.clipboard.writeText(args.text);
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
          `C:\\Users\\Desktop\\${args.query || 'project'}-notes.md`,
          `C:\\Users\\Downloads\\${args.query || 'report'}-final.pdf`,
        ],
      },
    };
  }
  if (type === 'powershell.read') {
    return { ok: true, result: { output: `[Simulated Output]\nExecuted: ${args.command}\nStatus: OK` } };
  }
  return { ok: true };
}
