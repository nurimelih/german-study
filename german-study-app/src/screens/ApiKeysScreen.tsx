import React, {useEffect, useState} from 'react';
import {Alert, Linking, ScrollView, StyleSheet, View} from 'react-native';
import {Button, Card, Divider, Text, TextInput, useTheme} from 'react-native-paper';
import {getApiKeys, saveApiKey} from '../../src/services/storageService';
import {AIProvider} from '../services/aiService';

const ApiKeysScreen = () => {
  const theme = useTheme();
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [perplexityKey, setPerplexityKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const keys = await getApiKeys();
      setOpenaiKey(keys.openai || '');
      setAnthropicKey(keys.anthropic || '');
      setPerplexityKey(keys.perplexity || '');
    } catch (error) {
      console.error('Error loading API keys:', error);
      Alert.alert('Error', 'Failed to load API keys');
    }
  };

  const saveKey = async (provider: AIProvider, key: string) => {
    setLoading(true);
    try {
      await saveApiKey(provider, key);
      Alert.alert('Success', `${provider} API key saved successfully`);
    } catch (error) {
      console.error(`Error saving ${provider} API key:`, error);
      Alert.alert('Error', `Failed to save ${provider} API key`);
    } finally {
      setLoading(false);
    }
  };

  const openProviderWebsite = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.error('Error opening URL:', err);
      Alert.alert('Error', 'Could not open the website');
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Keys</Text>
      <Text style={styles.subtitle}>
        Enter your API keys for the AI providers you want to use.
        You only need to set up one provider to use the app.
      </Text>

      <Card style={styles.card}>
        <Card.Title title="OpenAI" />
        <Card.Content>
          <Text style={styles.description}>
            OpenAI's GPT-4 Vision model can analyze images and provide detailed explanations.
            Recommended for German language learning.
          </Text>
          <TextInput
            label="API Key"
            value={openaiKey}
            onChangeText={setOpenaiKey}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.hint}>
            Get your API key from the OpenAI platform.
          </Text>
          <Button
            mode="text"
            onPress={() => openProviderWebsite('https://platform.openai.com/api-keys')}
          >
            Visit OpenAI Website
          </Button>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => saveKey('openai', openaiKey)}
            disabled={loading || !openaiKey}
            loading={loading}
          >
            Save OpenAI Key
          </Button>
        </Card.Actions>
      </Card>

      <Divider style={styles.divider} />

      <Card style={styles.card}>
        <Card.Title title="Anthropic" />
        <Card.Content>
          <Text style={styles.description}>
            Anthropic's Claude model can analyze images and provide detailed explanations.
            Good alternative to OpenAI.
          </Text>
          <TextInput
            label="API Key"
            value={anthropicKey}
            onChangeText={setAnthropicKey}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.hint}>
            Get your API key from the Anthropic console.
          </Text>
          <Button
            mode="text"
            onPress={() => openProviderWebsite('https://console.anthropic.com/settings/keys')}
          >
            Visit Anthropic Website
          </Button>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => saveKey('anthropic', anthropicKey)}
            disabled={loading || !anthropicKey}
            loading={loading}
          >
            Save Anthropic Key
          </Button>
        </Card.Actions>
      </Card>

      <Divider style={styles.divider} />

      <Card style={styles.card}>
        <Card.Title title="Perplexity" />
        <Card.Content>
          <Text style={styles.description}>
            Perplexity AI provides up-to-date information and can be useful for language learning.
          </Text>
          <TextInput
            label="API Key"
            value={perplexityKey}
            onChangeText={setPerplexityKey}
            secureTextEntry
            style={styles.input}
          />
          <Text style={styles.hint}>
            Get your API key from the Perplexity API settings.
          </Text>
          <Button
            mode="text"
            onPress={() => openProviderWebsite('https://www.perplexity.ai/settings/api')}
          >
            Visit Perplexity Website
          </Button>
        </Card.Content>
        <Card.Actions>
          <Button
            mode="contained"
            onPress={() => saveKey('perplexity', perplexityKey)}
            disabled={loading || !perplexityKey}
            loading={loading}
          >
            Save Perplexity Key
          </Button>
        </Card.Actions>
      </Card>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          Your API keys are stored securely on your device and are only used to make requests to the respective AI services.
          We do not collect or store your API keys on our servers.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  input: {
    marginVertical: 8,
  },
  description: {
    marginBottom: 16,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 16,
  },
  infoContainer: {
    marginTop: 24,
    marginBottom: 32,
    padding: 16,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#0277bd',
  },
});

export default ApiKeysScreen; 