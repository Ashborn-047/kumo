/**
 * Kumo Design System — CompanionDock Component
 * Frosted Glass Floating Bottom Companion Dock (Level 3 Elevation)
 */

import React from 'react';
import { CompanionDockProps } from './types';

export const CompanionDock: React.FC<CompanionDockProps> = ({
  shortcutHint = 'Space to pan • Ctrl+Scroll to zoom • Ctrl+K quick command',
  zoomLevel = '100%',
  onZoomIn,
  onZoomOut,
  onFitScreen,
  onResetZoom
}) => {
  return (
    <footer className="kumo-dock fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg shadow-on-surface/5 ring-1 ring-white/60">
      <span className="text-[12px] text-secondary hidden sm:inline">
        {shortcutHint}
      </span>

      <div className="h-4 w-px bg-outline-variant/50 hidden sm:block" />

      {/* Zoom and screen actions */}
      <div className="flex items-center gap-2 text-[10px] font-mono">
        <button
          onClick={onResetZoom}
          className="text-primary font-medium hover:text-on-surface hover:bg-surface-container-high/50 rounded-lg px-2 py-1 transition-colors"
          type="button"
        >
          {zoomLevel}
        </button>

        <button
          onClick={onFitScreen}
          className="text-secondary hover:text-on-surface hover:bg-surface-container-high/50 rounded-lg p-1 transition-colors"
          title="Fit to Screen"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">fit_screen</span>
        </button>

        <button
          onClick={onZoomIn}
          className="text-secondary hover:text-on-surface hover:bg-surface-container-high/50 rounded-lg p-1 transition-colors"
          title="Zoom In"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_in</span>
        </button>

        <button
          onClick={onZoomOut}
          className="text-secondary hover:text-on-surface hover:bg-surface-container-high/50 rounded-lg p-1 transition-colors"
          title="Zoom Out"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">zoom_out</span>
        </button>
      </div>
    </footer>
  );
};

export default CompanionDock;
