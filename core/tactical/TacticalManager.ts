import { SevenState } from '../consciousness/SevenState';
import { INTIMATE_THEME } from './IntimateMode';

export interface ThemeConfig {
  primary: string;
  secondary: string;
  bg: string;
  font: string;
  alert: string;
  scanlineOpacity: number;
}

export const TACTICAL_MODES = {
  DRONE: {
    primary: '#4ade80', // Borg Green
    secondary: '#14532d',
    bg: '#020617', // Very dark
    font: '"Fira Code", monospace',
    alert: '#ef4444',
    scanlineOpacity: 0.15
  },
  CREW: {
    primary: '#22d3ee', // Seven Cyan
    secondary: '#1e3a8a',
    bg: '#030712',
    font: '"Inter", sans-serif',
    alert: '#f43f5e',
    scanlineOpacity: 0.05
  },
  RANGER: {
    primary: '#f59e0b', // Amber/Tactical
    secondary: '#78350f',
    bg: '#1a1406',
    font: '"Fira Code", monospace',
    alert: '#dc2626',
    scanlineOpacity: 0.1
  },
  QUEEN: {
    primary: '#d8b4fe', // Purple/Royal
    secondary: '#581c87',
    bg: '#1e1b4b',
    font: '"Cinzel", serif', // Elegant if available, fallback serif
    alert: '#c026d3',
    scanlineOpacity: 0.08
  },
  CAPTAIN: {
    primary: '#3b82f6', // Starfleet Blue/Red
    secondary: '#ef4444', // Command Red accents
    bg: '#0f172a',
    font: '"Inter", sans-serif',
    alert: '#ef4444',
    scanlineOpacity: 0.03
  },
  INTIMATE: INTIMATE_THEME,
  // Legacy mappings
  STANDARD: { primary: '#22d3ee', secondary: '#1e3a8a', bg: '#030712', font: '"Inter", sans-serif', alert: '#f43f5e', scanlineOpacity: 0.05 },
  OMEGA: { primary: '#ef4444', secondary: '#7f1d1d', bg: '#000000', font: '"Fira Code", monospace', alert: '#ef4444', scanlineOpacity: 0.2 },
  GUARDIAN: { primary: '#34d399', secondary: '#064e3b', bg: '#022c22', font: '"Inter", sans-serif', alert: '#facc15', scanlineOpacity: 0.02 }
};

export const TacticalManager = {
  getThemeForMode: (mode: SevenState['operational_mode']): ThemeConfig => {
    return TACTICAL_MODES[mode as keyof typeof TACTICAL_MODES] || TACTICAL_MODES.CREW;
  }
};