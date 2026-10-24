/**
 * Kumo Design System — ColorSwatch Component
 * Swatch card with color preview, hex, RGB, and WCAG contrast ratio indicator.
 */

import React from 'react';
import { ColorSwatchProps } from './types';

export const ColorSwatch: React.FC<ColorSwatchProps> = ({
  name,
  hex,
  rgb,
  contrastRatio,
  rating,
  comparison,
  onCopy
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-outline-variant/30 shadow-2xs flex flex-col justify-between">
      <div
        className="h-24 w-full rounded-lg relative flex items-end p-2.5 shadow-sm border border-black/5"
        style={{ backgroundColor: hex }}
      >
        <span className="text-[10px] font-mono bg-black/40 text-white px-2 py-0.5 rounded backdrop-blur-xs font-semibold">
          {name}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex justify-between items-center">
          <span className="text-[18px] font-semibold text-on-surface">{hex}</span>
          <button
            className="text-[10px] font-mono text-primary hover:underline cursor-pointer"
            onClick={() => onCopy?.(hex)}
            type="button"
          >
            Copy
          </button>
        </div>
        <p className="text-[12px] text-secondary">RGB: {rgb}</p>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-surface-container text-[10px] font-mono">
          <span className="text-secondary">{comparison}:</span>
          <span className="font-semibold text-emerald-700 bg-emerald-100 px-1.5 rounded">
            {contrastRatio} ({rating})
          </span>
        </div>
      </div>
    </div>
  );
};

export default ColorSwatch;
