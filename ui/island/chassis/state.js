// ============================================================
// chassis/state.js — 3-State Seamless Morphing Chassis Lifecycle
// States: 'peek' (12px tab) | 'resting' (340x40 pill) | 'unrolled' (520x330 card)
// ============================================================

function initStateController() {
  const wrapper = document.getElementById('island-wrapper');
  const chassis = document.getElementById('seamless-chassis');
  const capsulePeek = document.getElementById('capsule-peek');
  const chassisHeader = document.getElementById('chassis-header');
  const pillMascot = document.getElementById('pill-mascot');
  const btnDockToggle = document.getElementById('btn-dock-toggle');
  const marqueeText = document.getElementById('marquee-text');

  // Mascot Toggle Elements
  const btnToggleMascot = document.getElementById('btn-toggle-mascot');
  const mascotToggleLabel = document.getElementById('mascot-toggle-label');
  const mascotStatusDot = document.getElementById('mascot-status-dot');
  const btnAssistantToggleMascot = document.getElementById('btn-assistant-toggle-mascot');
  const assistantToggleLabel = document.getElementById('assistant-toggle-label');
  const assistantStatusBadge = document.getElementById('assistant-status-badge');
  const assistantMascotOrb = document.getElementById('assistant-mascot-orb');
  const assistantOrbDot = document.getElementById('assistant-orb-dot');

  let currentState = 'peek';
  let hoverUnrollTimer = null;
  let idlePeekTimer = null;
  let isMascotEnabled = true;

  function setHit(interactive) {
    if (window.goo?.islandSetHit) {
      window.goo.islandSetHit(interactive);
    }
  }

  function setState(state) {
    clearTimeout(idlePeekTimer);
    if (currentState === state) return;
    currentState = state;

    wrapper.classList.remove('state-peek', 'state-resting', 'state-unrolled');
    wrapper.classList.add(`state-${state}`);

    if (state === 'unrolled') {
      const savedHeight = localStorage.getItem('kumo:island-unrolled-height');
      if (savedHeight && !wrapper.classList.contains('is-preview-active')) {
        chassis.style.height = `${savedHeight}px`;
        chassis.style.minHeight = `${savedHeight}px`;
      }
    } else {
      chassis.style.height = '';
      chassis.style.minHeight = '';
    }

    if (state === 'peek') {
      setHit(false);
    } else {
      setHit(true);
    }
  }

  function scheduleIdleCollapse(delay = 900) {
    clearTimeout(hoverUnrollTimer);
    clearTimeout(idlePeekTimer);

    idlePeekTimer = setTimeout(() => {
      setState('resting');

      idlePeekTimer = setTimeout(() => {
        setState('peek');
      }, 3500);
    }, delay);
  }

  function popOut() {
    clearTimeout(hoverUnrollTimer);
    clearTimeout(idlePeekTimer);
    setHit(true);
    setState('resting');
    window.IslandHaptics?.playHaptic('pop');

    // Display resting preview for 5 seconds before tucking flush to bezel
    idlePeekTimer = setTimeout(() => {
      if (currentState === 'resting') {
        setState('peek');
      }
    }, 5000);
  }

  function setMascotEnabled(enabled, syncSettings = true) {
    isMascotEnabled = Boolean(enabled);

    if (isMascotEnabled) {
      pillMascot?.classList.remove('mascot-off', 'dormant');
      btnToggleMascot?.classList.remove('is-off');
      if (mascotToggleLabel) mascotToggleLabel.textContent = 'MASCOT ON';
      mascotStatusDot?.classList.remove('is-off');
      btnAssistantToggleMascot?.classList.remove('is-off');
      if (assistantToggleLabel) assistantToggleLabel.textContent = 'MASCOT ACTIVE';
      if (assistantStatusBadge) assistantStatusBadge.textContent = 'READY';
      assistantMascotOrb?.classList.remove('mascot-off');
      assistantOrbDot?.classList.remove('is-off');
    } else {
      pillMascot?.classList.add('mascot-off', 'dormant');
      btnToggleMascot?.classList.add('is-off');
      if (mascotToggleLabel) mascotToggleLabel.textContent = 'MASCOT OFF';
      mascotStatusDot?.classList.add('is-off');
      btnAssistantToggleMascot?.classList.add('is-off');
      if (assistantToggleLabel) assistantToggleLabel.textContent = 'MASCOT OFF';
      if (assistantStatusBadge) assistantStatusBadge.textContent = 'OFFLINE';
      assistantMascotOrb?.classList.add('mascot-off');
      assistantOrbDot?.classList.add('is-off');

      if (window.goo?.hideOverlay) {
        window.goo.hideOverlay();
      }
    }

    if (syncSettings && window.goo?.saveSettings) {
      window.goo.saveSettings({ mascotEnabled: isMascotEnabled });
    }
  }

  function toggleMascot() {
    window.IslandHaptics?.playHaptic('pop');
    setMascotEnabled(!isMascotEnabled, true);
  }

  capsulePeek?.addEventListener('mouseenter', () => {
    clearTimeout(idlePeekTimer);
    setHit(true);
    setState('resting');
  });

  chassis?.addEventListener('mouseenter', () => {
    clearTimeout(idlePeekTimer);
    setHit(true);

    if (currentState === 'peek') {
      setState('resting');
    }

    hoverUnrollTimer = setTimeout(() => {
      if (currentState === 'resting' || currentState === 'peek') {
        setState('unrolled');
      }
    }, 200);
  });

  chassis?.addEventListener('mouseleave', () => {
    clearTimeout(hoverUnrollTimer);
    scheduleIdleCollapse();
  });

  chassisHeader?.addEventListener('click', (e) => {
    if (e.target.closest('button') || e.target.closest('.puff-mascot')) return;
    if (currentState === 'resting') {
      setState('unrolled');
    } else if (currentState === 'unrolled') {
      setState('resting');
    }
  });

  btnDockToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.IslandHaptics?.playHaptic('pop');
    setState('resting');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      setState('resting');
      setTimeout(() => setState('peek'), 800);
    }
  });

  btnToggleMascot?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMascot();
  });

  btnAssistantToggleMascot?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMascot();
  });

  pillMascot?.addEventListener('click', (e) => {
    e.stopPropagation();
    pillMascot.style.transform = 'translateY(-4px) scale(1.15)';
    setTimeout(() => {
      pillMascot.style.transform = '';
    }, 250);
    toggleMascot();
  });

  // Mascot Spatial Migration ("Dive-In / Leap-Out")
  if (window.goo?.onCompanionDive) {
    window.goo.onCompanionDive(() => {
      pillMascot.style.transition = 'transform 0.4s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.3s ease';
      pillMascot.style.transform = 'translateY(14px) scale(0.2)';
      pillMascot.style.opacity = '0';
      if (marqueeText) marqueeText.textContent = 'Kumo is inside Kumoboard';
    });
  }

  if (window.goo?.onCompanionLeap) {
    window.goo.onCompanionLeap(() => {
      pillMascot.style.transition = 'transform 0.5s cubic-bezier(0.17, 0.89, 0.32, 1.28), opacity 0.4s ease';
      pillMascot.style.transform = 'translateY(0) scale(1)';
      pillMascot.style.opacity = '1';
      if (marqueeText) marqueeText.textContent = 'Kumo Desktop Ready';
    });
  }

  // Initial Settings Sync for Mascot toggle
  if (window.goo?.getSettings) {
    window.goo.getSettings().then((cfg) => {
      if (cfg && cfg.mascotEnabled === false) {
        setMascotEnabled(false, false);
      }
    }).catch(() => {});
  }

  // IPC Pop-Out listener
  if (window.goo?.onIslandPopOut) {
    window.goo.onIslandPopOut(() => {
      popOut();
    });
  }

  // Tactile Drag-to-Resize Island Handle
  const resizeHandle = document.getElementById('island-resize-handle');
  if (resizeHandle) {
    let isResizing = false;
    let startY = 0;
    let startH = 0;

    resizeHandle.addEventListener('mousedown', (e) => {
      if (currentState !== 'unrolled') return;
      e.preventDefault();
      e.stopPropagation();
      isResizing = true;
      startY = e.clientY;
      startH = chassis.offsetHeight;
      chassis.classList.add('is-resizing');
      document.body.style.cursor = 'ns-resize';

      const onMouseMove = (ev) => {
        if (!isResizing) return;
        const deltaY = ev.clientY - startY;
        const newHeight = Math.min(520, Math.max(330, startH + deltaY));
        chassis.style.height = `${newHeight}px`;
        chassis.style.minHeight = `${newHeight}px`;
      };

      const onMouseUp = () => {
        if (!isResizing) return;
        isResizing = false;
        chassis.classList.remove('is-resizing');
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        const finalH = chassis.offsetHeight;
        if (finalH) {
          localStorage.setItem('kumo:island-unrolled-height', String(finalH));
        }
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  // Automatically pop out on initial boot
  setTimeout(() => {
    popOut();
  }, 150);

  return {
    getState: () => currentState,
    setState,
    setHit,
    popOut,
    scheduleIdleCollapse,
    setMascotEnabled,
    toggleMascot,
    isMascotEnabled: () => isMascotEnabled,
  };
}

window.IslandState = { init: initStateController };

