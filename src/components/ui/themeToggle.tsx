'use client';

import { useTheme } from 'next-themes'
import { IconSun, IconMoon } from "@tabler/icons-react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  return (
    <button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="px-2 py-2 rounded-md text-text-950 bg-secondary-200"
    >
      {theme === 'light' ? <IconMoon /> : <IconSun />}
    </button>
  );
};