// ============================================================
// ui/board/js/board-modals.js — Filters, Topbar Actions & Permissions
// ============================================================

import { state } from './state.js';
import { renderCards } from './card-renderer.js';
import { addNewTool } from './tool-factory.js';
import { toast } from './storage.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

export function initFilters() {
  $$('.nav-filter-btn').forEach((btn) => {
    btn.onclick = () => {
      $$('.nav-filter-btn').forEach((b) => {
        b.className = 'nav-filter-btn text-secondary dark:text-secondary-fixed hover:text-on-surface dark:hover:text-inverse-on-surface rounded-lg px-2.5 py-1 transition-all text-label-md font-label-md flex items-center gap-1.5 hover:bg-surface-container-high/60 active:scale-95 cursor-pointer';
      });
      btn.className = 'nav-filter-btn text-primary dark:text-inverse-primary bg-primary-fixed dark:bg-primary-container font-semibold rounded-lg px-2.5 py-1 transition-all text-label-md font-label-md flex items-center gap-1.5 active:scale-95 cursor-pointer';
      state.activeFilter = btn.dataset.filter;
      renderCards();
    };
  });
}

export function initFloatingActions() {
  const addBtn = $('#btn-add-tool');
  const popover = $('#popover-add-tool');

  if (addBtn && popover) {
    addBtn.onclick = (e) => {
      e.stopPropagation();
      popover.classList.toggle('hidden');
    };

    document.addEventListener('click', (e) => {
      if (!popover.contains(e.target) && !addBtn.contains(e.target)) {
        popover.classList.add('hidden');
      }
    });

    popover.querySelectorAll('.add-tool-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const type = opt.dataset.type;
        addNewTool(type);
        popover.classList.add('hidden');
      });
    });
  }

  const btnToggleMascot = $('#btn-toggle-mascot');
  const iconMascot = $('#icon-mascot-status');
  const labelMascot = $('#label-mascot-status');

  function updateMascotUI(visible) {
    if (visible) {
      if (iconMascot) iconMascot.textContent = 'cloud';
      if (labelMascot) labelMascot.textContent = 'Mascot ON';
      btnToggleMascot?.classList.add('bg-purple-50', 'text-purple-800');
      btnToggleMascot?.classList.remove('bg-surface-container-high', 'text-secondary');
    } else {
      if (iconMascot) iconMascot.textContent = 'cloud_off';
      if (labelMascot) labelMascot.textContent = 'Mascot OFF';
      btnToggleMascot?.classList.remove('bg-purple-50', 'text-purple-800');
      btnToggleMascot?.classList.add('bg-surface-container-high', 'text-secondary');
    }
  }

  if (window.goo?.isOverlayVisible) {
    window.goo.isOverlayVisible().then(updateMascotUI).catch(() => {});
  }

  btnToggleMascot?.addEventListener('click', async () => {
    if (window.goo?.toggleOverlay) {
      const isVisible = await window.goo.toggleOverlay();
      updateMascotUI(isVisible);
      toast(isVisible ? 'Kumo Mascot summoned' : 'Kumo Mascot sent to sleep');
    }
  });

  $('#btn-settings')?.addEventListener('click', () => {
    window.goo?.openStudio?.('studio');
  });

  $('#btn-permissions')?.addEventListener('click', () => {
    openPermissionsModal();
  });

  $$('.topbar-quick-app').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const appKey = btn.dataset.app;
      toast(`Assistant launching ${appKey}…`);
      try {
        const res = await window.goo?.action?.('app.open', { name: appKey });
        if (res?.ok) {
          toast(`Checked ${appKey} launched`);
        } else if (res?.error) {
          toast(`Alert: ${res.error}`);
        }
      } catch (err) {
        toast(`Could not open ${appKey}`);
      }
    });
  });
}

