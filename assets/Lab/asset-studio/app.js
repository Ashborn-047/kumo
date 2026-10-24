tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        kuma: {
                            bg: '#0c0a14',
                            surface: '#151221',
                            card: '#1e1a2e',
                            border: '#2e2744',
                            muted: '#9a94b8',
                            fg: '#ece9fb',
                            primary: '#8b7cf6',
                            primaryHover: '#7c6cf0'
                        }
                    },
                    fontFamily: {
                        sans: ['"Inter"', '"Trebuchet MS"', 'system-ui', 'sans-serif'],
                        mono: ['"JetBrains Mono"', 'monospace']
                    }
                }
            }
        }
    </script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <!-- Three.js r128 for 3D Viewport -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            overflow: hidden;
            background-color: #0c0a14;
            color: #ece9fb;
            user-select: none;
        }
        .bg-checkerboard {
            background-color: #151221;
            background-image: 
                linear-gradient(45deg, #1e1a2e 25%, transparent 25%), 
                linear-gradient(-45deg, #1e1a2e 25%, transparent 25%), 
                linear-gradient(45deg, transparent 75%, #1e1a2e 75%), 
                linear-gradient(-45deg, transparent 75%, #1e1a2e 75%);
            background-size: 24px 24px;
            background-position: 0 0, 0 12px, 12px -12px, -12px 0;
        }
        /* Custom Kuma Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0c0a14; }
        ::-webkit-scrollbar-thumb { background: #2e2744; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #3e375c; }
    </style>
</head>
<body class="h-screen w-screen flex flex-col md:flex-row overflow-hidden">

    <!-- LEFT / MAIN VIEWPORT CONTAINER -->
    <div id="viewport-container" class="relative flex-1 h-full w-full bg-kuma-surface flex items-center justify-center overflow-hidden">
        
        <!-- Top Navigation Bar & Mode Switcher -->
        <div class="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-30">
            <!-- Brand / Title Card -->
            <div class="bg-kuma-card/90 backdrop-blur-md border border-kuma-border px-4 py-2.5 rounded-2xl flex items-center gap-3 pointer-events-auto shadow-xl">
                <div class="w-3 h-3 rounded-full bg-kuma-primary animate-pulse shadow-[0_0_12px_#8b7cf6]"></div>
                <div>
                    <h1 class="text-xs sm:text-sm font-bold tracking-wide text-kuma-fg flex items-center gap-2">
                        KUMA DESIGN SYSTEM <span id="mode-badge" class="px-2 py-0.5 rounded text-[10px] bg-kuma-primary/20 text-kuma-primary border border-kuma-primary/30">3D STUDIO</span>
                    </h1>
                    <p id="state-readout" class="text-[11px] text-kuma-muted font-mono">STATE: IDLE</p>
                </div>
            </div>

            <!-- TAB SWITCHER: 3D STUDIO VS 2D PIXEL PUFF -->
            <div class="bg-kuma-card/90 backdrop-blur-md border border-kuma-border p-1.5 rounded-2xl flex items-center gap-1.5 pointer-events-auto shadow-2xl">
                <button id="tab-btn-3d" onclick="switchStudioMode('3d')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 bg-kuma-primary text-white shadow-[0_0_15px_rgba(139,124,246,0.4)]">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    <span>3D Studio</span>
                </button>
                <button id="tab-btn-2d" onclick="switchStudioMode('2d')" class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 text-kuma-muted hover:text-kuma-fg hover:bg-kuma-border/50">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
                    <span>2D Pixel Puff</span>
                </button>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW 1: 3D THREE.JS CANVAS CONTAINER        -->
        <!-- ========================================== -->
        <div id="view-3d" class="absolute inset-0 flex items-center justify-center">
            <canvas id="bot-canvas" class="w-full h-full block cursor-grab active:cursor-grabbing"></canvas>
            
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 bg-kuma-card/90 backdrop-blur-md border border-kuma-border px-3 py-1.5 rounded-xl text-xs text-kuma-muted shadow-2xl pointer-events-none z-10 flex items-center gap-3">
                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg> Drag to Rotate</span>
                <span class="text-kuma-border">|</span>
                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg> Click Slime to Boop</span>
                <span class="text-kuma-border">|</span>
                <span class="flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg> Scroll to Zoom</span>
            </div>
        </div>

        <!-- ========================================== -->
        <!-- VIEW 2: 2D PIXEL PUFF CANVAS CONTAINER     -->
        <!-- ========================================== -->
        <div id="view-2d" class="absolute inset-0 hidden items-center justify-center bg-kuma-surface">
            <div class="flex flex-col items-center justify-center p-6">
                <div id="puff-stage" class="rounded-3xl border border-kuma-border bg-kuma-card p-6 shadow-2xl flex items-center justify-center transition-all">
                    <canvas id="pixel-canvas" width="64" height="64" class="w-64 h-64 sm:w-80 sm:h-80 block rounded-2xl cursor-pointer" style="image-rendering: pixelated; image-rendering: crisp-edges;" aria-label="Puff, a pixel cloud assistant"></canvas>
                </div>
                <p class="text-xs text-kuma-muted mt-3 flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Click or tap Puff to boop! Right-click to save transparent 64px PNG.
                </p>
            </div>
        </div>

        <!-- Notification Toast -->
        <div id="toast" class="fixed top-20 left-1/2 -translate-x-1/2 bg-kuma-primary text-white font-semibold px-4 py-2 rounded-xl shadow-2xl transition-all duration-300 opacity-0 pointer-events-none translate-y-[-10px] z-50 text-sm flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span id="toast-msg">Asset exported!</span>
        </div>
    </div>

    <!-- RIGHT CONTROL SIDEBAR (KUMA DESIGN SYSTEM THEME) -->
    <div class="w-full md:w-80 lg:w-96 bg-kuma-card border-t md:border-t-0 md:border-l border-kuma-border flex flex-col h-[48vh] md:h-full z-20">
        <!-- Sidebar Header -->
        <div class="p-4 border-b border-kuma-border flex items-center justify-between">
            <h2 id="sidebar-title" class="font-bold text-kuma-fg flex items-center gap-2 text-sm uppercase tracking-wider">
                <svg class="w-4 h-4 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
                3D Studio Controls
            </h2>
            <button id="btn-reset-view" onclick="resetCamera()" class="text-xs text-kuma-primary hover:text-white font-medium px-2.5 py-1 rounded bg-kuma-surface border border-kuma-border transition flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Reset View
            </button>
        </div>

        <!-- Scrollable Controls List -->
        <div class="flex-1 overflow-y-auto p-4 space-y-6">

            <!-- Interactive Animation State Switcher -->
            <div class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-wider text-kuma-muted block">Assistant State / Animation</label>
                <div class="grid grid-cols-2 gap-2 bg-kuma-surface p-1.5 rounded-xl border border-kuma-border">
                    <button onclick="setBotState('normal')" id="st-btn-normal" class="px-3 py-2 rounded-lg text-xs font-bold bg-kuma-primary text-white transition flex items-center justify-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                        Idle
                    </button>
                    <button onclick="setBotState('animated')" id="st-btn-animated" class="px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition flex items-center justify-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                        Speaking
                    </button>
                    <button onclick="setBotState('listening')" id="st-btn-listening" class="px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition flex items-center justify-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 100-6 3 3 0 000 6z"></path></svg>
                        Listening
                    </button>
                    <button onclick="setBotState('happy')" id="st-btn-happy" class="px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition flex items-center justify-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Happy Hop
                    </button>
                    <button onclick="setBotState('thinking')" id="st-btn-thinking" class="px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition col-span-2 flex items-center justify-center gap-1.5">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                        Thinking
                    </button>
                </div>
            </div>

            <!-- 3D Specific Geometry & Customization Controls -->
            <div id="controls-3d-group" class="space-y-4">
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-wider text-kuma-muted block">3D Geometry Style</label>
                    <div class="grid grid-cols-2 gap-2 bg-kuma-surface p-1.5 rounded-xl border border-kuma-border">
                        <button id="style-btn-voxel" onclick="setGeometryMode('voxel')" class="px-3 py-2 rounded-lg text-xs font-bold bg-kuma-primary text-white shadow transition flex items-center justify-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10l8 4 8-4V7M4 7l8 4 8-4M4 7l8-4 8 4"></path></svg>
                            Pixel Voxel
                        </button>
                        <button id="style-btn-smooth" onclick="setGeometryMode('smooth')" class="px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition flex items-center justify-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            Smooth Mochi
                        </button>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-wider text-kuma-muted block">Color Palette</label>
                    <div id="palette-grid-3d" class="grid grid-cols-2 gap-2">
                        <button onclick="setSlimePalette('#29b6f6', '#1976d2', '#e1f5fe')" class="px-2.5 py-2 rounded-lg bg-kuma-surface hover:bg-kuma-border/50 text-xs font-semibold text-sky-300 border border-kuma-border flex items-center gap-2">
                            <span class="w-3.5 h-3.5 rounded bg-[#29b6f6] inline-block shadow"></span> Classic Cyan
                        </button>
                        <button onclick="setSlimePalette('#f472b6', '#db2777', '#fce7f3')" class="px-2.5 py-2 rounded-lg bg-kuma-surface hover:bg-kuma-border/50 text-xs font-semibold text-pink-300 border border-kuma-border flex items-center gap-2">
                            <span class="w-3.5 h-3.5 rounded bg-[#f472b6] inline-block shadow"></span> Peach Pink
                        </button>
                        <button onclick="setSlimePalette('#a78bfa', '#7c3aed', '#ede9fe')" class="px-2.5 py-2 rounded-lg bg-kuma-surface hover:bg-kuma-border/50 text-xs font-semibold text-purple-300 border border-kuma-border flex items-center gap-2">
                            <span class="w-3.5 h-3.5 rounded bg-[#a78bfa] inline-block shadow"></span> Grape Slime
                        </button>
                        <button onclick="setSlimePalette('#34d399', '#059669', '#d1fae5')" class="px-2.5 py-2 rounded-lg bg-kuma-surface hover:bg-kuma-border/50 text-xs font-semibold text-emerald-300 border border-kuma-border flex items-center gap-2">
                            <span class="w-3.5 h-3.5 rounded bg-[#34d399] inline-block shadow"></span> Mint Jelly
                        </button>
                    </div>
                </div>

                <div class="space-y-3 bg-kuma-surface p-3 rounded-xl border border-kuma-border">
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-kuma-fg">Animation Speed</span>
                            <span id="speed-val" class="font-mono text-kuma-muted">1.0x</span>
                        </div>
                        <input id="slider-speed" type="range" min="0.2" max="2.5" step="0.1" value="1.0" class="w-full accent-kuma-primary cursor-pointer">
                    </div>
                    <div>
                        <div class="flex justify-between text-xs mb-1">
                            <span class="text-kuma-fg">Squish Intensity</span>
                            <span id="voice-val" class="font-mono text-kuma-muted">100%</span>
                        </div>
                        <input id="slider-voice" type="range" min="20" max="180" step="10" value="100" class="w-full accent-kuma-primary cursor-pointer">
                    </div>
                    <div class="flex items-center justify-between pt-1">
                        <span class="text-xs text-kuma-fg">Show Cute Smile</span>
                        <input id="toggle-mouth" type="checkbox" checked class="w-4 h-4 accent-kuma-primary rounded cursor-pointer">
                    </div>
                </div>
            </div>

            <!-- 2D Specific Controls Group (Hidden in 3D mode) -->
            <div id="controls-2d-group" class="space-y-4 hidden">
                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-wider text-kuma-muted block">2D Color Palette</label>
                    <div id="palette-grid-2d" class="grid grid-cols-2 gap-2"></div>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-wider text-kuma-muted block">2D Background Style</label>
                    <div id="bg-grid-2d" class="grid grid-cols-3 gap-2"></div>
                </div>

                <div class="space-y-2">
                    <label class="text-xs font-semibold uppercase tracking-wider text-kuma-muted block">2D Animation Speed</label>
                    <input id="slider-speed-2d" type="range" min="0.4" max="2" step="0.1" value="1" class="w-full accent-kuma-primary cursor-pointer">
                </div>
            </div>

            <!-- Viewport Background Setup (3D) -->
            <div id="bg-3d-panel" class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-wider text-kuma-muted block">Viewport Background</label>
                <div class="grid grid-cols-2 gap-2">
                    <button id="bg-btn-dark" onclick="setViewportBg('dark')" class="px-3 py-2 rounded-xl text-xs font-semibold bg-kuma-primary/20 border border-kuma-primary text-kuma-fg flex items-center justify-center gap-2">
                        <svg class="w-3.5 h-3.5 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        Cozy Dark
                    </button>
                    <button id="bg-btn-trans" onclick="setViewportBg('checker')" class="px-3 py-2 rounded-xl text-xs font-semibold bg-kuma-surface border border-kuma-border text-kuma-muted hover:bg-kuma-border/50 flex items-center justify-center gap-2">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"></path></svg>
                        Transparent
                    </button>
                </div>
            </div>

            <!-- Export Assets Section -->
            <div class="space-y-3 pt-2 border-t border-kuma-border">
                <label class="text-xs font-semibold uppercase tracking-wider text-kuma-primary block">Export Assets</label>
                <div class="space-y-2">
                    <button onclick="exportCurrentAsset()" class="w-full py-2.5 px-4 rounded-xl bg-kuma-primary hover:bg-kuma-primaryHover text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        Download Current Asset (PNG)
                    </button>
                    <button id="btn-spritesheet-3d" onclick="exportSpriteSheet(8)" class="w-full py-2.5 px-4 rounded-xl bg-kuma-surface hover:bg-kuma-border/50 border border-kuma-border text-kuma-fg font-semibold text-xs transition flex items-center justify-center gap-2">
                        <svg class="w-4 h-4 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                        Generate 8-Frame Sprite Sheet
                    </button>
                </div>
            </div>

        </div>
    </div>

    <!-- ========================================== -->
    <!-- JAVASCRIPT LOGIC (BOTH 3D & 2D INTEGRATED)  -->
    <!-- ========================================== -->
    <script>
        let studioMode = '3d'; // '3d' | '2d'
        let currentState = 'normal'; // 'normal' | 'animated' | 'listening' | 'happy' | 'thinking'

        function switchStudioMode(mode) {
            studioMode = mode;
            const btn3d = document.getElementById('tab-btn-3d');
            const btn2d = document.getElementById('tab-btn-2d');
            const v3d = document.getElementById('view-3d');
            const v2d = document.getElementById('view-2d');
            const c3dGroup = document.getElementById('controls-3d-group');
            const c2dGroup = document.getElementById('controls-2d-group');
            const bg3dPanel = document.getElementById('bg-3d-panel');
            const modeBadge = document.getElementById('mode-badge');
            const sidebarTitle = document.getElementById('sidebar-title');
            const btnReset = document.getElementById('btn-reset-view');
            const btnSheet = document.getElementById('btn-spritesheet-3d');

            if (mode === '3d') {
                btn3d.className = "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 bg-kuma-primary text-white shadow-[0_0_15px_rgba(139,124,246,0.4)]";
                btn2d.className = "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 text-kuma-muted hover:text-kuma-fg hover:bg-kuma-border/50";
                v3d.classList.remove('hidden');
                v3d.classList.add('flex');
                v2d.classList.add('hidden');
                v2d.classList.remove('flex');
                c3dGroup.classList.remove('hidden');
                c2dGroup.classList.add('hidden');
                bg3dPanel.classList.remove('hidden');
                modeBadge.textContent = '3D STUDIO';
                sidebarTitle.innerHTML = `<svg class="w-4 h-4 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg> 3D Studio Controls`;
                btnReset.style.display = 'flex';
                btnSheet.style.display = 'flex';
            } else {
                btn2d.className = "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 bg-kuma-primary text-white shadow-[0_0_15px_rgba(139,124,246,0.4)]";
                btn3d.className = "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 text-kuma-muted hover:text-kuma-fg hover:bg-kuma-border/50";
                v2d.classList.remove('hidden');
                v2d.classList.add('flex');
                v3d.classList.add('hidden');
                v3d.classList.remove('flex');
                c2dGroup.classList.remove('hidden');
                c3dGroup.classList.add('hidden');
                bg3dPanel.classList.add('hidden');
                modeBadge.textContent = '2D PIXEL PUFF';
                sidebarTitle.innerHTML = `<svg class="w-4 h-4 text-kuma-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg> 2D Puff Controls`;
                btnReset.style.display = 'none';
                btnSheet.style.display = 'none';
            }
        }

        function setBotState(st) {
            currentState = st;
            puffS.state = st;

            ['normal', 'animated', 'listening', 'happy', 'thinking'].forEach(k => {
                const b = document.getElementById('st-btn-' + k);
                if (!b) return;
                if (k === st) {
                    b.className = "px-3 py-2 rounded-lg text-xs font-bold bg-kuma-primary text-white transition flex items-center justify-center gap-1.5";
                } else {
                    b.className = "px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition flex items-center justify-center gap-1.5";
                }
            });

            const stateNames = ['idle', 'speaking', 'listening', 'happy', 'thinking'];
            const stIdx = stateNames.indexOf(st);
            if (stIdx !== -1) {
                const box2d = document.getElementById('states-2d');
                if (box2d) {
                    [...box2d.children].forEach((c, j) => c.setAttribute('aria-pressed', j === stIdx));
                }
            }

            document.getElementById('state-readout').textContent = 'STATE: ' + st.toUpperCase();
            triggerPokeSquish();
        }

        function exportCurrentAsset() {
            if (studioMode === '3d') {
                exportTransparentPNG();
            } else {
                const link = document.createElement('a');
                link.download = `puff-${puffS.state}.png`;
                link.href = document.getElementById('pixel-canvas').toDataURL('image/png');
                link.click();
                showToast(`Exported puff-${puffS.state}.png!`);
            }
        }

        function showToast(msg) {
            const toast = document.getElementById('toast');
            document.getElementById('toast-msg').textContent = msg;
            toast.classList.remove('opacity-0', 'translate-y-[-10px]');
            toast.classList.add('opacity-100', 'translate-y-0');
            setTimeout(() => {
                toast.classList.remove('opacity-100', 'translate-y-0');
                toast.classList.add('opacity-0', 'translate-y-[-10px]');
            }, 2600);
        }

        // ------------------------------------------
        // PART 1: 3D THREE.JS STUDIO LOGIC
        // ------------------------------------------
        let geometryMode = 'voxel';
        let animSpeed = 1.0;
        let squishIntensity = 1.0;
        let trackMouse = true;
        let showSmileMouth = true;

        let bodyHex = '#29b6f6';
        let baseRimHex = '#1976d2';
        let shineHex = '#e1f5fe';
        let eyeHex = '#0f172a';
        let blushHex = '#ff80ab';

        let pokeImpulse = 0.0;
        let stateWeights = { normal: 1, animated: 0, listening: 0, happy: 0, thinking: 0 };
        let totalTime = 0;

        let isDragging = false;
        let prevMouse = { x: 0, y: 0 };
        let cameraSpherical = { radius: 6.4, theta: 0.0, phi: Math.PI / 2.05 };
        let mouseNormalized = { x: 0, y: 0 };

        let scene, camera, renderer;
        let botRoot, slimeBodyGroup, voxelBodyGroup, smoothBodyGroup;
        let faceGroup, leftEyeBlock, rightEyeBlock, leftHappyEye, rightHappyEye;
        let leftBlushMesh, rightBlushMesh;
        let mouthGroup, mouthSmileMesh, mouthTalkMesh, mouthThinkDot;
        let auraRingsGroup, particlesGroup, thinkingDotsGroup, glowBackSprite;
        let matBody, matBaseRim, matShine, matEye, matBlush, matSmoothShader;

        const SLIME_GRID = [
            "....BBBB....",
            "..BBHHBBBB..",
            ".BBHHBBBBBB.",
            ".BHBBBBBBBB.",
            "BBBBBBBBBBBB",
            "BBBBBBBBBBBB",
            "BBBBBBBBBBBB",
            "BBBBBBBBBBBB",
            "BBBBBBBBBBBB",
            "DBBBBBBBBBBD",
            "DDDDDDDDDDDD"
        ];

        function createSoftGlowTexture(hexColor) {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(128, 128, 10, 128, 128, 120);
            grad.addColorStop(0, hexColor + '66');
            grad.addColorStop(0.5, hexColor + '22');
            grad.addColorStop(1, hexColor + '00');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 256, 256);
            return new THREE.CanvasTexture(canvas);
        }

        function createSmoothSlimeShader() {
            return new THREE.ShaderMaterial({
                uniforms: {
                    uBodyColor: { value: new THREE.Color(bodyHex) },
                    uBaseColor: { value: new THREE.Color(baseRimHex) },
                    uShineColor: { value: new THREE.Color(shineHex) },
                    uLightDir: { value: new THREE.Vector3(-0.45, 0.75, 0.65).normalize() }
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
                        float baseBand = smoothstep(-0.88, -0.78, vPos.y);
                        vec3 col = mix(uBaseColor, uBodyColor, baseBand);
                        float spec = dot(n, uLightDir);
                        float shineMask = smoothstep(0.68, 0.74, spec) * step(0.15, vPos.y) * step(vPos.x, 0.15);
                        col = mix(col, uShineColor, shineMask * 0.9);
                        float rim = 1.0 - max(dot(n, vec3(0.0, 0.0, 1.0)), 0.0);
                        col = mix(col, uShineColor, smoothstep(0.65, 0.95, rim) * 0.25);
                        gl_FragColor = vec4(col, 1.0);
                    }
                `
            });
        }

        function buildMochiCloudBot() {
            botRoot = new THREE.Group();
            scene.add(botRoot);

            matBody = new THREE.MeshToonMaterial({ color: bodyHex, emissive: bodyHex, emissiveIntensity: 0.22 });
            matBaseRim = new THREE.MeshToonMaterial({ color: baseRimHex, emissive: baseRimHex, emissiveIntensity: 0.15 });
            matShine = new THREE.MeshBasicMaterial({ color: shineHex });
            matEye = new THREE.MeshBasicMaterial({ color: eyeHex });
            matBlush = new THREE.MeshBasicMaterial({ color: blushHex });
            matSmoothShader = createSmoothSlimeShader();

            const glowMat = new THREE.SpriteMaterial({
                map: createSoftGlowTexture(bodyHex),
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            glowBackSprite = new THREE.Sprite(glowMat);
            glowBackSprite.scale.set(5.2, 5.2, 1);
            glowBackSprite.position.set(0, 0, -0.5);
            botRoot.add(glowBackSprite);

            slimeBodyGroup = new THREE.Group();
            botRoot.add(slimeBodyGroup);

            // Voxel Body
            voxelBodyGroup = new THREE.Group();
            slimeBodyGroup.add(voxelBodyGroup);
            const voxSize = 0.22;
            const rows = SLIME_GRID.length, cols = SLIME_GRID[0].length;
            const boxGeo = new THREE.BoxGeometry(voxSize * 1.01, voxSize * 1.01, voxSize * 1.01);

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const ch = SLIME_GRID[r][c];
                    if (ch === '.') continue;
                    const distFromEdge = Math.min(c, cols - 1 - c, r, rows - 1 - r);
                    const depthLayers = distFromEdge === 0 ? 5 : (distFromEdge === 1 ? 7 : 8);

                    for (let z = -Math.floor(depthLayers / 2); z <= Math.floor(depthLayers / 2); z++) {
                        let mat = matBody;
                        if (ch === 'D') mat = matBaseRim;
                        if (ch === 'H' && z >= Math.floor(depthLayers / 2) - 1) mat = matShine;
                        const vox = new THREE.Mesh(boxGeo, mat);
                        vox.position.set((c - (cols - 1) / 2) * voxSize, ((rows - 1) / 2 - r) * voxSize, z * voxSize);
                        voxelBodyGroup.add(vox);
                    }
                }
            }

            // Smooth Body
            smoothBodyGroup = new THREE.Group();
            smoothBodyGroup.visible = false;
            slimeBodyGroup.add(smoothBodyGroup);
            const domeGeo = new THREE.SphereGeometry(1.38, 64, 64);
            const posAttr = domeGeo.attributes.position;
            const v = new THREE.Vector3();
            for (let i = 0; i < posAttr.count; i++) {
                v.fromBufferAttribute(posAttr, i);
                if (v.y < 0) {
                    v.y = Math.max(-1.05, v.y * 0.82);
                    const flatFactor = Math.min(1.0, Math.abs(v.y / 1.05));
                    v.x *= 1.0 + flatFactor * 0.08; v.z *= 1.0 + flatFactor * 0.08;
                } else { v.y *= 0.92; }
                posAttr.setXYZ(i, v.x, v.y, v.z);
            }
            domeGeo.computeVertexNormals();
            smoothBodyGroup.add(new THREE.Mesh(domeGeo, matSmoothShader));

            // Face
            faceGroup = new THREE.Group();
            faceGroup.position.set(0, 0, 1.04);
            slimeBodyGroup.add(faceGroup);

            const eyeGeo = new THREE.BoxGeometry(voxSize * 1.05, voxSize * 2.1, 0.08);
            leftEyeBlock = new THREE.Mesh(eyeGeo, matEye);
            leftEyeBlock.position.set(-voxSize * 2.5, -voxSize * 0.5, 0);
            faceGroup.add(leftEyeBlock);

            rightEyeBlock = new THREE.Mesh(eyeGeo, matEye);
            rightEyeBlock.position.set(voxSize * 2.5, -voxSize * 0.5, 0);
            faceGroup.add(rightEyeBlock);

            const blushGeo = new THREE.BoxGeometry(voxSize * 1.15, voxSize * 0.95, 0.07);
            leftBlushMesh = new THREE.Mesh(blushGeo, matBlush);
            leftBlushMesh.position.set(-voxSize * 3.55, -voxSize * 1.95, 0);
            faceGroup.add(leftBlushMesh);
            rightBlushMesh = new THREE.Mesh(blushGeo, matBlush);
            rightBlushMesh.position.set(voxSize * 3.55, -voxSize * 1.95, 0);
            faceGroup.add(rightBlushMesh);

            mouthGroup = new THREE.Group();
            mouthGroup.position.set(0, -voxSize * 1.85, 0.01);
            faceGroup.add(mouthGroup);

            mouthSmileMesh = new THREE.Group();
            const mCenter = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 1.4, voxSize * 0.45, 0.07), matEye);
            const mLeft = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 0.5, voxSize * 0.45, 0.07), matEye);
            mLeft.position.set(-voxSize * 0.85, voxSize * 0.35, 0);
            const mRight = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 0.5, voxSize * 0.45, 0.07), matEye);
            mRight.position.set(voxSize * 0.85, voxSize * 0.35, 0);
            mouthSmileMesh.add(mCenter, mLeft, mRight);
            mouthGroup.add(mouthSmileMesh);

            mouthTalkMesh = new THREE.Group();
            mouthTalkMesh.visible = false;
            const talkBack = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 1.8, voxSize * 1.4, 0.06), matEye);
            const talkTongue = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 1.1, voxSize * 0.65, 0.08), matBlush);
            talkTongue.position.set(0, -voxSize * 0.35, 0.01);
            mouthTalkMesh.add(talkBack, talkTongue);
            mouthGroup.add(mouthTalkMesh);

            mouthThinkDot = new THREE.Mesh(new THREE.BoxGeometry(voxSize * 0.7, voxSize * 0.7, 0.07), matEye);
            mouthThinkDot.visible = false;
            mouthGroup.add(mouthThinkDot);

            // Aura & Effects
            auraRingsGroup = new THREE.Group();
            botRoot.add(auraRingsGroup);
            for (let r = 0; r < 3; r++) {
                const ringGeo = new THREE.RingGeometry(1.55 + r * 0.35, 1.63 + r * 0.35, 32);
                ringGeo.rotateX(-Math.PI / 2);
                auraRingsGroup.add(new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: bodyHex, side: THREE.DoubleSide, transparent: true, opacity: 0.0 })));
            }

            particlesGroup = new THREE.Group();
            botRoot.add(particlesGroup);
            const miniVoxGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);
            for (let i = 0; i < 12; i++) {
                const pMesh = new THREE.Mesh(miniVoxGeo, new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? shineHex : bodyHex, transparent: true, opacity: 0 }));
                pMesh.userData = { angle: (i / 12) * Math.PI * 2, radius: 1.75 + (i % 3) * 0.28, yBase: -0.6 + (i % 4) * 0.45, speed: 0.8 + (i % 3) * 0.3 };
                particlesGroup.add(pMesh);
            }

            thinkingDotsGroup = new THREE.Group();
            botRoot.add(thinkingDotsGroup);
            [0.16, 0.24, 0.34].forEach((sz, idx) => {
                const dMesh = new THREE.Mesh(new THREE.BoxGeometry(sz, sz, sz), matShine);
                dMesh.position.copy([new THREE.Vector3(1.35, 0.95, 0.2), new THREE.Vector3(1.72, 1.32, 0.2), new THREE.Vector3(2.18, 1.75, 0.2)][idx]);
                dMesh.scale.set(0, 0, 0);
                thinkingDotsGroup.add(dMesh);
            });
        }

        function initThreeScene() {
            const canvas = document.getElementById('bot-canvas');
            const container = document.getElementById('viewport-container');
            scene = new THREE.Scene();
            scene.add(new THREE.AmbientLight(0xffffff, 0.85));
            const dirLight = new THREE.DirectionalLight(0xffffff, 0.55);
            dirLight.position.set(-3, 6, 5);
            scene.add(dirLight);

            camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
            updateCameraOrbit();

            renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
            renderer.setSize(container.clientWidth, container.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

            buildMochiCloudBot();
            setup3DListeners(canvas, container);
        }

        function updateCameraOrbit() {
            const { radius, theta, phi } = cameraSpherical;
            camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
            camera.position.y = radius * Math.cos(phi);
            camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
            camera.lookAt(0, 0.1, 0);
        }

        function triggerPokeSquish() { pokeImpulse = 1.0; }

        function setGeometryMode(mode) {
            geometryMode = mode;
            voxelBodyGroup.visible = (mode === 'voxel');
            smoothBodyGroup.visible = (mode === 'smooth');
            triggerPokeSquish();

            document.getElementById('style-btn-voxel').className = mode === 'voxel' ? "px-3 py-2 rounded-lg text-xs font-bold bg-kuma-primary text-white shadow transition flex items-center justify-center gap-1.5" : "px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition flex items-center justify-center gap-1.5";
            document.getElementById('style-btn-smooth').className = mode === 'smooth' ? "px-3 py-2 rounded-lg text-xs font-bold bg-kuma-primary text-white shadow transition flex items-center justify-center gap-1.5" : "px-3 py-2 rounded-lg text-xs font-bold text-kuma-muted hover:text-kuma-fg transition flex items-center justify-center gap-1.5";
        }

        function setSlimePalette(mainHex, rimHex, topShineHex) {
            bodyHex = mainHex; baseRimHex = rimHex; shineHex = topShineHex;
            matBody.color.set(mainHex); matBody.emissive.set(mainHex);
            matBaseRim.color.set(rimHex); matBaseRim.emissive.set(rimHex);
            matShine.color.set(topShineHex);
            matSmoothShader.uniforms.uBodyColor.value.set(mainHex);
            matSmoothShader.uniforms.uBaseColor.value.set(rimHex);
            matSmoothShader.uniforms.uShineColor.value.set(topShineHex);
            glowBackSprite.material.map = createSoftGlowTexture(mainHex);
            glowBackSprite.material.needsUpdate = true;
            auraRingsGroup.children.forEach(r => r.material.color.set(mainHex));
            triggerPokeSquish();
        }

        function setViewportBg(mode) {
            const container = document.getElementById('viewport-container');
            const btnDark = document.getElementById('bg-btn-dark');
            const btnTrans = document.getElementById('bg-btn-trans');
            if (mode === 'checker') {
                container.classList.remove('bg-kuma-surface'); container.classList.add('bg-checkerboard');
                btnTrans.className = "px-3 py-2 rounded-xl text-xs font-semibold bg-kuma-primary/20 border border-kuma-primary text-kuma-fg flex items-center justify-center gap-2";
                btnDark.className = "px-3 py-2 rounded-xl text-xs font-semibold bg-kuma-surface border border-kuma-border text-kuma-muted hover:bg-kuma-border/50 flex items-center justify-center gap-2";
            } else {
                container.classList.remove('bg-checkerboard'); container.classList.add('bg-kuma-surface');
                btnDark.className = "px-3 py-2 rounded-xl text-xs font-semibold bg-kuma-primary/20 border border-kuma-primary text-kuma-fg flex items-center justify-center gap-2";
                btnTrans.className = "px-3 py-2 rounded-xl text-xs font-semibold bg-kuma-surface border border-kuma-border text-kuma-muted hover:bg-kuma-border/50 flex items-center justify-center gap-2";
            }
        }

        function resetCamera() {
            cameraSpherical = { radius: 6.4, theta: 0, phi: Math.PI / 2.05 };
            updateCameraOrbit();
        }

        function exportTransparentPNG() {
            renderer.render(scene, camera);
            const link = document.createElement('a');
            link.download = `ai-bot-${currentState}-state.png`;
            link.href = renderer.domElement.toDataURL('image/png');
            link.click();
            showToast(`Exported ai-bot-${currentState}-state.png!`);
        }

        async function exportSpriteSheet(framesCount = 8) {
            const frameSize = 512;
            const sheetCanvas = document.createElement('canvas');
            sheetCanvas.width = frameSize * framesCount; sheetCanvas.height = frameSize;
            const sCtx = sheetCanvas.getContext('2d');
            const container = document.getElementById('viewport-container');
            const origW = container.clientWidth, origH = container.clientHeight, origAspect = camera.aspect;

            camera.aspect = 1.0; camera.updateProjectionMatrix();
            renderer.setSize(frameSize, frameSize, false);
            const stepDt = 1.6 / framesCount;
            for (let i = 0; i < framesCount; i++) {
                step3DSimulation(stepDt);
                renderer.render(scene, camera);
                sCtx.drawImage(renderer.domElement, i * frameSize, 0, frameSize, frameSize);
            }
            camera.aspect = origAspect; camera.updateProjectionMatrix();
            renderer.setSize(origW, origH, false);

            const link = document.createElement('a');
            link.download = `ai-bot-${currentState}-spritesheet.png`;
            link.href = sheetCanvas.toDataURL('image/png');
            link.click();
            showToast(`Generated 8-Frame Sprite Sheet!`);
        }

        function setup3DListeners(canvas, container) {
            canvas.addEventListener('mousedown', (e) => { isDragging = true; prevMouse = { x: e.clientX, y: e.clientY }; });
            window.addEventListener('mouseup', () => { isDragging = false; });
            window.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseNormalized.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                mouseNormalized.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                if (!isDragging) return;
                const dx = e.clientX - prevMouse.x, dy = e.clientY - prevMouse.y;
                prevMouse = { x: e.clientX, y: e.clientY };
                cameraSpherical.theta -= dx * 0.007;
                cameraSpherical.phi = Math.max(0.4, Math.min(Math.PI - 0.4, cameraSpherical.phi - dy * 0.007));
                updateCameraOrbit();
            });
            canvas.addEventListener('wheel', (e) => {
                e.preventDefault();
                cameraSpherical.radius = Math.max(4.5, Math.min(15, cameraSpherical.radius + e.deltaY * 0.005));
                updateCameraOrbit();
            }, { passive: false });
            canvas.addEventListener('click', () => triggerPokeSquish());

            document.getElementById('slider-speed').addEventListener('input', (e) => {
                animSpeed = parseFloat(e.target.value);
                document.getElementById('speed-val').textContent = animSpeed.toFixed(1) + 'x';
            });
            document.getElementById('slider-voice').addEventListener('input', (e) => {
                squishIntensity = parseInt(e.target.value, 10) / 100;
                document.getElementById('voice-val').textContent = e.target.value + '%';
            });
            document.getElementById('toggle-mouth').addEventListener('change', (e) => {
                showSmileMouth = e.target.checked;
            });
        }

        function step3DSimulation(dt) {
            totalTime += dt * animSpeed;
            const t = totalTime;
            if (pokeImpulse > 0) pokeImpulse = Math.max(0, pokeImpulse - dt * 2.8);

            ['normal', 'animated', 'listening', 'happy', 'thinking'].forEach(st => {
                const target = currentState === st ? 1.0 : 0.0;
                stateWeights[st] += (target - stateWeights[st]) * Math.min(1.0, dt * 7.0);
            });

            const wNorm = stateWeights.normal, wAnim = stateWeights.animated, wListen = stateWeights.listening, wHappy = stateWeights.happy, wThink = stateWeights.thinking;

            const voxSize = 0.22;
            const lookX = trackMouse ? mouseNormalized.x : Math.sin(t * 0.8) * 0.25;
            const lookY = trackMouse ? mouseNormalized.y : Math.cos(t * 1.1) * 0.18;
            const isHappy = currentState === 'happy' || pokeImpulse > 0.35;
            const isSpeaking = currentState === 'animated';
            const isListening = currentState === 'listening';
            const isThinking = currentState === 'thinking';

            const blinkCycle = t % 3.8;
            let blinkScaleY = (blinkCycle > 3.64) ? 0.12 : 1.0;

            const offsetX = isThinking ? Math.sin(t * 2.0) * 0.08 : lookX * 0.14;
            const offsetY = isThinking ? 0.10 : lookY * 0.10;
            const listenTall = isListening ? 1.18 : 1.0;

            leftEyeBlock.position.set(-voxSize * 2.5 + offsetX, -voxSize * 0.5 + offsetY, 0);
            rightEyeBlock.position.set(voxSize * 2.5 + offsetX, -voxSize * 0.5 + offsetY, 0);
            leftEyeBlock.scale.set(1.0, blinkScaleY * listenTall, 1.0);
            rightEyeBlock.scale.set(1.0, blinkScaleY * listenTall, 1.0);

            leftBlushMesh.position.set(-voxSize * 3.55 + offsetX * 0.85, -voxSize * 1.95 + offsetY * 0.85, 0);
            rightBlushMesh.position.set(voxSize * 3.55 + offsetX * 0.85, -voxSize * 1.95 + offsetY * 0.85, 0);

            mouthSmileMesh.visible = false; mouthTalkMesh.visible = false; mouthThinkDot.visible = false;
            mouthGroup.position.set(offsetX * 0.9, -voxSize * 1.85 + offsetY * 0.9, 0.01);

            if (isSpeaking) {
                mouthTalkMesh.visible = true;
                const openY = 0.35 + Math.abs(Math.sin(t * 13) * Math.cos(t * 6)) * 1.15 * squishIntensity;
                mouthTalkMesh.scale.set(0.9 + openY * 0.15, openY, 1);
            } else if (isHappy) {
                mouthTalkMesh.visible = true;
                mouthTalkMesh.scale.set(1.1, 1.0 + Math.sin(t * 9) * 0.12, 1);
            } else if (isThinking) {
                mouthThinkDot.visible = true;
            } else if (showSmileMouth) {
                mouthSmileMesh.visible = true;
            }

            const idleSquish = Math.sin(t * 2.6) * 0.045;
            const speakSquish = Math.sin(t * 10.5) * 0.085 * squishIntensity;
            const listenStretch = 0.06 + Math.sin(t * 3.5) * 0.025;
            const happySquish = Math.sin(t * 11.0) * 0.14 * squishIntensity;
            const pokeSquish = -Math.sin(pokeImpulse * Math.PI * 3) * 0.28 * pokeImpulse;

            const scaleY = 1.0 + idleSquish * wNorm + speakSquish * wAnim + listenStretch * wListen + happySquish * wHappy + pokeSquish;
            const invXZ = 1.0 / Math.sqrt(Math.max(0.55, scaleY));
            slimeBodyGroup.scale.set(invXZ, scaleY, invXZ);

            const hopY = Math.sin(t * 2.6) * 0.08 * wNorm + Math.abs(Math.sin(t * 5.25)) * 0.22 * wAnim + Math.abs(Math.sin(t * 5.5)) * 0.55 * wHappy;
            slimeBodyGroup.position.y = (scaleY - 1.0) * 0.85 + hopY;
            faceGroup.position.z = geometryMode === 'voxel' ? 1.02 : 1.40;

            const activeAura = Math.max(wAnim, wListen * 0.9, wHappy * 0.6);
            auraRingsGroup.children.forEach((ring, idx) => {
                const prog = ((t * 0.9 + idx * 0.33) % 1.0);
                const sc = 0.75 + prog * 0.65;
                ring.scale.set(sc, sc, sc);
                ring.material.opacity = activeAura * (1.0 - prog) * 0.55;
            });

            const pWeight = Math.max(wAnim * 0.9, wHappy, wListen * 0.4);
            particlesGroup.children.forEach((p, idx) => {
                const d = p.userData; const ang = d.angle + t * d.speed;
                p.position.set(Math.cos(ang) * d.radius, d.yBase + Math.sin(t * 3 + idx) * 0.25, Math.sin(ang) * d.radius);
                const pulse = 0.5 + 0.5 * Math.sin(t * 6 + idx);
                p.material.opacity = pWeight * pulse;
            });

            thinkingDotsGroup.children.forEach((dot, idx) => {
                const pop = wThink * (0.85 + Math.sin(t * 4.5 - idx * 0.9) * 0.18);
                dot.scale.set(pop, pop, pop);
            });
        }


        // ------------------------------------------
        // PART 2: 2D PIXEL PUFF CANVAS LOGIC
        // ------------------------------------------
        const N = 64, BASE = 52;
        const puffS = { state: 'idle', tones: [], poke: 0, mx: 0, my: 0, speed: 1 };
        const BY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v => (v + .5) / 16);

        function hsl2d(h, s, l) {
            s /= 100; l /= 100;
            const a = s * Math.min(l, 1 - l);
            const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
            return [f(0), f(8), f(4)];
        }

        const PAL2D = [['Sky', 205, 85], ['Peach', 350, 85], ['Lilac', 262, 80], ['Mint', 155, 60], ['Butter', 45, 90], ['Cloud', 220, 28]];

        function setPuffPalette(i) {
            const [, h, s] = PAL2D[i];
            puffS.tones = [60, 74, 83, 90, 97].map(l => hsl2d(h, s, l));
            document.getElementById('puff-stage').style.boxShadow = '0 0 28px hsla(' + h + ',' + s + '%,70%,0.3)';
            [...document.querySelectorAll('.sw-2d')].forEach((b, j) => b.setAttribute('aria-pressed', j === i));
        }

        const smin2d = (a, b, k) => { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k / 4; };
        const circ2d = (x, y, cx, cy, r) => Math.hypot(x - cx, y - cy) - r;
        function puffSdf(x, y, sx, sy, oy) {
            x = 32 + (x - 32) / sx; y = BASE + (y - oy - BASE) / sy;
            let d = circ2d(x, y, 32, 40, 14);
            d = smin2d(d, circ2d(x, y, 20, 43, 9), 6); d = smin2d(d, circ2d(x, y, 44, 43, 9), 6);
            d = smin2d(d, circ2d(x, y, 28, 30, 10), 6); d = smin2d(d, circ2d(x, y, 40, 32, 8), 6);
            return Math.max(d, y - BASE);
        }

        function renderPuffFrame(t, st, D) {
            D.fill(0);
            const tt = t * puffS.speed; let sy = 1 + Math.sin(tt * 2.2) * .035, oy = 0;
            if (st === 'happy') { const b = Math.abs(Math.sin(tt * 4)); oy = -b * 9; sy = 1 + .08 * b - .16 * Math.pow(1 - b, 6); }
            if (st === 'listening') sy += .06;
            sy -= puffS.poke * Math.cos(t * 16) * .28;
            const sx = 1 / Math.pow(sy, .8), T = puffS.tones;

            const put = (x, y, c, a = 255) => {
                x = Math.round(x); y = Math.round(y);
                if (x < 0 || y < 0 || x >= N || y >= N) return;
                const i = (y * N + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = a;
            };
            const rect = (x, y, w, h, c, a) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(x + i, y + j, c, a); };

            const sw = Math.round(13 - oy * .5);
            for (let x = -sw; x <= sw; x++) put(32 + x, 55, [60, 50, 90], 38);

            const F = (x, y) => puffSdf(x, y, sx, sy, oy);
            for (let y = 0; y < N; y++) {
                for (let x = 0; x < N; x++) {
                    const px = x + .5, py = y + .5, d = F(px, py);
                    if (d > 1) continue;
                    if (d > 0) { put(x, y, T[0]); continue; }
                    const gx = F(px + 1, py) - F(px - 1, py), gy = F(px, py + 1) - F(px, py - 1), gl = Math.hypot(gx, gy) || 1;
                    const lit = (gx * -.55 + gy * -.83) / gl, e = Math.max(0, 1 - (-d) / 7);
                    const yy = BASE + (py - oy - BASE) / sy, xx = 32 + (px - 32) / sx;
                    let i = Math.floor((.55 + .5 * lit * e - (yy - 38) * .012) * 4 + (BY[(y & 3) * 4 + (x & 3)] - .5) * 1.2) + 1;
                    i = Math.max(1, Math.min(4, i));
                    if (yy > BASE - 2.5) i = 1;
                    if (((xx - 23) / 3.6) ** 2 + ((yy - 31.5) / 2) ** 2 < 1) i = 4;
                    put(x, y, T[i]);
                }
            }

            const tr = st === 'thinking'; let lx = tr ? 3 : Math.max(-1, Math.min(1, puffS.mx)) * 3, ly = tr ? -2 : puffS.my * 2;
            const fx = Math.round(32 + lx * .5), fy = Math.round(BASE + oy - (BASE - 41) * sy), ink = [38, 32, 70], pink = [255, 150, 185];
            const L = fx - 8 + Math.round(lx * .5), R = fx + 5 + Math.round(lx * .5), blink = (tt % 4.2) < .14;

            if (st === 'happy') {
                [L - 1, R - 1].forEach(x => { [[0, 2], [1, 1], [2, 0], [3, 1], [4, 2]].forEach(p => put(x + p[0], fy - 1 + p[1] + Math.round(ly), ink)); });
            } else {
                const h = blink ? 1 : (st === 'listening' ? 6 : 5), w = st === 'listening' ? 4 : 3;
                const ty = fy - 2 + Math.round(ly) + Math.round((5 - h) / 2);
                [L, R].forEach(x => { rect(x, ty, w, h, ink); if (h > 2) put(x, ty, [255, 255, 255]); });
            }
            rect(fx - 14, fy + 4, 4, 2, pink, 200); rect(fx + 10, fy + 4, 4, 2, pink, 200);

            const my = fy + 5;
            if (st === 'speaking') {
                const o = Math.abs(Math.sin(tt * 9) + Math.sin(tt * 5.3)) / 2, h = 1 + Math.round(o * 3);
                rect(fx - 2, my - 1, 4, h, ink); if (h > 2) rect(fx - 1, my + h - 2, 2, 1, pink);
            } else if (st === 'happy') {
                rect(fx - 2, my - 1, 5, 1, ink); rect(fx - 1, my, 3, 2, ink); put(fx, my + 1, pink);
            } else if (tr) {
                rect(fx + 1, my, 2, 1, ink);
            } else {
                put(fx - 2, my - 1, ink); put(fx + 2, my - 1, ink); rect(fx - 1, my, 3, 1, ink);
            }

            if (st === 'happy') [[10, 22], [54, 18], [48, 8]].forEach((p, k) => {
                if (Math.sin(tt * 6 + k * 2) > 0) { const c = [255, 225, 120]; rect(p[0] - 1, p[1], 3, 1, c); rect(p[0], p[1] - 1, 1, 3, c); put(p[0], p[1], [255, 255, 255]); }
            });
            if (tr) {
                const n = Math.floor(tt * 2) % 4;
                [[46, 16], [51, 12], [56, 7]].forEach((p, k) => { if (k < n) rect(p[0], p[1], 2 + (k > 1), 2 + (k > 1), T[0]); });
            }
            if (st === 'listening') {
                const n = Math.floor(tt * 3) % 3;
                for (let r = 0; r <= n; r++) { [55 + r * 3, 8 - r * 3].forEach(x => rect(x, 35 - r, 1, 3 + 2 * r, T[0])); }
            }
        }


        // ------------------------------------------
        // INITIALIZATION & MAIN LOOPS
        // ------------------------------------------
        window.onload = function () {
            // 1. Init 3D
            initThreeScene();

            // 2. Build 2D UI inside sidebar
            const states2dBox = document.createElement('div');
            states2dBox.id = 'states-2d';
            states2dBox.className = 'grid grid-cols-3 gap-1.5 bg-kuma-surface p-1.5 rounded-xl border border-kuma-border';
            ['Idle', 'Speaking', 'Listening', 'Happy', 'Thinking'].forEach((name, i) => {
                const b = document.createElement('button');
                b.textContent = name;
                b.className = "px-2 py-1.5 rounded-lg text-xs font-medium bg-kuma-card hover:bg-kuma-border/50 text-kuma-fg transition";
                b.onclick = () => setBotState(['normal', 'animated', 'listening', 'happy', 'thinking'][i]);
                states2dBox.appendChild(b);
            });
            document.getElementById('controls-2d-group').children[0].appendChild(states2dBox);

            const pal2dGrid = document.getElementById('palette-grid-2d');
            PAL2D.forEach((p, i) => {
                const b = document.createElement('button');
                b.className = 'sw-2d px-2.5 py-2 rounded-lg bg-kuma-surface hover:bg-kuma-border/50 text-xs font-semibold text-kuma-fg border border-kuma-border flex items-center gap-2';
                b.innerHTML = `<span class="w-3.5 h-3.5 rounded inline-block shadow" style="background:hsl(${p[1]},${p[2]}%,82%)"></span> ${p[0]}`;
                b.onclick = () => setPuffPalette(i);
                pal2dGrid.appendChild(b);
            });

            const bg2dGrid = document.getElementById('bg-grid-2d');
            ['Theme', 'Day', 'Grid'].forEach((name, i) => {
                const b = document.createElement('button');
                b.textContent = name;
                b.className = "px-2 py-1.5 rounded-lg text-xs font-medium bg-kuma-card hover:bg-kuma-border/50 text-kuma-fg transition";
                b.onclick = () => {
                    const st = document.getElementById('puff-stage');
                    st.style.background = i === 1 ? '#fbfaff' : (i === 2 ? 'conic-gradient(#8884 25%,transparent 0 50%,#8884 0 75%,transparent 0) 0 0/24px 24px' : '#1e1a2e');
                };
                bg2dGrid.appendChild(b);
            });

            document.getElementById('slider-speed-2d').oninput = (e) => { puffS.speed = +e.target.value; };

            const pCanvas = document.getElementById('pixel-canvas');
            const pCtx = pCanvas.getContext('2d');
            const pImg = pCtx.createImageData(N, N);
            pCanvas.addEventListener('pointerdown', () => { puffS.poke = 1; });
            window.addEventListener('pointermove', e => {
                puffS.mx = (e.clientX / innerWidth - .5) * 2;
                puffS.my = (e.clientY / innerHeight - .5) * 2;
            });

            setPuffPalette(0);

            // 3. Unified Animation Loop
            let lastTime = performance.now();
            function mainLoop(now) {
                const dt = Math.min(.05, (now - lastTime) / 1000);
                lastTime = now;

                if (studioMode === '3d') {
                    step3DSimulation(dt);
                    renderer.render(scene, camera);
                } else {
                    puffS.poke *= Math.exp(-dt * 3.2);
                    renderPuffFrame(now / 1000, puffS.state, pImg.data);
                    pCtx.putImageData(pImg, 0, 0);
                }
                requestAnimationFrame(mainLoop);
            }
            requestAnimationFrame(mainLoop);
        };