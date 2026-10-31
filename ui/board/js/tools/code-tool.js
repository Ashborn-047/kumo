// ── ui/board/js/tools/code-tool.js: Live PowerShell & DevOps Console Widget ──

import { runSystemAction } from '../actions.js';

const PRESETS = {
  'system-info.ps1': 'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, TotalVisibleMemorySize, FreePhysicalMemory',
  'sync-workspace.ps1': 'Get-ChildItem -Path ./ -Depth 1 | Select-Object Name, Length, LastWriteTime',
  'list-processes.ps1': 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 6 ProcessName, Id, CPU',
  'network-ping.ps1': 'Test-Connection -TargetName 8.8.8.8 -Count 2',
  'clean-temp.ps1': 'Get-ChildItem $env:TEMP -Depth 1 | Measure-Object | Select-Object Count',
};

export function renderCodeHTML(card) {
  const code = card.data.code || PRESETS['system-info.ps1'];
  const cwd = card.data.cwd || 'Workspace';
  const output = card.data.output || `PS ${cwd}> Ready for script execution. Choose a preset or enter PowerShell script below.`;
  const preset = card.data.preset || 'system-info.ps1';
  const pid = card.data.pid || (typeof process !== 'undefined' ? process.pid : 'Active');
  const cpu = card.data.cpu || 'Ready';

  return `
    <!-- Terminal Header (macOS / Stitch Obsidian Style) -->
    <header class="h-11 bg-[#1e2433] px-4 flex items-center justify-between border-b border-white/5 select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <!-- Window Dots -->
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></span>
          <span class="w-3 h-3 rounded-full bg-[#ffbd2e] hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></span>
          <span class="w-3 h-3 rounded-full bg-[#27c93f] hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></span>
        </div>
        <div class="flex items-center gap-2 ml-2">
          <span class="text-label-sm font-label-sm text-emerald-400 font-mono font-semibold">POWERSHELL</span>
          <span class="text-white/30 text-xs">•</span>
          <span class="text-label-sm font-label-sm text-white/60 font-mono">PID ${pid}</span>
          <span class="text-white/30 text-xs">•</span>
          <span class="text-label-sm font-label-sm text-emerald-400 font-mono">${cpu}</span>
        </div>
      </div>
      <!-- Script Presets Dropdown & Run CTA -->
      <div class="flex items-center gap-2">
        <select class="code-preset-select bg-[#121620] text-label-sm font-label-sm font-mono text-white/80 py-1 px-2.5 rounded-lg border-0 ring-1 ring-white/10 focus:ring-emerald-500 cursor-pointer">
          <option value="system-info.ps1" ${preset === 'system-info.ps1' ? 'selected' : ''}>system-info.ps1</option>
          <option value="sync-workspace.ps1" ${preset === 'sync-workspace.ps1' ? 'selected' : ''}>sync-workspace.ps1</option>
          <option value="list-processes.ps1" ${preset === 'list-processes.ps1' ? 'selected' : ''}>list-processes.ps1</option>
          <option value="network-ping.ps1" ${preset === 'network-ping.ps1' ? 'selected' : ''}>network-ping.ps1</option>
          <option value="clean-temp.ps1" ${preset === 'clean-temp.ps1' ? 'selected' : ''}>clean-temp.ps1</option>
        </select>
        <button class="code-execute-btn flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-label-sm font-label-sm font-semibold shadow-sm active:scale-95 transition-all cursor-pointer">
          <span class="material-symbols-outlined text-[15px]">play_arrow</span>
          <span>Execute</span>
        </button>
      </div>
    </header>

    <!-- Script Editor Input Box -->
    <div class="bg-[#171b24] p-3.5 border-b border-white/5 flex flex-col gap-2">
      <div class="flex items-center justify-between text-[11px] font-mono text-white/50">
        <span class="text-emerald-400 font-semibold">INTERACTIVE SCRIPT EDITOR</span>
        <span>Type any PowerShell command or pick a preset</span>
      </div>
      <div class="relative bg-[#0e121a] rounded-xl p-2.5 ring-1 ring-white/10 focus-within:ring-emerald-500/50 transition-all">
        <textarea class="code-editor-input w-full bg-transparent border-0 font-mono text-label-sm font-label-sm text-emerald-300 placeholder:text-white/30 focus:ring-0 resize-none p-0 leading-relaxed" rows="3" spellcheck="false" placeholder="# Type PowerShell script here...">${code}</textarea>
      </div>
    </div>

    <!-- Terminal Syntactic Code & Output Screen -->
    <div class="p-4 font-mono text-label-sm font-label-sm space-y-1.5 bg-[#121620]/95 min-h-[160px] max-h-56 overflow-y-auto selection:bg-emerald-900 selection:text-emerald-100">
      <div class="code-output-log whitespace-pre-wrap leading-relaxed text-slate-300 font-mono text-label-sm font-label-sm">${output}</div>
      <!-- Pulsing Prompt Line -->
      <div class="flex items-center gap-2 pt-1 text-emerald-400">
        <span>PS ${cwd}&gt;</span>
        <span class="w-2 h-3.5 bg-emerald-400 inline-block animate-pulse"></span>
      </div>
    </div>

    <!-- Console Footer Status -->
    <div class="bg-[#171b24] px-4 py-2 border-t border-white/5 flex items-center justify-between text-label-sm font-label-sm font-mono text-white/50 select-none">
      <div class="flex items-center gap-3">
        <span>UTF-8</span>
        <span>•</span>
        <span>Safety Gate Active</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="code-clear-btn hover:text-white transition-colors cursor-pointer">Clear</button>
        <span>•</span>
        <button class="code-copy-log hover:text-white transition-colors cursor-pointer">Export Logs</button>
      </div>
    </div>
  `;
}

