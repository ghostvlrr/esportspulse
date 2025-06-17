import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMuiTheme } from '../theme';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

interface ThemeContextType {
  themeKey: string;
  muiTheme: any;
  changeTheme: (key: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeKey, setThemeKey] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'default';
    } catch (error) {
      console.error('Tema yüklenirken hata:', error);
      return 'default';
    }
  });
  const [muiTheme, setMuiTheme] = useState(() => getMuiTheme(themeKey));

  const changeTheme = useCallback((key: string) => {
    try {
      setThemeKey(key);
      setMuiTheme(getMuiTheme(key));
      localStorage.setItem('theme', key);
      document.body.setAttribute('data-theme', key);
      window.dispatchEvent(new Event('themeChanged'));
    } catch (error) {
      console.error('Tema değiştirilirken hata:', error);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const newTheme = localStorage.getItem('theme') || 'default';
        setThemeKey(newTheme);
        setMuiTheme(getMuiTheme(newTheme));
      } catch (error) {
        console.error('Tema değişikliği dinlenirken hata:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('themeChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleStorageChange);
    };
  }, []);

  return (
    <ThemeContext.Provider value={{ themeKey, muiTheme, changeTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 