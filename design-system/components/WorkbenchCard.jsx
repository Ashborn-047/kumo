/**
 * Kumo Design System — WorkbenchCard Component (JSX)
 * Spatial canvas tool card with 48px functional pastel header & 18px corners.
 */

import React from 'react';
import TiltedBadge from './TiltedBadge';

const HEADER_STYLES = {
  sky: {
    bg: 'bg-[#dcedff]',
    border: 'border-[#c3dfff]',
    iconColor: 'text-[#1b5ba5]',
    defaultIcon: 'widgets'
  },
  lilac: {
    bg: 'bg-[#eadfff]',
    border: 'border-[#dac8ff]',
    iconColor: 'text-primary',
    defaultIcon: 'psychology'
  },
  mint: {
    bg: 'bg-[#dcf5e7]',
    border: 'border-[#bbf0cf]',
    iconColor: 'text-[#166534]',
    defaultIcon: 'terminal'
  },
  peach: {
    bg: 'bg-[#ffe9d6]',
    border: 'border-[#ffd2af]',
    iconColor: 'text-[#b84a14]',
    defaultIcon: 'palette'
  },
  butter: {
    bg: 'bg-[#fff5c8]',
    border: 'border-[#ffec99]',
    iconColor: 'text-[#856404]',
    defaultIcon: 'sticky_note_2'
  }
};

export const WorkbenchCard = ({
  archetype = 'lilac',
  title,
  badgeLabel,
  iconName,
  nodeId,
  isFocused = false,
  onDragStart,
  onClose,
  onSettings,
  children,
  className = '',
  ...rest
}) => {
  const meta = HEADER_STYLES[archetype] || HEADER_STYLES.lilac;
  const activeIcon = iconName || meta.defaultIcon;

  return (
    <div
      className={`kumo-card bg-white rounded-[18px] border border-outline-variant/30 shadow-[0_8px_24px_-4px_rgba(46,59,82,0.06)] overflow-hidden flex flex-col justify-between transition-all duration-200 ${
        isFocused ? 'ring-2 ring-primary/20 border-primary/40 -translate-y-1 shadow-[0_12px_32px_-6px_rgba(99,85,216,0.12)]' : 'hover:border-primary/30'
      } ${className}`}
      {...rest}
    >
      {/* 48px Functional Pastel Header */}
      <div
        className={`h-12 ${meta.bg} px-4 flex items-center justify-between border-b ${meta.border} select-none`}
        draggable={Boolean(onDragStart)}
        onDragStart={onDragStart}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="material-symbols-outlined text-secondary cursor-grab hover:text-on-surface text-[18px]"
            title="Drag Node"
          >
            drag_indicator
          </span>
          <div className={`w-6 h-6 rounded-md bg-white flex items-center justify-center ${meta.iconColor} shadow-2xs`}>
            <span className="material-symbols-outlined text-[16px]">{activeIcon}</span>
          </div>
          <span className="text-[18px] font-semibold text-on-surface leading-snug">{title}</span>
          {badgeLabel && (
            <TiltedBadge archetype={archetype} label={badgeLabel} />
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {onSettings && (
            <button
              onClick={onSettings}
              className="w-6 h-6 rounded-md hover:bg-white/60 flex items-center justify-center text-secondary transition-colors"
              title="Settings"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-md hover:bg-white/60 flex items-center justify-center text-secondary transition-colors"
              title="Collapse"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">remove</span>
            </button>
          )}
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ml-1" title="Node Online" />
        </div>
      </div>

      {/* Card Interior Body */}
      <div className="p-5 space-y-4">
        {children}

        {nodeId && (
          <div className="pt-2 border-t border-surface-container flex justify-end">
            <span className="text-[10px] font-mono text-secondary">ID: {nodeId}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkbenchCard;
