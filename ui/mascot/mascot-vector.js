// ─────────────────────────────────────────────────────────────
// KUMO VECTOR COMPANION ENGINE (ui/mascot/mascot-vector.js)
// Dynamic SVG companion engine with animated mood states:
// idle, speaking, listening, happy, thinking.
// Supports: Kumo Cloud, Cotton Cloud, Mochi Droplet, and Kubo Bot.
// Uses resilient self-contained styling (works without Tailwind).
// ─────────────────────────────────────────────────────────────

export const VECTOR_PALETTES = {
  lilac:  { name: 'Lilac', main: '#a78bfa', rim: '#7c3aed', shine: '#ede9fe', tint: '#eadfff' },
  sky:    { name: 'Sky',   main: '#29b6f6', rim: '#1976d2', shine: '#e1f5fe', tint: '#dcedff' },
  matcha: { name: 'Matcha',main: '#34d399', rim: '#059669', shine: '#d1fae5', tint: '#dcf5e7' },
  peach:  { name: 'Peach', main: '#f472b6', rim: '#db2777', shine: '#fce7f3', tint: '#ffe9d6' },
  solar:  { name: 'Solar', main: '#fbbf24', rim: '#d97706', shine: '#fef3c7', tint: '#fff5c8' }
};

export function getVectorPalette(val) {
  if (typeof val === 'string') {
    const lower = val.toLowerCase().trim();
    if (VECTOR_PALETTES[lower]) return VECTOR_PALETTES[lower];
    for (const k in VECTOR_PALETTES) {
      const p = VECTOR_PALETTES[k];
      if (
        lower.includes(k) ||
        lower.includes(p.name.toLowerCase()) ||
        p.tint.toLowerCase() === lower ||
        p.main.toLowerCase() === lower
      ) {
        return p;
      }
    }
  }
  return VECTOR_PALETTES.lilac;
}

