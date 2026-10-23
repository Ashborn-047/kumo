// ============================================================
// goo.js — Mascot Animation Controller (Overlay)
// Organic blob mascot with physics, eye-tracking, breathing,
// and state expressions (idle, thinking, happy, talking).
// ============================================================

const canvas = document.getElementById('goo-canvas');
const ctx    = canvas.getContext('2d');

let COLOR = '#baa0ff';
const W = canvas.width;
const H = canvas.height;

// Mouse cursor relative to mascot center (for eye-tracking)
let mousePos = { x: 0, y: 0 };

window.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  mousePos.x = Math.max(-1, Math.min(1, (e.clientX - cx) / 80));
  mousePos.y = Math.max(-1, Math.min(1, (e.clientY - cy) / 80));
});

// Animation state
const state = {
  current: 'idle',   // idle | talking | thinking | happy | sleeping
  frame: 0,
  tick: 0,
  eyeOpen: true,
  blinkTimer: 0,
  breathScale: 1,
  breathDir: 1,
  talkMouth: 0,
};

function hexToRgb(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function drawBody(x, y, radius, color) {
  const { r, g, b } = hexToRgb(color);

  // Outer ambient glow
  const glow = ctx.createRadialGradient(x, y, radius * 0.2, x, y, radius * 1.55);
  glow.addColorStop(0, `rgba(${r},${g},${b},0.3)`);
  glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, radius * 1.55, 0, Math.PI * 2);
  ctx.fill();

  // Highlight 3D gradient
  const grad = ctx.createRadialGradient(x - radius * 0.35, y - radius * 0.35, radius * 0.1, x, y, radius * 1.1);
  grad.addColorStop(0, `rgba(${Math.min(r + 65, 255)}, ${Math.min(g + 65, 255)}, ${Math.min(b + 65, 255)}, 1)`);
  grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 1)`);
  grad.addColorStop(1, `rgba(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)}, 1)`);

  // Organic blob curve
  const wobble = state.current === 'thinking' ? Math.sin(state.tick * 0.25) * 4 : 0;

  ctx.beginPath();
  ctx.moveTo(x, y - radius + wobble);
  ctx.bezierCurveTo(
    x + radius * 0.95 + wobble, y - radius * 0.55,
    x + radius * 0.95, y + radius * 0.65,
    x, y + radius
  );
  ctx.bezierCurveTo(
    x - radius * 0.95, y + radius * 0.65,
    x - radius * 0.95 - wobble, y - radius * 0.55,
    x, y - radius + wobble
  );
  ctx.fillStyle = grad;
  ctx.fill();
}

function drawEyes(x, y, radius, open) {
  const eyeBaseY = y - radius * 0.12;
  const eyeDist  = radius * 0.30;
  const eyeR     = open ? radius * 0.13 : radius * 0.04;

  // Pupil offset from cursor tracking
  const lookX = mousePos.x * 3.5;
  const lookY = mousePos.y * 3;

  [x - eyeDist, x + eyeDist].forEach(ex => {
    ctx.beginPath();
    ctx.ellipse(ex, eyeBaseY, eyeR, open ? eyeR : eyeR * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#161426';
    ctx.fill();

    // Eye catchlight / shine
    if (open) {
      ctx.beginPath();
      ctx.arc(ex + lookX + eyeR * 0.3, eyeBaseY + lookY - eyeR * 0.3, eyeR * 0.32, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fill();

      // Tiny secondary sparkle
      ctx.beginPath();
      ctx.arc(ex + lookX - eyeR * 0.25, eyeBaseY + lookY + eyeR * 0.25, eyeR * 0.15, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.fill();
    }
  });
}

function drawCheeks(x, y, radius) {
  const { r, g, b } = hexToRgb(COLOR);
  ctx.beginPath();
  ctx.ellipse(x - radius * 0.44, y + radius * 0.1, radius * 0.18, radius * 0.09, 0, 0, Math.PI * 2);
  ctx.ellipse(x + radius * 0.44, y + radius * 0.1, radius * 0.18, radius * 0.09, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${Math.min(r + 80, 255)}, 120, 200, 0.45)`;
  ctx.fill();
}

