/**
 * Kumo Design System — TopNavBar Component (JSX)
 * Frosted Glass Floating Top Navigation Header (Level 3 Elevation)
 */

import React, { useState } from 'react';
import { DEFAULT_NAV_ITEMS } from './constants';

export const TopNavBar = ({
  version = 'v2.4 System Spec',
  brandTitle = 'Kumo',
  navItems = DEFAULT_NAV_ITEMS,
  avatarUrl = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_IEuCG4gwEUQ1NWZ6_J8HiGgfRo_PHmXx51dtvTIBBAkWA667piGh_j9gorjcKBHIBGoYADnFeHPvluiBjrt-QtgLtmjuT901shxdtGyLn49ho07krROVbWeBUPsDe9dYEukJSN6NlltoCh8r_i5g_5NukIGZkc1p9Lbj1tIs7BNeNCglw-Be_1szDQGIfKCm5WhkCvMdLUIo6Ai88XeMveyZdfu6VUPzfsY4r5CmxIf7T7v5D7RRNn_PFAk5OQmXkFoLhsj27Jk',
  onSearch,
  onNewTool,
  onOpenNotifications,
  onOpenSettings
}) => {
  const [searchVal, setSearchVal] = useState('');

  const handleSearchChange = (e) => {
    setSearchVal(e.target.value);
    onSearch?.(e.target.value);
  };

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50 flex items-center justify-between px-4 py-2.5 bg-white/70 backdrop-blur-md rounded-full shadow-lg shadow-on-surface/5 ring-1 ring-white/60">
      {/* Brand Anchor & Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">cloud</span>
          </div>
          <span className="text-[22px] font-bold text-on-surface tracking-tight font-display">{brandTitle}</span>
        </div>
        <span className="text-[10px] font-mono font-semibold bg-surface-container-high text-primary px-2 py-0.5 rounded-full border border-surface-variant">
          {version}
        </span>

        {/* Search Input on Left */}
        <div className="relative hidden lg:flex items-center ml-2">
          <span className="material-symbols-outlined text-secondary absolute left-2.5 text-[18px]">search</span>
          <input
            value={searchVal}
            onChange={handleSearchChange}
            className="pl-8 pr-12 py-1 bg-white border border-outline-variant/40 rounded-full text-[12px] text-on-surface placeholder:text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 shadow-2xs"
            placeholder="Search tokens, components... (Cmd+K)"
            type="text"
          />
          <span className="absolute right-2 text-[10px] font-mono text-secondary bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/30">
            ⌘K
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1 bg-surface-container-high/40 p-1 rounded-full border border-white/50">
        {navItems.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className={`rounded-full px-3 py-1.5 transition-all text-[11px] font-mono flex items-center gap-1.5 ${
              item.isActive
                ? 'text-primary bg-primary-fixed font-semibold shadow-2xs'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container-high/60'
            }`}
          >
            {item.icon && <span className="material-symbols-outlined text-[14px]">{item.icon}</span>}
            {item.label}
          </a>
        ))}
      </nav>

      {/* Trailing Actions & Profile */}
      <div className="flex items-center gap-2">
        {onNewTool && (
          <button
            onClick={onNewTool}
            className="hidden sm:inline-flex items-center gap-1 bg-primary text-white hover:bg-primary-container px-3.5 py-1.5 rounded-full text-[11px] font-mono font-semibold shadow-sm active:scale-95 transition-all cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            + New Tool
          </button>
        )}
        <button
          onClick={onOpenNotifications}
          className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer"
          title="Notifications"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:text-on-surface hover:bg-surface-container-high/60 transition-colors cursor-pointer"
          title="Settings"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>

        {/* Profile Avatar */}
        <div className="relative w-8 h-8 ml-1 rounded-full ring-2 ring-primary/20 overflow-hidden bg-primary-fixed flex items-center justify-center">
          <img
            className="w-full h-full object-cover"
            alt="Product Designer Avatar"
            src={avatarUrl}
          />
        </div>
      </div>
    </header>
  );
};

export default TopNavBar;
