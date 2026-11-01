// ============================================================
// board/board.js — Slot 01: Kumoboard Spatial Sync Component
// Clean Warm Pastel Dynamic Cards in a Smooth Horizontal Carousel
// Strictly Lucide SVG icons (Zero Emojis)
// ============================================================

function initBoardWidget() {
  const btnBoardNewSticky = document.getElementById('btn-board-new-sticky');
  const btnBoardOpenFull = document.getElementById('btn-board-open-full');
  const matrixDynamic = document.getElementById('sticky-matrix-dynamic');
  const badgeCount = document.getElementById('badge-board-count');
  const pinnedCountVal = document.getElementById('pinned-count-val');
  const boardNodesCount = document.getElementById('board-nodes-count');
  const boardNameDisplay = document.getElementById('board-name-display');

  let activeBoard = null;
  let dynamicCards = [];

  function getCardTag(c) {
    if (c.tag) return c.tag;
    switch (c.type) {
      case 'telemetry': return '#TELEMETRY';
      case 'network': return '#NETWORK';
      case 'media': return '#MEDIA';
      case 'workspace': return '#WORKSPACE';
      case 'launcher': return '#LAUNCHER';
      case 'writer': return '#AI-STUDIO';
      case 'code': return '#TERMINAL';
      case 'notes': return (c.data?.items && c.data.items.length > 0) ? '#TODO' : '#SCRATCHPAD';
      case 'design': return '#THEME-LAB';
      case 'drop': return '#EDGE-DROP';
      case 'link': return '#LINK';
      default: return `#${(c.type || 'CARD').toUpperCase()}`;
    }
  }

  function getCardSnippet(c) {
    if (c.text) return c.text;
    if (c.content) return c.content;
    if (c.data?.scratchText) return c.data.scratchText;
    if (c.data?.items && Array.isArray(c.data.items) && c.data.items.length > 0) {
      return c.data.items[0].text || 'Task checklist item';
    }
    if (c.data?.code) {
      const codeStr = String(c.data.code).trim();
      return codeStr.length > 55 ? codeStr.slice(0, 52) + '...' : codeStr;
    }
    if (c.data?.prompt) return String(c.data.prompt).trim();
    switch (c.type) {
      case 'telemetry': return 'CPU, Memory, & Hardware telemetry monitor';
      case 'network': return 'IP, Gateway, DNS, & Sentinel status';
      case 'media': return 'System Media & live track controller';
      case 'workspace': return 'Git repositories, branches, & dev environment';
      case 'launcher': return 'Quick app shortcuts & indexed system tools';
      case 'writer': return 'Kumo Neural Engine AI prompt studio';
      case 'code': return 'PowerShell & DevOps console terminal';
      case 'design': return 'Mascot companion moods & theme color palettes';
      case 'drop': return (c.data?.items && c.data.items.length > 0) ? `${c.data.items.length} saved links & staged drops` : 'Edge Drop & Web Stash Deck';
      case 'notes': return 'Sprint tasks, checklists, and scratchpad notes';
      default: return 'Active workspace tool card';
    }
  }

  function getCardColor(c) {
    if (c.color) return c.color;
    switch (c.type) {
      case 'telemetry': case 'code': return 'sky';
      case 'writer': case 'design': case 'media': case 'drop': return 'lilac';
      case 'workspace': case 'network': case 'launcher': case 'notes': return 'peach';
      default: return 'sky';
    }
  }

  async function loadBoardData() {
    try {
      if (window.goo?.listBoards) {
        const boards = await window.goo.listBoards();
        if (Array.isArray(boards) && boards.length > 0) {
          activeBoard = boards[0];
          if (boardNameDisplay) boardNameDisplay.textContent = activeBoard.name || 'Kumoboard';
          
          if (window.goo?.loadBoard) {
            const fullBoard = await window.goo.loadBoard(activeBoard.id);
            if (fullBoard && Array.isArray(fullBoard.cards) && fullBoard.cards.length > 0) {
              dynamicCards = fullBoard.cards.map(c => ({
                id: c.id || String(Date.now()),
                type: c.type || 'notes',
                title: c.title || (c.type ? `${c.type.charAt(0).toUpperCase() + c.type.slice(1)} Hub` : 'Canvas Card'),
                tag: getCardTag(c),
                text: getCardSnippet(c),
                color: getCardColor(c),
                time: c.time || 'Canvas Active'
              }));
              renderCards();
              return;
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load board data:', e);
    }

    dynamicCards = [];
    renderCards();
  }

  function renderCards() {
    const count = dynamicCards.length;
    if (badgeCount) badgeCount.textContent = count;
    if (pinnedCountVal) pinnedCountVal.textContent = count;
    if (boardNodesCount) boardNodesCount.textContent = count > 0 ? `${count} Active Cards` : 'Canvas Ready';

    if (!matrixDynamic) return;
    matrixDynamic.innerHTML = '';

    if (count === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'sticky-matrix-empty font-sans';
      emptyEl.innerHTML = `
        <svg class="lucide-icon icon-lg text-muted" viewBox="0 0 24 24">
          <rect width="7" height="7" x="3" y="3" rx="1"/>
          <rect width="7" height="7" x="14" y="3" rx="1"/>
          <rect width="7" height="7" x="14" y="14" rx="1"/>
          <rect width="7" height="7" x="3" y="14" rx="1"/>
        </svg>
        <span class="sticky-empty-title font-sans">No Canvas Cards Yet</span>
        <span class="sticky-empty-desc font-sans">Click '+ New Sticky Note' or open full canvas</span>
      `;
      emptyEl.addEventListener('click', () => {
        createNewStickyNote();
      });
      matrixDynamic.appendChild(emptyEl);
      return;
    }

    dynamicCards.forEach((card) => {
      const cardEl = document.createElement('div');
      const colorClass = card.color === 'lilac' ? 'card-lilac' : card.color === 'peach' ? 'card-peach' : 'card-sky';
      const textClass = card.color === 'lilac' ? 'text-lilac' : card.color === 'peach' ? 'text-peach' : 'text-sky';
      const dotClass = card.color === 'lilac' ? 'bg-lavender' : card.color === 'peach' ? 'bg-peach' : 'bg-green';

      cardEl.className = `sticky-card ${colorClass} font-sans`;
      cardEl.innerHTML = `
        <div class="sticky-meta font-mono">
          <span class="sticky-tag ${textClass}">${card.tag || '#CARD'}</span>
          <span class="sticky-dot ${dotClass}"></span>
        </div>
        <div class="sticky-title font-sans">${escapeHtml(card.title || '')}</div>
        <p class="sticky-text font-sans">${escapeHtml(card.text || '')}</p>
        <span class="sticky-time font-mono">${card.time || 'Active'}</span>
      `;

      cardEl.addEventListener('click', (e) => {
        e.stopPropagation();
        window.IslandHaptics?.playHaptic('pop');
        if (window.goo?.openBoard) window.goo.openBoard();
      });

      matrixDynamic.appendChild(cardEl);
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function createNewStickyNote(customText) {
    window.IslandHaptics?.playHaptic('pop');
    const colors = ['sky', 'lilac', 'peach'];
    const randomColor = colors[dynamicCards.length % colors.length];

    const noteText = customText || prompt('Enter quick sticky note:', 'Review desktop tasks') || '';
    if (!noteText.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      type: 'notes',
      title: 'Sticky Note',
      tag: '#QUICK-NOTE',
      text: noteText.trim(),
      color: randomColor,
      time: 'Just now'
    };

    dynamicCards.unshift(newNote);
    renderCards();

    if (window.goo?.pinCardToBoard) {
      window.goo.pinCardToBoard({
        id: `card-note-${newNote.id}`,
        type: 'notes',
        title: 'Sticky Note',
        data: {
          text: newNote.text,
          color: randomColor
        }
      });
    }
  }

  btnBoardNewSticky?.addEventListener('click', (e) => {
    e.stopPropagation();
    createNewStickyNote();
  });

  btnBoardOpenFull?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.IslandHaptics?.playHaptic('pop');
    if (window.goo?.openBoard) window.goo.openBoard();
  });

  // Listen for cards pinned externally
  if (window.goo?.onCardPinned) {
    window.goo.onCardPinned((card) => {
      dynamicCards.unshift({
        id: Date.now().toString(),
        type: card.type || 'notes',
        title: card.title || 'Pinned Card',
        tag: card.type === 'link' ? '#LINK' : (card.tag || '#PINNED'),
        text: card.text || card.data?.text || card.content || '',
        color: card.color || 'sky',
        time: 'Just now'
      });
      renderCards();
    });
  }

  // Defer board file I/O until after initial boot animation
  setTimeout(loadBoardData, 2000);

  return {
    loadBoardData,
    addCard: (card) => {
      dynamicCards.unshift(card);
      renderCards();
    }
  };
}

window.IslandBoard = { init: initBoardWidget };

