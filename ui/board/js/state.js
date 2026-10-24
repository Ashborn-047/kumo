// ── ui/board/js/state.js: Workbench State & Presets ──

export const BOARD_STORAGE_KEY = 'kumo:assistant_board_v4';

export const DESIGN_PALETTES = [
  { name: 'Kumo Classic', colors: ['#DCEDFF', '#EADFFF', '#DCF5E7', '#FFE9D6', '#FFF5C8'] },
  { name: 'Neon Cyber', colors: ['#00f0ff', '#ff007f', '#7000ff', '#ffe600', '#00ff88'] },
  { name: 'Velvet Dusk', colors: ['#1e1b2e', '#482387', '#9333ea', '#c084fc', '#f3e8ff'] },
  { name: 'Matcha Cream', colors: ['#285430', '#5f8d4e', '#a4be7b', '#e5d9b6', '#fefbe9'] },
  { name: 'Sunset Peach', colors: ['#ff7e67', '#ffac81', '#fec3a6', '#efe9ae', '#cdeac0'] },
];

export const DEFAULT_CARDS = [
  {
    id: 'card-launcher-1',
    type: 'launcher',
    title: 'System & App Launcher',
    x: 60,
    y: 100,
    width: 540,
    data: {
      activeTab: 'apps',
      searchQuery: '',
      searchResults: [],
      clipboardText: '',
    },
    zIndex: 1,
  },
  {
    id: 'card-writer-1',
    type: 'writer',
    title: 'Writing & AI Drafting Suite',
    x: 640,
    y: 100,
    width: 540,
    data: {
      activeTab: 'editor',
      text: '',
      summary: '',
      wordCount: 0,
    },
    zIndex: 2,
  },
  {
    id: 'card-code-1',
    type: 'code',
    title: 'PowerShell & Scripts Sandbox',
    x: 60,
    y: 470,
    width: 560,
    data: {
      activeTab: 'editor',
      language: 'powershell',
      code: '',
      output: '',
    },
    zIndex: 3,
  },
  {
    id: 'card-design-1',
    type: 'design',
    title: 'Design Studio',
    x: 640,
    y: 470,
    width: 540,
    data: {
      activeTab: 'tokens',
      paletteIndex: 0,
      svgCode: '',
    },
    zIndex: 4,
  },
  {
    id: 'card-note-1',
    type: 'notes',
    title: 'Workspace Sticky Note',
    x: 640,
    y: 830,
    width: 500,
    data: {
      activeTab: 'checklist',
      items: [],
      scratchText: '',
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
