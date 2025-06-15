import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
export const lightTheme = {
  background: '#FFFFFF',
  cardBackground: '#FFFFFF',
  text: '#333333',
  subtext: '#666666',
  primary: '#2E7D32',
  secondary: '#4CAF50',
  accent: '#8BC34A',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: '#388E3C',
  warning: '#F57C00',
  info: '#1976D2',
  shadow: '#000000',
  inputBackground: '#F5F5F5',
  divider: '#E0E0E0',
  tabBarBg: '#FFFFFF',
  expenseRed: '#E57373',
  incomeGreen: '#81C784',
};

export const darkTheme = {
  background: '#121212',
  cardBackground: '#1E1E1E',
  text: '#FFFFFF',
  subtext: '#AAAAAA',
  primary: '#4CAF50',
  secondary: '#8BC34A',
  accent: '#CDDC39',
  border: '#333333',
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',
  shadow: '#000000',
  inputBackground: '#333333',
  divider: '#424242',
  tabBarBg: '#1E1E1E',
  expenseRed: '#E57373',
  incomeGreen: '#81C784',
};

type ThemeType = typeof lightTheme;

interface ThemeContextType {
  theme: ThemeType;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme preference from storage
    const loadThemePreference = async () => {
      try {
        const themePreference = await AsyncStorage.getItem('@theme_preference');
        setIsDarkMode(themePreference === 'dark');
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  const toggleTheme = async () => {
    try {
      const newMode = !isDarkMode;
      await AsyncStorage.setItem('@theme_preference', newMode ? 'dark' : 'light');
      setIsDarkMode(newMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};