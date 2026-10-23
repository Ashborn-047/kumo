// ============================================================
// chat.js — Interaction, Chat Streaming & Settings Controller
// ============================================================

const input          = document.getElementById('chat-input');
const sendBtn        = document.getElementById('chat-send');
const chatBar        = document.getElementById('chat-bar');
const bubble         = document.getElementById('bubble');
const bubbleText     = document.getElementById('bubble-text');
const bubbleMore     = document.getElementById('bubble-more');
const bubbleClose    = document.getElementById('bubble-close');
const bubbleActions  = document.getElementById('bubble-actions');
const bubbleOpenBoard = document.getElementById('bubble-open-board');

const mascotWrap     = document.getElementById('mascot-wrap');
const btnQuickBoard  = document.getElementById('btn-quick-board');
const btnQuickHistory = document.getElementById('btn-quick-history');
const btnQuickSettings = document.getElementById('btn-quick-settings');

const settingsModal  = document.getElementById('settings-modal');
const settingsClose  = document.getElementById('settings-close');
const settingApiKey  = document.getElementById('setting-api-key');
const settingModel   = document.getElementById('setting-model');
const btnSaveSettings = document.getElementById('btn-save-settings');
const linkOpenRouter = document.getElementById('link-openrouter');
const colorSwatches  = document.querySelectorAll('.color-swatch');

const historyModal   = document.getElementById('history-modal');
const historyClose   = document.getElementById('history-close');
const historyList    = document.getElementById('history-list');
const btnClearHistory = document.getElementById('btn-clear-history');

let fullReply      = '';
let chatHistory    = [];
let isThinking     = false;
let currentSettings = {};

// ── 1. Mouse Passthrough & Interactive Hit-Testing ──────────
let isMouseIgnored = true;

function updateMousePassthrough(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const isInteractive = el && (
    el.closest('#mascot-wrap') ||
    el.closest('#chat-bar:not(.hidden)') ||
    el.closest('#bubble:not(.hidden)') ||
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

window.addEventListener('mousemove', updateMousePassthrough);

// ── 2. Mascot Drag-to-Move Window ────────────────────────────
let isDragging = false;
let startScreenX = 0;
let startScreenY = 0;
let dragDist = 0;

mascotWrap.addEventListener('mousedown', (e) => {
  // Ignore clicks on control buttons inside wrap
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
    // If it was just a click (minimal drag distance), toggle chat!
    if (dragDist < 6) {
      toggleChat();
    }
  }
});

// ── 3. Chat Bar Controls ─────────────────────────────────────
function showChat() {
  chatBar.classList.remove('hidden');
  settingsModal.classList.add('hidden');
  input.focus();
}

function hideChat() {
  chatBar.classList.add('hidden');
  input.value = '';
}

function toggleChat() {
  if (chatBar.classList.contains('hidden')) {
    showChat();
  } else {
    hideChat();
  }
}

// ── 4. Reply Bubble ──────────────────────────────────────────
const MAX_BUBBLE_PREVIEW = 160;

function showBubble(text, showBoardBtn = false) {
  fullReply = text;
  const isTruncated = text.length > MAX_BUBBLE_PREVIEW;
  const preview = isTruncated ? text.slice(0, MAX_BUBBLE_PREVIEW) + '…' : text;

  bubbleText.textContent = preview;
  bubble.classList.remove('hidden');

  let hasActions = false;

  if (isTruncated) {
    bubbleMore.classList.remove('hidden');
    bubbleMore.textContent = 'show more ▾';
    let expanded = false;
    bubbleMore.onclick = () => {
      expanded = !expanded;
      bubbleText.textContent = expanded ? text : preview;
      bubbleMore.textContent = expanded ? 'show less ▴' : 'show more ▾';
    };
    hasActions = true;
  } else {
    bubbleMore.classList.add('hidden');
  }

  if (showBoardBtn) {
    bubbleOpenBoard.classList.remove('hidden');
    hasActions = true;
  } else {
    bubbleOpenBoard.classList.add('hidden');
  }

  if (hasActions) {
    bubbleActions.classList.remove('hidden');
  } else {
    bubbleActions.classList.add('hidden');
  }
}

function hideBubble() {
  bubble.classList.add('hidden');
}

bubbleClose.addEventListener('click', hideBubble);
bubbleOpenBoard.addEventListener('click', () => {
  window.goo?.openBoard();
  hideBubble();
});

// ── 5. AI Streaming Reply ────────────────────────────────────
let streamedText = '';

if (window.goo?.onStream) {
  window.goo.onStream((token) => {
    streamedText += token;
    bubbleText.textContent = streamedText;
    bubble.classList.remove('hidden');
    window.gooState?.setState('talking');
  });
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text || isThinking) return;

  isThinking = true;
  input.value = '';
  hideChat();
  hideBubble();

  window.gooState?.setState('thinking');
  showBubble('Thinking…');
  streamedText = '';

  recordHistory('user', text);

  try {
    const res = await window.goo.sendMessage(text);
    if (res.error) {
      window.gooState?.setStateTemp('idle');
      showBubble(`⚠️ ${res.error}`);
    } else {
      const finalReply = res.reply || streamedText || 'Done!';
      recordHistory('goo', finalReply);
      window.gooState?.setStateTemp('happy', 2000);
      showBubble(finalReply, text.toLowerCase().includes('board') || text.toLowerCase().includes('canvas'));
    }
  } catch (err) {
    window.gooState?.setStateTemp('idle');
    showBubble(`Oops! ${err.message}`);
  } finally {
    isThinking = false;
  }
}

sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
  if (e.key === 'Escape') hideChat();
});

// ── 6. Settings Modal ────────────────────────────────────────
async function loadSettings() {
  if (!window.goo?.getSettings) return;
  currentSettings = await window.goo.getSettings();

  if (currentSettings.apiKey) {
    settingApiKey.value = currentSettings.apiKey;
  }
  if (currentSettings.model) {
    settingModel.value = currentSettings.model;
  }
  if (currentSettings.color) {
    window.gooState?.setColor(currentSettings.color);
    colorSwatches.forEach(s => {
      s.classList.toggle('active', s.dataset.color === currentSettings.color);
    });
  }

  // Welcome prompt on first run if no API key
  if (!currentSettings.apiKey) {
    showBubble("👋 Hi! I'm Goo. Click ⚙️ to add your OpenRouter API key so I can talk!");
  }
}

function openSettings() {
  hideChat();
  hideBubble();
  closeHistory();
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

// ── 7. Chat History Modal ────────────────────────────────────
const HISTORY_STORAGE_KEY = 'goo:chat_history';

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    chatHistory = raw ? JSON.parse(raw) : [];
  } catch {
    chatHistory = [];
  }
  renderHistory();
}

function recordHistory(role, content) {
  chatHistory.push({ role, content, time: Date.now() });
  // Keep last 40 entries
  if (chatHistory.length > 40) chatHistory = chatHistory.slice(-40);
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(chatHistory));
  } catch {}
  renderHistory();
}

function renderHistory() {
  if (!historyList) return;
  if (!chatHistory.length) {
    historyList.innerHTML = '<div class="history-empty">No conversations yet.<br><small style="opacity:0.6;">Chat with Goo to see past history here.</small></div>';
    return;
  }

  historyList.innerHTML = chatHistory.map(item => `
    <div class="history-item ${item.role}">
      <span class="history-role">${item.role === 'user' ? 'You' : 'Goo'}</span>
      <div class="history-content">${item.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
  `).join('');

  historyList.scrollTop = historyList.scrollHeight;
}

function openHistory() {
  hideChat();
  hideBubble();
  closeSettings();
  renderHistory();
  historyModal.classList.remove('hidden');
}

function closeHistory() {
  historyModal.classList.add('hidden');
}

function clearHistory() {
  chatHistory = [];
  try { localStorage.removeItem(HISTORY_STORAGE_KEY); } catch {}
  renderHistory();
}

settingsClose.addEventListener('click', closeSettings);
btnQuickSettings.addEventListener('click', openSettings);
btnQuickHistory.addEventListener('click', openHistory);
historyClose.addEventListener('click', closeHistory);
btnClearHistory.addEventListener('click', clearHistory);

btnQuickBoard.addEventListener('click', () => {
  window.goo?.openBoard();
});

colorSwatches.forEach(swatch => {
  swatch.addEventListener('click', () => {
    colorSwatches.forEach(s => s.classList.remove('active'));
    swatch.classList.add('active');
    const color = swatch.dataset.color;
    window.gooState?.setColor(color);
    window.goo?.saveSettings({ color });
  });
});

btnSaveSettings.addEventListener('click', async () => {
  const apiKey = settingApiKey.value.trim();
  const model  = settingModel.value;
  await window.goo?.saveSettings({ apiKey, model });
  closeSettings();
  window.gooState?.setStateTemp('happy', 1500);
  showBubble("Settings saved! I'm ready to help.");
});

linkOpenRouter?.addEventListener('click', () => {
  window.goo?.action('url.open', { url: 'https://openrouter.ai/keys' });
});

// Global events from main process (hotkey Alt+Space, tray clicks)
window.addEventListener('goo:focus-chat', showChat);
window.addEventListener('goo:open-settings', openSettings);
window.addEventListener('goo:first-run', () => {
  showBubble("✨ Welcome to Goo! Press Alt+Space anytime or click me to chat.");
});

// Initialize on page load
loadSettings();
loadHistory();
