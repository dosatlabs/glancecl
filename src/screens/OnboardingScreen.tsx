import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const [loading, setLoading] = useState(false);

  const completeOnboarding = async () => {
    try {
      console.log('Completing onboarding...');
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log('Onboarding marked as complete.');
      navigation.navigate('Home');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      Alert.alert('Error', 'Failed to complete onboarding. Please try again.');
    }
  };

  const handleConnectBankAccount = async () => {
    // This will be implemented with Plaid later
    setLoading(true);
    console.log('Connect bank account pressed');
    
    // Simulate connection delay
    setTimeout(async () => {
      setLoading(false);
      try {
        await completeOnboarding();
      } catch (error) {
        console.error('Error in bank connection flow:', error);
        Alert.alert('Connection Error', 'Failed to connect bank account. Please try again.');
      }
    }, 1500);
  };

  const handleSkip = async () => {
    try {
      await completeOnboarding();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
      Alert.alert('Error', 'Failed to skip onboarding. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Connect Your Bank</Text>
        <Text style={styles.subtitle}>
          Connect your bank accounts to start tracking your spending automatically.
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <TouchableOpacity 
          style={styles.connectButton} 
          onPress={handleConnectBankAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.connectButtonText}>Connect Bank Account</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.skipButtonText}>Skip for now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  contentContainer: {
    width: '100%',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
  },
});

export default OnboardingScreen;