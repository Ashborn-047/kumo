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
    id: 'card-telemetry-1',
    type: 'telemetry',
    title: 'System Health & Telemetry Hub',
    x: 60,
    y: 1040,
    width: 560,
    data: {
      ram: null,
      cpu: null
    },
    zIndex: 5,
  },
  {
    id: 'card-network-1',
    type: 'network',
    title: 'Network Sentinel Hub',
    x: 650,
    y: 1040,
    width: 580,
    data: {
      ip: null,
      gateway: null,
      dns: null
    },
    zIndex: 6,
  },
  {
    id: 'card-media-1',
    type: 'media',
    title: 'Spotify & Media Orchestrator',
    x: 60,
    y: 1400,
    width: 560,
    data: {
      track: null,
      artist: null,
      isPlaying: false
    },
    zIndex: 7,
  },
  {
    id: 'card-workspace-1',
    type: 'workspace',
    title: 'Developer Workspace Hub',
    x: 650,
    y: 1400,
    width: 580,
    data: {
      repo: null,
      branch: null,
      nodeVersion: null,
      wsl: null
    },
    zIndex: 8,
  },

  {
    id: 'card-launcher-1',
    type: 'launcher',
    title: 'App Launcher & Hub',
    x: 60,
    y: 80,
    width: 560,
    data: {
      activeCategory: 'all',
      searchQuery: '',
      clipboardText: '',
      apps: [],
      scannedApps: [],
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
      model: 'Kumo Neural Engine',
      tone: 'Professional',
      prompt: '',
      response: '',
      tokenCount: 0,
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
      preset: 'system-info.ps1',
      code: 'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, TotalVisibleMemorySize, FreePhysicalMemory',
      output: '',
      pid: null,
      cpu: null,
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
        { id: 't1', text: 'Welcome to Kumoboard — Double-click to edit or check tasks', done: false, tag: 'TODO' },
      ],
      scratchText: '',
    },
    zIndex: 4,
  },
  {
    id: 'card-design-1',
    type: 'design',
    title: 'Kumo Companion & Theme Lab',
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
