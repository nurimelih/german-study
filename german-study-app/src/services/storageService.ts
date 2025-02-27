import AsyncStorage from '@react-native-async-storage/async-storage';
import {AIProvider} from './aiService';

// Storage keys
const STORAGE_KEYS = {
  API_KEYS: 'german_study_api_keys',
  HISTORY: 'german_study_history',
  SETTINGS: 'german_study_settings',
};

// Types
export interface ApiKeys {
  openai?: string;
  anthropic?: string;
  perplexity?: string;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  response: string;
  provider: AIProvider;
  imageUri?: string;
  timestamp: number;
}

export interface Settings {
  defaultProvider: AIProvider;
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'de' | 'tr';
}

// Default settings
const DEFAULT_SETTINGS: Settings = {
  defaultProvider: 'anthropic',
  theme: 'system',
  language: 'en',
};

// Save API keys
export const saveApiKeys = async (keys: ApiKeys): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(keys));
  } catch (error) {
    console.error('Error saving API keys:', error);
    throw error;
  }
};

// Get API keys
export const getApiKeys = async (): Promise<ApiKeys> => {
  try {
    const keys = await AsyncStorage.getItem(STORAGE_KEYS.API_KEYS);
    return keys ? JSON.parse(keys) : {};
  } catch (error) {
    console.error('Error getting API keys:', error);
    return {};
  }
};

// Save a specific API key
export const saveApiKey = async (provider: AIProvider, key: string): Promise<void> => {
  try {
    const keys = await getApiKeys();
    keys[provider] = key;
    await saveApiKeys(keys);
  } catch (error) {
    console.error(`Error saving ${provider} API key:`, error);
    throw error;
  }
};

// Get a specific API key
export const getApiKey = async (provider: AIProvider): Promise<string | undefined> => {
  try {
    const keys = await getApiKeys();
    return keys[provider];
  } catch (error) {
    console.error(`Error getting ${provider} API key:`, error);
    return undefined;
  }
};

// Save history item
export const saveHistoryItem = async (item: HistoryItem): Promise<void> => {
  try {
    const history = await getHistory();
    history.unshift(item); // Add to the beginning of the array
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history item:', error);
    throw error;
  }
};

// Get history
export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const history = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Error getting history:', error);
    return [];
  }
};

// Clear history
export const clearHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.error('Error clearing history:', error);
    throw error;
  }
};

// Save settings
export const saveSettings = async (settings: Partial<Settings>): Promise<void> => {
  try {
    const currentSettings = await getSettings();
    const newSettings = { ...currentSettings, ...settings };
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};

// Get settings
export const getSettings = async (): Promise<Settings> => {
  try {
    const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting settings:', error);
    return DEFAULT_SETTINGS;
  }
}; 