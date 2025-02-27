import {DarkTheme, DefaultTheme} from '@react-navigation/native';
import {StatusBar} from 'expo-status-bar';
import React from 'react';
import 'react-native-get-random-values';
import {MD3DarkTheme, MD3LightTheme, PaperProvider, adaptNavigationTheme} from 'react-native-paper';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

// Combine React Navigation and Paper themes
const { LightTheme, DarkTheme: NavigationDarkTheme } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});

// Create custom theme with proper text variants
const customTextVariants = {
  displayLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 57,
    lineHeight: 64,
    letterSpacing: 0,
  },
  displayMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 45,
    lineHeight: 52,
    letterSpacing: 0,
  },
  displaySmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 36,
    lineHeight: 44,
    letterSpacing: 0,
  },
  headlineLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: 0,
  },
  headlineMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: 0,
  },
  headlineSmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  titleLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
  },
  titleMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  titleSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelLarge: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  labelMedium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  labelSmall: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.5,
  },
  bodyLarge: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  bodyMedium: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bodySmall: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  // Add the required variants
  regular: {
    fontFamily: 'System',
    fontWeight: '400' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  medium: {
    fontFamily: 'System',
    fontWeight: '500' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  bold: {
    fontFamily: 'System',
    fontWeight: '700' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  heavy: {
    fontFamily: 'System',
    fontWeight: '900' as const,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
};

const CombinedLightTheme = {
  ...MD3LightTheme,
  ...LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...LightTheme.colors,
    primary: '#6200ee',
    secondary: '#03dac6',
  },
  fonts: customTextVariants,
};

const CombinedDarkTheme = {
  ...MD3DarkTheme,
  ...NavigationDarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...NavigationDarkTheme.colors,
    primary: '#bb86fc',
    secondary: '#03dac6',
  },
  fonts: customTextVariants,
};

export default function App() {
  // For now, we'll use light theme. In a real app, you'd use the theme from settings
  const theme = CombinedLightTheme;

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar style={theme === CombinedDarkTheme ? 'light' : 'dark'} />
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
} 