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

  let shelfItems = [];
  let currentFilter = 'all';
  let searchQuery = '';

  function renderShelfUI() {
    if (!edgeCarousel) return;

    let filtered = shelfItems.filter(item => {
      if (currentFilter !== 'all' && item.type !== currentFilter) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesPreview = (item.preview || '').toLowerCase().includes(query);
        return matchesName || matchesPreview;
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
        <span class="edge-empty-desc font-sans">Drag files, links, or copied snippets from Windows here</span>
      `;
      edgeCarousel.appendChild(emptyBox);
      return;
    }

    filtered.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'edge-item-card font-sans';
      card.draggable = true;

      const iconType = item.type === 'file' ? 'icon-file' : item.type === 'link' ? 'icon-link' : 'icon-snippet';
      const iconSvg = item.type === 'file'
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

        <p class="item-preview-text font-sans">${escapeHtml(item.preview || item.name)}</p>

        <div class="item-bottom-actions font-sans">
          <span class="item-time font-mono">${item.time || 'Just now'}</span>
          <div class="item-action-btns">
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

      // Drag Out of the Shelf into Windows apps (Edge-Drop core feature)
      card.addEventListener('dragstart', (e) => {
        window.IslandHaptics?.playHaptic('drop');
        if (item.path && window.goo?.islandStartDrag) {
          e.preventDefault();
          window.goo.islandStartDrag(item.path);
        } else {
          e.dataTransfer.setData('text/plain', item.content || item.name);
        }
      });

      // Pin to Kumoboard
      card.querySelector('.btn-act-pin')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');

        if (window.goo?.pinCardToBoard) {
          window.goo.pinCardToBoard({
            id: `card-drop-${Date.now()}`,
            type: 'notes',
            title: item.name,
            data: {
              text: item.preview || item.path || item.name,
              color: item.type === 'link' ? 'lilac' : 'sky'
            }
          });
        }

        window.IslandBoard?.addCard?.({
          id: Date.now().toString(),
          tag: item.type === 'link' ? '#LINK' : '#FILE',
          text: item.name,
          color: item.type === 'link' ? 'lilac' : 'sky',
          time: 'Just now'
        });
      });

      // Copy to Clipboard
      card.querySelector('.btn-act-copy')?.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(item.content || item.name);
        }
      });

      // Ask Kumo AI
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
        shelfItems.unshift({
          name: f.name,
          path: f.path || f.name,
          type: 'file',
          badge: `${Math.round(f.size / 1024) || 1} KB`,
          preview: `File dropped from desktop · ${f.type || 'Document'}`,
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

  // Listen for Windows Clipboard Events if bridged via IPC
  if (window.goo?.onClipboardChange) {
    window.goo.onClipboardChange((clip) => {
      if (!clip || !clip.text) return;
      shelfItems.unshift({
        name: clip.text.slice(0, 26) + '...',
        content: clip.text,
        type: clip.type || 'snippet',
        badge: 'CLIPBOARD',
        preview: clip.text,
        time: 'Just now'
      });
      renderShelfUI();
    });
  }

  // Initial state: starts clean and ready
  renderShelfUI();

  return {
    addItem: (item) => {
      shelfItems.unshift(item);
      renderShelfUI();
    }
  };
}

window.IslandEdgeDrop = { init: initEdgeDropWidget };

