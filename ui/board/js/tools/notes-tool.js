// ── ui/board/js/tools/notes-tool.js: Stitch Sticky Note with Tabs ──

export function renderNotesHTML(card) {
  const activeTab = card.data.activeTab || 'checklist';
  const items = Array.isArray(card.data.items) ? card.data.items : [];
  const scratch = card.data.scratchText || '';

  return `
    <!-- Adhesive Tape Visual at Top -->
    <div class="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/60 backdrop-blur-xs border border-white/50 rotate-1 shadow-2xs pointer-events-none z-10"></div>

    <div class="p-5 flex flex-col justify-between h-full">
      <div class="cursor-grab" data-drag-handle="${card.id}">
        <!-- Handwritten Headline -->
        <div class="flex items-center justify-between border-b border-amber-200/60 pb-2 mb-2">
          <h3 class="font-handwriting text-2xl text-amber-950 font-bold tracking-wide">
            ✨ ${card.title || 'Workspace Sticky Note'}
          </h3>
          <span class="material-symbols-outlined text-amber-700/70 text-[20px]">push_pin</span>
        </div>

        <!-- Sticky Note Mini Tabs -->
        <div class="flex items-center gap-2 mb-3 border-b border-amber-200/40 pb-1.5">
          <button class="note-tab-btn font-handwriting text-lg ${activeTab === 'checklist' ? 'text-amber-950 font-bold underline' : 'text-amber-800/60 hover:text-amber-950'}" data-tab="checklist">
            Checklist
          </button>
          <span class="text-amber-300">•</span>
          <button class="note-tab-btn font-handwriting text-lg ${activeTab === 'scratch' ? 'text-amber-950 font-bold underline' : 'text-amber-800/60 hover:text-amber-950'}" data-tab="scratch">
            Scratchpad
          </button>
        </div>
      </div>

      <!-- TAB 1: CHECKLIST PANE -->
      <div class="note-tab-pane ${activeTab === 'checklist' ? '' : 'hidden'} space-y-2.5 font-body-sm text-body-sm text-amber-950" id="pane-note-checklist">
        <div class="space-y-2">
          ${items.length === 0 ? `
            <div class="py-3 text-center text-amber-800/60 font-body-sm text-body-sm italic">No todo items yet. Add one below.</div>
          ` : items.map((item, idx) => `
            <label class="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" class="note-chk mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30 border-amber-400 bg-amber-50" data-idx="${idx}" ${item.done ? 'checked' : ''}/>
              <span class="${item.done ? 'line-through text-amber-800/60' : 'font-medium'}">${item.text}</span>
            </label>
          `).join('')}
        </div>
        <div class="pt-2 flex items-center gap-1.5 border-t border-amber-200/40">
          <input type="text" class="note-add-in w-full bg-amber-50/50 border border-amber-200/80 rounded-lg px-2.5 py-1 text-xs text-amber-950 placeholder-amber-700/40 outline-none focus:border-amber-400" placeholder="+ Add new todo item..."/>
        </div>
      </div>

      <!-- TAB 2: SCRATCHPAD PANE -->
      <div class="note-tab-pane ${activeTab === 'scratch' ? '' : 'hidden'}" id="pane-note-scratch">
        <textarea class="note-scratch-textarea w-full bg-transparent border-none outline-none resize-none font-handwriting text-xl text-amber-950 leading-relaxed" rows="5" placeholder="Write freely here...">${scratch}</textarea>
      </div>

      <div class="mt-4 pt-2 border-t border-amber-300/40 flex items-center justify-between text-amber-800/70 text-[11px] font-label-sm">
        <span>Pinned to Workspace Canvas</span>
        <span class="material-symbols-outlined text-[14px]">push_pin</span>
      </div>
    </div>
  `;
}

export function attachNotesEvents(el, card, onSave) {
  // Tab switching
  el.querySelectorAll('.note-tab-btn').forEach((btn) => {
    btn.onclick = () => {
      card.data.activeTab = btn.dataset.tab;
      el.querySelectorAll('.note-tab-btn').forEach((b) => {
        b.className = 'note-tab-btn font-handwriting text-lg text-amber-800/60 hover:text-amber-950';
      });
      btn.className = 'note-tab-btn font-handwriting text-lg text-amber-950 font-bold underline';

      el.querySelectorAll('.note-tab-pane').forEach((p) => p.classList.add('hidden'));
      el.querySelector(`#pane-note-${card.data.activeTab}`)?.classList.remove('hidden');
      onSave?.();
    };
  });

  // Checkbox toggles
  el.querySelectorAll('.note-chk').forEach((chk) => {
    chk.addEventListener('change', () => {
      const idx = parseInt(chk.dataset.idx, 10);
      if (card.data.items && card.data.items[idx]) {
        card.data.items[idx].done = chk.checked;
        const span = chk.nextElementSibling;
        if (span) {
          span.className = chk.checked ? 'line-through text-amber-800/60' : 'font-medium';
        }
        onSave?.();
      }
    });
  });

  // Add todo
  const addIn = el.querySelector('.note-add-in');
  addIn?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const text = addIn.value.trim();
      if (!text) return;
      if (!card.data.items) card.data.items = [];
      card.data.items.push({ text, done: false });
      onSave?.();
      addIn.value = '';
      // Re-render checklist item in place
      const pane = el.querySelector('#pane-note-checklist');
      if (pane) {
        const div = document.createElement('label');
        div.className = 'flex items-start gap-2.5 cursor-pointer';
        div.innerHTML = `
          <input type="checkbox" class="note-chk mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary/30 border-amber-400 bg-amber-50" data-idx="${card.data.items.length - 1}"/>
          <span class="font-medium">${text}</span>
        `;
        pane.querySelector('.space-y-2')?.appendChild(div);
      }
    }
  });

  // Scratchpad typing
  const scratchTa = el.querySelector('.note-scratch-textarea');
  scratchTa?.addEventListener('input', () => {
    card.data.scratchText = scratchTa.value;
    onSave?.();
  });
}
