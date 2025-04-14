import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator, Text, Button } from 'react-native';

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a timeout to detect if loading takes too long
  useEffect(() => {
    if (loading || authLoading) {
      const timer = setTimeout(() => {
        setLoadingTimeout(true);
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [loading, authLoading]);

  useEffect(() => {
    console.log('Auth state changed. User:', user ? 'Logged in' : 'Not logged in');
    
    const checkOnboardingStatus = async () => {
      try {
        setLoading(true);
        const status = await AsyncStorage.getItem('hasCompletedOnboarding');
        console.log('Onboarding status from storage:', status);
        setHasCompletedOnboarding(status === 'true');
        setLoading(false);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setError('Failed to check onboarding status');
        setHasCompletedOnboarding(false);
        setLoading(false);
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [authLoading, user]);

  // Reset the app state (for debugging)
  const resetAppState = async () => {
    try {
      await AsyncStorage.removeItem('hasCompletedOnboarding');
      setHasCompletedOnboarding(false);
      setError(null);
      setLoadingTimeout(false);
      // Force refresh
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    } catch (e) {
      console.error('Error resetting app state:', e);
    }
  };

  if (authLoading || loading) {
    // Show loading spinner with timeout detection
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <ActivityIndicator size="large" color="#4CAF50" />
        {loadingTimeout && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ textAlign: 'center', marginBottom: 10 }}>
              Loading is taking longer than expected. There might be an issue with authentication.
            </Text>
            <Button title="Reset App State" onPress={resetAppState} />
          </View>
        )}
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'red', marginBottom: 20 }}>{error}</Text>
        <Button title="Retry" onPress={resetAppState} />
      </View>
    );
  }

  // Force navigation to onboarding after login if we're stuck
  if (user && hasCompletedOnboarding === null) {
    setHasCompletedOnboarding(false);
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : !hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

