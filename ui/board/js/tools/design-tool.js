// ── ui/board/js/tools/design-tool.js: Stitch Design Studio with Tabs ──

import { runSystemAction } from '../actions.js';

export function renderDesignHTML(card) {
  const activeTab = card.data.activeTab || 'tokens';

  return `
    <header class="h-12 px-4 bg-[#ffe9d6] border-b border-orange-100 flex items-center justify-between cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2">
        <span class="material-symbols-outlined text-slate-400 text-[18px]">drag_indicator</span>
        <div class="w-6 h-6 rounded-md bg-white/70 flex items-center justify-center text-orange-800 shadow-2xs">
          <span class="material-symbols-outlined text-[16px]">palette</span>
        </div>
        <h2 class="font-headline-sm text-headline-sm text-slate-800 font-bold">${card.title || 'Design Studio'}</h2>
      </div>
      <div class="flex items-center gap-3">
        <span class="inline-block transform rotate-2 bg-orange-100 text-orange-900 border border-orange-300/40 text-[10px] font-label-sm font-bold tracking-wider px-2 py-0.5 rounded-full">
          Tokens Sync
        </span>
        <div class="flex items-center gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-orange-400 transition-colors cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-slate-400 transition-colors cursor-pointer" data-act="del" title="Close"></div>
        </div>
      </div>
    </header>

    <!-- Sub-Tabs Bar -->
    <div class="flex items-center gap-1 px-5 pt-3 border-b border-slate-100">
      <button class="design-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'tokens' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="tokens">
        <span class="material-symbols-outlined text-[15px]">palette</span> Tokens
      </button>
      <button class="design-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'components' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="components">
        <span class="material-symbols-outlined text-[15px]">widgets</span> Components
      </button>
      <button class="design-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 ${activeTab === 'export' ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-slate-500 hover:text-slate-800'}" data-tab="export">
        <span class="material-symbols-outlined text-[15px]">code</span> Export
      </button>
    </div>

    <div class="p-5 flex flex-col gap-4">
      <!-- TAB 1: PASTEL TOKENS -->
      <div class="design-tab-pane ${activeTab === 'tokens' ? '' : 'hidden'} flex flex-col gap-3" id="pane-design-tokens">
        <div>
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-slate-500 font-semibold block mb-2">Pastel Design Tokens (Click to Copy Hex)</span>
          <div class="grid grid-cols-5 gap-1.5">
            <div class="palette-swatch flex flex-col items-center gap-1 group cursor-pointer" data-copy-color="#DCEDFF">
              <div class="w-full h-8 rounded-lg bg-[#dcedff] border border-sky-200 shadow-2xs group-hover:scale-105 transition-transform"></div>
              <span class="text-[9px] font-label-sm text-slate-600 font-mono">#DCEDFF</span>
            </div>
            <div class="palette-swatch flex flex-col items-center gap-1 group cursor-pointer" data-copy-color="#EADFFF">
              <div class="w-full h-8 rounded-lg bg-[#eadfff] border border-purple-200 shadow-2xs group-hover:scale-105 transition-transform"></div>
              <span class="text-[9px] font-label-sm text-slate-600 font-mono">#EADFFF</span>
            </div>
            <div class="palette-swatch flex flex-col items-center gap-1 group cursor-pointer" data-copy-color="#DCF5E7">
              <div class="w-full h-8 rounded-lg bg-[#dcf5e7] border border-emerald-200 shadow-2xs group-hover:scale-105 transition-transform"></div>
              <span class="text-[9px] font-label-sm text-slate-600 font-mono">#DCF5E7</span>
            </div>
            <div class="palette-swatch flex flex-col items-center gap-1 group cursor-pointer" data-copy-color="#FFE9D6">
              <div class="w-full h-8 rounded-lg bg-[#ffe9d6] border border-orange-200 shadow-2xs group-hover:scale-105 transition-transform"></div>
              <span class="text-[9px] font-label-sm text-slate-600 font-mono">#FFE9D6</span>
            </div>
            <div class="palette-swatch flex flex-col items-center gap-1 group cursor-pointer" data-copy-color="#FFF5C8">
              <div class="w-full h-8 rounded-lg bg-[#fff5c8] border border-amber-200 shadow-2xs group-hover:scale-105 transition-transform"></div>
              <span class="text-[9px] font-label-sm text-slate-600 font-mono">#FFF5C8</span>
            </div>
          </div>
        </div>
        <p class="text-[11px] text-slate-400 font-label-sm">Tokens power all 5 workbench headers, mini-map nodes, and tactile accents.</p>
      </div>

      <!-- TAB 2: COMPONENTS PREVIEW -->
      <div class="design-tab-pane ${activeTab === 'components' ? '' : 'hidden'} flex flex-col gap-3" id="pane-design-components">
        <div class="bg-slate-50/80 p-4 rounded-xl border border-slate-200/90 flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <span class="font-label-sm text-label-sm text-slate-500 font-semibold uppercase">Interactive Preview</span>
            <div class="flex gap-1">
              <button class="design-copy-css-btn text-[11px] font-label-sm text-slate-600 hover:text-primary transition-colors bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer">Copy CSS</button>
              <button class="design-export-svg-btn text-[11px] font-label-sm text-slate-600 hover:text-primary transition-colors bg-white px-2 py-0.5 rounded border border-slate-200 cursor-pointer">Export SVG</button>
            </div>
          </div>

          <div class="flex items-center justify-around py-2 bg-white rounded-lg border border-slate-200/60 shadow-2xs">
            <!-- Glass Pill Button -->
            <button class="px-4 py-1.5 rounded-full bg-white/70 backdrop-blur border border-white/90 shadow-md text-primary font-headline-sm text-body-sm flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer">
              <span class="material-symbols-outlined text-[16px]">touch_app</span> Pill Action
            </button>
            <!-- Custom Interactive Toggle -->
            <div class="design-toggle flex items-center gap-2 cursor-pointer">
              <div class="toggle-track w-11 h-6 bg-primary rounded-full p-0.5 flex items-center justify-end shadow-inner transition-colors">
                <div class="toggle-thumb w-5 h-5 rounded-full bg-white shadow-md transform transition-transform"></div>
              </div>
              <span class="toggle-label text-body-sm font-body-sm text-slate-600 font-medium">Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 3: EXPORT TOKENS -->
      <div class="design-tab-pane ${activeTab === 'export' ? '' : 'hidden'} flex flex-col gap-2" id="pane-design-export">
        <span class="font-label-sm text-label-sm uppercase tracking-wider text-slate-500 font-semibold">Copy Tokens for Development</span>
        <div class="grid grid-cols-3 gap-2">
          <button class="export-chip p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 flex flex-col items-center gap-1 text-center transition-colors" data-type="css">
            <span class="material-symbols-outlined text-orange-600 text-[18px]">css</span>
            <span class="font-label-sm text-label-sm font-bold text-slate-800">CSS Tokens</span>
          </button>
          <button class="export-chip p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 flex flex-col items-center gap-1 text-center transition-colors" data-type="tailwind">
            <span class="material-symbols-outlined text-sky-600 text-[18px]">brush</span>
            <span class="font-label-sm text-label-sm font-bold text-slate-800">Tailwind Config</span>
          </button>
          <button class="export-chip p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/60 flex flex-col items-center gap-1 text-center transition-colors" data-type="json">
            <span class="material-symbols-outlined text-purple-600 text-[18px]">data_object</span>
            <span class="font-label-sm text-label-sm font-bold text-slate-800">JSON Format</span>
          </button>
        </div>
      </div>

      <!-- Mini Preview Well always visible -->
      ${activeTab === 'tokens' ? `
        <div class="bg-slate-50/80 p-3 rounded-xl border border-slate-200/90 flex items-center justify-between text-body-sm">
          <span class="text-slate-600 font-label-sm">Active Palette: <b>Warm Tactile Spatial</b></span>
          <button class="open-design-system-btn text-primary hover:underline text-[11px] font-label-sm font-semibold flex items-center gap-0.5">
            Full System Specs <span class="material-symbols-outlined text-[12px]">north_east</span>
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

export function attachDesignEvents(el, card, onSave, onToast) {
  // Tab switching
  el.querySelectorAll('.design-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      card.data.activeTab = btn.dataset.tab;
      el.querySelectorAll('.design-tab-btn').forEach((b) => {
        b.className = 'design-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-slate-500 hover:text-slate-800';
      });
      btn.className = 'design-tab-btn px-3 py-1 rounded-t-lg font-label-md text-label-md font-semibold transition-colors flex items-center gap-1 text-primary border-b-2 border-primary bg-primary/5';

      el.querySelectorAll('.design-tab-pane').forEach((p) => p.classList.add('hidden'));
      el.querySelector(`#pane-design-${card.data.activeTab}`)?.classList.remove('hidden');
      onSave?.();
    };
  });

  // Swatches
  el.querySelectorAll('.palette-swatch').forEach((swatch) => {
    swatch.addEventListener('click', () => {
      const hex = swatch.dataset.copyColor;
      runSystemAction('clipboard.write', { text: hex });
      onToast?.(`Copied ${hex} to clipboard!`);
    });
  });

  // Export chips
  el.querySelectorAll('.export-chip').forEach((chip) => {
    chip.onclick = () => {
      const type = chip.dataset.type;
      let text = '';
      if (type === 'css') {
        text = `:root {\n  --kumo-sky: #DCEDFF;\n  --kumo-lilac: #EADFFF;\n  --kumo-mint: #DCF5E7;\n  --kumo-peach: #FFE9D6;\n  --kumo-butter: #FFF5C8;\n}`;
      } else if (type === 'tailwind') {
        text = `colors: { sky: '#DCEDFF', lilac: '#EADFFF', mint: '#DCF5E7', peach: '#FFE9D6', butter: '#FFF5C8' }`;
      } else {
        text = JSON.stringify({ sky: '#DCEDFF', lilac: '#EADFFF', mint: '#DCF5E7', peach: '#FFE9D6', butter: '#FFF5C8' }, null, 2);
      }
      runSystemAction('clipboard.write', { text });
      onToast?.(`Copied ${type.toUpperCase()} to clipboard!`);
    };
  });

  // Toggle
  const toggle = el.querySelector('.design-toggle');
  let active = true;
  toggle?.addEventListener('click', () => {
    active = !active;
    const track = toggle.querySelector('.toggle-track');
    const label = toggle.querySelector('.toggle-label');
    if (active) {
      track.className = 'toggle-track w-11 h-6 bg-primary rounded-full p-0.5 flex items-center justify-end shadow-inner transition-colors';
      label.textContent = 'Active';
    } else {
      track.className = 'toggle-track w-11 h-6 bg-slate-300 rounded-full p-0.5 flex items-center justify-start shadow-inner transition-colors';
      label.textContent = 'Inactive';
    }
    onToast?.(`Component state: ${label.textContent}`);
  });

  el.querySelector('.open-design-system-btn')?.addEventListener('click', () => {
    window.open('/design-system/index.html', '_blank');
  });
}