function getKumoCloudSvg(mood, pal, blushVal) {
  const blushOpacity = Math.max(0.15, (blushVal / 100) * 0.9);
  let mouthPath = 'M114 116 Q120 126 126 116';
  let eyesSvg = `
    <path d="M85 106 C85 96 99 96 99 106" stroke="#171b2b" stroke-linecap="round" stroke-width="4.5"></path>
    <circle cx="89" cy="100" fill="#ffffff" r="1.5"></circle>
    <path d="M141 106 C141 96 155 96 155 106" stroke="#171b2b" stroke-linecap="round" stroke-width="4.5"></path>
    <circle cx="145" cy="100" fill="#ffffff" r="1.5"></circle>
  `;
  let sparklesSvg = `
    <path d="M198 42 L202 30 L206 42 L218 46 L206 50 L202 62 L198 50 L186 46 Z" fill="${pal.main}" opacity="0.9"></path>
    <circle cx="218" cy="28" fill="${pal.main}" r="2.5"></circle>
  `;
  let animClass = 'animate-mochi';

  if (mood === 'happy') {
    mouthPath = 'M112 114 Q120 130 128 114 Z';
    animClass = 'animate-bounce';
    sparklesSvg += `
      <circle cx="45" cy="40" fill="${pal.main}" r="3.5" opacity="0.8"></circle>
      <circle cx="195" cy="140" fill="${pal.main}" r="3" opacity="0.8"></circle>
    `;
  } else if (mood === 'speaking') {
    mouthPath = 'M112 114 Q120 128 128 114 Z';
    animClass = 'animate-pulse';
  } else if (mood === 'thinking') {
    eyesSvg = `
      <circle cx="92" cy="98" r="6" fill="#171b2b"></circle>
      <circle cx="94" cy="96" r="2" fill="#ffffff"></circle>
      <circle cx="148" cy="98" r="6" fill="#171b2b"></circle>
      <circle cx="150" cy="96" r="2" fill="#ffffff"></circle>
    `;
    sparklesSvg += `
      <circle cx="180" cy="22" fill="${pal.main}" r="4" opacity="0.9"></circle>
      <circle cx="166" cy="12" fill="${pal.main}" r="2.5" opacity="0.7"></circle>
    `;
  }

  return `
    <div class="vector-mascot-inner" style="width:150px; height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; pointer-events:none; user-select:none;">
      <div class="vector-mascot-frame ${animClass}" style="width:145px; height:120px; display:flex; align-items:center; justify-content:center; position:relative;">
        <svg style="width:100%; height:100%; overflow:visible; display:block; filter:drop-shadow(0px 8px 16px ${pal.main}45);" fill="none" viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cloudBodyGradOverlay" x1="20" x2="220" y1="20" y2="180" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stop-color="#ffffff"></stop>
              <stop offset="45%" stop-color="${pal.tint}"></stop>
              <stop offset="100%" stop-color="${pal.main}"></stop>
            </linearGradient>
            <radialGradient id="blushLeftOverlay" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(72 122) scale(18 11)">
              <stop offset="0%" stop-color="#ff7e67" stop-opacity="${blushOpacity}"></stop>
              <stop offset="100%" stop-color="#ff7e67" stop-opacity="0"></stop>
            </radialGradient>
            <radialGradient id="blushRightOverlay" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(168 122) scale(18 11)">
              <stop offset="0%" stop-color="#ff7e67" stop-opacity="${blushOpacity}"></stop>
              <stop offset="100%" stop-color="#ff7e67" stop-opacity="0"></stop>
            </radialGradient>
          </defs>
          <path d="M70 170 C40 170 20 145 20 115 C20 85 45 68 70 68 C76 40 105 20 135 22 C165 24 185 45 192 68 C215 70 230 90 230 115 C230 145 210 170 175 170 Z" fill="url(#cloudBodyGradOverlay)" stroke="#ffffff" stroke-width="3"></path>
          <path d="M80 62 C105 32 145 32 170 58" opacity="0.85" stroke="#ffffff" stroke-linecap="round" stroke-width="4"></path>
          <ellipse cx="72" cy="122" fill="url(#blushLeftOverlay)" rx="18" ry="11"></ellipse>
          <ellipse cx="168" cy="122" fill="url(#blushRightOverlay)" rx="18" ry="11"></ellipse>
          ${eyesSvg}
          <path d="${mouthPath}" stroke="#171b2b" stroke-linecap="round" stroke-width="3.5" fill="${mood === 'happy' || mood === 'speaking' ? '#171b2b' : 'none'}"></path>
          ${sparklesSvg}
        </svg>
      </div>
      <div class="vector-mascot-shadow animate-mochi-shadow" style="width:100px; height:10px; border-radius:9999px; filter:blur(4px); margin-top:-2px; background-color: ${pal.main}35;"></div>
    </div>
  `;
}

