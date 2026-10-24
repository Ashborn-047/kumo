// ============================================================
// Kumo Design System — Documentation Logic
// ============================================================

// Pixel mascot
(function () {
  const c = document.getElementById('gooCanvas');
  if (!c) return;
  const g = c.getContext('2d');
  const W = c.width;
  const H = c.height;
  const B = [
    '....BBBBB....',
    '..BBSSBBBBB..',
    '.BBSSBBBBBBB.',
    '.BSBBBBBBBBB.',
    'BBBBBBBBBBBBB',
    'BBBBBBBBBBBBB',
    'BBBBBBBBBBBBB',
    'BBBBBBBBBBBBB',
    'BBBBBBBBBBBBB',
    'DBBBBBBBBBBBD',
    'DDDDDDDDDDDDD',
  ];
  const col = { B: '#33c7ff', S: '#ccf5ff', D: '#1480db' };
  let look = 0,
    lookTo = 0,
    nextLook = 0;
  const px = Math.floor(Math.min(W / 14, H / 13));

  function frame(now) {
    const t = now / 1000;
    g.clearRect(0, 0, W, H);
    if (t > nextLook) {
      lookTo = [-1, 0, 0, 1][Math.floor(Math.random() * 4)];
      nextLook = t + 1.5 + Math.random() * 2.5;
    }
    look += (lookTo - look) * 0.2;
    const br = Math.sin(t * 2.4) * 0.04,
      ox = (W - 13 * px) / 2,
      oy = H - 11 * px;
    g.save();
    g.translate(W / 2, H);
    g.scale(1 - br * 0.5, 1 + br);
    g.translate(-W / 2, -H);
    B.forEach((r, y) =>
      [...r].forEach((ch, x) => {
        if (ch !== '.') {
          g.fillStyle = col[ch];
          g.fillRect(ox + x * px, oy + y * px, px, px);
        }
      })
    );
    const blink = t % 3.3 > 3.15,
      ex = Math.round(look);
    g.fillStyle = '#081f3d';
    [3, 9].forEach((c2) => g.fillRect(ox + (c2 + ex) * px, oy + (blink ? 5.5 : 5) * px, px, blink ? px * 0.4 : px * 2));
    g.fillStyle = '#ff8fc2';
    [2, 10].forEach((c2) => g.fillRect(ox + c2 * px, oy + 7 * px, px, px));
    g.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

// Theme toggle
const themeBtn = document.getElementById('themeToggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    html.setAttribute('data-theme', isDark ? 'light' : 'dark');
    document.getElementById('themeLabel').textContent = isDark ? 'Switch to Dark' : 'Switch to Light';
  });
}

// Active link spy
const links = document.querySelectorAll('.sidebar-link[href^="#"]');
const sections = document.querySelectorAll('.section');
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        links.forEach((l) => l.classList.remove('active'));
        const link = document.querySelector(`.sidebar-link[href="#${e.target.id}"]`);
        if (link) link.classList.add('active');
      }
    });
  },
  { rootMargin: '-20% 0px -70% 0px' }
);
sections.forEach((s) => observer.observe(s));

// Copy utilities
let toastTimer;
window.copy = function (text) {
  navigator.clipboard.writeText(text).catch(() => {});
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = `Copied: ${text}`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }
};

window.copyAllTokens = function () {
  const block = document.getElementById('tokenBlock');
  if (!block) return;
  const code = block.textContent;
  navigator.clipboard.writeText(code).catch(() => {});
  const t = document.getElementById('toast');
  if (t) {
    t.textContent = 'All tokens copied';
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }
};
