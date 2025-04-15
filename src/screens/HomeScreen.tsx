import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import SpendingCard from '../components/SpendingCard';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';

const HomeScreen: React.FC = () => {
  const { signOut } = useAuth();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Load the fonts
  useEffect(() => {
    async function loadFonts() {
      try {
        console.log('Loading fonts...');
        await Font.loadAsync({
          'RethinkSans': require('../assets/fonts/RethinkSans-Regular.ttf'),
          'RethinkSans-Bold': require('../assets/fonts/RethinkSans-Bold.ttf'),
        });
        console.log('Fonts loaded successfully');
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
        // Continue without custom font if there's an error
        setFontsLoaded(true);
      }
    }
    
    loadFonts();
  }, []);
  
  // Mock data - later this will come from your API
  const spendingData = {
    today: { amount: '£35.50', difference: null },
    week: { amount: '£182.75', difference: null },
    month: { amount: '£455.20', difference: null },
  };

  const handleLogout = async () => {
    try {
      Alert.alert(
        'Logout',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel'
          },
          {
            text: 'Logout',
            onPress: async () => {
              // Clear onboarding status
              await AsyncStorage.removeItem('hasCompletedOnboarding');
              // Sign out from Supabase
              await signOut();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6d7f5b" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {/* Replace with your actual logo image */}
            <Image 
              source={require('../assets/glance_logo.png')} 
              style={styles.logoIcon}
              // Fallback to eye icon if image fails to load
              onError={(e) => console.log('Logo image failed to load:', e.nativeEvent.error)}
            />
            <Text style={styles.logo}>glance</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
       
        <SpendingCard
          title="Spent Today"
          amount={spendingData.today.amount}
          difference={spendingData.today.difference}
          backgroundColor="#f3fee8"
        />
       
        <SpendingCard
          title="Spent This Week"
          amount={spendingData.week.amount}
          difference={spendingData.week.difference}
          backgroundColor="#eaf5df"
        />
       
        <SpendingCard
          title="Spent This Month"
          amount={spendingData.month.amount}
          difference={spendingData.month.difference}
          backgroundColor="#ddebcf"
        />
      </ScrollView>
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
    paddingTop: 20, // Added more top padding
  },
  scrollContent: {
    padding: 20,
    paddingTop: 40, // Substantially increased top padding
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the logo
    alignItems: 'center',
    marginBottom: 50, // Increased spacing before cards
    marginTop: 10, // Added top margin for the header
    position: 'relative', // To position the logout button absolutely
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoIcon: {
    width: 24,
    height: 24,
    marginTop: 6,
    resizeMode: 'contain',
  },
  logo: {
    fontSize: 26,
    fontFamily: 'RethinkSans-Regular', // Make sure this exactly matches the font name
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    position: 'absolute',
    right: 0,
  },
  logoutText: {
    color: '#555',
    fontSize: 14,
    fontFamily: 'RethinkSans', // Make sure this exactly matches the font name
  }
});

export default HomeScreen;