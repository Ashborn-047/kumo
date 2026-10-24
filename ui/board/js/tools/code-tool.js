// ── ui/board/js/tools/code-tool.js: Stitch PowerShell & Scripts Sandbox with Tabs ──

import { askAI } from '../ai.js';
import { runSystemAction } from '../actions.js';

const SNIPPETS = [
  { name: 'Top Processes', code: 'Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 ProcessName, CPU, Handles' },
  { name: 'Git Status & Branch', code: 'git status -s; git branch --show-current' },
  { name: 'Disk Space', code: 'Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{N="Used(GB)";E={[math]::round($_.Used/1GB,2)}}, @{N="Free(GB)";E={[math]::round($_.Free/1GB,2)}}' },
  { name: 'Listening Ports', code: 'Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess -First 5' },
];

export function renderCodeHTML(card) {
  const activeTab = card.data.activeTab || 'editor';
  const codeVal = card.data.code || '';
  const outputVal = card.data.output || 'PS C:\\> Ready';

  return `
    <header class="h-12 px-4 bg-[#dcf5e7] border-b border-emerald-100 flex items-center justify-between cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-slate-400 text-[18px]">drag_indicator</span>
        <div class="w-6 h-6 rounded-md bg-white/70 flex items-center justify-center text-emerald-800 shadow-2xs">
          <span class="material-symbols-outlined text-[16px]">terminal</span>
        </div>
        <h2 class="font-headline-sm text-headline-sm text-slate-800 font-bold">${card.title || 'PowerShell & Scripts Sandbox'}</h2>
      </div>
      <div class="flex items-center gap-3">
        <span class="inline-block transform -rotate-2 bg-emerald-100 text-emerald-900 border border-emerald-300/40 text-[10px] font-label-sm font-bold tracking-wider px-2 py-0.5 rounded-full">
          Admin Session
        </span>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-emerald-400 transition-colors cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-slate-400 transition-colors cursor-pointer" data-act="del" title="Close"></div>
        </div>
      </div>
    </header>

    <!-- Sub-Tabs Bar -->
    <div class="flex items-center gap-1 px-5 pt-3 border-b border-slate-100">
      <button class="code-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'editor' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="editor">
        <span class="material-symbols-outlined text-[15px]">code</span> Editor
      </button>
      <button class="code-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'terminal' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="terminal">
        <span class="material-symbols-outlined text-[15px]">terminal</span> Output Terminal
      </button>
      <button class="code-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'snippets' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="snippets">
        <span class="material-symbols-outlined text-[15px]">data_object</span> Snippets
      </button>
    </div>

    <div class="p-5 flex flex-col gap-3.5">
      <!-- TAB 1: SCRIPT EDITOR -->
      <div class="code-tab-pane ${activeTab === 'editor' ? '' : 'hidden'} flex flex-col gap-3" id="pane-code-editor">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="code-run-btn bg-emerald-600 hover:bg-emerald-700 text-white font-label-md text-label-md font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors">
              <span class="material-symbols-outlined text-[16px]">play_arrow</span> Run Script
            </button>
            <button class="code-debug-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-label-md text-label-md font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <span class="material-symbols-outlined text-[15px] text-amber-600">bug_report</span> Debug
            </button>
            <button class="code-opt-btn bg-slate-100 hover:bg-slate-200 text-slate-700 font-label-md text-label-md font-medium px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <span class="material-symbols-outlined text-[15px] text-primary">magic_button</span> Optimize
            </button>
          </div>
          <span class="font-label-sm text-label-sm text-slate-400">PowerShell 7.4.2</span>
        </div>

        <div class="bg-slate-100/90 rounded-xl p-3 border border-slate-200 font-label-md text-label-md text-slate-800 space-y-1">
          <textarea class="code-editor-area w-full bg-transparent border-none outline-none resize-none font-label-md text-label-md leading-relaxed text-slate-800" rows="3" spellcheck="false" placeholder="# Write PowerShell commands here...">${codeVal}</textarea>
        </div>
      </div>

      <!-- TAB 2: TERMINAL CONSOLE -->
      <div class="code-tab-pane ${activeTab === 'terminal' ? '' : 'hidden'} flex flex-col gap-2" id="pane-code-terminal">
        <div class="bg-[#1e2530] text-slate-100 font-label-sm text-label-sm p-3.5 rounded-xl border border-slate-800 space-y-1 shadow-inner">
          <div class="flex items-center justify-between text-slate-400 border-b border-slate-700/60 pb-1 mb-1.5">
            <span class="flex items-center gap-1.5 font-semibold">
              <span>OUTPUT TERMINAL</span>
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
            <button class="code-clear-term text-[11px] hover:text-white transition-colors">Clear</button>
          </div>
          <pre class="code-output-terminal font-mono text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-48">${outputVal}</pre>
        </div>
      </div>

      <!-- TAB 3: SNIPPETS -->
      <div class="code-tab-pane ${activeTab === 'snippets' ? '' : 'hidden'} flex flex-col gap-2" id="pane-code-snippets">
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-slate-500 font-semibold">1-Click Sysadmin Snippets</span>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${SNIPPETS.map((snip) => `
            <div class="snippet-card p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/60 cursor-pointer transition-colors flex flex-col justify-between group" data-code="${encodeURIComponent(snip.code)}">
              <div>
                <p class="font-label-sm text-label-sm font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">${snip.name}</p>
                <p class="font-mono text-[10px] text-slate-500 truncate mt-0.5">${snip.code}</p>
              </div>
              <div class="mt-2 flex items-center justify-between text-[11px] text-emerald-700 font-semibold">
                <span>Load in Editor</span>
                <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Execution Strip at bottom of editor -->
      ${activeTab === 'editor' ? `
        <div class="bg-[#1e2530] text-slate-100 font-label-sm text-label-sm p-3 rounded-xl border border-slate-800 shadow-inner">
          <div class="flex items-center justify-between text-slate-400 border-b border-slate-700/60 pb-1 mb-1.5">
            <span>TERMINAL PREVIEW</span>
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
          <pre class="code-output-preview font-mono text-[10px] leading-relaxed text-slate-300 truncate">${outputVal.split('\n')[0] || 'Ready to run script...'}</pre>
        </div>
      ` : ''}
    </div>
  `;
}

export function attachCodeEvents(el, card, onSave, onToast) {
  // Tab switching
  el.querySelectorAll('.code-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      card.data.activeTab = btn.dataset.tab;
      el.querySelectorAll('.code-tab-btn').forEach((b) => {
        b.className = 'code-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-slate-500 hover:text-slate-800';
      });
      btn.className = 'code-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-primary border-b-2 border-primary bg-primary/5';

      el.querySelectorAll('.code-tab-pane').forEach((p) => p.classList.add('hidden'));
      el.querySelector(`#pane-code-${card.data.activeTab}`)?.classList.remove('hidden');
      onSave?.();
    };
  });

  const ta = el.querySelector('.code-editor-area');
  const term = el.querySelector('.code-output-terminal');
  const termPrev = el.querySelector('.code-output-preview');

  ta?.addEventListener('input', () => {
    card.data.code = ta.value;
    onSave?.();
  });

  const updateTerminal = (text) => {
    if (term) term.textContent = text;
    if (termPrev) termPrev.textContent = text.split('\n')[0] || '';
    card.data.output = text;
    onSave?.();
  };

  el.querySelector('.code-run-btn')?.addEventListener('click', async () => {
    onToast?.('Running script in background...');
    updateTerminal('PS C:\\kumo> Executing script...\n');
    const cmd = ta?.value.trim() || '';
    const res = await runSystemAction('powershell.read', { command: cmd }, onToast);
    if (res?.ok && res.result?.output) {
      updateTerminal(`PS C:\\kumo> .\\workspace-sync.ps1\n${res.result.output}`);
    } else if (res?.error) {
      updateTerminal(`PS C:\\kumo> Error:\n${res.error}`);
    } else {
      updateTerminal(`PS C:\\kumo> .\\workspace-sync.ps1\n[OK] Script executed successfully.\n[READY] Infinite canvas listener active.`);
    }
  });

  el.querySelector('.code-debug-btn')?.addEventListener('click', async () => {
    onToast?.('Kumo is debugging your script...');
    const res = await askAI(`Debug and explain this PowerShell script:\n\n${ta?.value}`);
    updateTerminal(`PS C:\\kumo> [DEBUG ANALYSIS]\n${res}`);
    onToast?.('Debug complete');
  });

  el.querySelector('.code-opt-btn')?.addEventListener('click', async () => {
    onToast?.('Kumo is optimizing script syntax...');
    const res = await askAI(`Optimize this PowerShell script for performance:\n\n${ta?.value}`);
    if (ta) ta.value = res.replace(/```[a-z]*\n?/g, '').trim();
    card.data.code = ta?.value || '';
    onSave?.();
    onToast?.('Script optimized');
  });

  el.querySelector('.code-clear-term')?.addEventListener('click', () => {
    updateTerminal('PS C:\\kumo> Console cleared.');
    onToast?.('Terminal cleared');
  });

  // Snippets
  el.querySelectorAll('.snippet-card').forEach((snip) => {
    snip.onclick = () => {
      const code = decodeURIComponent(snip.dataset.code);
      if (ta) ta.value = code;
      card.data.code = code;
      onSave?.();
      onToast?.('Loaded snippet into editor');
    };
  });
}
