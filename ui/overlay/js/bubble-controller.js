// ============================================================
// ui/overlay/js/bubble-controller.js
// Reply Speech Bubble Display, Truncation & Action Controller
// Strictly Zero Emojis per user design mandate.
// ============================================================

(function () {
  const bubble = document.getElementById('bubble');
  const bubbleText = document.getElementById('bubble-text');
  const bubbleMore = document.getElementById('bubble-more');
  const bubbleClose = document.getElementById('bubble-close');
  const bubbleActions = document.getElementById('bubble-actions');
  const bubbleOpenBoard = document.getElementById('bubble-open-board');

  const MAX_BUBBLE_PREVIEW = 160;
  let fullReply = '';

  function show(text, showBoardBtn = false) {
    if (!bubble || !bubbleText) return;
    fullReply = text;
    const isTruncated = text.length > MAX_BUBBLE_PREVIEW;
    const preview = isTruncated ? text.slice(0, MAX_BUBBLE_PREVIEW) + '...' : text;

    bubbleText.textContent = preview;
    bubble.classList.remove('hidden');

    let hasActions = false;

    if (isTruncated && bubbleMore) {
      bubbleMore.classList.remove('hidden');
      bubbleMore.textContent = 'show more';
      let expanded = false;
      bubbleMore.onclick = () => {
        expanded = !expanded;
        bubbleText.textContent = expanded ? text : preview;
        bubbleMore.textContent = expanded ? 'show less' : 'show more';
      };
      hasActions = true;
    } else if (bubbleMore) {
      bubbleMore.classList.add('hidden');
    }

    if (showBoardBtn && bubbleOpenBoard) {
      bubbleOpenBoard.classList.remove('hidden');
      hasActions = true;
    } else if (bubbleOpenBoard) {
      bubbleOpenBoard.classList.add('hidden');
    }

    if (bubbleActions) {
      if (hasActions) {
        bubbleActions.classList.remove('hidden');
      } else {
        bubbleActions.classList.add('hidden');
      }
    }
  }

  function hide() {
    if (bubble) bubble.classList.add('hidden');
  }

  if (bubbleClose) {
    bubbleClose.addEventListener('click', hide);
  }

  if (bubbleOpenBoard) {
    bubbleOpenBoard.addEventListener('click', () => {
      window.goo?.openBoard?.();
      hide();
    });
  }

  window.BubbleController = {
    show,
    hide,
    getFullReply: () => fullReply,
  };
})();