function getCottonCloudSvg(mood, pal, blushVal) {
  const blushOpacity = Math.max(0.15, (blushVal / 100) * 0.9);
  let eyesSvg = `
    <circle cx="68" cy="54" r="4.5" fill="#2E3B52" />
    <circle cx="102" cy="54" r="4.5" fill="#2E3B52" />
    <circle cx="69.5" cy="52.5" r="1.5" fill="#FFFFFF" />
    <circle cx="103.5" cy="52.5" r="1.5" fill="#FFFFFF" />
  `;
  let mouthPath = 'M80 61C82.5 64.5 87.5 64.5 90 61';
  let animClass = 'animate-mochi';

  if (mood === 'happy') {
    mouthPath = 'M80 60C82 66 88 66 90 60 Z';
    animClass = 'animate-bounce';
  } else if (mood === 'speaking') {
    mouthPath = 'M81 60C81 65 89 65 89 60 Z';
    animClass = 'animate-pulse';
  } else if (mood === 'thinking') {
    eyesSvg = `
      <circle cx="68" cy="52" r="4.5" fill="#2E3B52" />
      <circle cx="102" cy="52" r="4.5" fill="#2E3B52" />
      <circle cx="69" cy="50.5" r="1.5" fill="#FFFFFF" />
      <circle cx="103" cy="50.5" r="1.5" fill="#FFFFFF" />
    `;
  }

  return `
    <div class="vector-mascot-inner" style="width:150px; height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; pointer-events:none; user-select:none;">
      <div class="vector-mascot-frame ${animClass}" style="width:145px; height:120px; display:flex; align-items:center; justify-content:center; position:relative;">
        <svg style="width:100%; height:100%; overflow:visible; display:block; filter:drop-shadow(0px 8px 16px ${pal.main}40);" fill="none" viewBox="0 0 160 120" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cotton_grad_dyn" x1="72" y1="12" x2="72" y2="100" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FFFFFF" />
              <stop offset="0.5" stop-color="${pal.tint}" />
              <stop offset="1" stop-color="${pal.main}" />
            </linearGradient>
          </defs>
          <path d="M120 72C133.255 72 144 61.2548 144 48C144 35.8456 134.975 25.7981 123.279 24.2386C120.485 10.3707 108.204 0 93.5 0C82.1066 0 72.1388 6.27315 66.8601 15.5492C62.4638 13.2922 57.481 12 52.2 12C36.736 12 24.2 24.536 24.2 40C24.2 41.229 24.2793 42.4395 24.433 43.627C10.6698 46.126 0 58.1256 0 72.6C0 88.6163 12.9837 101.6 29 101.6H120C133.255 101.6 144 90.8548 144 77.6" fill="#FFFFFF" />
          <path d="M120 70C132.15 70 142 60.1503 142 48C142 36.8778 133.743 27.6833 123.042 26.252C120.486 13.5658 109.248 4 95.8 4C85.3748 4 76.2625 9.74088 71.4326 18.228C67.41 16.1627 62.8504 15 58 15C43.6406 15 32 26.6406 32 41C32 42.1246 32.0712 43.2329 32.2098 44.3197C19.6152 46.6063 10 57.5855 10 70.8C10 85.4355 21.8645 97.3 36.5 97.3H120C132.15 97.3 142 87.4503 142 75.3" fill="url(#cotton_grad_dyn)" />
          ${eyesSvg}
          <ellipse cx="59" cy="61" rx="6" ry="3.5" fill="#FF7E67" opacity="${blushOpacity}" />
          <ellipse cx="111" cy="61" rx="6" ry="3.5" fill="#FF7E67" opacity="${blushOpacity}" />
          <path d="${mouthPath}" stroke="#2E3B52" stroke-width="2.5" stroke-linecap="round" fill="${mood === 'happy' || mood === 'speaking' ? '#2E3B52' : 'none'}" />
        </svg>
      </div>
      <div class="vector-mascot-shadow animate-mochi-shadow" style="width:100px; height:10px; border-radius:9999px; filter:blur(4px); margin-top:-2px; background-color: ${pal.main}30;"></div>
    </div>
  `;
}

