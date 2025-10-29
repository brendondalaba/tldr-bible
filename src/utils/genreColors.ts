// Material Flat UI color mappings for Bible book genres
export const genreColors: Record<string, { bg: string; text: string; border: string }> = {
  Law: {
    bg: '#34495E',
    text: '#FFFFFF',
    border: '#2C3E50',
  },
  History: {
    bg: '#E67E22',
    text: '#FFFFFF',
    border: '#D35400',
  },
  Wisdom: {
    bg: '#3498DB',
    text: '#FFFFFF',
    border: '#2980B9',
  },
  Prophecy: {
    bg: '#9B59B6',
    text: '#FFFFFF',
    border: '#8E44AD',
  },
  Gospel: {
    bg: '#1ABC9C',
    text: '#FFFFFF',
    border: '#16A085',
  },
  Epistle: {
    bg: '#F1C40F',
    text: '#2C3E50',
    border: '#F39C12',
  },
  Apocalyptic: {
    bg: '#E74C3C',
    text: '#FFFFFF',
    border: '#C0392B',
  },
};

export function getGenreStyles(genre: string): string {
  const colors = genreColors[genre] || genreColors.Law;
  return `background-color: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};`;
}
