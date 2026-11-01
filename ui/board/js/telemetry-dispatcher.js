// ============================================================
// ui/board/js/telemetry-dispatcher.js — Live Telemetry Update Handlers
// ============================================================

import { state } from './state.js';

export function applyLiveTelemetry(metrics) {
  if (!metrics) return;

  // 1. Update Telemetry Card
  const telemetryCard = state.cards.find((c) => c.type === 'telemetry');
  if (telemetryCard) {
    telemetryCard.data.ram = metrics.ram;
    telemetryCard.data.cpu = metrics.cpu;
    const ramText = document.querySelector(`#${telemetryCard.id} .telemetry-ram-text`);
    const ramBar = document.querySelector(`#${telemetryCard.id} .telemetry-ram-bar`);
    const ramSub = document.querySelector(`#${telemetryCard.id} .telemetry-ram-sub`);
    const cpuText = document.querySelector(`#${telemetryCard.id} .telemetry-cpu-text`);
    const cpuBar = document.querySelector(`#${telemetryCard.id} .telemetry-cpu-bar`);
    const cpuSub = document.querySelector(`#${telemetryCard.id} .telemetry-cpu-sub`);

    if (ramText && metrics.ram) ramText.textContent = `${metrics.ram.used} / ${metrics.ram.total} GB`;
    if (ramBar && metrics.ram) ramBar.style.width = `${metrics.ram.pct}%`;
    if (ramSub && metrics.ram) ramSub.textContent = `${metrics.ram.pct}% in active use`;
    if (cpuText && metrics.cpu) cpuText.textContent = `${metrics.cpu.count} Logical`;
    if (cpuSub && metrics.cpu) cpuSub.textContent = metrics.cpu.model;
    if (cpuBar && metrics.cpu) {
      const loadPct = Math.min(100, Math.max(8, Math.round(((metrics.cpu.load?.[0] || 0.4) / (metrics.cpu.count || 1)) * 100)));
      cpuBar.style.width = `${loadPct}%`;
    }
  }

  // 2. Update Network Card
  const networkCard = state.cards.find((c) => c.type === 'network');
  if (networkCard && metrics.network) {
    networkCard.data.ip = metrics.network.ip;
    networkCard.data.gateway = metrics.network.gateway;
    networkCard.data.dns = metrics.network.dns;
    const ipText = document.querySelector(`#${networkCard.id} .network-ip-text`);
    const gwText = document.querySelector(`#${networkCard.id} .network-gateway-text`);
    const dnsText = document.querySelector(`#${networkCard.id} .network-dns-text`);
    const pill = document.querySelector(`#${networkCard.id} .network-status-pill`);

    if (ipText) ipText.textContent = metrics.network.ip;
    if (gwText) gwText.textContent = metrics.network.gateway;
    if (dnsText) dnsText.textContent = metrics.network.dns;
    if (pill) {
      const ok = metrics.network.ip && metrics.network.ip !== '127.0.0.1';
      pill.textContent = ok ? 'Connected' : 'Loopback';
      pill.className = `px-2 py-0.5 rounded-full text-label-sm font-label-sm ${ok ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'} font-medium network-status-pill`;
    }
  }

  // 3. Update Workspace Card
  const workspaceCard = state.cards.find((c) => c.type === 'workspace');
  if (workspaceCard && metrics.env) {
    workspaceCard.data.repo = metrics.env.gitRepo || 'kumo';
    workspaceCard.data.branch = metrics.env.gitBranch || 'main';
    workspaceCard.data.nodeVersion = metrics.env.nodeVersion;
    workspaceCard.data.platform = metrics.env.platform === 'win32' ? 'Windows Native' : metrics.env.platform;

    const repoEl = document.querySelector(`#${workspaceCard.id} .workspace-repo-name`);
    const branchPill = document.querySelector(`#${workspaceCard.id} .workspace-branch-pill`);
    const branchDesc = document.querySelector(`#${workspaceCard.id} .workspace-branch-desc`);
    const envText = document.querySelector(`#${workspaceCard.id} .workspace-env-text`);
    const nodeText = document.querySelector(`#${workspaceCard.id} .workspace-node-text`);

    if (repoEl) repoEl.textContent = workspaceCard.data.repo;
    if (branchPill) branchPill.textContent = `Git ${workspaceCard.data.branch}`;
    if (branchDesc) branchDesc.textContent = `Branch: ${workspaceCard.data.branch}`;
    if (envText) envText.textContent = workspaceCard.data.platform;
    if (nodeText) nodeText.textContent = `Node ${workspaceCard.data.nodeVersion}`;
  }
}

