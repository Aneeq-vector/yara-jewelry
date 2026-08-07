export const COLOR_SWATCHES: Record<string, string> = {
  gold: '#D4AF37',
  silver: '#C0C0C0',
  'rose gold': '#B76E79',
  'rose-gold': '#B76E79',
  black: '#1a1a1a',
  white: '#F5F5F5',
  pearl: '#FAEBD7',
  red: '#B22222',
  blue: '#4169E1',
  green: '#2E8B57',
  purple: '#6A0DAD',
  pink: '#FF69B4',
  orange: '#FF8C00',
};

export function getSwatchColor(color: string): string {
  const key = color.toLowerCase();
  return COLOR_SWATCHES[key] || '#c9856a';
}
