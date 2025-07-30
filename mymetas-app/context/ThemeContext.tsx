import React, { createContext, useState, useEffect, useContext } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  inputBackground: string;
  placeholder: string;
  cancelButton: string;
  cancelButtonText: string;
}

interface ThemeContextData {
  theme: 'light' | 'dark';
  colors: ThemeColors;
  toggleTheme: () => void;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  background: '#f0f4f8',
  card: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  primary: '#007BFF',
  border: '#ddd',
  inputBackground: '#f9f9f9',
  placeholder: '#888',
  cancelButton: '#f0f0f0',
  cancelButtonText: '#c0392b',
};

const darkColors: ThemeColors = {
  background: '#121212',
  card: '#1e1e1e',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  primary: '#007BFF',
  border: '#333333',
  inputBackground: '#2e2e2e',
  placeholder: '#888',
  cancelButton: '#333333',
  cancelButtonText: '#e74c3c',
};

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(systemScheme || 'light');

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme as 'light' | 'dark');
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