function getDropletSvg(mood, pal, blushVal) {
  const blushOpacity = Math.max(0.15, (blushVal / 100) * 0.9);
  let mouthPath = 'M60 80C62 83 66 83 68 80';
  let eyesSvg = `
    <ellipse cx="50" cy="74" rx="4" ry="6" fill="#1C3833" />
    <ellipse cx="78" cy="74" rx="4" ry="6" fill="#1C3833" />
    <circle cx="51.5" cy="72" r="1.5" fill="#FFFFFF" />
    <circle cx="79.5" cy="72" r="1.5" fill="#FFFFFF" />
  `;
  let animClass = 'animate-mochi';

  if (mood === 'happy') {
    eyesSvg = `
      <path d="M46 74L50 68L54 74" stroke="#1C3833" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M74 74L78 68L82 74" stroke="#1C3833" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    `;
    mouthPath = 'M59 79C61 84 67 84 69 79 Z';
    animClass = 'animate-bounce';
  } else if (mood === 'speaking') {
    mouthPath = 'M60 78C60 83 68 83 68 78 Z';
    animClass = 'animate-pulse';
  } else if (mood === 'thinking') {
    eyesSvg = `
      <ellipse cx="51" cy="71" rx="4" ry="5" fill="#1C3833" />
      <ellipse cx="79" cy="71" rx="4" ry="5" fill="#1C3833" />
      <circle cx="52" cy="69" r="1.5" fill="#FFFFFF" />
      <circle cx="80" cy="69" r="1.5" fill="#FFFFFF" />
    `;
  }

  return `
    <div class="vector-mascot-inner" style="width:150px; height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; pointer-events:none; user-select:none;">
      <div class="vector-mascot-frame ${animClass}" style="width:145px; height:120px; display:flex; align-items:center; justify-content:center; position:relative;">
        <svg style="width:100%; height:100%; overflow:visible; display:block; filter:drop-shadow(0px 8px 16px ${pal.main}45);" fill="none" viewBox="0 0 128 116" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="mochi_drop_dyn" x1="64" y1="6" x2="64" y2="108" gradientUnits="userSpaceOnUse">
              <stop stop-color="${pal.tint}" />
              <stop offset="0.55" stop-color="${pal.main}" />
              <stop offset="1" stop-color="${pal.rim}" />
            </linearGradient>
            <linearGradient id="mochi_inner_dyn" x1="64" y1="14" x2="64" y2="98" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FFFFFF" />
              <stop offset="0.6" stop-color="${pal.tint}" />
              <stop offset="1" stop-color="${pal.main}" />
            </linearGradient>
          </defs>
          <path d="M64 6C46 32 16 54 16 80C16 96.5685 37.4853 108 64 108C90.5147 108 112 96.5685 112 80C112 54 82 32 64 6Z" fill="url(#mochi_drop_dyn)" />
          <path d="M64 14C52 36 28 56 28 78C28 89.5 44 98 64 98C84 98 100 89.5 100 78C100 56 76 36 64 14Z" fill="url(#mochi_inner_dyn)" opacity="0.8" />
          <ellipse cx="46" cy="46" rx="14" ry="7" fill="#FFFFFF" opacity="0.8" transform="rotate(-30 46 46)" />
          ${eyesSvg}
          <path d="${mouthPath}" stroke="#1C3833" stroke-width="2.5" stroke-linecap="round" fill="${mood === 'happy' || mood === 'speaking' ? '#1C3833' : 'none'}" />
          <ellipse cx="40" cy="80" rx="5" ry="3" fill="#ff7e67" opacity="${blushOpacity}" />
          <ellipse cx="88" cy="80" rx="5" ry="3" fill="#ff7e67" opacity="${blushOpacity}" />
        </svg>
      </div>
      <div class="vector-mascot-shadow animate-mochi-shadow" style="width:100px; height:10px; border-radius:9999px; filter:blur(4px); margin-top:-2px; background-color: ${pal.main}35;"></div>
    </div>
  `;
}

