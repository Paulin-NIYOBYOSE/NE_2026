export const Colors = {
  primary: '#5B4FE9',
  primaryDark: '#3D35C0',
  primaryLight: '#EEF0FF',
  secondary: '#F97316',
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F5F2',
  text: '#1A1D2E',
  textSecondary: '#4B5066',
  textMuted: '#9498B0',
  textOnPrimary: '#FFFFFF',
  border: '#E8E6E1',
  divider: '#EEECEA',
  error: '#E11D48',
  errorLight: '#FFF1F3',
  success: '#059669',
  successLight: '#ECFDF5',
  amber: '#D97706',
  amberLight: '#FFFBEB',
  teal: '#0D9488',
  tealLight: '#F0FDFA',
};

type PosColors = { bg: string; text: string };

const posColorMap: Record<string, PosColors> = {
  noun: { bg: '#EFF6FF', text: '#2563EB' },
  verb: { bg: '#F0FDF4', text: '#16A34A' },
  adjective: { bg: '#FFF7ED', text: '#D97706' },
  adverb: { bg: '#FDF4FF', text: '#9333EA' },
  pronoun: { bg: '#ECFEFF', text: '#0891B2' },
  preposition: { bg: '#FFF1F2', text: '#E11D48' },
  conjunction: { bg: '#FEF3C7', text: '#D97706' },
  interjection: { bg: '#F0FDF4', text: '#15803D' },
  article: { bg: '#F1F5F9', text: '#475569' },
  exclamation: { bg: '#FDF4FF', text: '#9333EA' },
  determiner: { bg: '#ECFEFF', text: '#0E7490' },
  numeral: { bg: '#FFF7ED', text: '#EA580C' },
};

export function getPartOfSpeechColor(pos: string): PosColors {
  return posColorMap[pos.toLowerCase()] ?? { bg: '#F1F5F9', text: '#475569' };
}
