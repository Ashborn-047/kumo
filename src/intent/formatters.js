// ============================================================
// src/intent/formatters.js — Action Result Presentation
// ============================================================

function formatOfflineSuccess(action, args, result) {
  switch (action) {
    case 'app.open':
      return `Opening ${args.name}...`;
    case 'folder.open':
      return `Opened ${args.folderPath}`;
    case 'url.open':
      return `Opening ${args.url}`;
    case 'clipboard.read':
      return `Clipboard: "${result.result?.text || '(empty)'}"`;
    case 'clipboard.write':
      return `Copied to clipboard!`;
    case 'file.search': {
      const files = result.result?.results || [];
      return files.length
        ? `Found ${files.length} file(s):\n${files.slice(0, 5).join('\n')}`
        : `No matching files found.`;
    }
    case 'system.time':
      return `⏰ ${result.result?.time}`;
    case 'system.date':
      return `📅 ${result.result?.date}`;
    case 'system.info': {
      const r = result.result || {};
      return `💻 ${r.hostname || 'PC'}: ${r.totalMem} RAM, ${r.cpus} CPUs (${r.arch})`;
    }
    case 'system.lock':
      return `Workstation screen locked!`;
    case 'system.tasks': {
      const tasks = result.result?.tasks || [];
      if (!tasks.length) return `No active foreground tasks retrieved.`;
      const formatted = tasks.map(t => `* ${t.Name || 'App'}: ${t.MainWindowTitle ? `"${t.MainWindowTitle.slice(0, 35)}"` : ''} (${t.MemoryMB || 0} MB)`).join('\n');
      return `**Top Running Tasks**:\n${formatted}`;
    }
    case 'powershell.read':
      return `Output:\n${result.result?.output || '(no output)'}`;
    case 'powershell.write':
      return `Executed task:\n${result.result?.output || '(completed)'}`;
    case 'app.interact':
      return args?.text
        ? `Sent prompt to ${args.targetApp}: "${args.text.slice(0, 45)}..."`
        : `Pasted clipboard into ${args.targetApp}!`;
    case 'file.write':
      return `Saved note to: ${result.result?.path || 'Desktop\\Kumo_Notes'}`;
    case 'media.playPause':
      return `Toggled Spotify/Media (Play/Pause)!`;
    case 'media.next':
      return `Skipped to next track!`;
    case 'media.previous':
      return `Rewound to previous track!`;
    case 'media.mute':
      return `Toggled audio mute!`;
    case 'media.volUp':
      return `Volume raised!`;
    case 'media.volDown':
      return `Volume lowered!`;
    case 'mascot.sleep':
      return `Kumo is going to sleep! Summon me anytime from Kumoboard, system tray, or Ctrl+Shift+K.`;
    case 'process.kill':
      return `Closed ${args.name}!`;
    case 'app.deepLink':
      return result.result?.opened
        ? `Dispatched deep link: ${result.result.opened}`
        : `Dispatched deep link protocol!`;
    case 'office.create':
      return `Created new ${args.type || 'Office'} document: "${args.title || 'Document'}" at:\n${result.result?.path || 'Documents\\Kumo_Docs'}`;
    case 'compound.sequence':
      return `Executed compound sequence (${result.result?.stepResults?.length || 0} steps)!`;
    default:
      return `Done!`;
  }
}

function formatActionResult(type, args, result) {
  if (!result.ok) {
    return `\n[Error] ${result.error || 'Action could not be executed'}`;
  }

  switch (type) {
    case 'clipboard.read':
      return `\nClipboard: "${result.result?.text || '(empty)'}"`;
    case 'file.search': {
      const files = result.result?.results || [];
      return files.length
        ? `\nFound ${files.length} file(s):\n${files.slice(0, 3).join('\n')}`
        : `\nNo matching files found.`;
    }
    case 'system.time':
      return `\nTime: ${result.result?.time}`;
    case 'system.date':
      return `\nDate: ${result.result?.date}`;
    case 'system.info':
      return `\n${result.result?.totalMem} RAM, ${result.result?.cpus} CPUs (${result.result?.arch})`;
    case 'app.open':
      return `\nOpened: ${result.result?.opened}`;
    case 'folder.open':
      return `\nOpened: ${result.result?.opened}`;
    case 'url.open':
      return `\nOpened: ${result.result?.opened || args?.url}`;
    case 'process.kill':
      return `\nClosed: ${args?.name || 'Application'}`;
    case 'media.playPause':
      return `\nPlayback toggled`;
    case 'media.next':
      return `\nSkipped track`;
    case 'media.previous':
      return `\nPrevious track`;
    case 'media.mute':
      return `\nAudio mute toggled`;
    case 'media.volUp':
      return `\nVolume up`;
    case 'media.volDown':
      return `\nVolume down`;
    case 'file.write':
      return `\nSaved note: ${result.result?.path || 'Desktop\\Kumo_Notes'}`;
    case 'app.interact':
      return args?.text
        ? `\nSent prompt to ${args.targetApp}: "${args.text.slice(0, 45)}..."`
        : `\nPasted clipboard into ${args.targetApp}!`;
    case 'powershell.read':
      return `\nOutput: ${result.result?.output || '(no output)'}`;
    default:
      return `\nDone`;
  }
}

module.exports = {
  formatOfflineSuccess,
  formatActionResult,
};
