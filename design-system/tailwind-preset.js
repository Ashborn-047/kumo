/**
 * Kumo Design System — Tailwind CSS Preset Configuration
 * RFC-2025 Warm Tactile Spatial Canvas Spec
 */

module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#4a3abe",
        "primary-container": "#6355d8",
        "primary-fixed": "#e4dfff",
        "primary-fixed-dim": "#c6bfff",
        "on-primary": "#ffffff",
        "on-primary-container": "#ece7ff",
        "on-primary-fixed": "#160066",
        "on-primary-fixed-variant": "#402db4",

        "secondary": "#525f77",
        "secondary-container": "#d3e0fd",
        "secondary-fixed": "#d6e3ff",
        "secondary-fixed-dim": "#b9c7e3",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#56637c",
        "on-secondary-fixed": "#0e1c31",
        "on-secondary-fixed-variant": "#3a475f",

        "tertiary": "#922e1e",
        "tertiary-container": "#b34533",
        "tertiary-fixed": "#ffdad4",
        "tertiary-fixed-dim": "#ffb4a6",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#ffe3de",
        "on-tertiary-fixed": "#3f0300",
        "on-tertiary-fixed-variant": "#842415",

        "background": "#fbf8ff",
        "surface": "#fbf8ff",
        "surface-bright": "#fbf8ff",
        "surface-dim": "#d6d9ef",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f2ff",
        "surface-container": "#ececff",
        "surface-container-high": "#e5e7fe",
        "surface-container-highest": "#dfe1f8",
        "surface-variant": "#dfe1f8",
        "surface-tint": "#5849cc",

        "on-background": "#171b2b",
        "on-surface": "#171b2b",
        "on-surface-variant": "#474554",
        "inverse-surface": "#2c2f41",
        "inverse-on-surface": "#efefff",
        "inverse-primary": "#c6bfff",

        "outline": "#787585",
        "outline-variant": "#c8c4d6",

        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "on-error": "#ffffff",
        "on-error-container": "#93000a",

        /* 5 Workbench Pastel Archetypes */
        "archetype-sky": "#dcedff",
        "archetype-sky-border": "#c3dfff",
        "archetype-sky-ink": "#1b5ba5",

        "archetype-lilac": "#eadfff",
        "archetype-lilac-border": "#dac8ff",
        "archetype-lilac-ink": "#4a3abe",

        "archetype-mint": "#dcf5e7",
        "archetype-mint-border": "#bbf0cf",
        "archetype-mint-ink": "#166534",

        "archetype-peach": "#ffe9d6",
        "archetype-peach-border": "#ffd2af",
        "archetype-peach-ink": "#b84a14",

        "archetype-butter": "#fff5c8",
        "archetype-butter-border": "#ffec99",
        "archetype-butter-ink": "#856404",

        /* Neutrals & Contrast Tokens */
        "midnight-slate": "#2e3b52",
        "coral-punch": "#ff7e67",
        "canvas-base": "#fbf8fc"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "card": "18px",
        "dock": "22px",
        "full": "9999px"
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
        "margin": "2rem",
        "margin-mobile": "1rem",
        "gutter": "1.5rem",
        "gutter-sm": "0.75rem"
      },
      fontFamily: {
        "headline-xl": ["Plus Jakarta Sans", "sans-serif"],
        "headline-lg": ["Plus Jakarta Sans", "sans-serif"],
        "headline-md": ["Plus Jakarta Sans", "sans-serif"],
        "headline-sm": ["Plus Jakarta Sans", "sans-serif"],
        "headline-xl-mobile": ["Plus Jakarta Sans", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-md": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "label-lg": ["JetBrains Mono", "monospace"],
        "label-md": ["JetBrains Mono", "monospace"],
        "label-sm": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "headline-xl": ["40px", { lineHeight: "48px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg": ["28px", { lineHeight: "36px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-md": ["22px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["18px", { lineHeight: "24px", fontWeight: "600" }],
        "headline-xl-mobile": ["30px", { lineHeight: "38px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "21px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "18px", fontWeight: "400" }],
        "label-lg": ["13px", { lineHeight: "18px", letterSpacing: "0.01em", fontWeight: "500" }],
        "label-md": ["11px", { lineHeight: "16px", letterSpacing: "0.02em", fontWeight: "500" }],
        "label-sm": ["10px", { lineHeight: "14px", letterSpacing: "0.04em", fontWeight: "600" }]
      },
      boxShadow: {
        "elevation-1": "0px 1px 2px rgba(46,59,82,0.04), 0px 8px 24px -4px rgba(46,59,82,0.06)",
        "elevation-2": "0px 0px 0px 1px rgba(99,85,216,0.15), 0px 12px 32px -6px rgba(99,85,216,0.12), 0px 4px 12px rgba(46,59,82,0.04)",
        "elevation-3": "0px 16px 36px -8px rgba(46,59,82,0.12), 0px 4px 12px -2px rgba(46,59,82,0.06)"
      }
    }
  }
};
