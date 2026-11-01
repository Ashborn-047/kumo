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
});
