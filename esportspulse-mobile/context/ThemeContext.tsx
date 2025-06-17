import React, { createContext, useContext } from 'react';
import { Theme } from '@/constants/theme';

interface ThemeContextType {
  theme: Theme;
  themePreference: 'light' | 'dark' | 'system';
  setThemePreference: (preference: 'light' | 'dark' | 'system') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  value: ThemeContextType;
}> = ({ children, value }) => {
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 