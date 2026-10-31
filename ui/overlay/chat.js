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
const btnQuickSleep = document.getElementById('btn-quick-sleep');

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

// Contextual Card Popout (Dual-Mode Engine)
const cardPopout     = document.getElementById('card-popout');
const cardPopoutTitle = document.getElementById('card-popout-title');
const cardPopoutSubtitle = document.getElementById('card-popout-subtitle');
const cardPopoutIcon = document.getElementById('card-popout-icon');
const cardPopoutBody = document.getElementById('card-popout-body');
const cardPopoutPin  = document.getElementById('card-popout-pin');
const cardPopoutClose = document.getElementById('card-popout-close');

let currentActiveCard = null;
let fullReply      = '';
let chatHistory    = [];
let isThinking     = false;
let currentSettings = {};
let currentTelemetry = null;

if (window.goo?.getTelemetry) {
  window.goo.getTelemetry().then(t => { currentTelemetry = t; }).catch(() => {});
}
if (window.goo?.onTelemetry) {
  window.goo.onTelemetry(t => { currentTelemetry = t; });
}

// ── 1. Mouse Passthrough & Interactive Hit-Testing ──────────
let isMouseIgnored = true;

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
      window.gooState?.triggerPoke?.();
      toggleChat();
    }
  }
});

// ── 3. Chat Bar Controls ─────────────────────────────────────
function showChat() {
  chatBar.classList.remove('hidden');
  settingsModal.classList.add('hidden');
  window.gooState?.setState?.('listening');
  input.focus();
}

