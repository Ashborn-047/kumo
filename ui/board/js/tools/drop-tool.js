// ============================================================
// ui/board/js/tools/drop-tool.js — Edge Drop & Web Stash Deck
// Saves web links, desktop files, shortcuts, and snippets
// Zero emojis, strictly Material Symbols & Lucide-style SVG
// ============================================================

import { saveState, toast } from '../storage.js';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderDropHTML(card) {
  const data = card.data || {};
  const items = Array.isArray(data.items) ? data.items : [];
  const activeSubFilter = data.activeSubFilter || 'all';
  const searchQuery = (data.searchQuery || '').toLowerCase().trim();

  const filteredItems = items.filter((item) => {
    if (activeSubFilter === 'links' && item.itemType !== 'link') return false;
    if (activeSubFilter === 'files' && item.itemType !== 'file') return false;
    if (activeSubFilter === 'snippets' && item.itemType !== 'snippet') return false;
    if (searchQuery) {
      const matchTitle = (item.title || '').toLowerCase().includes(searchQuery);
      const matchText = (item.text || '').toLowerCase().includes(searchQuery);
      const matchUrl = (item.url || '').toLowerCase().includes(searchQuery);
      return matchTitle || matchText || matchUrl;
    }
    return true;
  });

  return `
    <header class="h-11 bg-surface-container-high/80 dark:bg-inverse-surface/80 border-b border-outline-variant/30 px-3.5 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 flex items-center justify-center shadow-xs">
          <span class="material-symbols-outlined text-[17px]">archive</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="card-title-text font-headline-sm text-label-md font-bold text-on-surface dark:text-inverse-on-surface">${escapeHtml(card.title || 'Edge Drop & Web Stash')}</span>
          <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold">${items.length} ${items.length === 1 ? 'item' : 'items'}</span>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-highest transition-colors cursor-pointer" data-act="min" title="Minimize Card">
          <span class="material-symbols-outlined text-[16px]">horizontal_rule</span>
        </button>
        <button class="w-7 h-7 rounded-lg flex items-center justify-center text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer" data-act="del" title="Remove Card">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </header>

    <div class="p-3.5 flex flex-col gap-3">
      <!-- Search & Sub-Filter Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
        <div class="flex items-center gap-1 overflow-x-auto py-0.5 font-mono text-[11px]">
          <button class="drop-sub-filter px-2.5 py-1 rounded-lg font-semibold transition-all ${activeSubFilter === 'all' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low text-secondary hover:text-on-surface'}" data-filter="all">All</button>
          <button class="drop-sub-filter px-2.5 py-1 rounded-lg font-semibold transition-all ${activeSubFilter === 'links' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low text-secondary hover:text-on-surface'}" data-filter="links">Links &amp; Web</button>
          <button class="drop-sub-filter px-2.5 py-1 rounded-lg font-semibold transition-all ${activeSubFilter === 'files' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low text-secondary hover:text-on-surface'}" data-filter="files">Files &amp; Apps</button>
          <button class="drop-sub-filter px-2.5 py-1 rounded-lg font-semibold transition-all ${activeSubFilter === 'snippets' ? 'bg-primary text-on-primary shadow-xs' : 'bg-surface-container-low text-secondary hover:text-on-surface'}" data-filter="snippets">Snippets</button>
        </div>

        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-2 text-[14px] text-secondary">search</span>
          <input type="text" class="drop-search-input pl-7 pr-2.5 py-1 rounded-lg text-body-sm font-sans bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary w-full sm:w-36 text-xs" placeholder="Search stash..." value="${escapeHtml(data.searchQuery || '')}"/>
        </div>
      </div>

      <!-- Items Grid / List -->
      <div class="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
        ${filteredItems.length === 0 ? `
          <div class="flex flex-col items-center justify-center p-6 border border-dashed border-outline-variant/40 rounded-xl bg-surface-container-lowest/50 text-center gap-1.5">
            <span class="material-symbols-outlined text-[24px] text-secondary/60">archive</span>
            <p class="text-label-md font-bold text-on-surface">No Stashed Items</p>
            <p class="text-[11px] text-secondary max-w-xs">Drop links or files onto Edge Drop in Pulse Island, or use the quick stash bar below.</p>
          </div>
        ` : filteredItems.map((item) => {
          const isLink = item.itemType === 'link' || Boolean(item.url);
          const icon = isLink ? 'link' : item.itemType === 'file' ? 'description' : 'notes';
          const badgeClass = isLink ? 'bg-sky-50 text-sky-700 border-sky-200' : item.itemType === 'file' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700 border-purple-200';
          const linkUrl = item.url || (isLink ? item.text : '');

          return `
            <div class="p-2.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary/40 hover:shadow-sm transition-all flex items-start justify-between gap-3 group" data-item-id="${item.id}">
              <div class="flex items-start gap-2.5 min-w-0 flex-1">
                <div class="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0 mt-0.5 text-primary">
                  <span class="material-symbols-outlined text-[17px]">${icon}</span>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    ${isLink ? `
                      <a href="#" class="drop-open-link font-headline-sm text-body-sm font-semibold text-primary hover:underline truncate inline-flex items-center gap-1" data-url="${escapeHtml(linkUrl)}" title="Click to open in default browser">
                        <span class="truncate">${escapeHtml(item.title || linkUrl)}</span>
                        <span class="material-symbols-outlined text-[13px] shrink-0 opacity-70">open_in_new</span>
                      </a>
                    ` : `
                      <span class="font-headline-sm text-body-sm font-semibold text-on-surface truncate">${escapeHtml(item.title || 'Stashed Note')}</span>
                    `}
                    <span class="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border ${badgeClass} shrink-0 uppercase">${escapeHtml(item.badge || item.itemType || 'STASH')}</span>
                  </div>
                  <p class="text-[11px] text-secondary truncate font-sans mt-0.5">${escapeHtml(item.text || item.url || '')}</p>
                </div>
              </div>

              <div class="flex items-center gap-1 opacity-90 group-hover:opacity-100 shrink-0">
                ${isLink ? `
                  <button class="drop-btn-open w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors cursor-pointer" data-url="${escapeHtml(linkUrl)}" title="Open in Browser">
                    <span class="material-symbols-outlined text-[15px]">launch</span>
                  </button>
                ` : ''}
                <button class="drop-btn-copy w-7 h-7 rounded-lg hover:bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center transition-colors cursor-pointer" data-copy="${escapeHtml(item.url || item.text || item.title)}" title="Copy to Clipboard">
                  <span class="material-symbols-outlined text-[15px]">content_copy</span>
                </button>
                <button class="drop-btn-remove w-7 h-7 rounded-lg hover:bg-rose-500/10 text-secondary hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer" data-remove="${item.id}" title="Remove Item">
                  <span class="material-symbols-outlined text-[15px]">delete</span>
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Bottom Quick Stash Bar -->
      <div class="flex items-center gap-2 pt-1 border-t border-outline-variant/20">
        <input type="text" class="drop-quick-input flex-1 px-3 py-1.5 rounded-xl text-body-sm bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:border-primary text-xs" placeholder="Paste URL or note to stash on canvas..."/>
        <button class="drop-quick-btn px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-label-sm flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95">
          <span class="material-symbols-outlined text-[15px]">add</span>
          <span>Stash</span>
        </button>
      </div>
    </div>
  `;
}

export function attachDropEvents(el, card, saveStateCb, toastCb) {
  const cardData = card.data || {};
  if (!Array.isArray(cardData.items)) cardData.items = [];

  // Open Link in Browser
  const openUrl = (rawUrl) => {
    if (!rawUrl) return;
    const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    if (window.goo?.openExternal) {
      window.goo.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
    if (toastCb) toastCb(`Opening ${url}`);
  };

  el.querySelectorAll('.drop-open-link, .drop-btn-open').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openUrl(btn.dataset.url);
    });
  });

  // Copy to Clipboard
  el.querySelectorAll('.drop-btn-copy').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const content = btn.dataset.copy;
      if (content && navigator.clipboard) {
        navigator.clipboard.writeText(content);
        if (toastCb) toastCb('Copied to clipboard!');
      }
    });
  });

  // Remove Item
  el.querySelectorAll('.drop-btn-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const itemId = btn.dataset.remove;
      cardData.items = cardData.items.filter((i) => i.id !== itemId);
      saveStateCb();
      renderDropDOM(el, card, saveStateCb, toastCb);
      if (toastCb) toastCb('Removed item from stash');
    });
  });

  // Sub-Filter Tabs
  el.querySelectorAll('.drop-sub-filter').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cardData.activeSubFilter = btn.dataset.filter || 'all';
      saveStateCb();
      renderDropDOM(el, card, saveStateCb, toastCb);
    });
  });

  // Search Filter Input
  const searchInput = el.querySelector('.drop-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      cardData.searchQuery = e.target.value;
      renderDropDOM(el, card, saveStateCb, toastCb);
    });
  }

  // Quick Stash Input
  const quickInput = el.querySelector('.drop-quick-input');
  const quickBtn = el.querySelector('.drop-quick-btn');

  const addQuickStash = () => {
    const text = quickInput?.value?.trim();
    if (!text) return;
    const isUrl = /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i.test(text);
    const newItem = {
      id: `drop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: isUrl ? text : (text.slice(0, 32) + (text.length > 32 ? '...' : '')),
      url: isUrl ? text : '',
      text,
      itemType: isUrl ? 'link' : 'snippet',
      badge: isUrl ? 'URL' : 'NOTE',
      color: isUrl ? 'lilac' : 'sky',
      pinnedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    cardData.items.unshift(newItem);
    if (quickInput) quickInput.value = '';
    saveStateCb();
    renderDropDOM(el, card, saveStateCb, toastCb);
    if (toastCb) toastCb(`Stashed "${newItem.title}"!`);
  };

  quickBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    addQuickStash();
  });

  quickInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQuickStash();
    }
  });
}

function renderDropDOM(el, card, saveStateCb, toastCb) {
  const container = el.querySelector('.p-3\\.5');
  if (!container) return;
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderDropHTML(card);
  const newContainer = tempDiv.querySelector('.p-3\\.5');
  if (newContainer) {
    container.replaceWith(newContainer);
    attachDropEvents(el, card, saveStateCb, toastCb);
  }
}
