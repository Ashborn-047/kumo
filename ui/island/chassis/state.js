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

  let currentState = 'peek';
  let hoverUnrollTimer = null;
  let idlePeekTimer = null;

  function setHit(interactive) {
    if (window.goo?.islandSetHit) {
      window.goo.islandSetHit(interactive);
    }
  }

  function setState(state) {
    if (currentState === state) return;
    currentState = state;

    wrapper.classList.remove('state-peek', 'state-resting', 'state-unrolled');
    wrapper.classList.add(`state-${state}`);

    if (state === 'peek') {
      setHit(false);
    } else {
      setHit(true);
    }
  }

  function scheduleIdleCollapse() {
    clearTimeout(hoverUnrollTimer);
    clearTimeout(idlePeekTimer);

    idlePeekTimer = setTimeout(() => {
      setState('resting');

      idlePeekTimer = setTimeout(() => {
        setState('peek');
      }, 3500);
    }, 900);
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

  pillMascot?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.IslandHaptics?.playHaptic('pop');
    pillMascot.style.transform = 'translateY(-4px) scale(1.15)';
    setTimeout(() => {
      pillMascot.style.transform = '';
    }, 250);

    // Summons / toggles the floating desktop companion widget
    if (window.goo?.toggleOverlay) {
      window.goo.toggleOverlay();
    }
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
      if (marqueeText) marqueeText.textContent = 'Paper Lanterns · Kiri Moon';
    });
  }

  // Initial State: Start at peek
  setState('peek');

  return {
    getState: () => currentState,
    setState,
    setHit,
    scheduleIdleCollapse
  };
}

window.IslandState = { init: initStateController };

