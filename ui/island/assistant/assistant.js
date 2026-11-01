// ============================================================
// assistant/assistant.js — Slot 02: Kumo Assistant Companion Component
// Dynamic prompt submission and action chip triggers
// Strictly Lucide SVG icons (Zero Emojis)
// ============================================================

function initAssistantWidget() {
  const inputAssistantQuery = document.getElementById('input-assistant-query');
  const btnAssistantGo = document.getElementById('btn-assistant-go');
  const chipActions = document.querySelectorAll('.chip-action');

  function triggerAssistantPrompt(text) {
    if (!text || text.trim() === '') return;
    window.IslandHaptics?.playHaptic('pop');
    
    if (inputAssistantQuery) inputAssistantQuery.value = '';

    if (window.goo?.showOverlay) {
      window.goo.showOverlay();
    }
  }

  btnAssistantGo?.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerAssistantPrompt(inputAssistantQuery?.value);
  });

  inputAssistantQuery?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      triggerAssistantPrompt(inputAssistantQuery.value);
    }
  });

  const mascotOrb = document.querySelector('.mascot-orb-wrap');
  mascotOrb?.addEventListener('click', (e) => {
    e.stopPropagation();
    window.IslandHaptics?.playHaptic('pop');
    if (window.goo?.toggleOverlay) {
      window.goo.toggleOverlay();
    }
  });

  chipActions.forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = chip.dataset.action;
      window.IslandHaptics?.playHaptic('pop');

      if (action === 'mascot') {
        if (window.goo?.toggleOverlay) window.goo.toggleOverlay();
      } else if (action === 'clean') {
        if (window.goo?.action) window.goo.action('desktop.clean').catch(console.warn);
      } else if (action === 'mute') {
        if (window.goo?.action) window.goo.action('media.mute').catch(console.warn);
      } else if (window.goo?.showOverlay) {
        window.goo.showOverlay();
      }
    });
  });
}

window.IslandAssistant = { init: initAssistantWidget };

