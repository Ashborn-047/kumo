# assets/ — App Assets

## Status

| Asset | File | Status |
|---|---|---|
| App icon (Windows) | `icon.ico` | ✅ Generated (32x32 ICO ready, replace with high-res later) |
| Tray icon (32x32) | `tray.png` | ✅ Generated & active |
| App icon PNG | `icon.png` | ✅ Generated & active |
| Mascot sprites | `mascot/*.png` | 🎨 Using organic canvas animation in `goo.js` (Figma/Rive assets can drop in anytime) |

## Notes

- App uses a **CSS canvas placeholder** until these files exist
- Drop final assets here with the exact filenames above
- No code changes needed — goo.js auto-detects and switches to sprite mode

## Required sizes

| Asset | Size |
|---|---|
| `icon.ico` | Multi-size ICO (16, 32, 48, 256px) |
| `tray.png` | 16x16 or 32x32 @2x |
| `mascot/*.png` | 256x256 minimum, transparent bg |
