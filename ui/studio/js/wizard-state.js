// ─────────────────────────────────────────────────────────────
// ui/studio/js/wizard-state.js — Studio Wizard State & Constants
// ─────────────────────────────────────────────────────────────

export const state = {
  engine: 'cotton', // 'cotton' | '3d' | '2d' | 'starlet'
  geometryMode: 'smooth', // 'smooth' | 'voxel'
  palette3d: 'Grape Slime',
  palette2d: 'Lilac',
  currentPaletteName: 'Lilac',
  mood: 'idle',
  smile: true,
  squish: 1.0,
  blushIntensity: 75,
};

export const SPEECH_PHRASES = [
  "“Hi! I am <span class='font-bold text-primary'>Kumo</span>, your desktop thinking buddy. Ready to pair-program and ideate together!”",
  "“All systems nominal. Press <kbd class='px-1.5 py-0.5 rounded bg-surface-container text-on-surface font-semibold'>Alt+Space</kbd> anywhere to summon me!”",
  "“Spatial canvas ready. Drag and pin cards anywhere across your screens.”",
  "“Switch me between 2D pixel and 3D jelly anytime in the top bar!”",
  "“Your local thinking buddy is fully connected and ready for work!”"
];

export const PALETTE_GRADIENTS = {
  'Lilac': { stop0: '#FFFFFF', stop75: '#F2EBFF', stop100: '#E2EEFF' },
  'Peach': { stop0: '#FFFFFF', stop75: '#FFE8EF', stop100: '#FFD6E0' },
  'Sky': { stop0: '#FFFFFF', stop75: '#E0F2FE', stop100: '#BAE6FD' },
  'Mint': { stop0: '#FFFFFF', stop75: '#E6FBF0', stop100: '#A7F3D0' },
  'Grape Slime': { stop0: '#FFFFFF', stop75: '#F3E8FF', stop100: '#DDD6FE' },
  'Peach Pink': { stop0: '#FFFFFF', stop75: '#FDF2F8', stop100: '#FBCFE8' },
  'Classic Cyan': { stop0: '#FFFFFF', stop75: '#ECFEFF', stop100: '#A5F3FC' },
  'Mint Jelly': { stop0: '#FFFFFF', stop75: '#ECFDF5', stop100: '#A7F3D0' },
};

