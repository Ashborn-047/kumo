// ============================================================
// ui/overlay/js/modals-controller.js
// Settings & Chat History Modals Controller
// Strictly Zero Emojis per user design mandate.
// ============================================================

(function () {
  const settingsModal = document.getElementById('settings-modal');
  const settingsClose = document.getElementById('settings-close');
  const settingApiKey = document.getElementById('setting-api-key');
  const settingModel = document.getElementById('setting-model');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const linkOpenRouter = document.getElementById('link-openrouter');
  const colorSwatches = document.querySelectorAll('.color-swatch');

  const historyModal = document.getElementById('history-modal');
  const historyClose = document.getElementById('history-close');
  const historyList = document.getElementById('history-list');
  const btnClearHistory = document.getElementById('btn-clear-history');

  const btnQuickBoard = document.getElementById('btn-quick-board');
  const btnQuickHistory = document.getElementById('btn-quick-history');
  const btnQuickSettings = document.getElementById('btn-quick-settings');
  const btnQuickSleep = document.getElementById('btn-quick-sleep');

  const HISTORY_STORAGE_KEY = 'kumo:chat_history';
  let chatHistory = [];

  function loadSettings(currentSettings) {
    if (!currentSettings) return;
    if (settingApiKey && currentSettings.apiKey) settingApiKey.value = currentSettings.apiKey;
    if (settingModel && currentSettings.model) settingModel.value = currentSettings.model;
    if (currentSettings.color) {
      colorSwatches.forEach(swatch => {
        if (swatch.dataset.color === currentSettings.color) {
          colorSwatches.forEach(s => s.classList.remove('active'));
          swatch.classList.add('active');
        }
      });
    }
  }

  function openSettings() {
    window.BubbleController?.hide();
    historyModal?.classList.add('hidden');
    settingsModal?.classList.remove('hidden');
  }

  function closeSettings() {
    settingsModal?.classList.add('hidden');
  }

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
    window.BubbleController?.hide();
    closeSettings();
    renderHistory();
    historyModal?.classList.remove('hidden');
  }

  function closeHistory() {
    historyModal?.classList.add('hidden');
  }

  function clearHistory() {
    chatHistory = [];
    try { localStorage.removeItem(HISTORY_STORAGE_KEY); } catch {}
    renderHistory();
  }

  settingsClose?.addEventListener('click', closeSettings);
  btnQuickSettings?.addEventListener('click', () => {
    if (window.goo?.openStudio) {
      window.goo.openStudio();
    } else {
      openSettings();
    }
  });

  btnQuickHistory?.addEventListener('click', openHistory);
  historyClose?.addEventListener('click', closeHistory);
  btnClearHistory?.addEventListener('click', clearHistory);

  btnQuickBoard?.addEventListener('click', () => {
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

  btnSaveSettings?.addEventListener('click', async () => {
    const apiKey = settingApiKey?.value.trim() || '';
    const model = settingModel?.value || '';
    await window.goo?.saveSettings({ apiKey, model });
    closeSettings();
    window.gooState?.setStateTemp('happy', 1500);
    window.BubbleController?.show("Settings saved! I'm ready to help.");
  });

  linkOpenRouter?.addEventListener('click', () => {
    window.goo?.action('url.open', { url: 'https://openrouter.ai/keys' });
  });

  window.ModalsController = {
    openSettings,
    closeSettings,
    openHistory,
    closeHistory,
    loadSettings,
    loadHistory,
    recordHistory,
  };
})();

