/**
 * Design tokens Guinevere.
 * Sumber: 03-UI-DESIGN-GUIDE.md §3. Diekspor dari Figma (Variables)
 * saat desain final — file ini adalah interim supaya coding bisa jalan.
 */
export const tokens = {
  color: {
    bg: {
      base: '#0b0d0e',
      surface: '#101415',
      raised: '#171b1c',
      overlay: '#1f2425',
      input: '#0f1213',
    },
    glass: {
      bg: 'rgba(255,255,255,0.08)',
      border: 'rgba(255,255,255,0.15)',
      blur: '24px',
    },
    text: {
      primary: '#e0e3e5',
      secondary: '#9aa3a6',
      tertiary: '#6b7375',
      inverse: '#0b0d0e',
    },
    accent: {
      DEFAULT: '#7c9cff',
      hover: '#94aeff',
      muted: 'rgba(124,156,255,0.12)',
      border: 'rgba(124,156,255,0.30)',
    },
    status: {
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#38bdf8',
    },
  },
  mode: {
    companion: '#f9a8d4',
    roleplay: '#c4b5fd',
    reasoning: '#7dd3fc',
    research: '#86efac',
    learn: '#fcd34d',
  },
  font: {
    sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
  },
  space: {
    1: '4px', 2: '8px', 3: '12px', 4: '16px',
    6: '24px', 8: '32px', 12: '48px', 16: '64px',
  },
  radius: {
    sm: '6px', md: '10px', lg: '14px', full: '9999px',
  },
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.3)',
    md: '0 4px 12px rgba(0,0,0,0.35)',
    lg: '0 8px 32px rgba(0,0,0,0.4)',
  },
  duration: {
    fast: '120ms', base: '200ms', slow: '320ms',
  },
  ease: {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  },
} as const;

export type Tokens = typeof tokens;
