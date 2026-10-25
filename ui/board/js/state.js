// ── ui/board/js/state.js: Workbench State & Presets ──

export const BOARD_STORAGE_KEY = 'kumo:assistant_board_v5';

export const DESIGN_PALETTES = [
  { name: 'Kumo Classic', colors: ['#EADFFF', '#DCEDFF', '#DCF5E7', '#FFE9D6', '#FFF5C8'] },
  { name: 'Neon Cyber', colors: ['#00f0ff', '#ff007f', '#7000ff', '#ffe600', '#00ff88'] },
  { name: 'Velvet Dusk', colors: ['#1e1b2e', '#482387', '#9333ea', '#c084fc', '#f3e8ff'] },
  { name: 'Matcha Cream', colors: ['#285430', '#5f8d4e', '#a4be7b', '#e5d9b6', '#fefbe9'] },
  { name: 'Sunset Peach', colors: ['#ff7e67', '#ffac81', '#fec3a6', '#efe9ae', '#cdeac0'] },
];

export const DEFAULT_CARDS = [
  {
    id: 'card-launcher-1',
    type: 'launcher',
    title: 'App Launcher & Hub',
    x: 60,
    y: 80,
    width: 560,
    data: {
      activeTab: 'apps',
      searchQuery: '',
      clipboardText: 'git commit -m "feat(spatial): tactile glassmorphic nodes"',
      apps: [
        { id: 'spotify', name: 'Spotify', icon: 'graphic_eq', bg: 'bg-emerald-100', text: 'text-emerald-700', status: 'RUNNING', statusColor: 'text-emerald-600 bg-emerald-50' },
        { id: 'code', name: 'VS Code', icon: 'terminal', bg: 'bg-blue-100', text: 'text-blue-700', status: 'IDLE', statusColor: 'text-secondary bg-surface-container-highest' },
        { id: 'chrome', name: 'Chrome', icon: 'public', bg: 'bg-amber-100', text: 'text-amber-700', status: 'ACTIVE', statusColor: 'text-emerald-600 bg-emerald-50' },
        { id: 'terminal', name: 'Terminal', icon: 'code', bg: 'bg-indigo-100', text: 'text-indigo-700', status: 'PID 89', statusColor: 'text-emerald-600 bg-emerald-50' },
        { id: 'notepad', name: 'Notepad', icon: 'description', bg: 'bg-purple-100', text: 'text-purple-700', status: 'READY', statusColor: 'text-secondary bg-surface-container-highest' },
        { id: 'explorer', name: 'Files', icon: 'folder_open', bg: 'bg-amber-100', text: 'text-amber-700', status: 'MOUNT', statusColor: 'text-secondary bg-surface-container-highest' },
      ],
      customApps: [],
    },
    zIndex: 1,
  },
  {
    id: 'card-writer-1',
    type: 'writer',
    title: 'AI Assistant Studio',
    x: 650,
    y: 80,
    width: 580,
    data: {
      activeTab: 'prompt',
      model: 'GPT-4o (Active)',
      tone: 'Professional',
      prompt: 'Architect an asynchronous Rust microservice that listens to local WebSocket events and synchronizes the infinite canvas node coordinates in 60fps.',
      response: '// WebSocket listener daemon initialized on ws://127.0.0.1:4020\npub async fn stream_canvas_delta(rx: Receiver<SpatialEvent>) -> Result<()> {\n    let mut interval = tokio::time::interval(Duration::from_millis(16));\n    // Bound coordinates seamlessly to 24px spatial steps\n}',
      tokenCount: 184,
      maxTokens: 4096,
    },
    zIndex: 2,
  },
  {
    id: 'card-code-1',
    type: 'code',
    title: 'PowerShell & DevOps Console',
    x: 60,
    y: 530,
    width: 560,
    data: {
      preset: 'sync-workspace.ps1',
      code: 'Get-ChildItem -Path ./src -Recurse -Depth 2 | Select-Object -First 8 Name, Length',
      output: 'PS C:\\Kumo\\spatial-engine> .\\scripts\\sync-workspace.ps1 -Channel "canary"\n[INFO] Scanning active workbench nodes across 24px coordinate grid...\n[SOCKET] Discovered client connection on 127.0.0.1:4020 (IPC Shared Memory)\n[OK] Memory bounds allocated: 48.2 MB / 512 MB. Spring dynamics steady.',
      pid: '9204',
      cpu: '1.2%',
    },
    zIndex: 3,
  },
  {
    id: 'card-note-1',
    type: 'notes',
    title: 'Sprint Scratchpad',
    x: 650,
    y: 530,
    width: 580,
    data: {
      bgColor: '#fff5c8',
      colorName: 'Solar Yellow',
      items: [
        { id: 't1', text: 'Configure IPC socket listeners', done: true, tag: 'BACKLOG' },
        { id: 't2', text: 'Implement pastel tint header blocks', done: true, tag: 'SYSTEM' },
        { id: 't3', text: 'Calibrate tactile 2.5deg tilt badges', done: true, tag: 'DESIGN' },
        { id: 't4', text: 'Verify 24px dot-matrix coordinate snap', done: false, tag: 'URGENT' },
        { id: 't5', text: 'Test mascot spring haptic responsiveness', done: false, tag: 'TESTING' },
      ],
      scratchText: 'Remember to run cargo build --release before generating standalone spatial electron wrappers.',
    },
    zIndex: 4,
  },
  {
    id: 'card-design-1',
    type: 'design',
    title: 'Mochi Companion & Theme Lab',
    x: 60,
    y: 1040,
    width: 1170,
    data: {
      activeMood: 'Idle',
      activePaletteIndex: 0,
      glowIntensity: 72,
      soundEnabled: true,
    },
    zIndex: 5,
  },
];

export const state = {
  scale: 1.0,
  panX: 0,
  panY: 0,
  isPanning: false,
  startPan: { x: 0, y: 0 },
  activeFilter: 'all',
  nextZIndex: 10,
  cards: [],
};
