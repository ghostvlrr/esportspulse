import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useTheme = () => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = useCallback(async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    await AsyncStorage.setItem('theme', newTheme);
    // Tema değişikliğini uygulamak için uygulamayı yeniden başlatmak gerekebilir
  }, [colorScheme]);

  return {
    theme,
    isDark: colorScheme === 'dark',
    toggleTheme,
  };
}; 