import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

// Import screens
import ApiKeysScreen from '../screens/ApiKeysScreen';
import ChatScreen from '../screens/ChatScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Define the stack navigator param list
export type RootStackParamList = {
  Home: undefined;
  Chat: { imageUri?: string };
  Settings: undefined;
  History: undefined;
  ApiKeys: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#6200ee',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'German Study Assistant' }} 
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen} 
          options={{ title: 'AI Chat' }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Settings' }} 
        />
        <Stack.Screen 
          name="History" 
          component={HistoryScreen} 
          options={{ title: 'History' }} 
        />
        <Stack.Screen 
          name="ApiKeys" 
          component={ApiKeysScreen} 
          options={{ title: 'API Keys' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 