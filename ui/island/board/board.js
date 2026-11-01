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

  async function loadBoardData() {
    try {
      if (window.goo?.listBoards) {
        const boards = await window.goo.listBoards();
        if (Array.isArray(boards) && boards.length > 0) {
          activeBoard = boards[0];
          if (boardNameDisplay) boardNameDisplay.textContent = activeBoard.name || 'Active Canvas';
          
          if (window.goo?.loadBoard) {
            const fullBoard = await window.goo.loadBoard(activeBoard.id);
            if (fullBoard && Array.isArray(fullBoard.cards) && fullBoard.cards.length > 0) {
              dynamicCards = fullBoard.cards.map(c => ({
                id: c.id || String(Date.now()),
                tag: c.type === 'link' ? '#LINK' : (c.tag || '#NOTE'),
                text: c.text || c.content || '',
                color: c.color || 'sky',
                time: c.time || 'Active'
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
    if (boardNodesCount) boardNodesCount.textContent = count > 0 ? `${count} Active Notes` : 'Canvas Ready';

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
        <span class="sticky-empty-title font-sans">No Pinned Notes Yet</span>
        <span class="sticky-empty-desc font-sans">Click '+ New Sticky Note' or drag desktop files here</span>
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
          <span class="sticky-tag ${textClass}">${card.tag || '#NOTE'}</span>
          <span class="sticky-dot ${dotClass}"></span>
        </div>
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
        tag: card.type === 'link' ? '#LINK' : '#PINNED',
        text: card.text || '',
        color: card.color || 'sky',
        time: 'Just now'
      });
      renderCards();
    });
  }

  loadBoardData();

  return {
    addCard: (card) => {
      dynamicCards.unshift(card);
      renderCards();
    }
  };
}

window.IslandBoard = { init: initBoardWidget };

