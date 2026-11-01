// ============================================================
// Kumoboard — Assistant Workbench Main Entry Point
// Exact Stitch Design Integration
// ============================================================

import { initCanvasControls } from './js/canvas.js';
import { initCommandPalette } from './js/command.js';
import { loadState, saveState, toast } from './js/storage.js';
import { updateMiniMap, updateZoomDisplay } from './js/minimap.js';
import { renderCards } from './js/card-renderer.js';
import { addNewTool } from './js/tool-factory.js';
import { initFilters, initFloatingActions, initPermissionsModal } from './js/board-modals.js';
import { setupPinListener, setupCompanionSpatialMigration } from './js/pin-listener.js';
import { applyLiveTelemetry } from './js/telemetry-dispatcher.js';

export { toast, saveState, loadState, updateMiniMap, renderCards, addNewTool, applyLiveTelemetry };

// ── Boot ──
(async () => {
  loadState();
  initCanvasControls(updateZoomDisplay);
  initFilters();
  initFloatingActions();
  initPermissionsModal();
  initCommandPalette(addNewTool, toast);
  renderCards();

  // Listen for Custom Re-render Events (e.g. from Pinned Songs deletions/plays)
  window.addEventListener('kumo:render-cards', () => {
    saveState();
    renderCards();
    updateMiniMap();
  });

  // Pinning & Spatial Companion Migration
  setupPinListener();
  setupCompanionSpatialMigration({ addNewTool, toast });
})();
