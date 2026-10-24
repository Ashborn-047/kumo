// ─────────────────────────────────────────────────────────────
// KUMO 3D MOCHI BOT ENGINE
// From assets/Lab/ai_bot_asset_studio_kuma.html
// Three.js Gelatinous Mochi & Voxel Bot with physics & states
// ─────────────────────────────────────────────────────────────

export const PALETTES_3D = {
  'Classic Cyan': { body: '#38bdf8', rim: '#1976d2', shine: '#e0f7ff', eye: '#0f172a', blush: '#ff80ab' },
  'Peach Pink':   { body: '#f472b6', rim: '#db2777', shine: '#ffe4f1', eye: '#1e1b4b', blush: '#fb7185' },
  'Grape Slime':  { body: '#a78bfa', rim: '#7c3aed', shine: '#f3e8ff', eye: '#1e1b4b', blush: '#f472b6' },
  'Mint Jelly':   { body: '#34d399', rim: '#059669', shine: '#d1fae5', eye: '#064e3b', blush: '#fb7185' },
};

const SLIME_GRID = [
  '....BBBB....',
  '..BBHHBBBB..',
  '.BBHHBBBBBB.',
  '.BHBBBBBBBB.',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'BBBBBBBBBBBB',
  'DBBBBBBBBBBD',
  'DDDDDDDDDDDD',
];

export class Mascot3D {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.options = options;
    this.state = options.state || 'idle'; // idle | listening | thinking | happy | speaking
    this.geometryMode = options.geometryMode || 'smooth'; // smooth | voxel
    this.paletteName = options.palette || 'Grape Slime';
    this.speed = options.speed || 1.0;
    this.squishIntensity = options.squish || 1.0;
    this.trackGaze = options.trackGaze !== false;
    this.showSmile = options.smile !== false;

    this.palette = PALETTES_3D[this.paletteName] || PALETTES_3D['Grape Slime'];
    this.pokeImpulse = 0.0;
    this.running = false;
    this.mouse = { x: 0, y: 0 };

    // 360-degree Orbit & Drag state
    this.isDragging = false;
    this.dragDistance = 0;
    this.prevMouse = { x: 0, y: 0 };
    this.spherical = { radius: 5.0, theta: 0.0, phi: Math.PI / 2.05 };

    this.initThree();

    this.onMouseDown = (e) => {
      this.isDragging = true;
      this.dragDistance = 0;
      this.prevMouse = { x: e.clientX, y: e.clientY };
    };

    this.onMouseUp = () => {
      if (this.isDragging && this.dragDistance < 4) {
        this.triggerPoke();
      }
      this.isDragging = false;
    };

    this.onMouseMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (this.trackGaze) {
        this.mouse.x = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
        this.mouse.y = Math.max(-1, Math.min(1, -(((e.clientY - rect.top) / rect.height) * 2 - 1)));
      }

