import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, {useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, View} from 'react-native';
import {Button, Card, Text, useTheme} from 'react-native-paper';
import {RootStackParamList} from '../navigation/AppNavigator';
import {getApiKeys} from '../services/storageService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const theme = useTheme();
  const [hasApiKeys, setHasApiKeys] = useState<boolean>(false);

  useEffect(() => {
    checkApiKeys();
  }, []);

  const checkApiKeys = async () => {
    const keys = await getApiKeys();
    setHasApiKeys(!!keys.openai || !!keys.anthropic || !!keys.perplexity);
  };

  const pickImage = async () => {
    if (!hasApiKeys) {
      Alert.alert(
        'No API Keys',
        'Please set up at least one API key in the settings before using the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to API Keys', onPress: () => navigation.navigate('ApiKeys') }
        ]
      );
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      navigation.navigate('Chat', { imageUri: result.assets[0].uri });
    }
  };

  const takePhoto = async () => {
    if (!hasApiKeys) {
      Alert.alert(
        'No API Keys',
        'Please set up at least one API key in the settings before using the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to API Keys', onPress: () => navigation.navigate('ApiKeys') }
        ]
      );
      return;
    }

    // Request permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Sorry, we need camera permissions to make this work!');
      return;
    }

    // Launch camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      navigation.navigate('Chat', { imageUri: result.assets[0].uri });
    }
  };

  const startTextChat = () => {
    if (!hasApiKeys) {
      Alert.alert(
        'No API Keys',
        'Please set up at least one API key in the settings before using the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to API Keys', onPress: () => navigation.navigate('ApiKeys') }
        ]
      );
      return;
    }

    navigation.navigate('Chat');
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>German Study Assistant</Text>
      <Text style={styles.subtitle}>
        Take a photo of your German textbook or homework and get AI assistance
      </Text>

      <View style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Upload Image</Text>
            <Text style={styles.cardDescription}>
              Select an image from your gallery to analyze with AI
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={pickImage}>
              Choose Image
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Take Photo</Text>
            <Text style={styles.cardDescription}>
              Take a photo of your German text to analyze with AI
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={takePhoto}>
              Open Camera
            </Button>
          </Card.Actions>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Text Chat</Text>
            <Text style={styles.cardDescription}>
              Ask questions about German language without an image
            </Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={startTextChat}>
              Start Chat
            </Button>
          </Card.Actions>
        </Card>
      </View>

      <View style={styles.bottomNav}>
        <Button 
          icon="history" 
          mode="outlined" 
          onPress={() => navigation.navigate('History')}
        >
          History
        </Button>
        <Button 
          icon="cog" 
          mode="outlined" 
          onPress={() => navigation.navigate('Settings')}
        >
          Settings
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    color: '#666',
  },
  cardContainer: {
    flex: 1,
    gap: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 16,
  },
});

export default HomeScreen; 