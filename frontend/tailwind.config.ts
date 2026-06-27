import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  // PRD §9.2 had "./src/**/*.{ts,tsx}"; this project has no src/ dir (app/ at root),
  // so content points at the real source folders. Token values below are verbatim.
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Page surfaces
        "canvas":                   "#ffffff",
        "background":               "#f9f9f9",
        "surface":                  "#f9f9f9",
        "surface-bright":           "#f9f9f9",
        "surface-dim":              "#dadada",
        "surface-container-lowest": "#ffffff",
        "surface-container-low":    "#f3f3f4",
        "surface-container":        "#eeeeee",
        "surface-container-high":   "#e8e8e8",
        "surface-container-highest":"#e2e2e2",
        "soft-stone":               "#eeece7",

        // Primary brand
        "primary":                  "#000000",
        "on-primary":               "#ffffff",
        "primary-container":        "#1b1b20",
        "on-primary-container":     "#848389",
        "primary-fixed":            "#e4e1e8",
        "primary-fixed-dim":        "#c8c5cc",
        "inverse-primary":          "#c8c5cc",

        // Secondary (deep green — agent console, hero cards)
        "secondary":                "#35675d",
        "on-secondary":             "#ffffff",
        "secondary-container":      "#b8ede0",
        "on-secondary-container":   "#3b6d63",
        "secondary-fixed":          "#b8ede0",
        "secondary-fixed-dim":      "#9dd1c4",
        "on-secondary-fixed":       "#00201b",
        "on-secondary-fixed-variant":"#1b4f45",
        "deep-green":               "#003c33",

        // Tertiary (navy — parent dashboard hero)
        "tertiary":                 "#000000",
        "on-tertiary":              "#ffffff",
        "tertiary-container":       "#001945",
        "on-tertiary-container":    "#417ef8",
        "tertiary-fixed":           "#d9e2ff",
        "tertiary-fixed-dim":       "#b0c6ff",
        "on-tertiary-fixed":        "#001945",
        "on-tertiary-fixed-variant":"#00419d",

        // Text
        "ink":                      "#212121",
        "on-surface":               "#1a1c1c",
        "on-background":            "#1a1c1c",
        "on-surface-variant":       "#47464b",
        "muted":                    "#93939f",
        "inverse-surface":          "#2f3131",
        "inverse-on-surface":       "#f0f1f1",

        // Borders & dividers
        "hairline":                 "#d9d9dd",
        "outline":                  "#78767b",
        "outline-variant":          "#c8c5cb",
        "surface-variant":          "#e2e2e2",
        "surface-tint":             "#5f5e64",

        // Semantic / accents
        "action-blue":              "#1863dc",  // links, interactive elements
        "coral":                    "#ff7759",  // category chips, taxonomy only
        "coral-soft":               "#ffad9b",  // chip borders
        "error":                    "#ba1a1a",  // alert severity, debit amounts
        "on-error":                 "#ffffff",
        "error-container":          "#ffdad6",
        "on-error-container":       "#93000a",

        // Severity system (insight cards)
        "severity-alert":           "#EF4444",  // red — health score, late night
        "severity-warning":         "#F59E0B",  // amber — coffee, beauty
        "severity-info":            "#3B82F6",  // blue — weekend pattern
      },

      borderRadius: {
        "DEFAULT": "0.25rem",   // 4px — inputs, small utility elements
        "sm":      "0.25rem",   // 4px
        "lg":      "0.5rem",    // 8px — cards, chips, small media
        "xl":      "0.75rem",   // 12px — standard card radius
        "2xl":     "1rem",      // 16px — feature cards, agent console
        "3xl":     "1.375rem",  // 22px — large media cards
        "full":    "9999px",    // pill — CTAs, category chips
      },

      spacing: {
        "xxs":              "2px",
        "xs":               "6px",
        "sm":               "8px",
        "md":               "12px",
        "lg":               "16px",
        "xl":               "24px",
        "xxl":              "32px",
        "section-mobile":   "48px",
        "section-desktop":  "80px",
      },

      fontFamily: {
        // Font families wired to next/font/google CSS variables (set in app/layout.tsx),
        // with the PRD's literal names + sans-serif kept as fallbacks. Only this
        // fontFamily block was adjusted from PRD §9.2 verbatim — to make next/font apply.
        // Space Grotesk — headlines, amounts, label-mono
        "headline-lg":         ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        "headline-lg-mobile":  ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        "label-mono":          ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
        // Inter — body, buttons, captions, everything else
        "headline-md":         ["var(--font-inter)", "Inter", "sans-serif"],
        "body-lg":             ["var(--font-inter)", "Inter", "sans-serif"],
        "body-md":             ["var(--font-inter)", "Inter", "sans-serif"],
        "button":              ["var(--font-inter)", "Inter", "sans-serif"],
        "caption":             ["var(--font-inter)", "Inter", "sans-serif"],
      },

      fontSize: {
        "headline-lg":        ["48px", { lineHeight: "48px",  letterSpacing: "-0.03em", fontWeight: "400" }],
        "headline-lg-mobile": ["32px", { lineHeight: "36px",  letterSpacing: "-0.02em", fontWeight: "400" }],
        "headline-md":        ["24px", { lineHeight: "32px",  letterSpacing: "-0.01em", fontWeight: "500" }],
        "body-lg":            ["18px", { lineHeight: "28px",  fontWeight: "400" }],
        "body-md":            ["16px", { lineHeight: "24px",  fontWeight: "400" }],
        "button":             ["14px", { lineHeight: "24px",  fontWeight: "500" }],
        "label-mono":         ["14px", { lineHeight: "20px",  letterSpacing: "0.02em", fontWeight: "400" }],
        "caption":            ["12px", { lineHeight: "16px",  fontWeight: "400" }],
      },
    },
  },
  plugins: [],
}

export default config