function drawMouth(x, y, radius) {
  const my = y + radius * 0.16;
  ctx.beginPath();
  if (state.current === 'talking') {
    // Animated speaking mouth
    const openH = (Math.sin(state.tick * 0.3) + 1) * 3 + 1;
    ctx.ellipse(x, my, 4, openH, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#161426';
    ctx.fill();
  } else if (state.current === 'happy') {
    // Big happy smile arc
    ctx.arc(x, my - 2, 6, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#161426';
    ctx.stroke();
  } else if (state.current === 'sleeping') {
    // Little sleeping mouth
    ctx.arc(x, my - 1, 2.5, 0, Math.PI);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#161426';
    ctx.stroke();
  } else {
    // Subtle content smile
    ctx.arc(x, my, 4, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.lineWidth = 1.8;
    ctx.strokeStyle = '#161426';
    ctx.stroke();
  }
}

function drawSleepZzz(x, y, radius) {
  if (state.current !== 'sleeping') return;
  const t = state.tick * 0.05;
  const zOffset = (state.tick % 90) * 0.45;
  ctx.save();
  ctx.fillStyle = 'rgba(232, 224, 255, ' + Math.max(0, 1 - zOffset / 35) + ')';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('z', x + radius * 0.6 + Math.sin(t) * 4, y - radius * 0.4 - zOffset);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('z', x + radius * 0.75 + Math.cos(t) * 3, y - radius * 0.2 - zOffset * 0.7);
  ctx.restore();
}

// Inactivity timer (enter sleeping state after 5 min idle)
let lastActiveTime = Date.now();
const SLEEP_IDLE_MS = 5 * 60 * 1000;

function resetActivity() {
  lastActiveTime = Date.now();
  if (state.current === 'sleeping') {
    setState('idle');
  }
}

window.addEventListener('mousemove', resetActivity);
window.addEventListener('mousedown', resetActivity);
window.addEventListener('keydown', resetActivity);

// ── Main Render Loop ─────────────────────────────────────────
function render() {
  ctx.clearRect(0, 0, W, H);
  state.tick++;

  // Check sleep transition
  if (state.current === 'idle' && (Date.now() - lastActiveTime > SLEEP_IDLE_MS)) {
    setState('sleeping');
  }

  // Slower, deeper breathing when asleep
  const breathSpeed = state.current === 'sleeping' ? 0.001 : 0.0018;
  state.breathScale += breathSpeed * state.breathDir;
  if (state.breathScale > 1.035 || state.breathScale < 0.965) {
    state.breathDir *= -1;
  }

  // Blinking cycle (only when awake)
  if (state.current !== 'sleeping') {
    state.blinkTimer++;
    if (state.blinkTimer > 210) {
      state.eyeOpen = false;
      if (state.blinkTimer > 220) {
        state.eyeOpen = true;
        state.blinkTimer = 0;
      }
    }
  } else {
    state.eyeOpen = false;
  }

  const cx = W / 2;
  const cy = H / 2 - 2;
  const radius = 48 * state.breathScale;

  // Floating bob animation
  const floatY = Math.sin(state.tick * 0.04) * (state.current === 'sleeping' ? 2 : 4);

  // Happy bounce
  const hopOffset = state.current === 'happy'
    ? Math.abs(Math.sin(state.tick * 0.28)) * -14
    : 0;

  ctx.save();
  ctx.translate(cx, cy + floatY + hopOffset);
  drawBody(0, 0, radius, COLOR);
  drawCheeks(0, 0, radius);
  drawEyes(0, 0, radius, state.eyeOpen);
  drawMouth(0, 0, radius);
  drawSleepZzz(0, 0, radius);
  ctx.restore();

  requestAnimationFrame(render);
}

// ── State Management ─────────────────────────────────────────
function setState(newState) {
  state.current = newState;
  state.frame = 0;
}

function setStateTemp(newState, durationMs = 2000) {
  setState(newState);
  setTimeout(() => setState('idle'), durationMs);
}

function setColor(newColor) {
  COLOR = newColor;
}

// Start rendering
render();

// Expose API
window.gooState = { setState, setStateTemp, setColor, resetActivity };
