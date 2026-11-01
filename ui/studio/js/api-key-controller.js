// ─────────────────────────────────────────────────────────────
// ui/studio/js/api-key-controller.js — API Key Management
// ─────────────────────────────────────────────────────────────

import { setActiveStepTab } from './step-navigator.js';

export function updateKeyStatus(val) {
  const statusBadge = document.getElementById('key-status-badge');

  if (!val) {
    if (statusBadge) {
      statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container text-secondary border border-outline-variant/40 font-label-sm text-label-sm font-medium';
      statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]">key_off</span> Not Configured';
    }
  } else {
    if (statusBadge) {
      statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-label-sm font-semibold';
      statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]" style="font-variation-settings: \'FILL\' 1;">check_circle</span> Key Saved';
    }
  }

  const activePill = document.querySelector('.step-pill.bg-primary');
  const currentActiveNum = activePill ? parseInt(activePill.getAttribute('data-step-num'), 10) : 1;
  setActiveStepTab(currentActiveNum);
}

export async function setupApiKeySection() {
  const keyInput = document.getElementById('api-key-input');
  const toggleBtn = document.getElementById('btn-toggle-key-visibility');
  const toggleIcon = document.getElementById('key-visibility-icon');
  const retestBtn = document.getElementById('btn-retest-key');
  const statusBadge = document.getElementById('key-status-badge');

  // Initialize key status on load
  if (keyInput) {
    updateKeyStatus(keyInput.value.trim());
  }

  if (toggleBtn && keyInput && toggleIcon) {
    toggleBtn.addEventListener('click', () => {
      const isPass = keyInput.type === 'password';
      keyInput.type = isPass ? 'text' : 'password';
      toggleIcon.textContent = isPass ? 'visibility_off' : 'visibility';
    });
  }

  // Live save key on change
  if (keyInput) {
    keyInput.addEventListener('input', () => {
      const val = keyInput.value.trim();
      updateKeyStatus(val);
      if (window.goo?.saveSettings) {
        window.goo.saveSettings({ apiKey: val });
      }
    });
  }

  // Re-test button
  if (retestBtn) {
    retestBtn.addEventListener('click', async () => {
      const val = keyInput ? keyInput.value.trim() : '';
      if (statusBadge) {
        statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-label-sm text-label-sm font-semibold';
        statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px] animate-spin">sync</span> Validating...';
      }

      await new Promise(r => setTimeout(r, 600));

      if (!val) {
        if (statusBadge) {
          statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-label-sm text-label-sm font-semibold';
          statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]">error</span> Key Required';
        }
        updateKeyStatus('');
      } else {
        if (statusBadge) {
          statusBadge.className = 'flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-label-sm text-label-sm font-semibold';
          statusBadge.innerHTML = '<span class="material-symbols-outlined text-[13px]" style="font-variation-settings: \'FILL\' 1;">check_circle</span> Verified & Connected';
        }
        updateKeyStatus(val);
      }
    });
  }

  // External link handler
  document.getElementById('link-openrouter')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.goo?.openExternal) {
      window.goo.openExternal('https://openrouter.ai');
    } else {
      window.open('https://openrouter.ai', '_blank');
    }
  });
}

