/**
 * Kumo Design System — TerminalWell Component
 * Obsidian Dark Terminal / Execution Well with syntax highlighting and daemon status.
 */

import React from 'react';
import { TerminalWellProps } from './types';

export const TerminalWell: React.FC<TerminalWellProps> = ({
  title = 'powershell.exe — kumo-daemon',
  statusLabel = 'RUNNING',
  isRunning = true,
  commands = [
    {
      prompt: 'PS C:\\kumo\\system>',
      command: 'Get-ChildItem -Path ./tokens',
      output: (
        <div className="text-slate-300 pl-2 border-l border-slate-700 space-y-1">
          <p className="text-slate-400">Mode        LastWriteTime      Length Name</p>
          <p>d-----    Today 09:41 AM            <span className="text-[#dcedff]">archetypes</span></p>
          <p>-a----    Today 09:42 AM       4096 <span className="text-[#fff5c8]">tokens.json</span></p>
          <p>-a----    Today 09:43 AM       1824 <span className="text-[#ffe9d6]">tailwind.config.js</span></p>
        </div>
      )
    },
    {
      prompt: 'PS C:\\kumo\\system>',
      command: 'Invoke-RestMethod -Uri "api/sync"',
      output: <p className="text-emerald-400 font-semibold">&gt;&gt; 200 OK: 48 tokens broadcast to infinite canvas</p>
    }
  ],
  memoryFootprint = 'MEM: 41.8 MB',
  onCopyCommand
}) => {
  return (
    <div className="kumo-terminal bg-[#1e2530] rounded-[18px] p-5 shadow-[0_8px_24px_-4px_rgba(46,59,82,0.12)] border border-slate-700/60 flex flex-col justify-between">
      <div>
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff7e67]" />
            <div className="w-3 h-3 rounded-full bg-[#fff5c8]" />
            <div className="w-3 h-3 rounded-full bg-[#dcf5e7]" />
            <span className="text-[10px] font-mono text-slate-300 ml-2">{title}</span>
          </div>

          {isRunning && (
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              {statusLabel}
            </span>
          )}
        </div>

        {/* Terminal Script Lines */}
        <div className="py-4 space-y-3 font-mono text-[11px] leading-relaxed">
          {commands.map((cmd, idx) => (
            <div key={idx} className="space-y-1">
              <p className="text-slate-400">
                {cmd.prompt} <span className="text-[#dcedff]">{cmd.command}</span>
              </p>
              {cmd.output}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
        <span>{memoryFootprint}</span>
        {onCopyCommand && (
          <button
            className="text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
            onClick={() => onCopyCommand('Invoke-RestMethod -Uri api/sync')}
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">content_copy</span>
            Copy Command
          </button>
        )}
      </div>
    </div>
  );
};

export default TerminalWell;
