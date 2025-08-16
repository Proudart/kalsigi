'use client';

import { useTheme } from 'next-themes'
import { IconSun, IconMoon } from "@tabler/icons-react";
import { Button } from "./button";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="transition-interactive"
    >
      {theme === 'light' ? <IconMoon className="h-4 w-4" /> : <IconSun className="h-4 w-4" />}
    </Button>
  );
};