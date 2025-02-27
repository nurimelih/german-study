import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Alert, ScrollView, StyleSheet, View} from 'react-native';
import {
  Button,
  Divider,
  List,
  RadioButton,
  Text,
  useTheme
} from 'react-native-paper';
import {clearHistory, getSettings, saveSettings} from '../../src/services/storageService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {AIProvider} from '../services/aiService';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const theme = useTheme();
  
  const [defaultProvider, setDefaultProvider] = useState<AIProvider>('openai');
  const [themePreference, setThemePreference] = useState<'light' | 'dark' | 'system'>('system');
  const [language, setLanguage] = useState<'en' | 'de' | 'tr'>('en');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setDefaultProvider(settings.defaultProvider);
      setThemePreference(settings.theme);
      setLanguage(settings.language);
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Error', 'Failed to load settings');
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await saveSettings({
        defaultProvider,
        theme: themePreference,
        language,
      });
      Alert.alert('Success', 'Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all chat history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              Alert.alert('Success', 'History cleared successfully');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <List.Section>
        <List.Subheader>AI Provider</List.Subheader>
        <RadioButton.Group
          onValueChange={(value) => setDefaultProvider(value as AIProvider)}
          value={defaultProvider}
        >
          <RadioButton.Item label="OpenAI" value="openai" />
          <RadioButton.Item label="Anthropic" value="anthropic" />
          <RadioButton.Item label="Perplexity" value="perplexity" />
        </RadioButton.Group>
        <List.Item
          title="Manage API Keys"
          description="Set up your API keys for different providers"
          left={(props) => <List.Icon {...props} icon="key" />}
          onPress={() => navigation.navigate('ApiKeys')}
        />
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Appearance</List.Subheader>
        <RadioButton.Group
          onValueChange={(value) => setThemePreference(value as 'light' | 'dark' | 'system')}
          value={themePreference}
        >
          <RadioButton.Item label="Light Theme" value="light" />
          <RadioButton.Item label="Dark Theme" value="dark" />
          <RadioButton.Item label="System Default" value="system" />
        </RadioButton.Group>
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Language</List.Subheader>
        <RadioButton.Group
          onValueChange={(value) => setLanguage(value as 'en' | 'de' | 'tr')}
          value={language}
        >
          <RadioButton.Item label="English" value="en" />
          <RadioButton.Item label="Deutsch" value="de" />
          <RadioButton.Item label="Türkçe" value="tr" />
        </RadioButton.Group>
      </List.Section>

      <Divider />

      <List.Section>
        <List.Subheader>Data</List.Subheader>
        <List.Item
          title="View History"
          description="See your past conversations"
          left={(props) => <List.Icon {...props} icon="history" />}
          onPress={() => navigation.navigate('History')}
        />
        <List.Item
          title="Clear History"
          description="Delete all your past conversations"
          left={(props) => <List.Icon {...props} icon="delete" />}
          onPress={handleClearHistory}
        />
      </List.Section>

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSaveSettings}
          disabled={loading}
          loading={loading}
          style={styles.saveButton}
        >
          Save Settings
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  buttonContainer: {
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  saveButton: {
    paddingVertical: 6,
  },
});

export default SettingsScreen; 