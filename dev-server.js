// ============================================================
// dev-server.js — Local Web Server for Browser Testing
// Allows testing the Mascot Overlay & Mochiboard Canvas in browser
// ============================================================

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html':  'text/html; charset=utf-8',
  '.css':   'text/css; charset=utf-8',
  '.js':    'application/javascript; charset=utf-8',
  '.json':  'application/json; charset=utf-8',
  '.png':   'image/png',
  '.jpg':   'image/jpeg',
  '.svg':   'image/svg+xml',
  '.ico':   'image/x-icon',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // Route shortcuts
  if (reqPath === '/studio' || reqPath === '/onboarding') {
    res.writeHead(302, { Location: '/ui/studio/index.html?mode=wizard' });
    res.end();
    return;
  }

  if (reqPath === '/' || reqPath === '/overlay' || reqPath === '/mascot') {
    reqPath = '/ui/overlay/index.html';
  } else if (reqPath === '/board' || reqPath === '/canvas') {
    reqPath = '/ui/board/index.html';
  } else if (reqPath === '/design' || reqPath === '/design-system' || reqPath === '/tokens') {
    reqPath = '/design-system/index.html';
  } else if (reqPath === '/lab' || reqPath === '/mascot-lab' || reqPath === '/bot-studio') {
    reqPath = '/assets/Lab/asset-studio/index.html';
  } else if (reqPath === '/clay') {
    reqPath = '/assets/Lab/kumo-studio-clay.html';
  } else if (reqPath === '/glass') {
    reqPath = '/assets/Lab/kumo-studio-glassmorphic.html';
  } else if (reqPath === '/y2k') {
    reqPath = '/assets/Lab/kumo-studio-y2k.html';
  }

  // Handle overlay relative paths (e.g. /overlay.css or /goo.js when on /)
  let filePath = path.join(ROOT, reqPath);

  if (!fs.existsSync(filePath)) {
    // Try resolving inside ui/overlay, ui/board, or design-system
    const overlayTry = path.join(ROOT, 'ui', 'overlay', reqPath);
    const boardTry   = path.join(ROOT, 'ui', 'board', reqPath);
    const studioTry  = path.join(ROOT, 'ui', 'studio', reqPath);
    const designTry  = path.join(ROOT, 'design-system', reqPath);
    if (fs.existsSync(overlayTry)) filePath = overlayTry;
    else if (fs.existsSync(boardTry)) filePath = boardTry;
    else if (fs.existsSync(studioTry)) filePath = studioTry;
    else if (fs.existsSync(designTry)) filePath = designTry;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${req.url}\n\nTry:\n  http://localhost:${PORT}/ (Mascot Overlay)\n  http://localhost:${PORT}/board (Mochiboard Canvas)`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });

    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Goo & Mochiboard Local Server running!`);
  console.log(`======================================================`);
  console.log(`👉 Mascot Overlay:      http://localhost:${PORT}/`);
  console.log(`👉 Onboarding Studio:   http://localhost:${PORT}/studio`);
  console.log(`👉 Mochiboard Canvas:   http://localhost:${PORT}/board`);
  console.log(`======================================================\n`);
});