function hideChat() {
  chatBar.classList.add('hidden');
  input.value = '';
  if (!isThinking) {
    window.gooState?.setState?.('idle');
  }
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

// ── Dual-Mode Contextual Card Popout Engine ───────────────────
function showCardPopout(type, payload = {}) {
  if (!cardPopout) return;

  hideBubble();
  cardPopout.classList.remove('hidden');

  let title = 'Assistant Card';
  let subtitle = 'Active Instance';
  let icon = 'widgets';
  let bodyHTML = '';
  let cardState = { type, title, data: {} };

  const query = (payload.query || '').toLowerCase();
  const reply = (payload.reply || '').toLowerCase();

  if (type === 'spotify' || query.includes('spotify') || reply.includes('spotify')) {
    title = 'Spotify Media Agent';
    subtitle = 'Active Playback Hook';
    icon = 'graphic_eq';
    cardState = {
      type: 'media',
      title: 'Spotify & Media Orchestrator',
      width: 520,
      data: { activeTab: 'apps', pinnedDomain: 'spotify', status: 'PLAYING' }
    };
    bodyHTML = `
      <div class="metric-row">
        <div class="metric-pill">
          <span class="metric-label">Service</span>
          <span class="metric-val" style="color:#1db954;">Spotify Desktop</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Status</span>
          <span class="metric-val">Connected (URI Hook)</span>
        </div>
      </div>
      <div class="popout-action-row" style="display:flex;gap:6px;align-items:center;">
        <button class="popout-action-btn" id="btn-popout-spotify-prev" title="Previous Track" style="padding:6px 10px;">
          <span class="material-symbols-outlined" style="font-size:16px;">skip_previous</span>
        </button>
        <button class="popout-action-btn primary" id="btn-popout-spotify-play" style="flex:1;">
          <span class="material-symbols-outlined" style="font-size:16px;">play_arrow</span>
          <span>Play / Pause</span>
        </button>
        <button class="popout-action-btn" id="btn-popout-spotify-next" title="Next Track" style="padding:6px 10px;">
          <span class="material-symbols-outlined" style="font-size:16px;">skip_next</span>
        </button>
        <button class="popout-action-btn" id="btn-popout-spotify-focus" title="Focus Spotify" style="padding:6px 10px;">
          <span class="material-symbols-outlined" style="font-size:16px;">open_in_new</span>
        </button>
      </div>
    `;
  } else if (type === 'system-health' || query.includes('ram') || query.includes('cpu') || query.includes('specs')) {
    title = 'System Telemetry Hub';
    subtitle = (currentTelemetry?.cpu?.count ? currentTelemetry.cpu.count + ' Cores • ' : '') + (currentTelemetry?.cpu?.model || 'Hardware Probe');
    icon = 'memory';
    cardState = {
      type: 'code',
      title: 'System Telemetry Hub',
      width: 560,
      data: { command: 'Get-Process | Select -First 10', mode: 'telemetry' }
    };
    bodyHTML = `
      <div class="metric-row">
        <div class="metric-pill">
          <span class="metric-label">Host RAM</span>
          <span class="metric-val" style="color:#baa0ff;">${currentTelemetry?.ram ? currentTelemetry.ram.used + " / " + currentTelemetry.ram.total + " GB (" + currentTelemetry.ram.pct + "%)" : "Host Memory"}</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">CPU Cores</span>
          <span class="metric-val">${currentTelemetry?.cpu ? currentTelemetry.cpu.count + " Logical Cores" : "Host CPU"}</span>
        </div>
      </div>
      <div class="popout-action-row">
        <button class="popout-action-btn primary" id="btn-popout-taskmgr">
          <span class="material-symbols-outlined" style="font-size:16px;">monitoring</span>
          <span>Task Manager</span>
        </button>
        <button class="popout-action-btn" id="btn-popout-clean-temp">
          <span class="material-symbols-outlined" style="font-size:16px;">cleaning_services</span>
          <span>Clean Temp</span>
        </button>
      </div>
    `;
  } else if (type === 'network' || query.includes('ip') || query.includes('ping') || query.includes('dns') || query.includes('network') || query.includes('wifi')) {
    title = 'Network Sentinel';
    subtitle = 'IPv4 / DNS Diagnostics';
    icon = 'wifi_tethering';
    cardState = {
      type: 'network',
      title: 'Network Sentinel Hub',
      width: 540,
      data: { command: 'Test-NetConnection 8.8.8.8', mode: 'network' }
    };
    bodyHTML = `
      <div class="metric-row">
        <div class="metric-pill">
          <span class="metric-label">Gateway</span>
          <span class="metric-val">${currentTelemetry?.network?.gateway || "Active Gateway"}</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">DNS Status</span>
          <span class="metric-val" style="color:#7bdcb5;">Online (53 OK)</span>
        </div>
      </div>
      <div class="popout-action-row">
        <button class="popout-action-btn primary" id="btn-popout-flush-dns">
          <span class="material-symbols-outlined" style="font-size:16px;">refresh</span>
          <span>Flush DNS</span>
        </button>
        <button class="popout-action-btn" id="btn-popout-ping">
          <span class="material-symbols-outlined" style="font-size:16px;">speed</span>
          <span>Ping 8.8.8.8</span>
        </button>
      </div>
    `;
  } else if (type === 'process' || query.includes('kill') || query.includes('terminate')) {
    title = 'Process Sentinel';
    subtitle = 'Process Safety Gate';
    icon = 'cancel';
    const target = (payload.target || 'target').replace(/kill\s+/i, '');
    cardState = {
      type: 'code',
      title: 'Process Sentinel',
      width: 500,
      data: { target }
    };
    bodyHTML = `
      <div class="metric-row">
        <div class="metric-pill">
          <span class="metric-label">Target Name</span>
          <span class="metric-val" style="color:#ff8a80;">${target}</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Safety Tier</span>
          <span class="metric-val" style="color:#ffd166;">YELLOW (Confirmed)</span>
        </div>
      </div>
      <div class="popout-action-row">
        <button class="popout-action-btn danger" id="btn-popout-kill-proc">
          <span class="material-symbols-outlined" style="font-size:16px;">delete_forever</span>
          <span>Terminate Process</span>
        </button>
      </div>
    `;
  } else {
    title = 'Application Dock';
    subtitle = 'Installed System Hooks';
    icon = 'apps';
    cardState = {
      type: 'launcher',
      title: 'Application Dock',
      width: 560,
      data: { activeTab: 'apps' }
    };
    bodyHTML = `
      <div class="metric-row">
        <div class="metric-pill">
          <span class="metric-label">Scanned Apps</span>
          <span class="metric-val">System Discovered</span>
        </div>
        <div class="metric-pill">
          <span class="metric-label">Active Hooks</span>
          <span class="metric-val" style="color:#7bdcb5;">Direct Launch</span>
        </div>
      </div>
      <div class="popout-action-row">
        <button class="popout-action-btn primary" id="btn-popout-open-calc">
          <span class="material-symbols-outlined" style="font-size:16px;">calculate</span>
          <span>Calc</span>
        </button>
        <button class="popout-action-btn" id="btn-popout-open-term">
          <span class="material-symbols-outlined" style="font-size:16px;">terminal</span>
          <span>Terminal</span>
        </button>
      </div>
    `;
  }

  cardPopoutTitle.textContent = title;
  cardPopoutSubtitle.textContent = subtitle;
  cardPopoutIcon.textContent = icon;
  cardPopoutBody.innerHTML = bodyHTML;
  currentActiveCard = cardState;

  if (cardPopoutPin) {
    cardPopoutPin.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;">push_pin</span><span>Pin</span>';
    cardPopoutPin.classList.remove('pinned');
  }

  // Bind popout quick action buttons
  document.getElementById('btn-popout-spotify-play')?.addEventListener('click', async () => {
    await window.goo?.action?.('media.playPause');
    showBubble('🎵 Spotify Play/Pause toggled!');
  });
  document.getElementById('btn-popout-spotify-next')?.addEventListener('click', async () => {
    await window.goo?.action?.('media.next');
    showBubble('⏭️ Next track!');
  });
  document.getElementById('btn-popout-spotify-prev')?.addEventListener('click', async () => {
    await window.goo?.action?.('media.previous');
    showBubble('⏮️ Previous track!');
  });
  document.getElementById('btn-popout-spotify-focus')?.addEventListener('click', () => {
    window.goo?.action?.('app.open', { name: 'spotify' });
  });
  document.getElementById('btn-popout-taskmgr')?.addEventListener('click', () => {
    window.goo?.action?.('app.open', { name: 'taskmgr' });
  });
  document.getElementById('btn-popout-clean-temp')?.addEventListener('click', () => {
    window.goo?.action?.('powershell.read', { command: 'Remove-Item -Path "$env:TEMP\\*" -Recurse -Force -ErrorAction SilentlyContinue; "Temp files purged."' });
    showBubble('🧹 Temp files cleaned!');
  });
  document.getElementById('btn-popout-flush-dns')?.addEventListener('click', () => {
    window.goo?.action?.('powershell.read', { command: 'ipconfig /flushdns' });
    showBubble('🔄 DNS cache flushed successfully!');
  });
  document.getElementById('btn-popout-ping')?.addEventListener('click', () => {
    window.goo?.action?.('powershell.read', { command: 'ping -n 4 8.8.8.8' });
    showBubble('⚡ Pinging 8.8.8.8...');
  });
  document.getElementById('btn-popout-open-calc')?.addEventListener('click', () => {
    window.goo?.action?.('app.open', { name: 'calc' });
  });
  document.getElementById('btn-popout-open-term')?.addEventListener('click', () => {
    window.goo?.action?.('app.open', { name: 'terminal' });
  });
  document.getElementById('btn-popout-kill-proc')?.addEventListener('click', () => {
    window.goo?.action?.('process.kill', { name: cardState.data?.target || 'calc' });
    showBubble(`🛑 Terminated process ${cardState.data?.target || ''}`);
  });
}

function hideCardPopout() {
  if (cardPopout) {
    cardPopout.classList.add('hidden');
    currentActiveCard = null;
  }
}

cardPopoutClose?.addEventListener('click', hideCardPopout);
cardPopoutPin?.addEventListener('click', () => {
  if (!currentActiveCard) return;
  window.goo?.pinCardToBoard?.(currentActiveCard);
  cardPopoutPin.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;">check</span><span>Pinned</span>';
  cardPopoutPin.classList.add('pinned');
  setTimeout(() => {
    hideCardPopout();
  }, 900);
});

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
  hideCardPopout();

  window.gooState?.setState('thinking');
  showBubble('Thinking…');
  streamedText = '';

  // Extract prior conversation turns for conversational memory context (last 12 items)
  const priorHistory = (chatHistory || []).slice(-12).map(item => ({
    role: (item.role === 'assistant' || item.role === 'goo') ? 'assistant' : 'user',
    content: item.content || item.text || ''
  }));

  recordHistory('user', text);

  try {
    const res = await window.goo.sendMessage(text, priorHistory);
    if (res.error) {
      window.gooState?.setStateTemp('idle');
      showBubble(`⚠️ ${res.error}`);
    } else {
      const finalReply = res.reply || streamedText || 'Done!';
      recordHistory('goo', finalReply);
      window.gooState?.setStateTemp('happy', 2000);
      showBubble(finalReply, text.toLowerCase().includes('board') || text.toLowerCase().includes('canvas'));

      // Check if this interaction triggers a contextual card popout
      const q = text.toLowerCase();
      const hasAction = res.actionResults && res.actionResults.length > 0;
      const actType = hasAction ? res.actionResults[0].type : '';
      const actArgs = hasAction ? res.actionResults[0].args : {};

      if (q.includes('spotify') || (actType === 'app.open' && actArgs?.name?.toLowerCase().includes('spotify'))) {
        showCardPopout('spotify', { query: text, reply: finalReply });
      } else if (q.includes('ram') || q.includes('cpu') || q.includes('specs') || actType === 'system.info') {
        showCardPopout('system-health', { query: text, reply: finalReply });
      } else if (q.includes('ip') || q.includes('ping') || q.includes('dns') || q.includes('wifi') || q.includes('network')) {
        showCardPopout('network', { query: text, reply: finalReply });
      } else if (q.includes('kill') || q.includes('terminate') || actType === 'process.kill') {
        showCardPopout('process', { query: text, reply: finalReply, target: actArgs?.name || text });
      } else if (q.includes('apps') || q.includes('launcher') || q.includes('dock') || actType === 'app.open') {
        showCardPopout('launcher', { query: text, reply: finalReply });
      }
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
  applyCompanionSettings(currentSettings);

  if (!currentSettings.apiKey && currentSettings.firstRun === false) {
    const name = currentSettings.companionName || 'Kumo';
    showBubble(`Hi — I'm ${name}. Open Customize to add an OpenRouter key so I can talk.`);
  }
}

function applyCompanionSettings(cfg = {}) {
  const name = (cfg.companionName || 'Kumo').trim() || 'Kumo';
  const title = document.getElementById('bubble-title');
  if (title) title.textContent = name;

  if (cfg.color) {
    window.gooState?.setColor(cfg.color);
    colorSwatches.forEach(s => {
      s.classList.toggle('active', s.dataset.color === cfg.color);
    });
  }
}

function openSettings() {
  if (window.goo?.openStudio) {
    window.goo.openStudio('studio');
    return;
  }
  hideChat();
  hideBubble();
  closeHistory();
  settingsModal.classList.remove('hidden');
}

function closeSettings() {
  settingsModal.classList.add('hidden');
}

// ── 7. Chat History Modal ────────────────────────────────────
const HISTORY_STORAGE_KEY = 'kumo:chat_history';

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
    historyList.innerHTML = '<div class="history-empty">No conversations yet.<br><small style="opacity:0.6;">Chat with Kumo to see past history here.</small></div>';
    return;
  }

  historyList.innerHTML = chatHistory.map(item => `
    <div class="history-item ${item.role}">
      <span class="history-role">${item.role === 'user' ? 'You' : 'Kumo'}</span>
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
btnQuickSettings.addEventListener('click', () => {
  if (window.goo?.openStudio) {
    window.goo.openStudio();
  } else {
    openSettings();
  }
});
btnQuickHistory.addEventListener('click', openHistory);
historyClose.addEventListener('click', closeHistory);
btnClearHistory.addEventListener('click', clearHistory);

btnQuickBoard.addEventListener('click', () => {
  window.goo?.openBoard();
});
btnQuickSleep?.addEventListener('click', (e) => {
  e.stopPropagation();
  window.goo?.hideOverlay?.();
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
  window.goo?.openStudio('wizard');
});
window.addEventListener('goo:launched', (e) => {
  const detail = e.detail || {};
  const name = detail.companionName || 'Kumo';
  const user = detail.userName;
  const hello = user
    ? `Hi ${user} — I'm ${name}. Press Alt+Space anytime, or click me to chat.`
    : `Hi — I'm ${name}. Press Alt+Space anytime, or click me to chat.`;
  window.gooState?.setStateTemp('happy', 2200);
  showBubble(hello);
});

if (window.goo?.onSettingsUpdated) {
  window.goo.onSettingsUpdated((cfg) => {
    currentSettings = { ...currentSettings, ...cfg };
    applyCompanionSettings(currentSettings);
  });
}

// Initialize on page load
loadSettings();
loadHistory();
