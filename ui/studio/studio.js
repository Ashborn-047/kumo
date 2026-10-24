// ============================================================
// studio.js — Kumo Studio Controller (Clean ES Module)
// ============================================================

import { createMascot } from '../mascot/index.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const P2 = [
  ['Sky', '#7dd3fc'],
  ['Peach', '#f472b6'],
  ['Lilac', '#c084fc'],
  ['Mint', '#6ee7b7'],
  ['Butter', '#fde047'],
  ['Cloud', '#e2e8f0'],
];

const P3 = [
  ['Classic Cyan', '#38bdf8', '#e0f7ff', '#7dd3fc'],
  ['Peach Pink', '#f472b6', '#ffe4f1', '#fbcfe8'],
  ['Grape Slime', '#a78bfa', '#f3e8ff', '#c4b5fd'],
  ['Mint Jelly', '#34d399', '#d1fae5', '#6ee7b7'],
];

const DEF = {
  apiKey: '',
  model: '',
  avatarType: '2d',
  style3d: 'smooth',
  palette: 'Sky',
  speed: 1.0,
  squish: 1.0,
  trackGaze: true,
  firstRun: true,
  bg: 'night',
  smile: true,
  blush: 0.6,
  autostart: false,
  startMinimized: true,
  theme: 'dark',
};

let activeAvatarType = '2d';
let active3DStyle = 'smooth';
let activePalette = 'Sky';
let activeBg = 'night';
let tab = 0;
let wiz = 0;
let currentMascotState = 'idle';
let studioMascot = null;

const speedSlider = $('#speed');
const squishSlider = $('#squish');
const gazeCheckbox = $('#gaze');
const kin = $('#api-key-input');
const wk = $('#wiz-key');

const pal = () => (activeAvatarType === '2d' ? P2 : P3);

function toast(t) {
  const e = $('#toast');
  e.textContent = t;
  e.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => e.classList.remove('on'), 2600);
}

function setTheme(t) {
  document.documentElement.dataset.theme = t;
  $('#themeLabel').textContent = 'Switch to ' + (t === 'dark' ? 'Light' : 'Dark');
}

function updateBadge() {
  const typeLabel =
    activeAvatarType === '2d'
      ? '2D Retro Cloud'
      : active3DStyle === 'voxel'
      ? '3D Voxel Bot'
      : '3D Smooth Mochi';
  const b = $('#stage-badge');
  if (b) b.textContent = `${typeLabel} · ${currentMascotState.toUpperCase()}`;
  const hint = $('#stage-hint');
  if (hint) {
    hint.textContent =
      activeAvatarType === '3d'
        ? '🖱️ Drag to rotate 360° • Click to poke • Scroll to zoom'
        : '🖱️ Click to poke • Eyes track cursor';
  }
}

function initMascotPreview() {
  const c = $('#studio-mascot-canvas');
  if (!c || studioMascot) return;
  studioMascot = createMascot(c, {
    type: activeAvatarType,
    state: 'idle',
    geometryMode: active3DStyle,
    palette: activePalette,
    speed: parseFloat(speedSlider.value || 1.0),
    squish: parseFloat(squishSlider.value || 1.0),
    trackGaze: true,
    smile: true,
  });

  c.addEventListener('click', () => {
    studioMascot?.triggerPoke();
  });
}

function sync() {
  if (!pal().some((p) => p[0] === activePalette)) activePalette = pal()[0][0];

  $('#pals').innerHTML = pal()
    .map(
      (p) =>
        `<button class="swc${p[0] === activePalette ? ' on' : ''}" data-pal="${p[0]}" style="--c:${p[1]}"><i></i>${p[0]}${
          p[2]
            ? `<s style="background:${p[2]}" title="Specular"></s><s style="background:${p[3]}" title="Rim light"></s>`
            : ''
        }</button>`
    )
    .join('');

  $('#palnote').textContent =
    activeAvatarType === '2d'
      ? '2D Pixel Cloud palette.'
      : '3D Mochi Bot palette. Small dots show specular and rim light.';

  $$('[data-av]').forEach((b) => b.classList.toggle('on', b.dataset.av === activeAvatarType));
  $$('[data-geo]').forEach((b) => b.classList.toggle('on', b.dataset.geo === active3DStyle));
  $$('[data-bg]').forEach((b) => b.classList.toggle('on', b.dataset.bg === activeBg));
  $$('.geo').forEach((g) => g.classList.toggle('dim', activeAvatarType !== '3d'));
  $('#sum').textContent = `${
    activeAvatarType === '2d' ? '2D Pixel Cloud' : '3D Mochi Bot'
  } · ${activePalette} · ${kin.value.trim() ? 'key connected' : 'no key yet'}`;

  updateBadge();

  const curPal = pal().find((p) => p[0] === activePalette);
  if (curPal && curPal[1]) {
    const glow = $('#stage-glow');
    if (glow) glow.style.background = `radial-gradient(circle, ${curPal[1]}55 0%, transparent 70%)`;
  }

  if (studioMascot) {
    studioMascot.setType(activeAvatarType);
    studioMascot.setPalette(activePalette);
    studioMascot.setGeometryMode(active3DStyle);
    const cvs = $('#studio-mascot-canvas');
    if (cvs) cvs.style.imageRendering = activeAvatarType === '2d' ? 'pixelated' : 'auto';
  }
}

const out = () => {
  $('#speedv').textContent = (+speedSlider.value).toFixed(2) + '×';
  $('#squishv').textContent = Math.round(squishSlider.value * 100) + '%';
  $('#blushv').textContent = $('#blush').value + '%';
  if (studioMascot) {
    studioMascot.setSpeed(parseFloat(speedSlider.value));
    studioMascot.setSquish(parseFloat(squishSlider.value));
  }
};

