// ── ui/board/js/tools/writer-tool.js: Stitch Writing & AI Drafting Suite with Tabs ──

import { askAI } from '../ai.js';

const TEMPLATES = [
  { name: 'Sprint Update', text: "## Weekly Sprint Update\n- Finalized spatial canvas layout with Stitch design system\n- Verified live 3D mascot companion integration\n- Next: multi-window paste synchronization" },
  { name: 'Release Changelog', text: "### v1.0.0 Release Notes\n- Integrated Stitch Warm Tactile Spatial design system\n- Native Windows PowerShell script execution\n- Instant AI text polishing and prompt rewrite pipeline" },
  { name: 'Bug RFC', text: "### Problem Description\n[Describe what went wrong]\n\n### Expected Behavior\n[Describe what should happen]\n\n### Fix Proposal\n[Proposed patch or solution]" },
];

export function renderWriterHTML(card) {
  const activeTab = card.data.activeTab || 'editor';
  const text = card.data.text || '';
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const readTime = words > 0 ? Math.max(1, Math.round(words / 3)) : 0;

  return `
    <header class="h-12 px-4 bg-[#eadfff] border-b border-purple-100 flex items-center justify-between cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-slate-400 text-[18px]">drag_indicator</span>
        <div class="w-6 h-6 rounded-md bg-white/70 flex items-center justify-center text-purple-800 shadow-2xs">
          <span class="material-symbols-outlined text-[16px]">auto_awesome</span>
        </div>
        <h2 class="font-headline-sm text-headline-sm text-slate-800 font-bold">${card.title || 'Writing & AI Drafting Suite'}</h2>
      </div>
      <div class="flex items-center gap-3">
        <span class="inline-block transform rotate-3 bg-purple-100 text-purple-900 border border-purple-300/40 text-[10px] font-label-sm font-bold tracking-wider px-2 py-0.5 rounded-full">
          GPT-4o Assisted
        </span>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-purple-400 transition-colors cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-slate-400 transition-colors cursor-pointer" data-act="del" title="Close"></div>
        </div>
      </div>
    </header>

    <!-- Sub-Tabs Bar -->
    <div class="flex items-center gap-1 px-5 pt-3 border-b border-slate-100">
      <button class="writer-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'editor' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="editor">
        <span class="material-symbols-outlined text-[15px]">edit</span> Editor
      </button>
      <button class="writer-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'rewrite' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="rewrite">
        <span class="material-symbols-outlined text-[15px]">sync</span> AI Rewrite
      </button>
      <button class="writer-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'templates' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="templates">
        <span class="material-symbols-outlined text-[15px]">library_books</span> Templates
      </button>
    </div>

    <div class="p-5 flex flex-col gap-3.5">
      <!-- TAB 1: EDITOR PANE -->
      <div class="writer-tab-pane ${activeTab === 'editor' ? '' : 'hidden'} flex flex-col gap-3" id="pane-editor">
        <div class="p-3.5 bg-slate-50/70 rounded-xl border border-slate-200/80 flex flex-col gap-2">
          <textarea class="writer-editor-textarea font-body-md text-body-md text-slate-700 leading-relaxed bg-transparent border-none outline-none resize-none w-full" rows="3" placeholder="Draft your thoughts, emails, or docs here...">${text}</textarea>
          <div class="flex items-center justify-between pt-1 border-t border-slate-200/60 text-slate-500 font-label-sm text-label-sm">
            <span class="flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">timer</span>
              <span class="writer-word-stats">${words} words • ${readTime}s read</span>
            </span>
            <span class="writer-focus-btn text-primary font-medium cursor-pointer hover:underline">Focus Editor ↗</span>
          </div>
        </div>

        <!-- AI Action Quick Pills -->
        <div class="flex flex-wrap items-center gap-1.5">
          <button class="ai-chip flex items-center gap-1 bg-surface-container-high/60 hover:bg-surface-variant text-slate-700 px-2.5 py-1 rounded-full text-body-sm font-body-sm transition-colors border border-outline-variant/30" data-action="polish">
            <span class="material-symbols-outlined text-[14px] text-primary">auto_fix</span> Polish Grammar
          </button>
          <button class="ai-chip flex items-center gap-1 bg-surface-container-high/60 hover:bg-surface-variant text-slate-700 px-2.5 py-1 rounded-full text-body-sm font-body-sm transition-colors border border-outline-variant/30" data-action="professional">
            <span class="material-symbols-outlined text-[14px] text-secondary">business_center</span> Professional
          </button>
          <button class="ai-chip flex items-center gap-1 bg-surface-container-high/60 hover:bg-surface-variant text-slate-700 px-2.5 py-1 rounded-full text-body-sm font-body-sm transition-colors border border-outline-variant/30" data-action="casual">
            <span class="material-symbols-outlined text-[14px] text-emerald-600">chat</span> Casual
          </button>
          <button class="ai-chip flex items-center gap-1 bg-surface-container-high/60 hover:bg-surface-variant text-slate-700 px-2.5 py-1 rounded-full text-body-sm font-body-sm transition-colors border border-outline-variant/30" data-action="punchy">
            <span class="material-symbols-outlined text-[14px] text-amber-600">bolt</span> Punchy
          </button>
          <button class="ai-chip flex items-center gap-1 bg-surface-container-high/60 hover:bg-surface-variant text-slate-700 px-2.5 py-1 rounded-full text-body-sm font-body-sm transition-colors border border-outline-variant/30" data-action="summarize">
            <span class="material-symbols-outlined text-[14px] text-sky-600">compress</span> Summarize
          </button>
        </div>
      </div>

      <!-- TAB 2: AI REWRITE PANE -->
      <div class="writer-tab-pane ${activeTab === 'rewrite' ? '' : 'hidden'} flex flex-col gap-2.5" id="pane-rewrite">
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-slate-500 font-semibold">Custom AI Prompt Revision</span>
        <div class="relative w-full">
          <input class="writer-revision-in w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-body-sm font-body-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="e.g. Make it more concise and add actionable bullet points..." type="text"/>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <button class="quick-prompt-btn px-2.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-label-sm transition-colors" data-prompt="Summarize into 3 key takeaways">Takeaways</button>
            <button class="quick-prompt-btn px-2.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-label-sm transition-colors" data-prompt="Translate to Japanese">日本語</button>
            <button class="quick-prompt-btn px-2.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-label-sm transition-colors" data-prompt="Make it punchy for Twitter / X">Tweet</button>
          </div>
          <button class="writer-rewrite-btn bg-primary hover:bg-primary-container text-on-primary px-3.5 py-1.5 rounded-xl text-body-sm font-body-sm font-medium transition-all shadow-xs flex items-center gap-1 shrink-0">
            <span class="material-symbols-outlined text-[15px]">auto_awesome</span> Run Rewrite
          </button>
        </div>
      </div>

      <!-- TAB 3: TEMPLATES PANE -->
      <div class="writer-tab-pane ${activeTab === 'templates' ? '' : 'hidden'} flex flex-col gap-2" id="pane-templates">
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-slate-500 font-semibold">1-Click Drafting Templates</span>
        <div class="grid grid-cols-1 gap-2">
          ${TEMPLATES.map((tmpl) => `
            <div class="template-card p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/50 border border-slate-200/60 cursor-pointer transition-colors flex items-center justify-between group" data-tmpl="${encodeURIComponent(tmpl.text)}">
              <div>
                <p class="font-label-sm text-label-sm font-bold text-slate-800 group-hover:text-primary transition-colors">${tmpl.name}</p>
                <p class="text-[11px] text-slate-500 truncate max-w-[340px]">${tmpl.text.split('\n')[0]}</p>
              </div>
              <span class="material-symbols-outlined text-slate-400 group-hover:text-primary text-[18px]">input</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Persistent prompt input bar at bottom of editor -->
      ${activeTab === 'editor' ? `
        <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
          <div class="relative flex-1">
            <input class="writer-quick-prompt w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-body-sm font-body-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Type AI revision instruction..." type="text"/>
          </div>
          <button class="writer-quick-rewrite-btn bg-primary hover:bg-primary-container text-on-primary px-3 py-1.5 rounded-xl text-body-sm font-body-sm font-medium transition-all shadow-xs flex items-center gap-1 shrink-0">
            <span class="material-symbols-outlined text-[15px]">sync</span> Rewrite
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export function attachWriterEvents(el, card, onSave, onToast) {
  // Tab switching
  el.querySelectorAll('.writer-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      card.data.activeTab = btn.dataset.tab;
      el.querySelectorAll('.writer-tab-btn').forEach((b) => {
        b.className = 'writer-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-slate-500 hover:text-slate-800';
      });
      btn.className = 'writer-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-primary border-b-2 border-primary bg-primary/5';

      el.querySelectorAll('.writer-tab-pane').forEach((p) => p.classList.add('hidden'));
      el.querySelector(`#pane-${card.data.activeTab}`)?.classList.remove('hidden');
      onSave?.();
    };
  });

  const ta = el.querySelector('.writer-editor-textarea');
  const stats = el.querySelector('.writer-word-stats');

  const updateStats = () => {
    if (!ta) return;
    const w = ta.value.trim() ? ta.value.trim().split(/\s+/).length : 0;
    const r = Math.max(1, Math.round(w / 3));
    if (stats) stats.textContent = `${w} words • ${r}s read`;
    card.data.text = ta.value;
    onSave?.();
  };

  ta?.addEventListener('input', updateStats);

  // Quick action chips
  el.querySelectorAll('.ai-chip').forEach((btn) => {
    btn.onclick = async () => {
      const act = btn.dataset.action;
      onToast?.(`Kumo is applying ${act} polish...`);
      const res = await askAI(`Rewrite the following text with a ${act} style:\n\n${ta.value}`);
      ta.value = res;
      updateStats();
      onToast?.(`Rewritten in ${act} tone`);
    };
  });

  // Prompt rewriting
  const runRevision = async (prompt) => {
    if (!prompt) return;
    onToast?.(`Kumo is rewriting: "${prompt}"...`);
    const res = await askAI(`Instructions: ${prompt}\n\nOriginal Text:\n${ta?.value || card.data.text}`);
    if (ta) ta.value = res;
    card.data.text = res;
    updateStats();
    onToast?.('Revision complete');
  };

  el.querySelector('.writer-rewrite-btn')?.addEventListener('click', () => {
    const p = el.querySelector('.writer-revision-in')?.value.trim();
    runRevision(p);
  });

  el.querySelector('.writer-quick-rewrite-btn')?.addEventListener('click', () => {
    const p = el.querySelector('.writer-quick-prompt')?.value.trim();
    runRevision(p);
  });

  el.querySelectorAll('.quick-prompt-btn').forEach((b) => {
    b.onclick = () => runRevision(b.dataset.prompt);
  });

  // Template insertion
  el.querySelectorAll('.template-card').forEach((cardEl) => {
    cardEl.onclick = () => {
      const tmplText = decodeURIComponent(cardEl.dataset.tmpl);
      if (ta) ta.value = tmplText;
      card.data.text = tmplText;
      updateStats();
      onToast?.('Template inserted into editor');
    };
  });

  el.querySelector('.writer-focus-btn')?.addEventListener('click', () => {
    ta?.focus();
    onToast?.('Editor focused');
  });
}
