/**
 * Kumo Design System — TiltedBadge Component (JSX)
 * Tactile micro-badge with signature rotate(-2.5deg) and spring hover scaling.
 */

import React from 'react';

const ARCHETYPE_STYLES = {
  sky: 'bg-[#dcedff] text-[#1b5ba5] border-[#c5e1ff]',
  lilac: 'bg-[#eadfff] text-[#4a3abe] border-[#dac7ff]',
  mint: 'bg-[#dcf5e7] text-[#166534] border-[#b8edcc]',
  peach: 'bg-[#ffe9d6] text-[#b84a14] border-[#ffcfab]',
  butter: 'bg-[#fff5c8] text-[#856404] border-[#fee78b]',
  primary: 'bg-[#4a3abe] text-white border-transparent',
  dark: 'bg-[#1e2530] text-slate-200 border-slate-700'
};

export const TiltedBadge = ({
  archetype = 'primary',
  label,
  icon,
  className = '',
  style = {},
  ...rest
}) => {
  const colorClasses = ARCHETYPE_STYLES[archetype] || ARCHETYPE_STYLES.primary;

  return (
    <span
      className={`tilted-tag inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] leading-[14px] font-mono font-bold tracking-wider uppercase border shadow-2xs cursor-default ${colorClasses} ${className}`}
      style={{
        transform: 'rotate(-2.5deg)',
        transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
        ...style
      }}
      {...rest}
    >
      {icon && (
        <span className="material-symbols-outlined text-[12px] leading-none">
          {icon}
        </span>
      )}
      <span>{label}</span>
    </span>
  );
};

export default TiltedBadge;
