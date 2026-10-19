export const DEFAULT_THEME = {
  themePrimary: "#C6A15B",
  themePrimaryDark: "#9F7E3F",
  themeBackground: "#0E0E0E",
  themeSurface: "#151515",
  themeText: "#F7F4EE",
  themeMuted: "#B8B8B8",
  themeBorder: "#2A2A2A",
} as const;

export type ThemeColors = {
  themePrimary: string;
  themePrimaryDark: string;
  themeBackground: string;
  themeSurface: string;
  themeText: string;
  themeMuted: string;
  themeBorder: string;
};

const CSS_VAR_MAP: Record<keyof ThemeColors, string> = {
  themePrimary: "--theme-primary",
  themePrimaryDark: "--theme-primary-dark",
  themeBackground: "--theme-background",
  themeSurface: "--theme-surface",
  themeText: "--theme-text",
  themeMuted: "--theme-muted",
  themeBorder: "--theme-border",
};

export function isValidHex(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9A-Fa-f]{6}$/.test(value);
}

export function applyTheme(colors: Partial<ThemeColors>): void {
  const root = document.documentElement;
  (Object.keys(CSS_VAR_MAP) as (keyof ThemeColors)[]).forEach((key) => {
    const value = colors[key];
    if (isValidHex(value)) {
      root.style.setProperty(CSS_VAR_MAP[key], value);
    }
  });
}

export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToHex(h: number, s: number, l: number): string {
  const sN = Math.min(100, Math.max(0, s)) / 100;
  const lN = Math.min(100, Math.max(0, l)) / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sN * Math.min(lN, 1 - lN);
  const f = (n: number) => lN - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const to = (x: number) => Math.round(x * 255).toString(16).padStart(2, "0");
  return `#${to(f(0))}${to(f(8))}${to(f(4))}`.toUpperCase();
}

/** Shift a hex colour's lightness by delta points (-100..100). Returns uppercase #RRGGBB. */
export function shiftLightness(hex: string, delta: number): string {
  if (!isValidHex(hex)) return DEFAULT_THEME.themePrimary;
  const { h, s, l } = hexToHsl(hex);
  return hslToHex(h, s, l + delta);
}

export interface ThemePreset {
  name: string;
  blurb: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    name: "Classic Gold",
    blurb: "The current look",
    colors: { ...DEFAULT_THEME },
  },
  {
    name: "Royal Blue",
    blurb: "Corporate & trustworthy",
    colors: {
      themePrimary: "#5B8BD0",
      themePrimaryDark: "#3F6BAE",
      themeBackground: "#0B1220",
      themeSurface: "#131C2E",
      themeText: "#F4F6FA",
      themeMuted: "#A8B3C2",
      themeBorder: "#243044",
    },
  },
  {
    name: "Emerald",
    blurb: "Fresh & modern",
    colors: {
      themePrimary: "#3FA97A",
      themePrimaryDark: "#2E7F5C",
      themeBackground: "#0C1411",
      themeSurface: "#14211B",
      themeText: "#F2F7F3",
      themeMuted: "#A9BDB2",
      themeBorder: "#22332A",
    },
  },
  {
    name: "Burgundy",
    blurb: "Rich & traditional",
    colors: {
      themePrimary: "#B04A5A",
      themePrimaryDark: "#8A3745",
      themeBackground: "#140D0E",
      themeSurface: "#201416",
      themeText: "#F8F1F1",
      themeMuted: "#C0A9AD",
      themeBorder: "#332227",
    },
  },
  {
    name: "Charcoal",
    blurb: "Minimal monochrome",
    colors: {
      themePrimary: "#D8D5CE",
      themePrimaryDark: "#A8A49A",
      themeBackground: "#101010",
      themeSurface: "#181818",
      themeText: "#F5F4F0",
      themeMuted: "#A3A099",
      themeBorder: "#2C2C2C",
    },
  },
];

export interface ThemeFieldMeta {
  key: keyof ThemeColors;
  label: string;
  hint: string;
}

export const THEME_FIELDS: ThemeFieldMeta[] = [
  { key: "themePrimary", label: "Accent colour", hint: "Buttons, links and highlights — the main brand colour." },
  { key: "themePrimaryDark", label: "Accent hover shade", hint: "Darker version used when hovering buttons. Auto-matched when you use the shade slider." },
  { key: "themeBackground", label: "Page background", hint: "The main background of every page." },
  { key: "themeSurface", label: "Cards & panels", hint: "Content cards, admin rows and popups." },
  { key: "themeText", label: "Headings & text", hint: "The main text colour." },
  { key: "themeMuted", label: "Secondary text", hint: "Subtitles, hints and quieter grey text." },
  { key: "themeBorder", label: "Borders & lines", hint: "Dividers, card outlines and input borders." },
];
