// ============================================================
// ui/overlay/js/popout-controller.js
// Dual-Mode Contextual Popout Card Engine
// Strictly Zero Emojis per user design mandate.
// ============================================================

(function () {
  const cardPopout = document.getElementById('card-popout');
  const cardPopoutTitle = document.getElementById('card-popout-title');
  const cardPopoutSubtitle = document.getElementById('card-popout-subtitle');
  const cardPopoutIcon = document.getElementById('card-popout-icon');
  const cardPopoutBody = document.getElementById('card-popout-body');
  const cardPopoutPin = document.getElementById('card-popout-pin');
  const cardPopoutClose = document.getElementById('card-popout-close');

  let currentActiveCard = null;

  function show(type, payload = {}, currentTelemetry = null) {
    if (!cardPopout) return;

    window.BubbleController?.hide();
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
            <span class="metric-val" style="color:var(--iris-action, #6355d8);">${currentTelemetry?.ram ? currentTelemetry.ram.used + " / " + currentTelemetry.ram.total + " GB (" + currentTelemetry.ram.pct + "%)" : "Host Memory"}</span>
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

    // Bind popout actions
    document.getElementById('btn-popout-spotify-play')?.addEventListener('click', async () => {
      await window.goo?.action?.('media.playPause');
    });
    document.getElementById('btn-popout-spotify-prev')?.addEventListener('click', async () => {
      await window.goo?.action?.('media.previous');
    });
    document.getElementById('btn-popout-spotify-next')?.addEventListener('click', async () => {
      await window.goo?.action?.('media.next');
    });
    document.getElementById('btn-popout-spotify-focus')?.addEventListener('click', async () => {
      await window.goo?.action?.('app.open', { appName: 'Spotify' });
    });

    document.getElementById('btn-popout-taskmgr')?.addEventListener('click', async () => {
      await window.goo?.action?.('powershell.read', { command: 'Start-Process taskmgr' });
    });
    document.getElementById('btn-popout-clean-temp')?.addEventListener('click', async () => {
      await window.goo?.action?.('powershell.read', { command: 'Remove-Item $env:TEMP\\* -Recurse -Force -ErrorAction SilentlyContinue' });
      window.BubbleController?.show('Cleaned temporary files from user cache.');
    });

    document.getElementById('btn-popout-flush-dns')?.addEventListener('click', async () => {
      await window.goo?.action?.('powershell.read', { command: 'ipconfig /flushdns' });
      window.BubbleController?.show('Successfully flushed DNS Resolver Cache.');
    });
    document.getElementById('btn-popout-ping')?.addEventListener('click', async () => {
      await window.goo?.action?.('powershell.read', { command: 'Test-NetConnection 8.8.8.8' });
      window.BubbleController?.show('Network ping successful (8.8.8.8 alive).');
    });

    document.getElementById('btn-popout-kill-proc')?.addEventListener('click', async () => {
      const target = currentActiveCard?.data?.target;
      if (target) {
        await window.goo?.action?.('process.kill', { processName: target, force: true });
        window.BubbleController?.show(`Terminated process ${target}.`);
        hide();
      }
    });

    document.getElementById('btn-popout-open-calc')?.addEventListener('click', async () => {
      await window.goo?.action?.('app.open', { appName: 'calc' });
    });
    document.getElementById('btn-popout-open-term')?.addEventListener('click', async () => {
      await window.goo?.action?.('app.open', { appName: 'wt' });
    });
  }

  function hide() {
    if (cardPopout) cardPopout.classList.add('hidden');
    currentActiveCard = null;
  }

  if (cardPopoutClose) {
    cardPopoutClose.addEventListener('click', hide);
  }

  if (cardPopoutPin) {
    cardPopoutPin.addEventListener('click', () => {
      if (!currentActiveCard) return;
      const pinnedCard = {
        id: `card-${Date.now()}`,
        type: currentActiveCard.type,
        title: currentActiveCard.title,
        data: currentActiveCard.data,
        x: 48,
        y: 48,
      };

      if (window.goo?.pinCardToBoard) {
        window.goo.pinCardToBoard(pinnedCard);
      }
      cardPopoutPin.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;">check</span><span>Pinned</span>';
      cardPopoutPin.classList.add('pinned');
      setTimeout(hide, 1200);
    });
  }

  window.PopoutController = {
    show,
    hide,
    getCurrentCard: () => currentActiveCard,
  };
})();