export function attachCodeEvents(el, card, onSave, onToast) {
  const select = el.querySelector('.code-preset-select');
  const editor = el.querySelector('.code-editor-input');
  const logView = el.querySelector('.code-output-log');

  // Preset selection
  select?.addEventListener('change', () => {
    const val = select.value;
    card.data.preset = val;
    if (PRESETS[val]) {
      editor.value = PRESETS[val];
      card.data.code = PRESETS[val];
    }
    onSave?.();
    onToast?.(`Loaded ${val}`);
  });

  // Editor typing
  editor?.addEventListener('input', () => {
    card.data.code = editor.value;
    onSave?.();
  });

  // Execute Script via Safety-Gated Native Action
  el.querySelector('.code-execute-btn')?.addEventListener('click', async () => {
    const cmd = editor?.value.trim();
    if (!cmd) {
      onToast?.('Please write a command to execute');
      return;
    }

    const cwd = card.data.cwd || 'Workspace';
    onToast?.(`Executing: ${cmd.split('\n')[0].slice(0, 30)}...`);
    if (logView) {
      logView.textContent = `PS ${cwd}> ${cmd}\n[INFO] Executing in local sandbox process...\n`;
    }

    try {
      const res = await runSystemAction('powershell.read', { command: cmd }, onToast);
      if (res?.ok && res.result?.output) {
        const out = `PS ${cwd}> ${cmd}\n[INFO] Process completed with Exit Code 0\n\n${res.result.output}`;
        card.data.output = out;
        if (logView) logView.textContent = out;
        onSave?.();
        onToast?.('✓ Script execution completed');
      } else if (res?.error) {
        const out = `PS ${cwd}> ${cmd}\n[ERROR] ${res.error}`;
        card.data.output = out;
        if (logView) logView.textContent = out;
        onSave?.();
        onToast?.(`Notice: ${res.error}`);
      } else {
        const out = `PS ${cwd}> ${cmd}\n[OK] Script executed successfully.`;
        card.data.output = out;
        if (logView) logView.textContent = out;
        onSave?.();
        onToast?.('✓ Command completed');
      }
    } catch (err) {
      const out = `PS ${cwd}> ${cmd}\n[ERROR] ${err.message}`;
      card.data.output = out;
      if (logView) logView.textContent = out;
      onSave?.();
    }
  });

  // Clear log
  el.querySelector('.code-clear-btn')?.addEventListener('click', () => {
    const cwd = card.data.cwd || 'Workspace';
    const out = `PS ${cwd}> Console output cleared.`;
    card.data.output = out;
    if (logView) logView.textContent = out;
    onSave?.();
    onToast?.('Console cleared');
  });

  // Export logs
  el.querySelector('.code-copy-log')?.addEventListener('click', async () => {
    const text = card.data.output || '';
    if (!text) {
      onToast?.('No logs to export');
      return;
    }
    await runSystemAction('clipboard.write', { text }, onToast);
    onToast?.('Exported terminal logs to clipboard');
  });
}
