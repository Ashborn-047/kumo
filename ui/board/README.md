# ui/board/ — Mochiboard Canvas (Ported)

This folder contains the infinite canvas engine ported from:
https://github.com/jessawolfe-ux/mochiboard

## Files to copy from mochiboard repo

The following files are copied **verbatim** (zero changes) from the original repo's `web/` folder:

| File | Source | Status |
|---|---|---|
| `index.html` | `web/index.html` | ⬜ Not yet copied |
| `app.js` | `web/app.js` | ⬜ Not yet copied |
| `style.css` | `web/style.css` | ⬜ Not yet copied |
| `goo.js` | `web/goo.js` | ⬜ Not yet copied |
| `sw.js` | `web/sw.js` | ⬜ Not yet copied |
| `fonts.css` | `web/fonts.css` | ⬜ Not yet copied |

`bridge.js` is the **only file we changed** — already present in this folder.

## How to copy (Phase 2)

```powershell
# Clone mochiboard next to this project
git clone https://github.com/jessawolfe-ux/mochiboard ../mochiboard-src

# Copy the web files
Copy-Item ../mochiboard-src/web/app.js      ./
Copy-Item ../mochiboard-src/web/index.html  ./
Copy-Item ../mochiboard-src/web/style.css   ./
Copy-Item ../mochiboard-src/web/goo.js      ./
Copy-Item ../mochiboard-src/web/sw.js       ./
Copy-Item ../mochiboard-src/web/fonts.css   ./
Copy-Item ../mochiboard-src/web/fonts       ./ -Recurse
Copy-Item ../mochiboard-src/web/icons       ./ -Recurse
Copy-Item ../mochiboard-src/web/stamps      ./ -Recurse
```
