// ============================================================
// src/actions/registry.js — Safety-Gated Action Registry
// ============================================================

const { TIER } = require('./types');
const media = require('./media');
const system = require('./system');
const fileOps = require('./file-ops');
const appOps = require('./app-ops');

const ACTIONS = {
  // GREEN — safe reads
  'clipboard.read':   { tier: TIER.GREEN,  fn: fileOps.readClipboard },
  'clipboard.write':  { tier: TIER.GREEN,  fn: fileOps.writeClipboard },
  'file.search':      { tier: TIER.GREEN,  fn: fileOps.searchFiles },
  'url.open':         { tier: TIER.GREEN,  fn: fileOps.openUrl },
  'system.time':      { tier: TIER.GREEN,  fn: system.getTime },
  'system.date':      { tier: TIER.GREEN,  fn: system.getDate },
  'system.info':      { tier: TIER.GREEN,  fn: system.getSystemInfo },
  'media.playPause':  { tier: TIER.GREEN,  fn: () => media.sendMediaKey('Toggle') },
  'media.next':       { tier: TIER.GREEN,  fn: () => media.sendMediaKey('Next') },
  'media.previous':   { tier: TIER.GREEN,  fn: () => media.sendMediaKey('Prev') },
  'media.mute':       { tier: TIER.GREEN,  fn: () => media.sendMediaKey('Mute') },
  'media.volUp':      { tier: TIER.GREEN,  fn: () => media.sendMediaKey('VolumeUp') },
  'media.volDown':    { tier: TIER.GREEN,  fn: () => media.sendMediaKey('VolumeDown') },
  'media.status':     { tier: TIER.GREEN,  fn: media.getMediaStatus },
  'media.queue':      { tier: TIER.GREEN,  fn: media.getMediaQueue },
  'mascot.sleep':     { tier: TIER.GREEN,  fn: system.sleepMascot },

  // YELLOW — needs confirmation (or auto-confirm in settings)
  'app.open':          { tier: TIER.YELLOW, fn: appOps.openApp },
  'app.deepLink':      { tier: TIER.YELLOW, fn: appOps.openDeepLink },
  'app.interact':      { tier: TIER.YELLOW, fn: appOps.interactWithApp },
  'office.create':     { tier: TIER.YELLOW, fn: appOps.createOfficeDocument },
  'compound.sequence': { tier: TIER.YELLOW, fn: (args) => appOps.executeCompoundSequence(args, ACTIONS) },
  'folder.open':       { tier: TIER.YELLOW, fn: fileOps.openFolder },
  'powershell.read':  { tier: TIER.YELLOW, fn: system.runPowerShellReadOnly },
  'powershell.write': { tier: TIER.YELLOW, fn: system.runPowerShellCommand },
  'process.kill':     { tier: TIER.YELLOW, fn: system.killProcess },
  'file.write':       { tier: TIER.YELLOW, fn: fileOps.writeFileContent },
  'file.move':        { tier: TIER.YELLOW, fn: fileOps.moveFile },
  'system.tasks':     { tier: TIER.YELLOW, fn: system.getRunningTasks },
  'system.lock':      { tier: TIER.YELLOW, fn: system.lockWorkstation },

  // RED — always refused, never executed
  'file.delete':      { tier: TIER.RED },
  'registry.write':   { tier: TIER.RED },
  'software.install': { tier: TIER.RED },
  'exe.run':          { tier: TIER.RED },
};

module.exports = ACTIONS;

