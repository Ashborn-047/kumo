// ============================================================
// preload.js — IPC Security Bridge
// Exposes a safe, restricted API to the renderer via
// contextBridge. Renderer CANNOT access Node directly.
// ============================================================
// TODO Phase 1: expose chat send/receive
// TODO Phase 2: expose board save/load
// TODO Phase 3: expose system actions (safety-gated)

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('goo', {
  // AI chat
  sendMessage: (message) => ipcRenderer.invoke('ai:send', message),
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
  rescanSystem:       ()               => ipcRenderer.invoke('system:rescan'),
  updateAppPermission: (appId, allowed) => ipcRenderer.invoke('system:update-permission', { appId, allowed }),

  // Studio / onboarding
  openStudio:      (optionsOrTheme) => ipcRenderer.send('studio:open', optionsOrTheme || 'studio'),
  closeStudio:     ()               => ipcRenderer.send('studio:close'),
  launchCompanion: (data)           => ipcRenderer.invoke('studio:launch', data),
  studioWindow:    (action)         => ipcRenderer.send('studio:window', action),
  openExternal:    (url)            => ipcRenderer.invoke('shell:open-external', url),

  // Window controls
  openBoard:       ()         => ipcRenderer.send('window:open-board'),
  hideOverlay:     ()         => ipcRenderer.send('window:hide-overlay'),
  showOverlay:     ()         => ipcRenderer.send('window:show-overlay'),

  // Board ↔ native bridge (used by ui/board/bridge.js)
  boardCall:    (msg)      => ipcRenderer.send('board:call', msg),
  onBoardReply: (cb)       => ipcRenderer.on('board:reply', (_e, id, ok, val) => cb(id, ok, val)),

  // Overlay mouse passthrough & reposition
  setMouseIgnore: (ignore) => ipcRenderer.send('overlay:set-mouse', ignore),
  moveOverlay:    (deltaX, deltaY) => ipcRenderer.send('overlay:move', { deltaX, deltaY }),

  // Dual-mode card pinning: from mascot popout to Kumoboard canvas
  pinCardToBoard: (card) => ipcRenderer.send('board:pin-card', card),
  onCardPinned:   (cb)   => ipcRenderer.on('board:card-pinned', (_e, card) => cb(card)),
});