function go(i) {
  tab = i;
  $$('.panel').forEach((p) => p.classList.toggle('on', +p.dataset.p === i));
  $$('#nav .slink').forEach((b, j) => b.classList.toggle('on', j === i));
  sync();
}

function wz(i) {
  wiz = clamp(i, 0, 2);
  $$('.step').forEach((s) => s.classList.toggle('on', +s.dataset.w === wiz));
  $$('#dots i').forEach((d, j) => d.classList.toggle('on', j <= wiz));
  $('#back').style.visibility = wiz ? '' : 'hidden';
  $('#next').style.display = wiz < 2 ? '' : 'none';
  sync();
}

function chk(v) {
  const ok = /^sk-or-[\w-]{10,}$/.test(v);
  const e = $('#kst');
  e.className = 'st ' + (v ? (ok ? 'ok' : 'bad') : '');
  e.textContent = v
    ? ok
      ? 'Looks like a valid OpenRouter key'
      : 'OpenRouter keys start with sk-or-. Check for a typo.'
    : 'No key yet';
}

// Global click delegation
document.addEventListener('click', (e) => {
  const t = e.target.closest('[data-pal],[data-av],[data-geo],[data-bg],[data-ext],#nav .slink');
  if (!t) return;
  if (t.dataset.ext !== undefined) {
    e.preventDefault();
    window.goo?.openExternal ? window.goo.openExternal(t.href) : window.open(t.href, '_blank');
    return;
  }
  if (t.dataset.pal) activePalette = t.dataset.pal;
  if (t.dataset.av) activeAvatarType = t.dataset.av;
  if (t.dataset.geo) active3DStyle = t.dataset.geo;
  if (t.dataset.bg) activeBg = t.dataset.bg;
  if (t.closest('#nav')) return go($$('#nav .slink').indexOf(t));
  sync();
});

// Interactive state buttons
$$('.state-pill').forEach((btn) => {
  btn.onclick = () => {
    const st = btn.dataset.st;
    $$('.state-pill').forEach((b) => b.classList.remove('on'));
    btn.classList.add('on');
    currentMascotState = st;
    studioMascot?.setState(st);
    updateBadge();
  };
});

[speedSlider, squishSlider, $('#blush')].forEach((s) => (s.oninput = out));
[kin, wk].forEach(
  (el) =>
    (el.oninput = () => {
      kin.value = wk.value = el.value;
      chk(el.value.trim());
      sync();
    })
);

$('#eye').onclick = () => {
  kin.type = kin.type === 'password' ? 'text' : 'password';
};

$('#test').onclick = async () => {
  const e = $('#kst');
  e.className = 'st';
  e.textContent = 'Testing…';
  try {
    const r = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers: { Authorization: 'Bearer ' + kin.value.trim() },
    });
    e.className = 'st ' + (r.ok ? 'ok' : 'bad');
    e.textContent = r.ok ? 'Key verified' : 'OpenRouter rejected this key (' + r.status + ')';
  } catch {
    e.className = 'st bad';
    e.textContent = 'Could not reach OpenRouter. Check your connection.';
  }
};

$('#next').onclick = () => wz(wiz + 1);
$('#back').onclick = () => wz(wiz - 1);
$('#themeToggle').onclick = () =>
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');

async function saveAllSettings(isLaunch = false) {
  const o = {
    apiKey: kin.value.trim(),
    model: ($('#model-input')?.value || '').trim(),
    avatarType: activeAvatarType,
    style3d: active3DStyle,
    palette: activePalette,
    speed: parseFloat(speedSlider.value),
    squish: parseFloat(squishSlider.value),
    trackGaze: gazeCheckbox.checked,
    firstRun: false,
    bg: activeBg,
    smile: $('#smile').checked,
    blush: $('#blush').value / 100,
    autostart: $('#auto').checked,
    startMinimized: $('#mini').checked,
    theme: document.documentElement.dataset.theme,
  };

  if (isLaunch && window.goo?.launchCompanion) {
    await window.goo.launchCompanion(o);
  } else if (window.goo?.saveSettings) {
    await window.goo.saveSettings(o);
    window.goo.showOverlay?.();
    window.goo.closeStudio?.();
  } else {
    try {
      localStorage.kumo = JSON.stringify(o);
    } catch (_) {}
    if (isLaunch) {
      toast('✨ Launching Kumo Desktop Companion...');
      setTimeout(() => {
        window.location.href = '../overlay/index.html';
      }, 400);
    } else {
      toast('Saved locally.');
    }
  }
}

$('#save').onclick = () => saveAllSettings(false);
$('#launch').onclick = () => saveAllSettings(true);

// Boot
(async () => {
  let s = null;
  try {
    s = await window.goo?.getSettings();
  } catch (_) {}
  if (!s) {
    try {
      s = JSON.parse(localStorage.kumo);
    } catch (_) {}
  }
  s = { ...DEF, ...s };
  activeAvatarType = s.avatarType;
  active3DStyle = s.style3d;
  activePalette = s.palette;
  activeBg = s.bg;
  kin.value = wk.value = s.apiKey;
  const mIn = $('#model-input');
  if (mIn) mIn.value = s.model || '';
  speedSlider.value = s.speed;
  squishSlider.value = s.squish;
  gazeCheckbox.checked = s.trackGaze;
  $('#smile').checked = s.smile;
  $('#blush').value = Math.round(s.blush * 100);
  $('#auto').checked = s.autostart;
  $('#mini').checked = s.startMinimized;
  setTheme(s.theme);
  chk(s.apiKey);
  out();
  initMascotPreview();
  go(s.firstRun ? 0 : 1);
  wz(0);
})();
