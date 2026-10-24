# Kumo Mascot Assets & Companion Gallery

This directory contains production-ready vector SVGs, high-resolution PNG renders, WebGL shaders, sprite sheets, and Windows desktop icons for all official Kumo Desktop Companions.

---

## Companion Persona Showcase

| Companion | Preview Image | Archetype & Engine | Highlights |
| :--- | :---: | :--- | :--- |
| **Cotton Cloud** | ![Cotton Cloud](./cotton-cloud/cotton-cloud.png) | **Organic Vector**<br>`Vector SVG` | Soft puffy vector cloud with rosy blush, gentle specular highlights, and comforting aura halo. |
| **Starlet Astro** | ![Starlet Astro](./starlet-astro/starlet-astro.png) | **Cosmic 2D Sprite**<br>`Cosmic 2D` | Inquisitive chubby 5-point celestial star with golden gradient and orbital planetary ring. |
| **Mochi Droplet** | ![Mochi Droplet](./mochi-droplet/mochi-droplet.png) | **Fluid Gel Mesh**<br>`Fluid 2D/3D Mesh` | Translucent squishy water/gel teardrop with bouncing highlights, hydro-viscosity, and spring physics. |
| **Kubo Bot** | ![Kubo Bot](./kubo-bot/kubo-bot.png) | **Voxel Retro Buffer**<br>`Retro Buffer / 2D` | Playful cubic voxel robot buddy featuring a bouncy spring antenna, CRT screen bezel, and LED pixel face. |
| **3D Mochi Gel Bot** | ![3D Mochi Gel Bot](./3d-mochi-gel/mochi-gel-3d.png) | **WebGL 2.0 Smooth Dome**<br>`Three.js Shader` | Smooth organic gelatin dome with Blinn-Phong specular shader, Fresnel rim lighting, squish physics, and gaze tracking. |
| **3D Voxel Bot** | ![3D Voxel Bot](./3d/voxel-bot-3d.png) | **WebGL 2.0 Voxel Blocks**<br>`Three.js PBR` | Tactile extruded 3D pixel voxel blocks with real-time shadow casting and contact occlusion. |
| **2D Pixel Cloud** | ![2D Pixel Cloud](./2d/pixel-cloud-2d.png) | **Canvas 2D Bayer Dither**<br>`64x64 SDF Canvas` | Retro Bayer-dithered 64x64 SDF pixel cloud running with sub-1% CPU usage. |

---

## Detailed Directory Breakdown

### 1. [`cotton-cloud/`](./cotton-cloud/)
<img src="./cotton-cloud/cotton-cloud.png" width="220" alt="Cotton Cloud"/>

- **Files**:
  - `cotton-cloud.svg` — Scalable resolution-independent vector graphic.
  - `cotton-cloud.png` — Rendered 320x240 transparent PNG asset.
  - `metadata.json` — Color palette, mood expressions (`idle`, `happy`, `thinking`, `speaking`), and physics tokens.

---

### 2. [`starlet-astro/`](./starlet-astro/)
<img src="./starlet-astro/starlet-astro.png" width="200" alt="Starlet Astro"/>

- **Files**:
  - `starlet-astro.svg` — Scalable vector graphic with orbital ring path.
  - `starlet-astro.png` — Rendered 280x260 transparent PNG asset.
  - `metadata.json` — Orbit speed, coordinates, and celestial expressions.

---

### 3. [`mochi-droplet/`](./mochi-droplet/)
<img src="./mochi-droplet/mochi-droplet.png" width="200" alt="Mochi Droplet"/>

- **Files**:
  - `mochi-droplet.svg` — Scalable vector graphic with inner specular gradients.
  - `mochi-droplet.png` — Rendered 260x260 transparent PNG asset.
  - `metadata.json` — Viscosity, damping, and mass parameters.

---

### 4. [`kubo-bot/`](./kubo-bot/)
<img src="./kubo-bot/kubo-bot.png" width="200" alt="Kubo Bot"/>

- **Files**:
  - `kubo-bot.svg` — Scalable vector graphic with CRT display and antenna.
  - `kubo-bot.png` — Rendered 260x280 transparent PNG asset.
  - `metadata.json` — LED pixel state matrices and hardware buttons.

---

### 5. [`3d-mochi-gel/`](./3d-mochi-gel/)
<img src="./3d-mochi-gel/mochi-gel-3d.png" width="220" alt="3D Mochi Gel Bot"/>

- **Files**:
  - `mochi-gel-3d.png` — WebGL render snapshot of the live 3D organic gel dome.
  - `metadata.json` — Custom Three.js shader uniforms, Fresnel rim, and palette definitions.

---

### 6. [`3d/`](./3d/)
<img src="./3d/voxel-bot-3d.png" width="160" alt="3D Voxel Bot"/>

- **Files**:
  - `voxel-bot-3d.png` / `idle.png`, `happy.png`, `listening.png`, `speaking.png`, `thinking.png` — Individual frame renders.
  - `spritesheet.png` — 320x64 horizontal spritesheet containing all 5 key animation states.

---

### 7. [`2d/`](./2d/)
<img src="./2d/pixel-cloud-2d.png" width="160" alt="2D Pixel Cloud"/>

- **Files**:
  - `pixel-cloud-2d.png` / `idle.png`, `happy.png`, `listening.png`, `speaking.png`, `thinking.png` — Individual Bayer-dithered frames.
  - `spritesheet.png` — 320x64 horizontal spritesheet containing all 5 animation states.

---

### 8. [`icons/`](./icons/)
- `icon.png` — 256x256 high-resolution application icon.
- `icon.ico` — Multi-resolution Windows desktop icon (16px to 256px).
- `tray.png` — 32x32 taskbar system tray icon.
- `tray@2x.png` — 64x64 high-DPI taskbar system tray icon.
