// ============================================================
// export-mascot-pngs.js — Headless PNG Renderer using Electron
// Loads mascot-renderer.html via dev-server and captures exact PNGs
// ============================================================

const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.disableHardwareAcceleration();

const mascots = [
  {
    id: 'cotton-cloud',
    outPng: path.join(__dirname, '../assets/mascot/cotton-cloud/cotton-cloud.png'),
  },
  {
    id: 'starlet-astro',
    outPng: path.join(__dirname, '../assets/mascot/starlet-astro/starlet-astro.png'),
  },
  {
    id: 'mochi-droplet',
    outPng: path.join(__dirname, '../assets/mascot/mochi-droplet/mochi-droplet.png'),
  },
  {
    id: 'kubo-bot',
    outPng: path.join(__dirname, '../assets/mascot/kubo-bot/kubo-bot.png'),
  },
];

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    show: false,
    webPreferences: {
      offscreen: true,
    },
  });

  console.log('Loading mascot-renderer.html...');
  await win.loadURL('http://localhost:3000/scripts/mascot-renderer.html');
  await new Promise((r) => setTimeout(r, 600));

  for (const m of mascots) {
    const bounds = await win.webContents.executeJavaScript(`
      (() => {
        const el = document.getElementById('${m.id}');
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
      })()
    `);

    if (bounds) {
      const image = await win.webContents.capturePage(bounds);
      fs.writeFileSync(m.outPng, image.toPNG());
      console.log(`✓ Exported ${m.id}.png (${bounds.width}x${bounds.height})`);
    } else {
      console.warn(`Could not find #${m.id}`);
    }
  }

  // Snapshot 3D Mochi Gel Bot
  console.log('Snapshotting 3D Mochi Gel Bot from live WebGL studio canvas...');
  await win.loadURL('http://localhost:3000/ui/studio/index.html?mode=wizard');
  await new Promise((r) => setTimeout(r, 800));

  await win.webContents.executeJavaScript(`
    document.getElementById('card-engine-3d-smooth')?.click();
  `);
  await new Promise((r) => setTimeout(r, 800));

  const bounds3d = await win.webContents.executeJavaScript(`
    (() => {
      const c = document.getElementById('studio-mascot-canvas');
      if (!c) return null;
      const r = c.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) };
    })()
  `);

  if (bounds3d) {
    const img3d = await win.webContents.capturePage(bounds3d);
    fs.writeFileSync(path.join(__dirname, '../assets/mascot/3d-mochi-gel/mochi-gel-3d.png'), img3d.toPNG());
    console.log(`✓ Exported 3d-mochi-gel/mochi-gel-3d.png (${bounds3d.width}x${bounds3d.height})`);
  }

  // Copy voxel & 2d idle PNGs into their named versions
  const d3Idle = path.join(__dirname, '../assets/mascot/3d/idle.png');
  const d2Idle = path.join(__dirname, '../assets/mascot/2d/idle.png');

  if (fs.existsSync(d3Idle)) {
    fs.copyFileSync(d3Idle, path.join(__dirname, '../assets/mascot/3d/voxel-bot-3d.png'));
    console.log('✓ Created 3d/voxel-bot-3d.png');
  }
  if (fs.existsSync(d2Idle)) {
    fs.copyFileSync(d2Idle, path.join(__dirname, '../assets/mascot/2d/pixel-cloud-2d.png'));
    console.log('✓ Created 2d/pixel-cloud-2d.png');
  }

  console.log('All mascot PNG images successfully created!');
  app.quit();
});
