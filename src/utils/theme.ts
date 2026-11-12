// Theme-aware style tokens
// Usage: import { t } from './theme'; then t.bg, t.text, t.border, etc.

type Theme = 'dark' | 'light';

export const t = {
  bg: (theme: Theme) => theme === 'dark' ? 'bg-[#0f1117]' : 'bg-[#f8f9fc]',
  bgCard: (theme: Theme) => theme === 'dark' ? 'bg-[#1e2030]' : 'bg-white',
  bgSidebar: (theme: Theme) => theme === 'dark' ? 'bg-[#13151c]' : 'bg-white',
  bgInput: (theme: Theme) => theme === 'dark' ? 'bg-[#1e2030]' : 'bg-gray-100',
  bgHover: (theme: Theme) => theme === 'dark' ? 'hover:bg-gray-800/50' : 'hover:bg-gray-100',
  bgActive: (theme: Theme) => theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50',
  bgCode: (theme: Theme) => theme === 'dark' ? 'bg-[#0d0f14]' : 'bg-gray-50',
  text: (theme: Theme) => theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
  textSecondary: (theme: Theme) => theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
  textMuted: (theme: Theme) => theme === 'dark' ? 'text-gray-500' : 'text-gray-400',
  textWhite: (theme: Theme) => theme === 'dark' ? 'text-white' : 'text-gray-900',
  border: (theme: Theme) => theme === 'dark' ? 'border-gray-800' : 'border-gray-200',
  borderLight: (theme: Theme) => theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200',
  shadow: (theme: Theme) => theme === 'dark' ? '' : 'shadow-sm',
};
