// ============================================================
// ui/overlay/chat.js — Mascot Chat Orchestrator
// Modular coordinator: interacts with InteractionManager,
// BubbleController, PopoutController, and ModalsController.
// Strictly Zero Emojis per user design mandate.
// ============================================================

const input = document.getElementById('chat-input');
const sendBtn = document.getElementById('chat-send');
const chatBar = document.getElementById('chat-bar');

let isThinking = false;
let currentSettings = {};
let currentTelemetry = null;
let streamedText = '';

if (window.goo?.getTelemetry) {
  window.goo.getTelemetry().then(t => { currentTelemetry = t; }).catch(() => {});
}
if (window.goo?.onTelemetry) {
  window.goo.onTelemetry(t => { currentTelemetry = t; });
}

function showChat() {
  if (!chatBar) return;
  chatBar.classList.remove('hidden');
  window.ModalsController?.closeSettings();
  window.gooState?.setState?.('listening');
  input?.focus();
}

function hideChat() {
  if (!chatBar) return;
  chatBar.classList.add('hidden');
  if (input) input.value = '';
  if (!isThinking) {
    window.gooState?.setState?.('idle');
  }
}

function toggleChat() {
  if (!chatBar) return;
  if (chatBar.classList.contains('hidden')) {
    showChat();
  } else {
    hideChat();
  }
}

// ── Streaming Reply Hook ──────────────────────────────────────
if (window.goo?.onStream) {
  window.goo.onStream((token) => {
    streamedText += token;
    window.BubbleController?.show(streamedText);
    window.gooState?.setState?.('talking');
  });
}

// ── Message Dispatcher ───────────────────────────────────────
async function sendMessage() {
  const text = input?.value.trim();
  if (!text || isThinking) return;

  isThinking = true;
  if (input) input.value = '';
  hideChat();
  window.BubbleController?.hide();
  window.PopoutController?.hide();

  window.gooState?.setState?.('thinking');
  window.BubbleController?.show('Thinking...');
  streamedText = '';

  window.ModalsController?.recordHistory('user', text);

  try {
    const res = await window.goo.sendMessage(text, []);
    if (res.error) {
      window.gooState?.setStateTemp?.('idle');
      window.BubbleController?.show(`Error: ${res.error}`);
    } else {
      const finalReply = res.reply || streamedText || 'Done!';
      window.ModalsController?.recordHistory('goo', finalReply);
      window.gooState?.setStateTemp?.('happy', 2000);
      window.BubbleController?.show(finalReply, text.toLowerCase().includes('board') || text.toLowerCase().includes('canvas'));

      // Check contextual card triggers
      const q = text.toLowerCase();
      const hasAction = res.actionResults && res.actionResults.length > 0;
      const actType = hasAction ? res.actionResults[0].type : '';
      const actArgs = hasAction ? res.actionResults[0].args : {};

      if (q.includes('spotify') || (actType === 'app.open' && actArgs?.name?.toLowerCase().includes('spotify'))) {
        window.PopoutController?.show('spotify', { query: text, reply: finalReply }, currentTelemetry);
      } else if (q.includes('ram') || q.includes('cpu') || q.includes('specs') || actType === 'system.info') {
        window.PopoutController?.show('system-health', { query: text, reply: finalReply }, currentTelemetry);
      } else if (q.includes('ip') || q.includes('ping') || q.includes('dns') || q.includes('wifi') || q.includes('network')) {
        window.PopoutController?.show('network', { query: text, reply: finalReply }, currentTelemetry);
      } else if (q.includes('kill') || q.includes('terminate') || actType === 'process.kill') {
        window.PopoutController?.show('process', { query: text, reply: finalReply, target: actArgs?.name || text }, currentTelemetry);
      } else if (q.includes('apps') || q.includes('launcher') || q.includes('dock') || actType === 'app.open') {
        window.PopoutController?.show('launcher', { query: text, reply: finalReply }, currentTelemetry);
      }
    }
  } catch (err) {
    window.gooState?.setStateTemp?.('idle');
    window.BubbleController?.show(`Action error: ${err.message}`);
  } finally {
    isThinking = false;
  }
}

sendBtn?.addEventListener('click', sendMessage);
input?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
  if (e.key === 'Escape') hideChat();
});

// ── Companion Lifecycle Events ────────────────────────────────
window.addEventListener('goo:focus-chat', showChat);
window.addEventListener('goo:open-settings', () => window.ModalsController?.openSettings());
window.addEventListener('goo:first-run', () => window.goo?.openStudio?.('wizard'));

window.addEventListener('goo:launched', (e) => {
  const detail = e.detail || {};
  const name = detail.companionName || 'Kumo';
  const user = detail.userName;
  const hello = user
    ? `Hi ${user} — I'm ${name}. Press Alt+Space anytime, or click me to chat.`
    : `Hi — I'm ${name}. Press Alt+Space anytime, or click me to chat.`;
  window.gooState?.setStateTemp?.('happy', 2200);
  window.BubbleController?.show(hello);
});

if (window.goo?.onSettingsUpdated) {
  window.goo.onSettingsUpdated((cfg) => {
    currentSettings = { ...currentSettings, ...cfg };
    const name = (cfg.companionName || 'Kumo').trim() || 'Kumo';
    const title = document.getElementById('bubble-title');
    if (title) title.textContent = name;
    if (cfg.color) window.gooState?.setColor?.(cfg.color);
    window.ModalsController?.loadSettings(currentSettings);
  });
}

// ── Initialize Submodules ─────────────────────────────────────
window.InteractionManager?.init(toggleChat);
window.ModalsController?.loadHistory();
if (window.goo?.getSettings) {
  window.goo.getSettings().then(cfg => {
    currentSettings = cfg || {};
    window.ModalsController?.loadSettings(currentSettings);
  });
}
