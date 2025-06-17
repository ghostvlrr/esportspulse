import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { darkTheme, lightTheme } from '@/constants/theme';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@/context/ThemeContext';

export default function App() {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedPreference = await AsyncStorage.getItem('themePreference');
      if (savedPreference) {
        setThemePreference(savedPreference as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.error('Tema tercihi yüklenirken hata:', error);
    }
  };

  const getCurrentTheme = () => {
    if (themePreference === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themePreference === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getCurrentTheme();

  return (
    <ThemeProvider value={{ theme, themePreference, setThemePreference }}>
      <StatusBar style={themePreference === 'dark' ? 'light' : 'dark'} backgroundColor={theme.colors.background} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerTintColor: theme.colors.text,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      />
    </ThemeProvider>
  );
} 