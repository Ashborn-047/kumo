/**
 * Kumo Design System — StickyNote Component
 * Warm Butter Ideation & Sprint Checklist Component.
 */

import React from 'react';
import { StickyNoteProps } from './types';
import TiltedBadge from './TiltedBadge';

export const StickyNote: React.FC<StickyNoteProps> = ({
  title = 'Sprint Milestones',
  badgeLabel = 'URGENT',
  items,
  onToggleItem
}) => {
  const completedCount = items.filter(i => i.completed).length;

  return (
    <div className="kumo-sticky bg-[#fff5c8] rounded-[18px] p-5 shadow-[0_8px_24px_-4px_rgba(255,245,200,0.6)] border border-[#ffec99] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#ebd780]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#856404] text-[20px]">push_pin</span>
            <span className="text-[18px] font-bold text-[#533f03]">{title}</span>
          </div>
          {badgeLabel && (
            <TiltedBadge archetype="butter" label={badgeLabel} />
          )}
        </div>

        {/* Checklist */}
        <div className="py-4 space-y-3">
          {items.map((item) => (
            <label
              key={item.id}
              className="flex items-center gap-3 cursor-pointer group select-none"
            >
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleItem?.(item.id)}
                className="w-4 h-4 rounded border-amber-600 text-primary focus:ring-primary/30"
              />
              <span
                className={`text-[14px] text-[#533f03] transition-all ${
                  item.completed ? 'line-through opacity-75' : 'font-medium'
                }`}
              >
                {item.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-3 border-t border-[#ebd780] flex justify-between items-center text-[10px] font-mono text-[#856404]">
        <span>STICKY ARCHETYPE</span>
        <span>{completedCount} OF {items.length} COMPLETED</span>
      </div>
    </div>
  );
};

export default StickyNote;
