// ============================================================
// segregate-lab.js
// Segregates monolithic Lab HTML files into dedicated subfolders
// ============================================================

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const labDir = path.join(root, 'assets', 'Lab');

// 1. Segregate ai_bot_asset_studio_kuma.html -> assets/Lab/asset-studio/
const botHtmlPath = path.join(labDir, 'ai_bot_asset_studio_kuma.html');
if (fs.existsSync(botHtmlPath)) {
  const content = fs.readFileSync(botHtmlPath, 'utf8');
  const targetDir = path.join(labDir, 'asset-studio');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);

  const css = styleMatch ? styleMatch[1].trim() : '';
  const js = scriptMatch ? scriptMatch[1].trim() : '';

  let html = content;
  if (styleMatch) {
    html = html.replace(styleMatch[0], '<link rel="stylesheet" href="style.css">');
  }
  if (scriptMatch) {
    html = html.replace(scriptMatch[0], '<script src="app.js"></script>\n</body>');
  }

  fs.writeFileSync(path.join(targetDir, 'style.css'), css);
  fs.writeFileSync(path.join(targetDir, 'app.js'), js);
  fs.writeFileSync(path.join(targetDir, 'index.html'), html);
  console.log('✓ Segregated assets/Lab/asset-studio/ (index.html, style.css, app.js)');
}

// 2. Segregate kumo-studio-ds.html -> assets/Lab/studio-ds/
const dsHtmlPath = path.join(labDir, 'kumo-studio-ds.html');
if (fs.existsSync(dsHtmlPath)) {
  const content = fs.readFileSync(dsHtmlPath, 'utf8');
  const targetDir = path.join(labDir, 'studio-ds');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
  const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);

  const css = styleMatch ? styleMatch[1].trim() : '';
  const js = scriptMatch ? scriptMatch[1].trim() : '';

  let html = content;
  if (styleMatch) {
    html = html.replace(styleMatch[0], '<link rel="stylesheet" href="style.css">');
  }
  if (scriptMatch) {
    html = html.replace(scriptMatch[0], '<script src="app.js"></script>\n</body>');
  }

  fs.writeFileSync(path.join(targetDir, 'style.css'), css);
  fs.writeFileSync(path.join(targetDir, 'app.js'), js);
  fs.writeFileSync(path.join(targetDir, 'index.html'), html);
  console.log('✓ Segregated assets/Lab/studio-ds/ (index.html, style.css, app.js)');
}