function getKuboBotSvg(mood, pal, blushVal) {
  let eyesSvg = `
    <rect x="38" y="62" width="16" height="16" rx="4" fill="${pal.tint}" />
    <path d="M42 72L46 66L50 72" stroke="#171B2B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="76" y="62" width="16" height="16" rx="4" fill="${pal.tint}" />
    <path d="M80 72L84 66L88 72" stroke="#171B2B" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
  `;
  let mouthSvg = `<rect x="58" y="76" width="14" height="4" rx="2" fill="${pal.main}" />`;
  let animClass = 'animate-mochi';

  if (mood === 'happy') {
    animClass = 'animate-bounce';
    eyesSvg = `
      <rect x="38" y="60" width="16" height="16" rx="4" fill="${pal.main}" />
      <path d="M41 71L46 64L51 71" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="76" y="60" width="16" height="16" rx="4" fill="${pal.main}" />
      <path d="M79 71L84 64L89 71" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
    `;
    mouthSvg = `<rect x="56" y="75" width="18" height="6" rx="3" fill="${pal.tint}" stroke="${pal.main}" stroke-width="1.5" />`;
  } else if (mood === 'speaking') {
    animClass = 'animate-pulse';
    mouthSvg = `
      <rect x="54" y="74" width="4" height="8" rx="2" fill="${pal.main}" />
      <rect x="60" y="72" width="4" height="12" rx="2" fill="${pal.main}" />
      <rect x="66" y="75" width="4" height="7" rx="2" fill="${pal.main}" />
      <rect x="72" y="73" width="4" height="10" rx="2" fill="${pal.main}" />
    `;
  } else if (mood === 'thinking') {
    eyesSvg = `
      <rect x="38" y="62" width="16" height="16" rx="4" fill="${pal.tint}" />
      <circle cx="46" cy="70" r="3.5" fill="#171B2B" />
      <rect x="76" y="62" width="16" height="16" rx="4" fill="${pal.tint}" />
      <circle cx="84" cy="70" r="3.5" fill="#171B2B" />
    `;
    mouthSvg = `<circle cx="65" cy="78" r="3" fill="${pal.main}" />`;
  }

  return `
    <div class="vector-mascot-inner" style="width:150px; height:150px; display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; pointer-events:none; user-select:none;">
      <div class="vector-mascot-frame ${animClass}" style="width:145px; height:120px; display:flex; align-items:center; justify-content:center; position:relative;">
        <svg style="width:100%; height:100%; overflow:visible; display:block; filter:drop-shadow(0px 8px 16px ${pal.main}40);" fill="none" viewBox="0 0 130 140" xmlns="http://www.w3.org/2000/svg">
          <rect x="62" y="14" width="6" height="24" rx="3" fill="#525F77" />
          <circle cx="65" cy="12" r="10" fill="${pal.main}" opacity="0.45" />
          <circle cx="65" cy="12" r="6" fill="${pal.main}" stroke="#FFFFFF" stroke-width="2" />
          <rect x="15" y="36" width="100" height="88" rx="20" fill="#2E3B52" stroke="${pal.rim}" stroke-width="2" />
          <rect x="25" y="46" width="80" height="52" rx="14" fill="#171B2B" stroke="#3A475F" stroke-width="2" />
          ${eyesSvg}
          ${mouthSvg}
          <circle cx="35" cy="110" r="4" fill="${pal.main}" />
          <circle cx="47" cy="110" r="4" fill="#FB7185" />
          <text x="70" y="113" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="600" fill="#8A92A6" letter-spacing="1">KUBO-04</text>
        </svg>
      </div>
      <div class="vector-mascot-shadow animate-mochi-shadow" style="width:100px; height:10px; border-radius:9999px; filter:blur(4px); margin-top:-2px; background-color: ${pal.main}30;"></div>
    </div>
  `;
}

export class MascotVector {
  constructor(container, options = {}) {
    this.container = container;
    this.engine = options.engine || 'kumo';
    this.state = options.state || 'idle';
    this.palette = options.palette || 'lilac';
    this.blush = typeof options.blush === 'number' ? options.blush : 75;
    this.render();
  }

  setEngine(engine) {
    this.engine = engine;
    this.render();
  }

  setState(state) {
    this.state = state;
    this.render();
  }

  setPalette(nameOrHex) {
    this.palette = nameOrHex;
    this.render();
  }

  setBlush(val) {
    this.blush = typeof val === 'number' ? (val <= 1 ? val * 100 : val) : 75;
    this.render();
  }

  triggerPoke() {
    const el = this.container?.querySelector('.vector-mascot-inner');
    if (el) {
      el.style.transform = 'scale(0.88, 1.12)';
      setTimeout(() => {
        el.style.transform = 'scale(1.08, 0.92)';
        setTimeout(() => {
          el.style.transform = 'scale(1, 1)';
        }, 150);
      }, 150);
    }
  }

  render() {
    if (!this.container) return;
    const pal = getVectorPalette(this.palette);
    const blushVal = typeof this.blush === 'number' ? (this.blush <= 1 ? this.blush * 100 : this.blush) : 75;

    let html = '';
    if (this.engine === 'cotton') {
      html = getCottonCloudSvg(this.state, pal, blushVal);
    } else if (this.engine === 'droplet') {
      html = getDropletSvg(this.state, pal, blushVal);
    } else if (this.engine === 'kubo') {
      html = getKuboBotSvg(this.state, pal, blushVal);
    } else {
      html = getKumoCloudSvg(this.state, pal, blushVal);
    }

    this.container.innerHTML = html;
  }

  start() {}
  destroy() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
