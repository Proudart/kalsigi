// ThemeProvider.tsx
'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { setCookie, getCookie } from 'cookies-next';

type Theme = 'light' | 'dark';

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const storedTheme = getCookie('theme');
    if (storedTheme) {
      setTheme(storedTheme as Theme);
    } else {
      // Check the user's preferred color scheme
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDarkMode ? 'dark' : 'light';
      setTheme(initialTheme);
      setCookie('theme', initialTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setCookie('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${theme === 'dark' ? 'dark' : ''}`}>{children}</div>
    </ThemeContext.Provider>
  );
};