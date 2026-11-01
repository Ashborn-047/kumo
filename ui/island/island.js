// ============================================================
// island.js — Pulse Dynamic Island (Aggregator & Bootstrapper)
// Segregated Modular Architecture:
// - chassis/haptics.js   : Web Audio API sound synthesis
// - chassis/state.js     : 3-State Morphing Chassis lifecycle
// - board/board.js       : Slot 01: Kumoboard Spatial Sync
// - assistant/assistant.js : Slot 02: Kumo Assistant Companion
// - amp/amp.js           : Slot 03: Kumo Amp Retro-Modern Deck
// - edge-drop/edge-drop.js : Slot 04: Edge Drop Desktop Shelf
// Strictly Lucide SVG icons (Zero Emojis)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3-State Seamless Chassis Controller
  const stateController = window.IslandState?.init();
  if (window.IslandState) {
    window.IslandState.controller = stateController;
  }

  // 2. Setup Modular Nav Tab Switching with Jelly Pop Animation
  const navTabs = document.querySelectorAll('.nav-tab');
  const widgetPanels = {
    board: document.getElementById('widget-board'),
    assistant: document.getElementById('widget-assistant'),
    amp: document.getElementById('widget-amp'),
    edge: document.getElementById('widget-edge')
  };

  function switchTab(tabName) {
    if (!widgetPanels[tabName]) return;
    window.IslandHaptics?.playHaptic('pop');

    navTabs.forEach(t => {
      if (t.dataset.tab === tabName) t.classList.add('active');
      else t.classList.remove('active');
    });

    Object.keys(widgetPanels).forEach(key => {
      if (key === tabName) widgetPanels[key]?.classList.add('active');
      else widgetPanels[key]?.classList.remove('active');
    });

    if (tabName === 'board') {
      window.IslandBoard?.loadBoardData?.();
    } else if (tabName === 'amp') {
      window.IslandAmp?.pollLiveMedia?.();
    }
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = tab.dataset.tab;
      if (target) switchTab(target);
    });
  });

  // 3. Initialize Individual Modular Widgets
  window.IslandBoard?.init();
  window.IslandAssistant?.init();
  window.IslandAmp?.init();
  window.IslandEdgeDrop?.init(stateController, switchTab);

  // 4. Companion Spatial Migration ("Dive-In / Leap-Out")
  const pillMascot = document.getElementById('pill-mascot');
  const headerBrand = document.getElementById('header-brand');

  if (window.goo?.onCompanionDive) {
    window.goo.onCompanionDive(() => {
      if (!pillMascot) return;
      pillMascot.classList.remove('leaping');
      pillMascot.classList.add('diving');
      window.IslandHaptics?.playHaptic('snap');
      setTimeout(() => {
        pillMascot.classList.remove('diving');
        pillMascot.classList.add('dormant');
        if (headerBrand) headerBrand.textContent = 'PULSE // CO-PILOT ON CANVAS';
      }, 350);
    });
  }

  if (window.goo?.onCompanionLeap) {
    window.goo.onCompanionLeap(() => {
      if (!pillMascot) return;
      pillMascot.classList.remove('dormant', 'diving');
      pillMascot.classList.add('leaping');
      window.IslandHaptics?.playHaptic('pop');
      if (headerBrand) headerBrand.textContent = 'PULSE // DECK V4';
      setTimeout(() => {
        pillMascot.classList.remove('leaping');
      }, 450);
    });
  }
});
