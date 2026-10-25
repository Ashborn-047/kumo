// ── ui/board/js/tools/notes-tool.js: Dynamic Sprint Scratchpad & Interactive Checklist ──

const TINT_PALETTES = [
  { name: 'Solar Yellow', bg: '#fff5c8', border: 'border-amber-200/80', header: 'bg-amber-100/70' },
  { name: 'Pastel Rose',  bg: '#ffd6de', border: 'border-rose-200/80',  header: 'bg-rose-100/70' },
  { name: 'Soft Mint',    bg: '#dcf5e7', border: 'border-emerald-200/80', header: 'bg-emerald-100/70' },
  { name: 'Lilac Mist',   bg: '#eadfff', border: 'border-purple-200/80', header: 'bg-purple-100/70' },
  { name: 'Sky Blue',     bg: '#dcedff', border: 'border-sky-200/80',    header: 'bg-sky-100/70' },
];

export function renderNotesHTML(card) {
  const items = card.data.items || [];
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const currentBg = card.data.bgColor || '#fff5c8';
  const memo = card.data.scratchText || '';

  return `
    <!-- Warm Butter Pastel Header -->
    <header class="h-12 bg-amber-100/70 border-b border-amber-200/60 px-4 flex items-center justify-between select-none cursor-grab notes-card-header" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2">
        <!-- Brass Pushpin Icon -->
        <span class="material-symbols-outlined text-[20px] text-amber-700">push_pin</span>
        <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold card-title-text" title="Click to rename">${card.title || 'Sprint Scratchpad'}</h2>
      </div>
      <div class="flex items-center gap-2.5">
        <!-- Color Palette Dots -->
        <div class="flex items-center gap-1.5 notes-tint-picker">
          <span class="w-3.5 h-3.5 rounded-full bg-[#fff5c8] ring-1 ring-black/20 hover:scale-110 transition-transform cursor-pointer" data-color="#fff5c8" data-header="bg-amber-100/70" title="Solar Yellow"></span>
          <span class="w-3.5 h-3.5 rounded-full bg-[#ffd6de] ring-1 ring-black/20 hover:scale-110 transition-transform cursor-pointer" data-color="#ffd6de" data-header="bg-rose-100/70" title="Pastel Rose"></span>
          <span class="w-3.5 h-3.5 rounded-full bg-[#dcf5e7] ring-1 ring-black/20 hover:scale-110 transition-transform cursor-pointer" data-color="#dcf5e7" data-header="bg-emerald-100/70" title="Soft Mint"></span>
          <span class="w-3.5 h-3.5 rounded-full bg-[#eadfff] ring-1 ring-black/20 hover:scale-110 transition-transform cursor-pointer" data-color="#eadfff" data-header="bg-purple-100/70" title="Lilac Mist"></span>
          <span class="w-3.5 h-3.5 rounded-full bg-[#dcedff] ring-1 ring-black/20 hover:scale-110 transition-transform cursor-pointer" data-color="#dcedff" data-header="bg-sky-100/70" title="Sky Blue"></span>
        </div>
        <!-- Window Controls -->
        <div class="flex items-center gap-1 ml-1">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-amber-400 transition-colors cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300/80 hover:bg-rose-400 transition-colors cursor-pointer" data-act="del" title="Close"></div>
        </div>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <!-- Body -->
    <div class="p-5 flex flex-col gap-4">
      <!-- Sprint Readiness Progress Bar -->
      <div class="flex flex-col gap-1.5 bg-white/50 p-2.5 rounded-xl border border-black/5">
        <div class="flex items-center justify-between text-label-sm font-label-sm">
          <span class="text-secondary font-medium">Sprint Readiness</span>
          <span class="notes-progress-label font-mono font-semibold text-primary">${done} of ${total} Done • ${pct}%</span>
        </div>
        <div class="w-full h-2 bg-black/5 rounded-full overflow-hidden">
          <div class="notes-progress-bar h-full bg-primary-container rounded-full transition-all duration-300" style="width: ${pct}%"></div>
        </div>
      </div>

      <!-- Interactive Checklist Container -->
      <div class="space-y-2 notes-items-list max-h-56 overflow-y-auto">
        ${items.map((item, idx) => `
          <div class="notes-item-row flex items-center justify-between p-2 rounded-xl bg-white/70 hover:bg-white transition-all border border-black/5 group" data-idx="${idx}">
            <label class="flex items-center gap-2.5 cursor-pointer flex-1 select-none">
              <input class="notes-item-check w-4 h-4 rounded text-primary-container focus:ring-primary border-outline-variant/60 cursor-pointer" type="checkbox" ${item.done ? 'checked' : ''}/>
              <span class="notes-item-text text-body-sm font-body-sm transition-all ${item.done ? 'line-through text-slate-400' : 'text-on-surface font-medium'}">${item.text}</span>
            </label>
            <div class="flex items-center gap-1.5">
              <span class="text-label-sm font-label-sm px-2 py-0.5 rounded-full ${item.tag === 'URGENT' ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : item.tag === 'DESIGN' ? 'bg-primary-fixed text-primary' : 'bg-surface-container-highest text-secondary'} font-mono">${item.tag || 'TODO'}</span>
              <button class="notes-item-del opacity-0 group-hover:opacity-100 hover:text-rose-600 transition-opacity p-0.5 text-slate-400" title="Delete Task">
                <span class="material-symbols-outlined text-[15px]">close</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Add Task Input Row -->
      <div class="flex items-center gap-2 pt-1">
        <input class="notes-add-input w-full bg-white/80 py-2 px-3 rounded-xl text-body-sm font-body-sm text-on-surface border border-outline-variant/30 focus:ring-2 focus:ring-primary-container placeholder:text-secondary focus:outline-none transition-all" placeholder="+ Add task and press Enter..." type="text"/>
        <select class="notes-tag-select bg-white/80 py-2 px-2 rounded-xl text-label-sm font-label-sm font-mono text-secondary border border-outline-variant/30 focus:outline-none cursor-pointer">
          <option value="TODO">TODO</option>
          <option value="URGENT">URGENT</option>
          <option value="BACKLOG">BACKLOG</option>
          <option value="SYSTEM">SYSTEM</option>
          <option value="DESIGN">DESIGN</option>
        </select>
        <button class="notes-add-btn bg-primary text-on-primary px-3 py-2 rounded-xl text-label-sm font-label-sm font-semibold hover:bg-primary-container transition-all active:scale-95 whitespace-nowrap">
          Add
        </button>
      </div>

      <!-- Quick Scribble Scratchpad Memo -->
      <div class="bg-white/60 p-3 rounded-xl border border-black/5 flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-[11px] font-mono text-slate-600">
          <span class="font-semibold">SCRATCHPAD MEMO</span>
          <span class="text-slate-400">Autosaved to disk</span>
        </div>
        <textarea class="notes-scratchpad-area w-full bg-transparent border-0 text-body-sm font-body-sm text-on-surface placeholder:text-slate-400 focus:ring-0 resize-none p-0 leading-relaxed italic" rows="2" placeholder="Jot down quick thoughts, sprint notes, or thoughts here...">${memo}</textarea>
      </div>
    </div>
  `;
}

export function attachNotesEvents(el, card, onSave) {
  // Update parent card container background tint
  if (card.data.bgColor) {
    el.style.backgroundColor = card.data.bgColor;
  }

  // Recalculate progress helper
  const updateProgress = () => {
    const items = card.data.items || [];
    const total = items.length;
    const done = items.filter((i) => i.done).length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const pLabel = el.querySelector('.notes-progress-label');
    const pBar = el.querySelector('.notes-progress-bar');
    if (pLabel) pLabel.textContent = `${done} of ${total} Done • ${pct}%`;
    if (pBar) pBar.style.width = `${pct}%`;
    onSave?.();
  };

  // Color tint switches
  el.querySelectorAll('.notes-tint-picker span').forEach((dot) => {
    dot.onclick = () => {
      const color = dot.dataset.color;
      const headerClass = dot.dataset.header;
      card.data.bgColor = color;
      el.style.backgroundColor = color;
      const header = el.querySelector('.notes-card-header');
      if (header && headerClass) {
        header.className = `h-12 ${headerClass} border-b border-black/10 px-4 flex items-center justify-between select-none cursor-grab notes-card-header`;
      }
      onSave?.();
    };
  });

  // Checklist check / uncheck
  el.querySelectorAll('.notes-item-row').forEach((row) => {
    const idx = parseInt(row.dataset.idx, 10);
    const cb = row.querySelector('.notes-item-check');
    const textEl = row.querySelector('.notes-item-text');
    const delBtn = row.querySelector('.notes-item-del');

    cb?.addEventListener('change', () => {
      if (card.data.items[idx]) {
        card.data.items[idx].done = cb.checked;
        if (cb.checked) {
          textEl?.classList.add('line-through', 'text-slate-400');
          textEl?.classList.remove('text-on-surface', 'font-medium');
        } else {
          textEl?.classList.remove('line-through', 'text-slate-400');
          textEl?.classList.add('text-on-surface', 'font-medium');
        }
        updateProgress();
      }
    });

    delBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      card.data.items.splice(idx, 1);
      // Re-render
      el.innerHTML = renderNotesHTML(card);
      attachNotesEvents(el, card, onSave);
      onSave?.();
    });
  });

  // Add new task
  const addIn = el.querySelector('.notes-add-input');
  const tagSelect = el.querySelector('.notes-tag-select');
  const addBtn = el.querySelector('.notes-add-btn');

  const handleAdd = () => {
    const text = addIn?.value.trim();
    if (!text) return;
    const tag = tagSelect?.value || 'TODO';
    if (!card.data.items) card.data.items = [];
    card.data.items.push({ id: `t-${Date.now()}`, text, done: false, tag });
    addIn.value = '';
    el.innerHTML = renderNotesHTML(card);
    attachNotesEvents(el, card, onSave);
    onSave?.();
  };

  addBtn?.addEventListener('click', handleAdd);
  addIn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdd();
  });

  // Scratchpad memo autosave
  const scratchArea = el.querySelector('.notes-scratchpad-area');
  scratchArea?.addEventListener('input', () => {
    card.data.scratchText = scratchArea.value;
    onSave?.();
  });
}
