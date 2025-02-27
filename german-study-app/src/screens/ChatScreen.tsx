import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import {
  Button,
  Chip,
  Divider,
  IconButton,
  Text,
  TextInput,
  useTheme
} from 'react-native-paper';
import {v4 as uuidv4} from 'uuid';
import {getApiKey, getSettings, saveHistoryItem} from '../../src/services/storageService';
import {RootStackParamList} from '../navigation/AppNavigator';
import {AIProvider, sendToAI} from '../services/aiService';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;
type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  imageUri?: string | null;
  timestamp: number;
}

const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const theme = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(route.params?.imageUri || null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('anthropic');
  const [apiKey, setApiKey] = useState<string | undefined>();

  useEffect(() => {
    loadSettings();
    if (imageUri) {
      // If image was passed, show it in the chat
      addMessage({
        id: uuidv4(),
        text: 'I\'ve uploaded an image for analysis.',
        isUser: true,
        imageUri,
        timestamp: Date.now(),
      });
    }
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await getSettings();
      setProvider(settings.defaultProvider);
      const key = await getApiKey(settings.defaultProvider);
      setApiKey(key);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const addMessage = (message: Message) => {
    setMessages(prevMessages => [...prevMessages, message]);
    // Scroll to bottom after message is added
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (!inputText.trim() && !imageUri) {
      return;
    }

    if (!apiKey) {
      Alert.alert(
        'API Key Missing',
        `Please set up your ${provider} API key in the settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to API Keys', onPress: () => navigation.navigate('ApiKeys') }
        ]
      );
      return;
    }

    // Helper function to convert null to undefined for type safety
    const nullToUndefined = <T,>(value: T | null): T | undefined => 
      value === null ? undefined : value;

    const userMessage: Message = {
      id: uuidv4(),
      text: inputText,
      isUser: true,
      imageUri,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendToAI(
        provider,
        apiKey,
        inputText || 'Please analyze this image and explain it in detail.',
        imageUri
      );

      const aiMessage: Message = {
        id: uuidv4(),
        text: response.text,
        isUser: false,
        timestamp: Date.now(),
      };

      addMessage(aiMessage);

      // Save to history with scaled image if available
      const historyImageUri = response.scaledImageUri || userMessage.imageUri;
      await saveHistoryItem({
        id: userMessage.id,
        prompt: userMessage.text,
        response: response.text,
        provider,
        ...(historyImageUri && { imageUri: historyImageUri }),
        timestamp: userMessage.timestamp,
      });

      // Clear image after sending
      setImageUri(null);
    } catch (error) {
      console.error('Error sending to AI:', error);
      addMessage({
        id: uuidv4(),
        text: 'Sorry, there was an error processing your request. Please try again.',
        isUser: false,
        timestamp: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const changeProvider = async (newProvider: AIProvider) => {
    setProvider(newProvider);
    const key = await getApiKey(newProvider);
    setApiKey(key);
  };

  const removeImage = () => {
    setImageUri(null);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.providerSelector}>
        <Chip
          selected={provider === 'openai'}
          onPress={() => changeProvider('openai')}
          style={styles.chip}
        >
          OpenAI
        </Chip>
        <Chip
          selected={provider === 'anthropic'}
          onPress={() => changeProvider('anthropic')}
          style={styles.chip}
        >
          Anthropic
        </Chip>
        <Chip
          selected={provider === 'perplexity'}
          onPress={() => changeProvider('perplexity')}
          style={styles.chip}
        >
          Perplexity
        </Chip>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Start a conversation by sending a message or uploading an image.
            </Text>
          </View>
        ) : (
          messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              {message.imageUri && (
                <Image
                  source={{ uri: message.imageUri }}
                  style={styles.messageImage}
                  resizeMode="contain"
                />
              )}
              <Text style={styles.messageText}>{message.text}</Text>
              <Text style={styles.timestamp}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Text>
            </View>
          ))
        )}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Getting response from {provider}...</Text>
          </View>
        )}
      </ScrollView>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
          <IconButton
            icon="close-circle"
            size={24}
            onPress={removeImage}
            style={styles.removeImageButton}
          />
        </View>
      )}

      <Divider />

      <View style={styles.inputContainer}>
        <IconButton
          icon="camera"
          size={24}
          onPress={takePhoto}
        />
        <IconButton
          icon="image"
          size={24}
          onPress={pickImage}
        />
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={imageUri ? "Ask about this image..." : "Type your message..."}
          multiline
        />
        <Button
          mode="contained"
          onPress={handleSend}
          disabled={isLoading || (!inputText.trim() && !imageUri)}
          loading={isLoading}
        >
          Send
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  providerSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chip: {
    marginHorizontal: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
    elevation: 1,
  },
  userBubble: {
    backgroundColor: '#e1f5fe',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginHorizontal: 8,
    maxHeight: 100,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    textAlign: 'center',
    color: '#888',
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    color: '#666',
  },
  imagePreviewContainer: {
    padding: 8,
    backgroundColor: '#eee',
    position: 'relative',
  },
  imagePreview: {
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
});

export default ChatScreen; 