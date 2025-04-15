import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithGoogle, refreshSession, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  // --- Font loading and other useEffect hooks remain the same ---
  // Load the fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        console.log('Loading fonts for login screen...');

        await Font.loadAsync({
          'RethinkSans': require('../assets/fonts/RethinkSans-Regular.ttf'),
          'RethinkSans-Bold': require('../assets/fonts/RethinkSans-Bold.ttf'),
          'RethinkSans-Regular': require('../assets/fonts/RethinkSans-Regular.ttf'),
          'RethinkSans-SemiBold': require('../assets/fonts/RethinkSans-SemiBold.ttf'),
          'RethinkSans-Medium': require('../assets/fonts/RethinkSans-Medium.ttf')
        });

        console.log('Login screen fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts for login screen:', error);
        setFontsLoaded(true); // Continue even if fonts fail
      }
    }

    loadFonts();
  }, []);

  // Check if auth timed out
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (loading && !user) {
      timer = setTimeout(() => {
        setAuthTimedOut(true);
        setLoading(false);
      }, 15000); // 15 second timeout
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [loading, user]);

   // Navigate based on user and onboarding status
  useEffect(() => {
    if (user) {
      setLoading(false);
      setAuthTimedOut(false);

      const checkAndNavigate = async () => {
        try {
          const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
          // Ensure navigation doesn't happen multiple times if component re-renders
          if (navigation.isFocused()) {
             if (hasCompletedOnboarding !== 'true') {
                navigation.replace('Onboarding'); // Use replace to prevent going back to Login
             } else {
                navigation.replace('Home'); // Use replace
             }
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
           // Decide how to handle error, maybe stay on login or show message
        }
      };

      checkAndNavigate();
    }
  }, [user, navigation]);


  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setAuthTimedOut(false);
      console.log('Starting Google sign-in process...');
      await signInWithGoogle();
      // Navigation now handled by useEffect [user, navigation]
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An error occurred during sign in. Please try again.');
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/glance_logo.png')}
          style={styles.logoIcon}
        />
        <Text style={styles.logoText}>glance</Text>
      </View>

      {/* Content Group: Tagline, Illustration, Button */}
      <View style={styles.contentGroup}>
        <Text style={styles.tagline}>
          See your spending{'\n'}at a glance
        </Text>

        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/illustration.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleSignIn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" size="small" />
          ) : (
            <View style={styles.googleButtonContent}>
              <Image
                source={require('../assets/google-logo.png')}
                style={styles.googleLogo}
              />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {authTimedOut && (
          <Text style={styles.timeoutText}>
            Authentication is taking longer than expected. Please try again.
          </Text>
        )}
      </View>

       {/* This View pushes the content group up if needed, or just occupies space */}
      <View style={styles.spacer} />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    // Remove justifyContent: 'space-between'
    paddingHorizontal: 20,
    paddingTop: 80, // Adjust top padding if needed
    paddingBottom: 40, // Adjust bottom padding if needed
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // Removed marginBottom, add it below the whole logo section if needed
    // Or add marginTop to contentGroup
  },
  logoIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
    // Removed marginTop, rely on logoContainer alignment
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: 26,
    fontFamily: 'RethinkSans-Regular',
    transform: [{ translateY: -3 }]
  },
  // New style for grouping content below the logo
  contentGroup: {
     alignItems: 'center',
     width: '100%', // Ensure group takes width for centering content
     marginTop: 60, // Space below logo // *** ADJUST THIS VALUE ***
  },
  tagline: {
    fontSize: 32,
    textAlign: 'center',
    fontFamily: 'RethinkSans-Medium',
    lineHeight: 36, // Slightly increased line height for multi-line text
    marginBottom: 30, // Space below tagline // *** ADJUST THIS VALUE ***
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40, // Space below illustration // *** ADJUST THIS VALUE ***
  },
  illustration: {
    width: 260, // Keep desired width
    height: 220, // ** ADJUST HEIGHT TO MATCH VISUAL **
  },
  googleButton: {
    backgroundColor: '#e7f9e4',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 35,
    width: '90%',
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
    // marginTop: 0, // Explicitly set or remove if not needed
  },
  googleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleLogo: {
    width: 18,
    height: 18,
    marginRight: 10,
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontFamily: 'RethinkSans',
  },
  timeoutText: {
    // Position this relative to the button or bottom as needed
    position: 'absolute', // Example: position absolutely at the bottom
    bottom: -30, // Adjust as needed
    color: '#F44336',
    textAlign: 'center',
    fontSize: 14,
    fontFamily: 'RethinkSans',
    width: '90%' // Ensure it wraps within bounds
  },
   spacer: {
     flex: 1 // This empty view will push the contentGroup up
   }
});

export default LoginScreen;