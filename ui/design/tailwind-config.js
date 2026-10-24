/**
 * Kumo Design System — Browser Runtime Tailwind Configuration
 */
tailwind.config = {
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
        "secondary": "#525f77",
        "secondary-container": "#d3e0fd",
        "secondary-fixed": "#d6e3ff",
        "secondary-fixed-dim": "#b9c7e3",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#56637c",
        "tertiary": "#922e1e",
        "tertiary-container": "#b34533",
        "tertiary-fixed": "#ffdad4",
        "tertiary-fixed-dim": "#ffb4a6",
        "background": "#fbf8ff",
        "surface": "#fbf8ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f3f2ff",
        "surface-container": "#ececff",
        "surface-container-high": "#e5e7fe",
        "surface-container-highest": "#dfe1f8",
        "surface-variant": "#dfe1f8",
        "surface-tint": "#5849cc",
        "on-surface": "#171b2b",
        "on-surface-variant": "#474554",
        "outline": "#787585",
        "outline-variant": "#c8c4d6",
        "error": "#ba1a1a",
        "error-container": "#ffdad6"
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
      fontFamily: {
        "headline-xl": ["Plus Jakarta Sans"],
        "headline-lg": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "headline-sm": ["Plus Jakarta Sans"],
        "body-lg": ["Inter"],
        "body-md": ["Inter"],
        "body-sm": ["Inter"],
        "label-lg": ["JetBrains Mono"],
        "label-md": ["JetBrains Mono"],
        "label-sm": ["JetBrains Mono"]
      },
      fontSize: {
        "headline-xl": ["40px", { "lineHeight": "48px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-lg": ["28px", { "lineHeight": "36px", "letterSpacing": "-0.015em", "fontWeight": "600" }],
        "headline-md": ["22px", { "lineHeight": "28px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-sm": ["18px", { "lineHeight": "24px", "fontWeight": "600" }],
        "body-lg": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "body-md": ["14px", { "lineHeight": "21px", "fontWeight": "400" }],
        "body-sm": ["12px", { "lineHeight": "18px", "fontWeight": "400" }],
        "label-lg": ["13px", { "lineHeight": "18px", "letterSpacing": "0.01em", "fontWeight": "500" }],
        "label-md": ["11px", { "lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500" }],
        "label-sm": ["10px", { "lineHeight": "14px", "letterSpacing": "0.04em", "fontWeight": "600" }]
      }
    }
  }
};
