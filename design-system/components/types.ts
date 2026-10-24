/**
 * Kumo Design System — Component Type Definitions
 * RFC-2025 Warm Tactile Spatial Canvas
 */

import React from 'react';

export type Archetype = 'sky' | 'lilac' | 'mint' | 'peach' | 'butter';

export type ElevationLevel = 0 | 1 | 2 | 3;

export interface TiltedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  archetype?: Archetype | 'primary' | 'dark' | 'custom';
  label: string;
  icon?: string;
  className?: string;
}

export interface WorkbenchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  archetype: Archetype;
  title: string;
  badgeLabel?: string;
  iconName?: string;
  nodeId?: string;
  isFocused?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onClose?: () => void;
  onSettings?: () => void;
  children: React.ReactNode;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  isActive?: boolean;
}

export interface TopNavBarProps {
  version?: string;
  brandTitle?: string;
  navItems?: NavItem[];
  avatarUrl?: string;
  onSearch?: (query: string) => void;
  onNewTool?: () => void;
  onOpenNotifications?: () => void;
  onOpenSettings?: () => void;
}

export interface TerminalWellProps {
  title?: string;
  statusLabel?: string;
  isRunning?: boolean;
  commands?: {
    prompt: string;
    command: string;
    output?: React.ReactNode;
  }[];
  memoryFootprint?: string;
  onCopyCommand?: (cmd: string) => void;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface StickyNoteProps {
  title: string;
  badgeLabel?: string;
  items: ChecklistItem[];
  onToggleItem?: (id: string) => void;
}

export interface CompanionDockProps {
  shortcutHint?: string;
  zoomLevel?: string;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onFitScreen?: () => void;
  onResetZoom?: () => void;
}

export interface ColorSwatchProps {
  name: string;
  hex: string;
  rgb: string;
  contrastRatio: string;
  rating: 'AA' | 'AAA';
  comparison: string;
  onCopy?: (hex: string) => void;
}
