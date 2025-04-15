import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import SpendingCard from '../components/SpendingCard'; // Ensure path is correct
import { useAuth } from '../context/AuthContext'; // Ensure path is correct
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
// Removed Icon import here if only used for logout previously

// Function to get initials (simple example)
const getInitials = (name: string): string => {
   if (!name) return '??';
   const names = name.split(' ');
   if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
   return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
};

// Function to get time-based greeting
const getGreeting = (): string => {
   const hour = new Date().getHours();
   if (hour < 12) return "Good morning!";
   if (hour < 18) return "Good afternoon!";
   return "Good evening!";
};

// Function to format date ranges (example)
const getWeekRange = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust if week starts Sunday or Monday
    const monday = new Date(today.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${monday.toLocaleDateString('en-GB', options)} - ${sunday.toLocaleDateString('en-GB', options)}`;
}

const getMonthRange = (): string => {
   const today = new Date();
   const options: Intl.DateTimeFormatOptions = { month: 'long' };
   return today.toLocaleDateString('en-GB', options); // Just return month name, or get start/end dates
}


const HomeScreen: React.FC = () => {
  const { signOut, user } = useAuth(); // Assuming user object has display name or similar
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [userName, setUserName] = useState<string>(''); // State for user name

  // --- Font loading logic ---
  useEffect(() => {
    async function loadFonts() { /* ... no changes here ... */
        try {
            console.log('Loading fonts...');
            await Font.loadAsync({
              'RethinkSans': require('../assets/fonts/RethinkSans-Regular.ttf'),
              'RethinkSans-Bold': require('../assets/fonts/RethinkSans-Bold.ttf'),
              'RethinkSans-Medium': require('../assets/fonts/RethinkSans-Medium.ttf'), // Ensure Medium is loaded
            });
            console.log('Fonts loaded successfully');
            setFontsLoaded(true);
          } catch (error) {
            console.error('Error loading fonts:', error);
            setFontsLoaded(true);
          }
    }
    loadFonts();
  }, []);

  // --- Get user name (Example) ---
  useEffect(() => {
      // Replace with your actual method of getting user display name
      // This might come from the user object in your AuthContext
      const fetchedUserName = user?.user_metadata?.full_name || user?.email || 'User'; // Example fallback
      setUserName(fetchedUserName);
  }, [user]);


  // --- Mock data ---
  const spendingData = {
    today: { amount: '£35.50', difference: { value: '12.23', isPositive: true } },
    week: { amount: '£182.75', difference: { value: '8.50', isPositive: false } },
    month: { amount: '£455.20', difference: null },
  };

  // --- handleLogout ---
  const handleLogout = async () => { /* ... no changes here ... */
    try {
        Alert.alert(
          'Logout',
          'Are you sure you want to log out?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Logout',
              onPress: async () => {
                await AsyncStorage.removeItem('hasCompletedOnboarding');
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

  // --- Handle Avatar Press ---
  const handleAvatarPress = () => {
      // Example: Show logout or navigate to profile
      console.log('Avatar pressed');
      handleLogout(); // For now, just trigger logout directly
      // Later: navigation.navigate('Profile') or show ActionSheetIOS / Bottom Sheet
  };


  if (!fontsLoaded) { /* ... no changes here ... */
    return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1A3A0A" /> {/* Use your brand color */}
        </View>
      );
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header with Logo and Avatar */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/glance_logo.png')}
              style={styles.logoIcon}
              onError={(e) => console.log('Logo image failed to load:', e.nativeEvent.error)}
            />
            <Text style={styles.logo}>glance</Text>
          </View>
          {/* Avatar Placeholder */}
          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarButton}>
             <View style={styles.avatarCircle}>
                 <Text style={styles.avatarInitials}>{getInitials(userName)}</Text>
             </View>
          </TouchableOpacity>
        </View>

     

        {/* Optional: Screen Title */}
        <Text style={styles.screenTitle}>Spending Summary</Text>

        {/* Spending Cards */}
        <SpendingCard
          title="Spent Today"
          amount={spendingData.today.amount}
          difference={spendingData.today.difference}
          iconName="calendar-today"
          // No date range for today
          showChevron={false} // Example: make cards interactive
        />

        <SpendingCard
          title="Spent This Week"
          amount={spendingData.week.amount}
          difference={spendingData.week.difference}
          iconName="calendar-week"
          dateRange={getWeekRange()} // Add date range
          showChevron={false}
        />

        <SpendingCard
          title="Spent This Month"
          amount={spendingData.month.amount}
          difference={spendingData.month.difference}
          iconName="calendar-month"
          dateRange={getMonthRange()} // Add date range
          showChevron={false}
        />

        {/* Bottom padding */}
        <View style={{ height: 20 }} />

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- loadingContainer, container --- (no changes)
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 25, // Adjusted - less needed if header is smaller
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 45, // Reduced space below header now greeting is separate
  },
  logoContainer: { /* Keep as is */ flexDirection: 'row', alignItems: 'center' },
  logoIcon: { /* Keep as is */ width: 24, height: 24, marginRight: 6, resizeMode: 'contain' },
  logo: { /* Keep as is */ fontSize: 26, fontFamily: 'RethinkSans', color: '#1A3A0A', transform: [{ translateY: -3 }] }, // Keep Y transform if needed
  avatarButton: {
     // Just for touch area, styling is on the circle inside
  },
  avatarCircle: {
      width: 36,
      height: 36,
      borderRadius: 18, // Half of width/height
      backgroundColor: '#E0E0E0', // Placeholder grey background
      justifyContent: 'center',
      alignItems: 'center',
  },
  avatarInitials: {
      color: '#666666',
      fontSize: 14,
      fontFamily: 'RethinkSans-Medium',
      // fontWeight: '600',
  },
  greeting: {
      fontSize: 18,
      fontFamily: 'RethinkSans', // Or Medium
      color: '#555555',
      marginBottom: 10, // Space below greeting
  },
  screenTitle: {
    fontSize: 24, // Larger title
    fontFamily: 'RethinkSans-Bold', // Or Medium
    color: '#1A3A0A', // Use brand color
    marginBottom: 20, // Space below title
    // textAlign: 'center', // Optional: center title
  },
});

export default HomeScreen;