export async function openPermissionsModal() {
  const modal = $('#modal-permissions');
  if (!modal) return;
  modal.classList.remove('hidden');

  try {
    const cfg = await window.goo?.getSettings?.();
    const perms = cfg?.permissions || {};
    if ($('#perm-app-launch')) $('#perm-app-launch').checked = perms.appLaunch !== false;
    if ($('#perm-clipboard'))  $('#perm-clipboard').checked  = perms.clipboardAccess !== false;
    if ($('#perm-shell'))      $('#perm-shell').checked      = perms.shellSandbox !== false;
    if ($('#perm-files'))      $('#perm-files').checked      = perms.fileSearch !== false;
    if ($('#perm-system'))     $('#perm-system').checked     = perms.systemInfo !== false;

    const islandCfg = cfg?.island || {};
    if ($('#setting-island-edge'))  $('#setting-island-edge').value = islandCfg.edge || 'top';
    if ($('#setting-island-style')) $('#setting-island-style').value = islandCfg.style || 'seamless';
  } catch (err) {
    console.warn('Failed to load permissions:', err);
  }
}

export function closePermissionsModal() {
  const modal = $('#modal-permissions');
  if (modal) modal.classList.add('hidden');
  const testOut = $('#perm-test-output');
  if (testOut) testOut.classList.add('hidden');
}

export function initPermissionsModal() {
  $('#btn-close-permissions')?.addEventListener('click', closePermissionsModal);
  $('#btn-cancel-permissions')?.addEventListener('click', closePermissionsModal);

  $('#modal-permissions')?.addEventListener('click', (e) => {
    if (e.target.id === 'modal-permissions') closePermissionsModal();
  });

  $('#btn-save-permissions')?.addEventListener('click', async () => {
    const updated = {
      appLaunch:       $('#perm-app-launch')?.checked ?? true,
      clipboardAccess: $('#perm-clipboard')?.checked ?? true,
      shellSandbox:    $('#perm-shell')?.checked ?? true,
      fileSearch:      $('#perm-files')?.checked ?? true,
      systemInfo:      $('#perm-system')?.checked ?? true,
      browserOpen:     true,
    };
    const selectedEdge = $('#setting-island-edge')?.value || 'top';
    const selectedStyle = $('#setting-island-style')?.value || 'seamless';
    try {
      await window.goo?.saveSettings?.({
        permissions: updated,
        island: {
          enabled: true,
          edge: selectedEdge,
          style: selectedStyle,
          soundHaptics: true,
        }
      });
      if (window.goo?.islandSnapEdge) {
        window.goo.islandSnapEdge(selectedEdge);
      }
      toast('Assistant & Pulse Island settings updated & active');
      closePermissionsModal();
    } catch (err) {
      toast('Failed to save permissions');
    }
  });

  $('#btn-reset-permissions')?.addEventListener('click', () => {
    if ($('#perm-app-launch')) $('#perm-app-launch').checked = true;
    if ($('#perm-clipboard'))  $('#perm-clipboard').checked  = true;
    if ($('#perm-shell'))      $('#perm-shell').checked      = true;
    if ($('#perm-files'))      $('#perm-files').checked      = true;
    if ($('#perm-system'))     $('#perm-system').checked     = true;
    toast('Permissions reset to recommended defaults');
  });

  $$('.test-perm-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const act = btn.dataset.action;
      const testOut = $('#perm-test-output');
      if (!testOut) return;
      testOut.classList.remove('hidden');
      testOut.textContent = `[Testing ${act}...] Executing through Safety Gate...`;

      try {
        let res;
        if (act === 'app') {
          res = await window.goo?.action?.('app.open', { name: btn.dataset.name || 'calc' });
        } else if (act === 'clipboard') {
          res = await window.goo?.action?.('clipboard.read');
        } else if (act === 'system') {
          res = await window.goo?.action?.('system.info');
        }
        testOut.textContent = JSON.stringify(res, null, 2);
      } catch (err) {
        testOut.textContent = `Error: ${err.message}`;
      }
    });
  });
}

