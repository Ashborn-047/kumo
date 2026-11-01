// ============================================================
// resident-companion.js — Slot 01 In-Canvas Resident Companion (Spatial Migration)
// Manages the resident Kumo co-pilot on Kumoboard canvas
// Strictly Zero Emojis
// ============================================================

export function initResidentCompanion({ addNewTool, toast }) {
  const residentWrap = document.getElementById('canvas-resident-kumo');
  const residentBubble = document.getElementById('resident-kumo-bubble');
  const residentBubbleText = document.getElementById('resident-kumo-bubble-text');
  const residentAvatar = document.getElementById('resident-kumo-avatar');
  const btnKumoCmd = document.getElementById('btn-kumo-cmd');
  const btnKumoNote = document.getElementById('btn-kumo-note');
  const btnKumoReturn = document.getElementById('btn-kumo-return');

  let bubbleTimer = null;
  let audioCtx = null;

  function playLandingChime() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.12); // G5
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {
      // Audio fallback note
    }
  }

  function playLeapChime() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(1046.50, audioCtx.currentTime + 0.15); // C6
      gain.gain.setValueAtTime(0.07, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      // Audio fallback note
    }
  }

  function showBubble(text, durationMs = 4000) {
    if (!residentBubble || !residentBubbleText) return;
    if (bubbleTimer) clearTimeout(bubbleTimer);
    residentBubbleText.textContent = text;
    residentBubble.classList.remove('hidden');
    if (durationMs > 0) {
      bubbleTimer = setTimeout(() => {
        residentBubble.classList.add('hidden');
      }, durationMs);
    }
  }

  function hideBubble() {
    if (!residentBubble) return;
    if (bubbleTimer) clearTimeout(bubbleTimer);
    residentBubble.classList.add('hidden');
  }

  function triggerLeapReturn() {
    if (!residentWrap) return;
    hideBubble();
    playLeapChime();
    residentWrap.classList.remove('landing');
    residentWrap.classList.add('leaping');

    if (toast) toast('Kumo leaping back to Desktop Island...');

    setTimeout(() => {
      if (window.goo?.companionLeapReturn) {
        window.goo.companionLeapReturn();
      }
      setTimeout(() => {
        residentWrap.classList.remove('leaping');
      }, 500);
    }, 380);
  }

  // Handle landing from Island dive-in
  if (window.goo?.onCompanionBoardEnter) {
    window.goo.onCompanionBoardEnter(() => {
      if (!residentWrap) return;
      residentWrap.classList.remove('leaping');
      residentWrap.classList.add('landing');
      playLandingChime();
      showBubble('Puff dived in from Pulse Island! Co-pilot active on canvas.', 4500);
      setTimeout(() => {
        residentWrap.classList.remove('landing');
      }, 700);
    });
  }

  // Click Avatar to Toggle Speech Menu
  if (residentAvatar) {
    residentAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      if (residentBubble && !residentBubble.classList.contains('hidden')) {
        hideBubble();
      } else {
        showBubble('What would you like to build or plan on canvas?', 0);
      }
    });
  }

  // Quick Action Buttons
  btnKumoCmd?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble();
    const cmdBar = document.getElementById('command-bar');
    if (cmdBar) cmdBar.click();
  });

  btnKumoNote?.addEventListener('click', (e) => {
    e.stopPropagation();
    hideBubble();
    if (typeof addNewTool === 'function') {
      addNewTool('notes');
    }
  });

  btnKumoReturn?.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerLeapReturn();
  });

  // Safe Leap-Out on Board Window Close
  window.addEventListener('beforeunload', () => {
    if (window.goo?.companionLeapReturn) {
      window.goo.companionLeapReturn();
    }
  });

  return {
    showBubble,
    triggerLeapReturn,
  };
}

