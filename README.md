# German Study Assistant

A React Native application to help with German language learning using AI. This app allows users to take photos of German text, upload images, or ask questions directly to get AI-powered assistance.

## Features

- Take photos of German textbooks, homework, or any German text
- Upload existing images from your gallery
- Text-based chat for asking questions about German language
- Support for multiple AI providers (OpenAI, Anthropic, Perplexity)
- Conversation history
- Customizable settings

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- Yarn package manager
- Expo CLI
- API keys for at least one of the supported AI providers:
  - OpenAI: https://platform.openai.com/api-keys
  - Anthropic: https://console.anthropic.com/settings/keys
  - Perplexity: https://www.perplexity.ai/settings/api

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   yarn install
   ```
3. Start the development server:
   ```
   yarn start
   ```
4. Follow the instructions to open the app on your device or emulator

### Running on Physical Devices

1. Install the Expo Go app on your iOS or Android device
2. Scan the QR code shown in the terminal or Expo Dev Tools
3. The app will open in Expo Go

## Usage

1. Set up your API keys in the Settings > API Keys section
2. Take a photo of German text or upload an image
3. Ask questions about the text or request translations
4. View your conversation history anytime

## Technologies Used

- React Native
- Expo
- React Navigation
- React Native Paper (UI components)
- AsyncStorage for data persistence
- OpenAI, Anthropic, and Perplexity APIs

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for GPT-4 Vision API
- Anthropic for Claude API
- Perplexity for their AI API 