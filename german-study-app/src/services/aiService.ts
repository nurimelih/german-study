import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import {Alert} from 'react-native';

// Types
export type AIProvider = 'openai' | 'anthropic' | 'perplexity';

export interface AIResponse {
  text: string;
  provider: AIProvider;
  scaledImageUri?: string;
}

// Configuration for different AI providers
const API_CONFIG = {
  openai: {
    apiUrl: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4-vision-preview',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
  },
  anthropic: {
    apiUrl: 'https://api.anthropic.com/v1/messages',
    model: 'claude-3-opus-20240229',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }),
  },
  perplexity: {
    apiUrl: 'https://api.perplexity.ai/chat/completions',
    model: 'sonar',
    headers: (apiKey: string) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
  }
};

// Function to convert image to base64
const imageToBase64 = async (uri: string): Promise<{base64: string, scaledUri: string}> => {
  try {
    // Resize the image to reduce token size
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }], // Resize to 800px width, height will scale proportionally
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    
    const base64 = await FileSystem.readAsStringAsync(manipResult.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return { base64, scaledUri: manipResult.uri };
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

// Format the request body based on the provider
const formatRequestBody = async (
  provider: AIProvider,
  prompt: string,
  imageUri: string | null
): Promise<{body: any, scaledUri: string | null}> => {
  const config = API_CONFIG[provider];
  let scaledUri: string | null = null;

  const defaultPrompt = `Bu resmi analiz et ve açıkla. Bu muhtemelen bir Almanca çalışma veya dersidir. Ödevim için yardımcı ol. Bana öğretmen gibi yaklaş hatalarım varsa söyle. Sen benim Almanca öğretmenimsin. Sorularımı sana soracağım. Cevabın lütfen Türkçe olsun. Almanca ifadeleri italic ver. Resmi ekte gönderiyorum: `
  
  if (imageUri) {
    const imageData = await imageToBase64(imageUri);
    const base64Image = imageData.base64;
    scaledUri = imageData.scaledUri;
    
    switch (provider) {
      case 'openai':
        return {
          body: {
            model: config.model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: defaultPrompt + prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          },
          scaledUri
        };
        
      case 'anthropic':
        return {
          body: {
            model: config.model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: defaultPrompt + prompt },
                  {
                    type: 'image',
                    source: {
                      type: 'base64',
                      media_type: 'image/jpeg',
                      data: base64Image,
                    },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          },
          scaledUri
        };
        
      case 'perplexity':
        // Use a format similar to OpenAI for image handling
        return {
          body: {
            model: config.model,
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: defaultPrompt + prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/jpeg;base64,${base64Image}`,
                    },
                  },
                ],
              },
            ],
          },
          scaledUri
        };
    }
  } else {
    // Text-only requests
    switch (provider) {
      case 'openai':
        return {
          body: {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
          },
          scaledUri: null
        };
        
      case 'anthropic':
        return {
          body: {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 1000,
          },
          scaledUri: null
        };
        
      case 'perplexity':
        return {
          body: {
            model: config.model,
            messages: [{ role: 'user', content: prompt }],
          },
          scaledUri: null
        };
    }
  }
  
};

// Parse the response based on the provider
const parseResponse = (provider: AIProvider, data: any): string => {
  switch (provider) {
    case 'openai':
      return data.choices[0].message.content;
    case 'anthropic':
      return data.content[0].text;
    case 'perplexity':
      return data.choices[0].message.content;
    default:
      return 'No response from AI';
  }
};

// Main function to send a request to the AI provider
export const sendToAI = async (
  provider: AIProvider,
  apiKey: string,
  prompt: string,
  imageUri: string | null = null
): Promise<AIResponse> => {
  try {
    if (!apiKey) {
      throw new Error(`API key for ${provider} is not set`);
    }

    const config = API_CONFIG[provider];
    const { body: requestBody, scaledUri } = await formatRequestBody(provider, prompt, imageUri);
    
    const response = await axios.post(
      config.apiUrl,
      requestBody,
      { headers: config.headers(apiKey) }
    );

    return {
      text: parseResponse(provider, response.data),
      provider,
      scaledImageUri: scaledUri || undefined
    };
  } catch (error: any) {
    console.error(`Error with ${provider} API:`, error);
    
    // Handle different error types
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      
      const errorMessage = error.response.data?.error?.message || 
                          error.response.data?.error || 
                          `Error: ${error.response.status}`;
      
      Alert.alert(`${provider} API Error`, errorMessage);
    } else if (error.request) {
      // The request was made but no response was received
      Alert.alert('Network Error', 'No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      Alert.alert('Error', error.message);
    }
    
    throw error;
  }
}; 