      if (this.isDragging) {
        const dx = e.clientX - this.prevMouse.x;
        const dy = e.clientY - this.prevMouse.y;
        this.dragDistance += Math.abs(dx) + Math.abs(dy);
        this.prevMouse = { x: e.clientX, y: e.clientY };

        // Full 360 horizontal and vertical orbit
        this.spherical.theta -= dx * 0.012;
        this.spherical.phi = Math.max(0.12, Math.min(Math.PI - 0.12, this.spherical.phi - dy * 0.012));
        this.updateCameraOrbit();
      }
    };

    this.onWheel = (e) => {
      e.preventDefault();
      this.spherical.radius = Math.max(3.0, Math.min(12.0, this.spherical.radius + e.deltaY * 0.005));
      this.updateCameraOrbit();
    };

    this.canvas.addEventListener('mousedown', this.onMouseDown);
    window.addEventListener('mouseup', this.onMouseUp);
    window.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('wheel', this.onWheel, { passive: false });
  }

  updateCameraOrbit() {
    if (!this.camera) return;
    const { radius, theta, phi } = this.spherical;
    this.camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
    this.camera.position.y = radius * Math.cos(phi);
    this.camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
    this.camera.lookAt(0, 0.05, 0);
  }

  initThree() {
    const THREE = window.THREE;
    if (!THREE) {
      console.warn('Three.js not found on window. Please ensure Three.js is loaded.');
      return;
    }

    const w = Math.max(this.canvas.width || 0, this.canvas.clientWidth || 0, 320);
    const h = Math.max(this.canvas.height || 0, this.canvas.clientHeight || 0, 320);
    this.canvas.width = w;
    this.canvas.height = h;

    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.95));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(-3, 6, 5);
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(3, -2, 4);
    this.scene.add(fillLight);

    this.camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 100);
    this.camera.position.set(0, 0.05, 5.0);

    const headLight = new THREE.DirectionalLight(0xffffff, 0.75);
    headLight.position.set(0, 0, 5);
    this.camera.add(headLight);
    this.scene.add(this.camera);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    this.buildBot();
  }

  buildBot() {
    const THREE = window.THREE;
    if (!THREE) return;

    this.botRoot = new THREE.Group();
    this.scene.add(this.botRoot);

    const { body, rim, shine, eye, blush } = this.palette;

    this.matBody = new THREE.MeshToonMaterial({ color: body, emissive: body, emissiveIntensity: 0.55 });
    this.matBaseRim = new THREE.MeshToonMaterial({ color: rim, emissive: rim, emissiveIntensity: 0.40 });
    this.matShine = new THREE.MeshBasicMaterial({ color: shine });
    this.matEye = new THREE.MeshBasicMaterial({ color: eye, depthTest: false });
    this.matBlush = new THREE.MeshBasicMaterial({ color: blush, depthTest: false, transparent: true, opacity: 0.85 });

    // Smooth Gel Shader
    this.matSmoothShader = new THREE.ShaderMaterial({
      uniforms: {
        uBodyColor: { value: new THREE.Color(body) },
        uBaseColor: { value: new THREE.Color(rim) },
        uShineColor: { value: new THREE.Color(shine) },
        uLightDir: { value: new THREE.Vector3(-0.45, 0.75, 0.65).normalize() },
      },
      vertexShader: `
        varying vec3 vNormal; varying vec3 vPos;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uBodyColor; uniform vec3 uBaseColor; uniform vec3 uShineColor; uniform vec3 uLightDir;
        varying vec3 vNormal; varying vec3 vPos;
        void main() {
          vec3 n = normalize(vNormal);
          float baseBand = smoothstep(-0.95, -0.65, vPos.y);
          vec3 col = mix(uBaseColor, uBodyColor, baseBand);

          // Soft organic specular highlight
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          vec3 halfDir = normalize(uLightDir + viewDir);
          float spec = max(dot(n, halfDir), 0.0);
          float shineMask = pow(spec, 24.0) * 0.75 + pow(spec, 6.0) * 0.15;
          col = mix(col, uShineColor, shineMask);

          // Gentle Fresnel rim lighting
          float fresnel = 1.0 - max(dot(n, viewDir), 0.0);
          col = mix(col, uShineColor, pow(fresnel, 2.5) * 0.35);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });

    this.slimeBodyGroup = new THREE.Group();
    this.botRoot.add(this.slimeBodyGroup);

    // Voxel Body
    this.voxelBodyGroup = new THREE.Group();
    this.slimeBodyGroup.add(this.voxelBodyGroup);
    const voxSize = 0.22;
    this.voxSize = voxSize;
    const rows = SLIME_GRID.length;
    const cols = SLIME_GRID[0].length;
    const boxGeo = new THREE.BoxGeometry(voxSize * 1.01, voxSize * 1.01, voxSize * 1.01);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const ch = SLIME_GRID[r][c];
        if (ch === '.') continue;
        const distFromEdge = Math.min(c, cols - 1 - c, r, rows - 1 - r);
        const depthLayers = distFromEdge === 0 ? 5 : distFromEdge === 1 ? 7 : 8;

        for (let z = -Math.floor(depthLayers / 2); z <= Math.floor(depthLayers / 2); z++) {
          let mat = this.matBody;
          if (ch === 'D') mat = this.matBaseRim;
          if (ch === 'H' && z >= Math.floor(depthLayers / 2) - 1) mat = this.matShine;
          const vox = new THREE.Mesh(boxGeo, mat);
          vox.position.set((c - (cols - 1) / 2) * voxSize, ((rows - 1) / 2 - r) * voxSize, z * voxSize);
          this.voxelBodyGroup.add(vox);
        }
      }
    }

    // Smooth Mochi Dome
    this.smoothBodyGroup = new THREE.Group();
    this.slimeBodyGroup.add(this.smoothBodyGroup);
    const domeGeo = new THREE.SphereGeometry(1.38, 64, 64);
    const posAttr = domeGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      if (v.y < 0) {
        v.y = Math.max(-1.05, v.y * 0.82);
        const flatFactor = Math.min(1.0, Math.abs(v.y / 1.05));
        v.x *= 1.0 + flatFactor * 0.08;
        v.z *= 1.0 + flatFactor * 0.08;
      } else {
        v.y *= 0.92;
      }
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    domeGeo.computeVertexNormals();
    this.smoothBodyGroup.add(new THREE.Mesh(domeGeo, this.matSmoothShader));

    // Face
    this.faceGroup = new THREE.Group();
    this.faceGroup.position.set(0, 0, 1.04);
    this.slimeBodyGroup.add(this.faceGroup);

    const eyeGeo = new THREE.BoxGeometry(voxSize * 1.05, voxSize * 2.1, 0.08);
    this.leftEye = new THREE.Mesh(eyeGeo, this.matEye);
    this.leftEye.position.set(-voxSize * 2.5, -voxSize * 0.5, 0);
    this.faceGroup.add(this.leftEye);

    this.rightEye = new THREE.Mesh(eyeGeo, this.matEye);
    this.rightEye.position.set(voxSize * 2.5, -voxSize * 0.5, 0);
    this.faceGroup.add(this.rightEye);

    const blushGeo = new THREE.BoxGeometry(voxSize * 1.15, voxSize * 0.95, 0.07);
    this.leftBlush = new THREE.Mesh(blushGeo, this.matBlush);
    this.leftBlush.position.set(-voxSize * 3.55, -voxSize * 1.95, 0);
    this.faceGroup.add(this.leftBlush);

    this.rightBlush = new THREE.Mesh(blushGeo, this.matBlush);
    this.rightBlush.position.set(voxSize * 3.55, -voxSize * 1.95, 0);
    this.faceGroup.add(this.rightBlush);

    // Mouth
    this.mouthGroup = new THREE.Group();
    this.mouthGroup.position.set(0, -voxSize * 1.85, 0.01);
    this.faceGroup.add(this.mouthGroup);

    this.mouthSmile = new THREE.Group();
    const mCenter = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 1.4, voxSize * 0.45, 0.07), this.matEye);
    const mLeft = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 0.5, voxSize * 0.45, 0.07), this.matEye);
    mLeft.position.set(-voxSize * 0.85, voxSize * 0.35, 0);
    const mRight = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 0.5, voxSize * 0.45, 0.07), this.matEye);
    mRight.position.set(voxSize * 0.85, voxSize * 0.35, 0);
    this.mouthSmile.add(mCenter, mLeft, mRight);
    this.mouthGroup.add(this.mouthSmile);

    this.mouthTalk = new THREE.Group();
    this.mouthTalk.visible = false;
    const talkBack = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 1.8, voxSize * 1.4, 0.06), this.matEye);
    const talkTongue = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 1.1, voxSize * 0.65, 0.08), this.matBlush);
    talkTongue.position.set(0, -voxSize * 0.35, 0.01);
    this.mouthTalk.add(talkBack, talkTongue);
    this.mouthGroup.add(this.mouthTalk);

    this.mouthThink = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 0.7, voxSize * 0.7, 0.07), this.matEye);
    this.mouthThink.visible = false;
    this.mouthGroup.add(this.mouthThink);

    // Ensure all face elements render crisply on top of the dome
    this.faceGroup.renderOrder = 10;
    this.leftEye.renderOrder = 10;
    this.rightEye.renderOrder = 10;
    this.leftBlush.renderOrder = 10;
    this.rightBlush.renderOrder = 10;
    this.mouthSmile.traverse((o) => { if (o.isMesh) o.renderOrder = 10; });
    this.mouthTalk.traverse((o) => { if (o.isMesh) o.renderOrder = 10; });
    this.mouthThink.renderOrder = 10;

    this.setGeometryMode(this.geometryMode);
  }

  setGeometryMode(mode) {
    this.geometryMode = mode;
    if (this.voxelBodyGroup && this.smoothBodyGroup) {
      this.voxelBodyGroup.visible = mode === 'voxel';
      this.smoothBodyGroup.visible = mode === 'smooth';
      if (this.faceGroup) {
        this.faceGroup.position.z = mode === 'voxel' ? 1.02 : 1.42;
      }
    }
  }

  setPalette(name) {
    const p = PALETTES_3D[name] || PALETTES_3D['Grape Slime'];
    this.paletteName = name;
    this.palette = p;

    if (this.matBody) {
      this.matBody.color.set(p.body);
      this.matBody.emissive.set(p.body);
      this.matBaseRim.color.set(p.rim);
      this.matBaseRim.emissive.set(p.rim);
      this.matShine.color.set(p.shine);
      if (this.matBlush && p.blush) this.matBlush.color.set(p.blush);
      if (this.matSmoothShader) {
        this.matSmoothShader.uniforms.uBodyColor.value.set(p.body);
        this.matSmoothShader.uniforms.uBaseColor.value.set(p.rim);
        this.matSmoothShader.uniforms.uShineColor.value.set(p.shine);
      }
    }
    this.triggerPoke();
  }

  setState(st) {
    this.state = st;
  }

  triggerPoke() {
    this.pokeImpulse = 1.0;
  }

  start() {
    if (this.running) return;
    this.running = true;
    let last = performance.now();
    let t = 0;

    const animate = (now) => {
      if (!this.running) return;
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      t += dt * this.speed;

      this.stepPhysics(t, dt);
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  stepPhysics(t, dt) {
    if (!this.slimeBodyGroup) return;

    this.pokeImpulse = Math.max(0, this.pokeImpulse - dt * 2.8);

    const st = this.state;
    const isHappy = st === 'happy';
    const isSpeaking = st === 'speaking';
    const isThinking = st === 'thinking';
    const isListening = st === 'listening';

    // Squish physics
    const idleSquish = Math.sin(t * 2.6) * 0.045;
    const speakSquish = Math.sin(t * 10.5) * 0.085 * this.squishIntensity;
    const happySquish = Math.sin(t * 11.0) * 0.14 * this.squishIntensity;
    const pokeSquish = -Math.sin(this.pokeImpulse * Math.PI * 3) * 0.28 * this.pokeImpulse;

    const scaleY =
      1.0 +
      idleSquish * (st === 'idle' ? 1 : 0.3) +
      speakSquish * (isSpeaking ? 1 : 0) +
      happySquish * (isHappy ? 1 : 0) +
      pokeSquish;

    const invXZ = 1.0 / Math.sqrt(Math.max(0.55, scaleY));
    this.slimeBodyGroup.scale.set(invXZ, scaleY, invXZ);

    const hopY =
      Math.sin(t * 2.6) * 0.08 +
      (isSpeaking ? Math.abs(Math.sin(t * 5.25)) * 0.22 : 0) +
      (isHappy ? Math.abs(Math.sin(t * 5.5)) * 0.55 : 0);

    this.slimeBodyGroup.position.y = (scaleY - 1.0) * 0.85 + hopY;

    // Gaze / Cursor tracking
    const targetRotY = this.mouse.x * 0.28;
    const targetRotX = -this.mouse.y * 0.18;
    this.botRoot.rotation.y += (targetRotY - this.botRoot.rotation.y) * 0.12;
    this.botRoot.rotation.x += (targetRotX - this.botRoot.rotation.x) * 0.12;

    // Blinking
    const blink = (t % 4.0) > 3.82;
    const eyeScaleY = blink ? 0.15 : 1.0;
    this.leftEye.scale.y = eyeScaleY;
    this.rightEye.scale.y = eyeScaleY;

    // Mouth state
    this.mouthSmile.visible = false;
    this.mouthTalk.visible = false;
    this.mouthThink.visible = false;

    if (isSpeaking) {
      this.mouthTalk.visible = true;
      const openY = 0.35 + Math.abs(Math.sin(t * 13)) * 1.15;
      this.mouthTalk.scale.set(1, openY, 1);
    } else if (isHappy) {
      this.mouthTalk.visible = true;
      this.mouthTalk.scale.set(1.1, 1.0 + Math.sin(t * 9) * 0.15, 1);
    } else if (isThinking) {
      this.mouthThink.visible = true;
    } else if (this.showSmile) {
      this.mouthSmile.visible = true;
    }
  }

  stop() {
    this.running = false;
  }

  destroy() {
    this.stop();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('wheel', this.onWheel);
  }
}
