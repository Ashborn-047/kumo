/**
 * Kumo Design System Showcase — Micro-Interactions, Telemetry & Modular Section Loader
 * RFC-2025 Warm Tactile Spatial Canvas
 */

(function () {
  'use strict';

  // ── 1. Modular Section Loader (data-include) ──
  async function loadModularSections() {
    const includeElements = document.querySelectorAll('[data-include]');
    if (!includeElements.length) {
      setupInteractions();
      return;
    }

    const loadPromises = Array.from(includeElements).map(async (el) => {
      const file = el.getAttribute('data-include');
      if (!file) return;
      try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`HTTP ${response.status} loading ${file}`);
        const html = await response.text();
        el.outerHTML = html;
      } catch (err) {
        console.warn('Error loading modular section:', file, err);
      }
    });

    await Promise.all(loadPromises);
    setupInteractions();
  }

  // ── 2. Clipboard Copy with Tactile Toast Notification ──
  window.copyToken = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
    showToast(text);
  };

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (e) {
      console.warn('Fallback copy failed:', e);
    }
    document.body.removeChild(textArea);
  }

  function showToast(text) {
    const toast = document.getElementById('copy-toast');
    const toastMsg = document.getElementById('copy-toast-msg');
    if (!toast) return;

    if (toastMsg) {
      toastMsg.innerText = 'Copied: ' + text;
    }
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');

    if (window._copyToastTimer) clearTimeout(window._copyToastTimer);
    window._copyToastTimer = setTimeout(() => {
      toast.classList.remove('opacity-100');
      toast.classList.add('opacity-0', 'pointer-events-none');
    }, 2200);
  }

  // ── 3. Keyboard Shortcuts (Cmd+K / Ctrl+K) ──
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('input[type="text"]');
      if (searchInput) {
        searchInput.focus();
        showToast('Search palette focused (Cmd+K)');
      }
    }
  });

  // ── 4. Interactive Component Sandbox Controls ──
  function setupInteractions() {
    // Range Slider for Frosted Blur
    const blurSlider = document.querySelector('input[type="range"]');
    const blurDisplay = blurSlider?.parentElement?.querySelector('.font-bold');
    if (blurSlider && blurDisplay) {
      blurSlider.addEventListener('input', (e) => {
        blurDisplay.textContent = `${e.target.value}px`;
      });
    }

    // Coordinate Snapping Toggle
    const snapToggle = document.querySelector('input[type="checkbox"].peer');
    if (snapToggle) {
      snapToggle.addEventListener('change', (e) => {
        const status = e.target.checked ? '24px Grid Snap Enabled' : 'Freeform Coordinate Pan';
        showToast(status);
      });
    }

    // Active Tool Card Interactive Demo
    const executeStreamBtn = document.querySelector('button[title="Execute Stream"]') ||
      Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Execute Stream'));
    if (executeStreamBtn) {
      executeStreamBtn.addEventListener('click', () => {
        showToast('Neural stream synthesis executed (0.42s)');
      });
    }
  }

  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModularSections);
  } else {
    loadModularSections();
  }
})();
