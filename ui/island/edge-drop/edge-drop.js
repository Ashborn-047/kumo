// ============================================================
// edge-drop/edge-drop.js — Edge Drop Desktop Shelf Logic
// Inspired by Deepender25/Edge-Drop
// Clipboard history, file drop ingestion, drag-out, filtering & staging
// Strictly Lucide SVG icons (Zero Emojis)
// ============================================================

function initEdgeDropWidget(stateController, switchTabCallback) {
  const ambientOverlay = document.getElementById('edge-drop-ambient-overlay');
  const edgeCarousel = document.getElementById('edge-cards-carousel');
  const shelfCountBadge = document.getElementById('shelf-count-badge');
  const btnShelfClear = document.getElementById('btn-shelf-clear');
  const shelfSearchInput = document.getElementById('shelf-search-input');
  const filterChips = document.querySelectorAll('.filter-chip');
  const dockButtons = document.querySelectorAll('.dock-edge-btn');
  const btnToggleAutoCopy = document.getElementById('btn-toggle-auto-copy');

  // Preview Modal Elements
  const previewModal = document.getElementById('edge-preview-modal');
  const previewTitle = document.getElementById('preview-modal-title');
  const previewBadge = document.getElementById('preview-modal-badge');
  const previewBody = document.getElementById('preview-modal-body');
  const previewMeta = document.getElementById('preview-modal-meta');
  const previewClose = document.getElementById('preview-modal-close');
  const previewBackdrop = document.getElementById('preview-backdrop');
  const previewBtnPin = document.getElementById('preview-btn-pin');
  const previewBtnCopy = document.getElementById('preview-btn-copy');
  const previewBtnOpen = document.getElementById('preview-btn-open');

  let shelfItems = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let autoCopyActive = true;
  let activePreviewItem = null;

  function renderShelfUI() {
    if (!edgeCarousel) return;

    let filtered = shelfItems.filter(item => {
      if (currentFilter === 'stack') return item.type === 'stack';
      if (currentFilter !== 'all' && item.type !== currentFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = (item.name || '').toLowerCase().includes(query);
        const matchesPreview = (item.preview || '').toLowerCase().includes(query);
        const matchesContent = (item.content || '').toLowerCase().includes(query);
        return matchesName || matchesPreview || matchesContent;
      }
      return true;
    });

    if (shelfCountBadge) {
      shelfCountBadge.textContent = `${shelfItems.length} ${shelfItems.length === 1 ? 'item' : 'items'}`;
    }
    edgeCarousel.innerHTML = '';

    if (filtered.length === 0) {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'edge-shelf-empty font-sans';
      emptyBox.innerHTML = `
        <svg class="lucide-icon icon-lg text-muted" viewBox="0 0 24 24">
          <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
        </svg>
        <span class="edge-empty-title font-sans">Edge Shelf Ready</span>
        <span class="edge-empty-desc font-sans">Drag files, links, screenshots, or copy text to stage here</span>
      `;
      edgeCarousel.appendChild(emptyBox);
      return;
    }

    filtered.forEach((item) => {
      const card = document.createElement('div');
      const isStack = item.type === 'stack';
      card.className = `edge-item-card font-sans ${isStack ? 'is-stack-card' : ''}`;
      card.draggable = true;

      const iconType = isStack ? 'icon-stack' : item.type === 'file' ? 'icon-file' : item.type === 'link' ? 'icon-link' : 'icon-snippet';
      const iconSvg = isStack
        ? `<svg class="lucide-icon icon-sm" viewBox="0 0 24 24"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>`
        : item.type === 'file'
        ? `<svg class="lucide-icon icon-sm" viewBox="0 0 24 24"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`
        : item.type === 'link'
        ? `<svg class="lucide-icon icon-sm" viewBox="0 0 24 24"><path d="M9 17H7A5 5 0 0 1 7 7h2"/><path d="M15 7h2a5 5 0 1 1 0 10h-2"/><line x1="8" x2="16" y1="12" y2="12"/></svg>`
        : `<svg class="lucide-icon icon-sm" viewBox="0 0 24 24"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;

      card.innerHTML = `
        <div class="item-top">
          <div class="item-icon-wrap ${iconType}">
            ${iconSvg}
          </div>
          <div class="item-meta-cluster truncate">
            <div class="item-name truncate font-sans">${escapeHtml(item.name)}</div>
            <div class="item-type-badge font-mono">${item.badge || item.type.toUpperCase()}</div>
          </div>
        </div>

        ${item.thumbnail ? `
          <div class="item-img-preview">
            <img src="${item.thumbnail}" alt="Thumbnail" class="item-thumb-img"/>
          </div>
        ` : `
          <p class="item-preview-text font-sans">${escapeHtml(item.preview || item.name)}</p>
        `}

        <div class="item-bottom-actions font-sans">
          <span class="item-time font-mono">${item.time || 'Just now'}</span>
          <div class="item-action-btns">
            <button class="btn-item-action btn-act-preview" title="Full-Size Lightbox Preview">
              <svg class="lucide-icon icon-sm" viewBox="0 0 24 24">
                <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
              </svg>
            </button>
            <button class="btn-item-action btn-act-pin" title="Pin to Kumoboard">
              <svg class="lucide-icon icon-sm" viewBox="0 0 24 24">
                <path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/>
              </svg>
            </button>
            <button class="btn-item-action btn-act-copy" title="Copy to Clipboard">
              <svg class="lucide-icon icon-sm" viewBox="0 0 24 24">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
            </button>
            <button class="btn-item-action btn-act-ask" title="Ask Kumo AI">
              <svg class="lucide-icon icon-sm" viewBox="0 0 24 24">
                <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
              </svg>
            </button>
          </div>
        </div>
      `;

      // ── FEATURE 3: Drag Out of the Shelf into Windows apps ──
      card.addEventListener('dragstart', (e) => {
        window.__draggedShelfItem = item;
        window.IslandHaptics?.playHaptic('drop');
        if (item.path && window.goo?.islandStartDrag) {
          e.preventDefault();
          window.goo.islandStartDrag(item.path);
        } else {
          e.dataTransfer.setData('text/plain', item.content || item.name);
        }
      });

      // ── FEATURE 4: Stacks (Drop cards together to make one) ──
      card.addEventListener('dragover', (e) => {
        if (window.__draggedShelfItem && window.__draggedShelfItem !== item) {
          e.preventDefault();
          card.classList.add('border-primary');
        }
      });

      card.addEventListener('dragleave', () => {
        card.classList.remove('border-primary');
      });

      card.addEventListener('drop', (e) => {
        const dragged = window.__draggedShelfItem;
        if (!dragged || dragged === item) return;
        e.preventDefault();
        e.stopPropagation();
        card.classList.remove('border-primary');
        window.IslandHaptics?.playHaptic('drop');

        // Remove dragged item from top level
        shelfItems = shelfItems.filter(i => i !== dragged);

        // Turn target card into a multi-item stack
        if (item.type === 'stack') {
          item.items.push(dragged);
          item.badge = `STACK (${item.items.length})`;
          item.preview = `${item.items.length} items bundled in stack`;
        } else {
          const original = { ...item };
          item.type = 'stack';
          item.name = `${original.name} & Stack`;
          item.items = [original, dragged];
          item.badge = `STACK (2)`;
          item.preview = `2 items bundled in stack`;
        }

        window.__draggedShelfItem = null;
        renderShelfUI();
      });

      // ── Direct Click-to-Open for Links in default browser ──
      const isLink = item.type === 'link' || /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i.test(item.content || item.name);
      if (isLink) {
        card.classList.add('is-link-card');
        card.title = 'Click to open in browser (or double click for full preview)';
        const rawUrl = item.content || item.name;
        const fullUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

        card.addEventListener('click', (e) => {
          if (e.target.closest('.item-action-btns') || e.target.closest('button')) return;
          window.IslandHaptics?.playHaptic('pop');
          if (window.goo?.openExternal) {
            window.goo.openExternal(fullUrl);
          } else {
            window.open(fullUrl, '_blank');
          }
        });
      }

      // ── FEATURE 5: Full-size preview trigger ──
      card.querySelector('.btn-act-preview')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');
        openPreview(item);
      });

      card.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        openPreview(item);
      });

      // ── Pin to Kumoboard ──
      card.querySelector('.btn-act-pin')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');

        const rawUrl = item.content || (item.type === 'link' ? item.name : '');
        const fullUrl = isLink ? (/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`) : '';

        if (window.goo?.pinCardToBoard) {
          window.goo.pinCardToBoard({
            id: `card-drop-${Date.now()}`,
            type: 'drop',
            title: item.name,
            data: {
              url: fullUrl,
              text: item.preview || item.path || item.name,
              itemType: item.type,
              path: item.path,
              badge: item.badge,
              color: item.type === 'link' ? 'lilac' : 'sky'
            }
          });
        }

        window.IslandBoard?.addCard?.({
          id: Date.now().toString(),
          type: 'drop',
          title: item.name,
          tag: item.type === 'link' ? '#LINK' : item.type === 'stack' ? '#STACK' : '#FILE',
          text: item.name,
          color: item.type === 'link' ? 'lilac' : 'sky',
          time: 'Just now'
        });
      });

      // ── Copy to Clipboard ──
      card.querySelector('.btn-act-copy')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(item.content || item.path || item.name);
        }
      });

      // ── Ask Kumo AI ──
      card.querySelector('.btn-act-ask')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');
        if (window.goo?.showOverlay) {
          window.goo.showOverlay();
        }
      });

      edgeCarousel.appendChild(card);
    });
  }

  // ── FEATURE 5: Lightbox Preview Modal Logic ──
  function openPreview(item) {
    activePreviewItem = item;
    if (!previewModal) return;

    if (previewTitle) previewTitle.textContent = item.name;
    if (previewBadge) previewBadge.textContent = item.badge || item.type.toUpperCase();
    if (previewMeta) previewMeta.textContent = item.path || item.time || 'Staged in Edge Drop';

    if (previewBody) {
      if (item.type === 'stack') {
        previewBody.innerHTML = `
          <div class="flex flex-col gap-2">
            <p class="font-bold text-[11px] text-iris">Stack Bundle (${item.items?.length || 0} items):</p>
            ${(item.items || []).map((sub, sIdx) => `
              <div class="p-2 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-center justify-between">
                <span class="truncate font-semibold text-xs">${escapeHtml(sub.name)}</span>
                <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high">${sub.badge || sub.type}</span>
              </div>
            `).join('')}
          </div>
        `;
      } else if (item.thumbnail) {
        previewBody.innerHTML = `
          <img src="${item.thumbnail}" alt="Preview" class="preview-full-img"/>
          <p class="mt-2 text-xs font-mono text-muted">${escapeHtml(item.path || item.preview || '')}</p>
        `;
      } else if (item.type === 'link') {
        const url = item.content || item.name;
        previewBody.innerHTML = `
          <div class="flex flex-col gap-2">
            <a href="#" class="text-primary font-bold text-xs hover:underline flex items-center gap-1">${escapeHtml(url)}</a>
            <p class="text-xs text-muted font-sans">${escapeHtml(item.preview || '')}</p>
          </div>
        `;
      } else {
        previewBody.innerHTML = `
          <div class="font-mono text-xs whitespace-pre-wrap select-text p-2 bg-slate-50 dark:bg-slate-900 rounded-lg max-h-36 overflow-y-auto">${escapeHtml(item.content || item.preview || item.name)}</div>
        `;
      }
    }

    previewModal.classList.remove('hidden');
  }

  function closePreview() {
    previewModal?.classList.add('hidden');
    activePreviewItem = null;
  }

  previewClose?.addEventListener('click', closePreview);
  previewBackdrop?.addEventListener('click', closePreview);

  previewBtnPin?.addEventListener('click', () => {
    if (!activePreviewItem) return;
    if (window.goo?.pinCardToBoard) {
      window.goo.pinCardToBoard({
        id: `card-drop-${Date.now()}`,
        type: 'drop',
        title: activePreviewItem.name,
        data: {
          url: activePreviewItem.content || '',
          text: activePreviewItem.preview || activePreviewItem.name,
          itemType: activePreviewItem.type,
          badge: activePreviewItem.badge
        }
      });
    }
    closePreview();
  });

  previewBtnCopy?.addEventListener('click', () => {
    if (!activePreviewItem) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activePreviewItem.content || activePreviewItem.path || activePreviewItem.name);
    }
    closePreview();
  });

  previewBtnOpen?.addEventListener('click', () => {
    if (!activePreviewItem) return;
    const target = activePreviewItem.content || activePreviewItem.path || activePreviewItem.name;
    if (/^(https?:\/\/|[a-zA-Z0-9-]+\.[a-zA-Z]{2,})/i.test(target)) {
      const fullUrl = /^https?:\/\//i.test(target) ? target : `https://${target}`;
      if (window.goo?.openExternal) window.goo.openExternal(fullUrl);
    }
    closePreview();
  });

  // ── FEATURE 1: Left, Right or Top Docking Selector ──
  dockButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      dockButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const edge = btn.dataset.edge || 'top';
      if (window.goo?.islandSnapEdge) {
        window.goo.islandSnapEdge(edge);
      }
    });
  });

  // ── FEATURE 2: Auto-Copy Clipboard Watcher Toggle ──
  btnToggleAutoCopy?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.IslandHaptics?.playHaptic('pop');
    autoCopyActive = !autoCopyActive;
    btnToggleAutoCopy.classList.toggle('active', autoCopyActive);
    btnToggleAutoCopy.textContent = autoCopyActive ? 'Auto-Copy' : 'Auto-Copy: OFF';
    if (window.goo?.setClipboardWatch) {
      window.goo.setClipboardWatch(autoCopyActive);
    }
  });

  // ── FEATURE 2: Windows Clipboard Listener ──
  if (window.goo?.onClipboardChange) {
    window.goo.onClipboardChange((clip) => {
      if (!clip || !autoCopyActive) return;
      // Prevent duplicate consecutive entries
      const alreadyExists = shelfItems.some(i => (clip.content && i.content === clip.content) || (clip.path && i.path === clip.path));
      if (alreadyExists) return;

      shelfItems.unshift({
        id: clip.id || String(Date.now()),
        name: clip.name || (clip.text ? clip.text.slice(0, 26) + '...' : 'Copied Item'),
        content: clip.content || clip.text,
        path: clip.path,
        thumbnail: clip.thumbnail,
        type: clip.type || (clip.isUrl ? 'link' : (clip.path ? 'file' : 'snippet')),
        badge: clip.badge || (clip.isUrl ? 'URL' : 'CLIPBOARD'),
        preview: clip.preview || clip.text,
        time: 'Just now'
      });
      renderShelfUI();
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  btnShelfClear?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.IslandHaptics?.playHaptic('pop');
    shelfItems = [];
    renderShelfUI();
  });

  shelfSearchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderShelfUI();
  });

  filterChips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      window.IslandHaptics?.playHaptic('pop');
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter || 'all';
      renderShelfUI();
    });
  });

  // Ambient Drag Detection over whole window (Spring unroll + overlay)
  window.addEventListener('dragenter', (e) => {
    stateController?.setState('unrolled');
    if (switchTabCallback) switchTabCallback('edge');
    if (ambientOverlay) ambientOverlay.classList.add('active');
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (ambientOverlay) ambientOverlay.classList.add('active');
  });

  window.addEventListener('dragleave', (e) => {
    if (e.clientX <= 0 || e.clientY <= 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      if (ambientOverlay) ambientOverlay.classList.remove('active');
    }
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (ambientOverlay) ambientOverlay.classList.remove('active');

    const files = Array.from(e.dataTransfer.files || []);
    const textData = e.dataTransfer.getData('text/plain');

    if (files.length === 0 && !textData) return;
    window.IslandHaptics?.playHaptic('drop');

    if (files.length > 0) {
      files.forEach(f => {
        const isLnk = /\.lnk$/i.test(f.name);
        const cleanName = isLnk ? f.name.replace(/\.lnk$/i, '') : f.name;
        shelfItems.unshift({
          name: cleanName,
          path: f.path || f.name,
          type: 'file',
          badge: isLnk ? 'APP' : `${Math.round(f.size / 1024) || 1} KB`,
          preview: isLnk ? 'Windows application shortcut' : `File dropped from desktop · ${f.type || 'Document'}`,
          time: 'Just now'
        });
      });
    } else if (textData) {
      const trimmed = textData.trim();
      const isUrl = /^(https?:\/\/|www\.|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/.*)?$)/i.test(trimmed);
      shelfItems.unshift({
        name: isUrl ? trimmed : (trimmed.slice(0, 28) + (trimmed.length > 28 ? '...' : '')),
        content: trimmed,
        type: isUrl ? 'link' : 'snippet',
        badge: isUrl ? 'URL' : 'TEXT',
        preview: trimmed,
        time: 'Just now'
      });
    }

    if (switchTabCallback) switchTabCallback('edge');
    renderShelfUI();
  });

  renderShelfUI();

  return {
    addItem: (item) => {
      shelfItems.unshift(item);
      renderShelfUI();
    }
  };
}

window.IslandEdgeDrop = { init: initEdgeDropWidget };
