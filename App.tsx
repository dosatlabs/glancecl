import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import 'react-native-url-polyfill/auto';
import * as Linking from 'expo-linking';

// Initialize URL handling for deep links
const prefix = Linking.createURL('/');
console.log('Deep link prefix:', prefix);

export default function App() {
  // Log incoming URLs for debugging
  useEffect(() => {
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        console.log('App initial URL:', initialUrl);
      }
    };
    
    getInitialURL();
    
    const subscription = Linking.addEventListener('url', (event) => {
      console.log('Received URL event in App.tsx:', event.url);
    });
    
    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}