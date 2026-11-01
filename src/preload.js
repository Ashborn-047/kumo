// ============================================================
// preload.js — IPC Security Bridge
// Exposes a safe, restricted API to the renderer via
// contextBridge. Renderer CANNOT access Node directly.
// ============================================================

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('goo', {
  // AI chat
  sendMessage: (message, history = []) => {
    if (typeof message === 'object' && message !== null) {
      return ipcRenderer.invoke('ai:send', message);
    }
    return ipcRenderer.invoke('ai:send', { text: message, history });
  },
  onReply:     (cb)      => ipcRenderer.on('ai:reply', (_e, data) => cb(data)),
  onStream:    (cb)      => ipcRenderer.on('ai:stream', (_e, chunk) => cb(chunk)),

  // Board operations
  listBoards:   ()         => ipcRenderer.invoke('board:list'),
  loadBoard:    (id)       => ipcRenderer.invoke('board:load', id),
  saveBoard:    (board)    => ipcRenderer.invoke('board:save', board),
  deleteBoard:  (id)       => ipcRenderer.invoke('board:delete', id),
  exportBoard:  (id, format) => ipcRenderer.invoke('board:export', { id, format }),

  // Notifications
  notify:       (title, body) => ipcRenderer.send('app:notify', { title, body }),

  // System actions (safety-gated in actions.js)
  action:       (type, args) => ipcRenderer.invoke('action:run', { type, args }),

  // Settings & Capabilities
  getSettings:        ()               => ipcRenderer.invoke('settings:get'),
  saveSettings:       (data)           => ipcRenderer.invoke('settings:save', data),
  onSettingsUpdated:  (cb)             => ipcRenderer.on('settings:updated', (_e, data) => cb(data)),
  getCapabilities:    ()               => ipcRenderer.invoke('system:get-capabilities'),
  getTelemetry:       ()               => ipcRenderer.invoke('system:get-telemetry'),
  onTelemetry:        (cb)             => ipcRenderer.on('board:telemetry-update', (_e, data) => cb(data)),
  rescanSystem:       ()               => ipcRenderer.invoke('system:rescan'),
  updateAppPermission: (appId, allowed) => ipcRenderer.invoke('system:update-permission', { appId, allowed }),

  // Studio / onboarding
  openStudio:      (optionsOrTheme) => ipcRenderer.send('studio:open', optionsOrTheme || 'studio'),
  closeStudio:     ()               => ipcRenderer.send('studio:close'),
  launchCompanion: (data)           => ipcRenderer.invoke('studio:launch', data),
  studioWindow:    (action)         => ipcRenderer.send('studio:window', action),
  openExternal:    (url)            => ipcRenderer.invoke('shell:open-external', url),
  getMascot:       ()               => ipcRenderer.invoke('mascot:get'),
  listMascots:     ()               => ipcRenderer.invoke('mascot:list'),
  setMascot:       (mascotId)       => ipcRenderer.invoke('mascot:set', mascotId),

  // Window controls
  openBoard:        ()         => ipcRenderer.send('window:open-board'),
  openAmpWindow:    ()         => ipcRenderer.send('window:open-amp'),
  closeAmpWindow:   ()         => ipcRenderer.send('window:close-amp'),
  hideOverlay:      ()         => ipcRenderer.send('window:hide-overlay'),
  showOverlay:      ()         => ipcRenderer.send('window:show-overlay'),
  toggleOverlay:    ()         => ipcRenderer.invoke('window:toggle-overlay'),
  isOverlayVisible: ()         => ipcRenderer.invoke('window:is-overlay-visible'),

  // Board ↔ native bridge (used by ui/board/bridge.js)
  boardCall:    (msg)      => ipcRenderer.send('board:call', msg),
  onBoardReply: (cb)       => ipcRenderer.on('board:reply', (_e, id, ok, val) => cb(id, ok, val)),

  // Overlay mouse passthrough & reposition
  setMouseIgnore: (ignore) => ipcRenderer.send('overlay:set-mouse', ignore),
  moveOverlay:    (deltaX, deltaY) => ipcRenderer.send('overlay:move', { deltaX, deltaY }),

  // Dual-mode card pinning: from mascot popout to Kumoboard canvas
  pinCardToBoard: (card) => ipcRenderer.send('board:pin-card', card),
  onCardPinned:   (cb)   => ipcRenderer.on('board:card-pinned', (_e, card) => cb(card)),

  // Pulse Dynamic Island Bridge
  islandSetHit:          (interactive) => ipcRenderer.send('island:set-hit', Boolean(interactive)),
  islandSetExpanded:     (expanded)    => ipcRenderer.send('island:set-expanded', Boolean(expanded)),
  islandSnapEdge:        (edge)        => ipcRenderer.send('island:snap-edge', edge),
  islandGetConfig:       ()            => ipcRenderer.invoke('island:get-config'),
  onIslandEdgeChanged:   (cb)          => ipcRenderer.on('island:edge-changed', (_e, d) => cb(d)),
  onIslandExpandChanged: (cb)          => ipcRenderer.on('island:expand-changed', (_e, d) => cb(d)),
  onIslandPopOut:        (cb)          => ipcRenderer.on('island:pop-out', (_e, d) => cb(d)),
  islandStartDrag:       (filePath)    => ipcRenderer.send('island:start-drag', filePath),

  // Live Windows SMTC & Media Status Bridge
  getMediaStatus:        ()            => ipcRenderer.invoke('media:get-status'),
  getMediaQueue:         ()            => ipcRenderer.invoke('media:get-queue'),
  onMediaStatusUpdate:   (cb)          => ipcRenderer.on('media:status-update', (_e, d) => cb(d)),

  // Companion Spatial Migration ("Dive-In / Leap-Out")
  onCompanionDive:       (cb)          => ipcRenderer.on('companion:dive-exit', (_e, d) => cb(d)),
  onCompanionBoardEnter: (cb)          => ipcRenderer.on('companion:board-enter', (_e, d) => cb(d)),
  onCompanionLeap:       (cb)          => ipcRenderer.on('companion:island-enter', (_e, d) => cb(d)),
  companionLeapReturn:   ()            => ipcRenderer.send('companion:board-exit'),
});
