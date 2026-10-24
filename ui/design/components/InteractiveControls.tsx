/**
 * Kumo Design System — InteractiveControls Component
 * Tactile pill buttons, coordinate snapping toggle switch, and blur intensity slider.
 */

import React, { useState } from 'react';

export interface InteractiveControlsProps {
  onSnapToggle?: (snapped: boolean) => void;
  onBlurChange?: (blurPx: number) => void;
  onPrimaryClick?: () => void;
  onGhostClick?: () => void;
}

export const InteractiveControls: React.FC<InteractiveControlsProps> = ({
  onSnapToggle,
  onBlurChange,
  onPrimaryClick,
  onGhostClick
}) => {
  const [snapped, setSnapped] = useState(true);
  const [blurVal, setBlurVal] = useState(16);

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSnapped(checked);
    onSnapToggle?.(checked);
  };

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setBlurVal(val);
    onBlurChange?.(val);
  };

  return (
    <div className="bg-white rounded-[18px] p-5 border border-outline-variant/30 shadow-[0_8px_24px_-4px_rgba(46,59,82,0.06)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-surface-container">
          <h4 className="text-[18px] font-semibold text-on-surface">Interactive Controls</h4>
          <span className="text-[10px] font-mono text-primary font-semibold">Tactile Form Kits</span>
        </div>

        <div className="py-4 space-y-4">
          {/* Pill Button Variants */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onPrimaryClick}
              className="px-4 py-2 bg-primary text-white hover:bg-primary-container rounded-lg text-[11px] font-mono font-semibold shadow-sm active:scale-95 transition-all flex items-center gap-1.5"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">touch_app</span>
              Primary Iris
            </button>

            <button
              onClick={onGhostClick}
              className="px-3.5 py-2 bg-surface-container text-on-surface hover:bg-surface-container-high rounded-lg text-[11px] font-mono font-medium border border-outline-variant/40 active:scale-95 transition-all"
              type="button"
            >
              Ghost Secondary
            </button>
          </div>

          {/* Interactive Toggle Switch */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[14px] text-on-surface font-medium">Coordinate Snapping (24px)</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={snapped}
                onChange={handleToggle}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>

          {/* Slider Range */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-secondary">
              <span>Frosted Blur Intensity</span>
              <span className="text-primary font-bold">{blurVal}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="32"
              value={blurVal}
              onChange={handleSlider}
              className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-surface-container flex justify-between items-center text-[10px] font-mono text-secondary">
        <span>INTERACTION</span>
        <span className="text-primary font-semibold">Active:scale-95 tactile press</span>
      </div>
    </div>
  );
};

export default InteractiveControls;
