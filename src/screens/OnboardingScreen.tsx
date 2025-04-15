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
import { RootStackParamList } from '../types/navigation'; // Assuming this path is correct
import { useAuth } from '../context/AuthContext'; // Assuming this path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font'; // Keep if fonts are loaded per screen

// Define navigation prop type for this screen
type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingConnectBankScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { refreshSession } = useAuth(); // Needed to potentially trigger navigation after completion
  const [loading, setLoading] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false); // Keep if loading fonts here

  // Optional: Font loading (if not handled globally)
  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          // Make sure these fonts match your login screen's fonts
          'RethinkSans': require('../assets/fonts/RethinkSans-Regular.ttf'),
          'RethinkSans-Bold': require('../assets/fonts/RethinkSans-Bold.ttf'),
          'RethinkSans-Medium': require('../assets/fonts/RethinkSans-Medium.ttf'),
          // Add other weights if used
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts for onboarding screen:', error);
        setFontsLoaded(true); // Continue even if fonts fail
      }
    }
    loadFonts();
  }, []);

  // Function to mark onboarding as done and potentially trigger navigation
  const completeOnboardingAndProceed = async () => {
    try {
       // This might involve setting state, asyncstorage, and potentially navigating
       // or refreshing the session state to let a higher-level navigator handle it.
      console.log('Marking onboarding as complete...');
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log('Onboarding marked complete.');

      // Option 1: Navigate directly (if this is the last step)
      // navigation.replace('Home');

      // Option 2: Refresh session state (if AppNavigator handles the switch)
      await refreshSession();

    } catch (error) {
      console.error('Error saving onboarding status:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
      // Ensure loading is stopped even on error
      setLoading(false);
    }
     // Intentionally don't stop loading here if refreshSession handles navigation
     // If navigating directly, stop loading: setLoading(false);
  };

  // Placeholder for Plaid connection logic
  const handleConnectBankAccount = async () => {
    setLoading(true);
    console.log('Attempting to connect bank account via Plaid...');

    // ** START: Replace with actual Plaid Link SDK integration **
    // Simulate Plaid Link flow (success case)
    // In reality, you'd open Plaid Link, handle success/exit callbacks
    // On success, you'd get a public_token, exchange it for an access_token server-side
    // and then likely call completeOnboardingAndProceed()
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    const plaidConnectionSuccessful = true; // Simulate success
    // ** END: Replace with actual Plaid Link SDK integration **


    if (plaidConnectionSuccessful) {
       console.log('Plaid connection simulation successful.');
       await completeOnboardingAndProceed();
       // setLoading(false) will be handled by completeOnboarding or screen unmount
    } else {
       console.log('Plaid connection simulation failed.');
       Alert.alert('Connection Failed', 'Could not connect bank account. Please try again.');
       setLoading(false);
    }
  };

  // Display loading indicator until fonts are ready (if loading per screen)
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#4CAF50" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo Section - Reuse styles from Login */}
      <View style={styles.logoContainer}>
        <Image
          source={require('../assets/glance_logo.png')} // Ensure path is correct
          style={styles.logoIcon}
        />
        <Text style={styles.logoText}>glance</Text>
      </View>

      {/* Content Group */}
      <View style={styles.contentGroup}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require('../assets/card_illustration.png')} // *** USE YOUR ILLUSTRATION PATH ***
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* Text Block */}
        <View style={styles.textContainer}>
          <Text style={styles.headline}>Connect to Your Bank</Text>
          <Text style={styles.subHeadline}>
             {/* ** CHOOSE ONE OF THE SENTENCES BELOW ** */}
             {/* Option 1: */}
             We use Plaid to securely connect your bank account. Glance never sees or stores your bank login credentials.
             {/* Option 2: */}
             {/* Securely link your bank using Plaid. Your login details are encrypted and never stored or seen by Glance. */}
             {/* Option 3: */}
             {/* Connect your bank securely via Plaid. Plaid handles your login details, and Glance cannot access your credentials. */}
             {/* Option 4: */}
             {/* Connect securely with Plaid. Glance never sees your bank login. */}
          </Text>
        </View>

        {/* Connect Button */}
        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleConnectBankAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" size="small" /> // Dark spinner for light button
          ) : (
            <Text style={styles.connectButtonText}>Connect Bank Account</Text>
          )}
        </TouchableOpacity>
      </View>

       {/* Spacer pushes content up */}
      <View style={styles.spacer} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { // Reusable loading style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: { // Adapted from Login Screen
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80, // Adjust as needed for space above logo
    paddingBottom: 40, // Adjust as needed for space below button
  },
  logoContainer: { // Reused from Login Screen
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 50, // Space below logo
  },
  logoIcon: { // Reused from Login Screen
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: 'contain',
  },
  logoText: { // Reused from Login Screen (adjust font if needed)
    fontSize: 26,
    fontFamily: 'RethinkSans-Regular', // Ensure font is loaded
    transform: [{ translateY: -3 }]
  },
  contentGroup: {
     flex: 1, // Allow content to take space but spacer pushes it up
     alignItems: 'center',
     width: '100%',
     // marginTop: is handled by logoContainer marginBottom
  },
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 35, // Space below illustration // *** ADJUST THIS VALUE ***
  },
  illustration: {
    width: 260, // Adjust width as needed
    height: 200, // Adjust height as needed
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 45, // Space below text block // *** ADJUST THIS VALUE ***
  },
  headline: {
    fontSize: 26, // Adjust font size as needed
    fontFamily: 'RethinkSans-Medium', // Or Bold, ensure loaded
    textAlign: 'center',
    marginBottom: 12, // Space between headline and sub-headline
    color: '#000000', // Or your primary text color
  },
  subHeadline: {
    fontSize: 15, // Adjust font size as needed
    fontFamily: 'RethinkSans', // Ensure loaded
    textAlign: 'center',
    color: '#666666', // Slightly lighter text color
    lineHeight: 21, // Adjust for readability
    paddingHorizontal: 10, // Prevent text from touching edges
  },
  connectButton: { // Style adapted from image
    backgroundColor: '#e7f9e4', // Light green background
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 35, // Rounded corners
    width: '90%', // Adjust width as needed
    maxWidth: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectButtonText: { // Style adapted from image
    color: '#000000', // Black text on light green
    fontSize: 16,
    fontFamily: 'RethinkSans-Medium', // Or SemiBold, ensure loaded
  },
  spacer: {
    // This empty view doesn't need height, flex: 1 in container handles distribution
    // If content doesn't push up enough, add height or adjust flex on contentGroup/spacer
  }
});

export default OnboardingConnectBankScreen;