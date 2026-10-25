// ── ui/board/js/tools/design-tool.js: Mochi Companion & Theme Lab Widget ──

import { runSystemAction } from '../actions.js';

export function renderDesignHTML(card) {
  const mood = card.data.activeMood || 'Idle';
  const intensity = card.data.glowIntensity || 72;
  const activePalette = card.data.activePaletteIndex || 0;

  // Render mood-reactive SVG facial expressions
  let eyesHTML = '<circle cx="48" cy="54" fill="#4a3abe" r="3.5"/><circle cx="72" cy="54" fill="#4a3abe" r="3.5"/>';
  let mouthHTML = '<path d="M56 60C58 63 62 63 64 60" stroke="#4a3abe" stroke-linecap="round" stroke-width="2.5"/>';

  if (mood === 'Happy') {
    eyesHTML = '<path d="M44 54C46 51 50 51 52 54" stroke="#4a3abe" stroke-width="3" stroke-linecap="round"/><path d="M68 54C70 51 74 51 76 54" stroke="#4a3abe" stroke-width="3" stroke-linecap="round"/>';
    mouthHTML = '<path d="M54 60C56 65 64 65 66 60Z" fill="#ff7e67" stroke="#4a3abe" stroke-width="1.5"/>';
  } else if (mood === 'Thinking') {
    eyesHTML = '<circle cx="48" cy="51" fill="#4a3abe" r="3.5"/><circle cx="72" cy="51" fill="#4a3abe" r="3.5"/>';
    mouthHTML = '<circle cx="60" cy="62" r="3" fill="#4a3abe"/>';
  } else if (mood === 'Speaking') {
    eyesHTML = '<circle cx="48" cy="53" fill="#4a3abe" r="3.5"/><circle cx="72" cy="53" fill="#4a3abe" r="3.5"/>';
    mouthHTML = '<ellipse cx="60" cy="63" rx="5" ry="4" fill="#4a3abe"/>';
  }

  return `
    <!-- Peach Tint Header -->
    <header class="h-12 bg-tertiary-fixed/40 border-b border-tertiary-fixed/50 px-4 flex items-center justify-between select-none cursor-grab" data-drag-handle="${card.id}">
      <div class="flex items-center gap-2.5">
        <!-- Tactile Window Dots -->
        <div class="flex items-center gap-1.5">
          <div class="w-3 h-3 rounded-full bg-rose-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="del" title="Close"></div>
          <div class="w-3 h-3 rounded-full bg-amber-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" data-act="min" title="Minimize"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-400/80 shadow-inner hover:opacity-80 transition-opacity cursor-pointer" title="Zoom"></div>
        </div>
        <div class="w-7 h-7 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center shadow-xs ml-1">
          <span class="material-symbols-outlined text-[18px]">palette</span>
        </div>
        <h2 class="text-headline-sm font-headline-sm text-on-surface font-semibold card-title-text" title="Click to rename">${card.title || 'Mochi Companion & Theme Lab'}</h2>
        <span class="px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-tertiary-fixed text-on-tertiary-fixed-variant font-mono">Cotton Cloud v2.4</span>
      </div>
      <div class="flex items-center gap-3">
        <button class="design-sound-btn p-1 rounded-full text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" title="Toggle Companion Sounds">
          <span class="material-symbols-outlined text-[18px]">${card.data.soundEnabled !== false ? 'volume_up' : 'volume_off'}</span>
        </button>
        <span class="material-symbols-outlined text-secondary text-[18px]">drag_indicator</span>
      </div>
    </header>

    <!-- Body with Bento Columns -->
    <div class="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
      <!-- Mascot Interactive Preview Viewport -->
      <div class="md:col-span-5 bg-gradient-to-b from-primary-fixed/20 to-surface-container-low rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden ring-1 ring-outline-variant/30 min-h-[220px]">
        <!-- Glowing Aura Backdrop -->
        <div class="absolute w-40 h-40 bg-primary-fixed/60 rounded-full blur-3xl pointer-events-none"></div>

        <!-- SVG Vector Mascot (Cotton Cloud) -->
        <div class="design-mascot-avatar relative z-10 flex flex-col items-center cursor-pointer group active:scale-95 transition-transform duration-300">
          <svg class="w-28 h-28 drop-shadow-lg transition-transform group-hover:scale-105 duration-200" fill="none" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
            <!-- Cloud Body Base -->
            <path d="M30 75C22 75 16 68 16 60C16 52 22 46 29 45C30 33 41 24 53 25C62 25 70 31 73 38C76 36 80 35 84 36C93 37 100 44 100 53C104 56 106 61 104 66C102 72 97 75 91 75L30 75Z" fill="#ffffff" stroke="#c6bfff" stroke-width="2.5"/>
            <!-- Dynamic Eyes -->
            ${eyesHTML}
            <!-- Blushing Cheeks -->
            <ellipse cx="42" cy="58" fill="#ffdad4" rx="4" ry="2.5"/>
            <ellipse cx="78" cy="58" fill="#ffdad4" rx="4" ry="2.5"/>
            <!-- Dynamic Mouth -->
            ${mouthHTML}
          </svg>
          <div class="mt-2 text-center">
            <span class="text-label-sm font-label-sm font-semibold text-primary">Mochi The Coordinator</span>
            <p class="text-body-sm font-body-sm text-secondary">State: <span class="font-semibold text-primary">${mood}</span> • Click to tickle</p>
          </div>
        </div>

        <!-- Mood State Indicator Chips -->
        <div class="flex items-center gap-1.5 mt-4 z-10">
          ${['Idle', 'Thinking', 'Happy', 'Speaking'].map((m) => `
            <button class="design-mood-chip px-2.5 py-0.5 rounded-full text-label-sm font-label-sm transition-all active:scale-95 ${mood === m ? 'bg-primary-fixed text-primary font-semibold shadow-xs ring-1 ring-primary/40' : 'bg-surface-container text-secondary hover:text-on-surface'}" data-mood="${m}">
              ${m}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Color Wheel & Token Harmonizer Controls -->
      <div class="md:col-span-7 flex flex-col justify-between gap-4">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-headline-sm font-headline-sm text-on-surface font-semibold">Curated Pastel Swatches</h3>
            <span class="text-label-sm font-label-sm text-secondary font-mono">TOKENS LINKED: 12</span>
          </div>

          <!-- 5 Curated Pastel Swatches -->
          <div class="grid grid-cols-5 gap-2.5">
            ${[
              { name: 'Lilac',  hex: '#eadfff', bg: 'bg-purple-50', dot: '#eadfff' },
              { name: 'Sky',    hex: '#dcedff', bg: 'bg-blue-50/60', dot: '#dcedff' },
              { name: 'Matcha', hex: '#dcf5e7', bg: 'bg-emerald-50/60', dot: '#dcf5e7' },
              { name: 'Peach',  hex: '#ffe9d6', bg: 'bg-orange-50/60', dot: '#ffe9d6' },
              { name: 'Solar',  hex: '#fff5c8', bg: 'bg-amber-50/60', dot: '#fff5c8' },
            ].map((swatch, idx) => `
              <div class="design-swatch-card p-3 rounded-xl ${swatch.bg} ${activePalette === idx ? 'ring-2 ring-primary-container shadow-sm' : 'ring-1 ring-outline-variant/30 hover:ring-primary-container'} flex flex-col items-center gap-1 cursor-pointer transition-all active:scale-95" data-idx="${idx}" data-color="${swatch.hex}" title="Select ${swatch.name}">
                <div class="w-8 h-8 rounded-full shadow-sm border border-black/10" style="background-color: ${swatch.dot}"></div>
                <span class="text-label-sm font-label-sm text-on-surface font-semibold">${swatch.name}</span>
                <span class="text-[9px] font-mono text-secondary">${swatch.hex}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Spatial Depth & Glow Slider -->
        <div class="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2">
          <div class="flex items-center justify-between text-label-sm font-label-sm">
            <span class="text-on-surface font-medium">Ambient Refraction &amp; Glow Rim Intensity</span>
            <span class="design-glow-readout font-mono text-primary font-semibold">${intensity}% Blur / ${Math.round(intensity / 4.5)}px Diffusion</span>
          </div>
          <input class="design-glow-slider w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container" max="100" min="10" type="range" value="${intensity}"/>
        </div>

        <!-- Action Controls Row -->
        <div class="flex items-center justify-between pt-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-label-sm font-label-sm text-secondary font-mono">Tailwind CSS Variable Mappings: Verified</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="design-copy-tokens-btn px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-body-sm font-body-sm text-secondary font-medium transition-all active:scale-95">
              Copy Tokens
            </button>
            <button class="design-sync-tokens-btn flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary text-body-sm font-body-sm font-medium shadow-sm active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[18px]">sync_saved_locally</span>
              <span>Sync to Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function attachDesignEvents(el, card, onSave, onToast) {
  // Mood switches
  el.querySelectorAll('.design-mood-chip').forEach((btn) => {
    btn.onclick = () => {
      card.data.activeMood = btn.dataset.mood;
      el.innerHTML = renderDesignHTML(card);
      attachDesignEvents(el, card, onSave, onToast);
      onSave?.();
      onToast?.(`Mochi mood set to: ${card.data.activeMood}`);
    };
  });

  // Mascot tickle interaction
  el.querySelector('.design-mascot-avatar')?.addEventListener('click', () => {
    const moods = ['Happy', 'Speaking', 'Idle', 'Thinking'];
    const next = moods[(moods.indexOf(card.data.activeMood) + 1) % moods.length];
    card.data.activeMood = next;
    el.innerHTML = renderDesignHTML(card);
    attachDesignEvents(el, card, onSave, onToast);
    onSave?.();
    onToast?.(`Mochi: ${next}!`);
  });

  // Sound toggle
  el.querySelector('.design-sound-btn')?.addEventListener('click', () => {
    card.data.soundEnabled = card.data.soundEnabled === false ? true : false;
    onSave?.();
    onToast?.(card.data.soundEnabled ? 'Companion audio haptics enabled' : 'Companion audio muted');
    const icon = el.querySelector('.design-sound-btn .material-symbols-outlined');
    if (icon) icon.textContent = card.data.soundEnabled ? 'volume_up' : 'volume_off';
  });

  // Swatch selection
  el.querySelectorAll('.design-swatch-card').forEach((cardEl) => {
    cardEl.onclick = () => {
      const idx = parseInt(cardEl.dataset.idx, 10);
      card.data.activePaletteIndex = idx;
      el.querySelectorAll('.design-swatch-card').forEach((c) => {
        c.className = c.className.replace('ring-2 ring-primary-container shadow-sm', 'ring-1 ring-outline-variant/30 hover:ring-primary-container');
      });
      cardEl.className = cardEl.className.replace('ring-1 ring-outline-variant/30 hover:ring-primary-container', 'ring-2 ring-primary-container shadow-sm');
      onSave?.();
      onToast?.(`Palette: ${cardEl.dataset.color} applied`);
    };
  });

  // Glow Slider
  const slider = el.querySelector('.design-glow-slider');
  const readout = el.querySelector('.design-glow-readout');
  slider?.addEventListener('input', () => {
    const val = parseInt(slider.value, 10);
    card.data.glowIntensity = val;
    if (readout) readout.textContent = `${val}% Blur / ${Math.round(val / 4.5)}px Diffusion`;
    // Apply dynamic box-shadow across cards
    document.querySelectorAll('.kumo-canvas-card').forEach((c) => {
      c.style.boxShadow = `0px 1px 3px rgba(46,59,82,0.05), 0px ${Math.round(val / 6)}px ${Math.round(val / 2.5)}px -6px rgba(46,59,82,${(val / 700).toFixed(2)})`;
    });
    onSave?.();
  });

  // Copy CSS Tokens
  el.querySelector('.design-copy-tokens-btn')?.addEventListener('click', async () => {
    const tokens = `:root {\n  --kumo-primary: #4a3abe;\n  --kumo-primary-container: #6355d8;\n  --kumo-surface: #fbf8ff;\n  --kumo-glow: ${card.data.glowIntensity || 72}%;\n}`;
    await runSystemAction('clipboard.write', { text: tokens }, onToast);
    onToast?.('CSS tokens copied to clipboard');
  });

  // Sync to Canvas Tokens
  el.querySelector('.design-sync-tokens-btn')?.addEventListener('click', () => {
    onSave?.();
    onToast?.('✓ Synced design tokens across spatial workbench');
  });
}
