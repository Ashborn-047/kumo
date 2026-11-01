// ============================================================
// ui/overlay/js/interaction-manager.js
// Mouse Passthrough Hit-Testing & Mascot Drag-to-Move Manager
// Strictly Zero Emojis per user design mandate.
// ============================================================

(function () {
  const mascotWrap = document.getElementById('mascot-wrap');
  let isMouseIgnored = true;
  let isDragging = false;
  let startScreenX = 0;
  let startScreenY = 0;
  let dragDist = 0;

  function updateMousePassthrough(e) {
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const isInteractive = el && (
      el.closest('#mascot-wrap') ||
      el.closest('#chat-bar:not(.hidden)') ||
      el.closest('#bubble:not(.hidden)') ||
      el.closest('#card-popout:not(.hidden)') ||
      el.closest('#settings-modal:not(.hidden)') ||
      el.closest('#history-modal:not(.hidden)')
    );

    if (isInteractive && isMouseIgnored) {
      isMouseIgnored = false;
      window.goo?.setMouseIgnore(false);
    } else if (!isInteractive && !isMouseIgnored) {
      isMouseIgnored = true;
      window.goo?.setMouseIgnore(true);
    }
  }

  function initDragHandlers(onMascotClick) {
    if (!mascotWrap) return;

    mascotWrap.addEventListener('mousedown', (e) => {
      if (e.target.closest('.control-btn')) return;
      isDragging = true;
      startScreenX = e.screenX;
      startScreenY = e.screenY;
      dragDist = 0;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.screenX - startScreenX;
      const deltaY = e.screenY - startScreenY;
      dragDist += Math.hypot(deltaX, deltaY);

      if (Math.abs(deltaX) > 0 || Math.abs(deltaY) > 0) {
        window.goo?.moveOverlay(deltaX, deltaY);
        startScreenX = e.screenX;
        startScreenY = e.screenY;
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        if (dragDist < 6) {
          window.gooState?.triggerPoke?.();
          onMascotClick?.();
        }
      }
    });
  }

  window.addEventListener('mousemove', updateMousePassthrough);

  window.InteractionManager = {
    init: initDragHandlers,
  };
})();

