import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithGoogle, refreshSession, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [authStarted, setAuthStarted] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  // Check if auth timed out
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (authStarted && !user) {
      timer = setTimeout(() => {
        setAuthTimedOut(true);
        setLoading(false);
      }, 10000); // 10 second timeout
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [authStarted, user]);

  // Reset auth state when user changes
  useEffect(() => {
    if (user) {
      setAuthStarted(false);
      setAuthTimedOut(false);
      
      // Navigate to onboarding if we have a user
      const checkAndNavigate = async () => {
        try {
          const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
          if (hasCompletedOnboarding !== 'true') {
            navigation.navigate('Onboarding');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        }
      };
      
      checkAndNavigate();
    }
  }, [user, navigation]);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthStarted(true);
      setAuthTimedOut(false);
      console.log('Starting Google sign-in process...');
      await signInWithGoogle();
      console.log('Google sign-in successful');
      // Navigation will happen automatically via the useEffect when user changes
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during sign in. Please try again.');
      setLoading(false);
      setAuthStarted(false);
    }
  };

  const handleManualContinue = async () => {
    try {
      setLoading(true);
      console.log('Manually continuing...');
      await refreshSession();
      
      if (!user) {
        // Still no user, try direct navigation
        console.log('No user found, manually navigating to onboarding');
        await AsyncStorage.setItem('hasCompletedOnboarding', 'false');
        navigation.navigate('Onboarding');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Manual continue error:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to continue. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>glance</Text>
        <Text style={styles.tagline}>Your finances at a glance</Text>
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading && !authTimedOut ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          )}
        </TouchableOpacity>
        
        {authTimedOut && (
          <View style={styles.timeoutContainer}>
            <Text style={styles.timeoutText}>
              Authentication is taking longer than expected. If you've already signed in with Google, you can continue manually.
            </Text>
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={handleManualContinue}
              disabled={loading}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 18,
    color: '#666',
  },
  contentContainer: {
    width: '100%',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeoutContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeoutText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: '#34A853',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;

