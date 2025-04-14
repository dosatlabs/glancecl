import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import SpendingCard from '../components/SpendingCard';

const HomeScreen: React.FC = () => {
  // Mock data - later this will come from your API
  const spendingData = {
    today: { amount: '£35.50', difference: { value: '£12.23', isPositive: true } },
    week: { amount: '£182.75', difference: { value: '£8.50', isPositive: false } },
    month: { amount: '£455.20', difference: null },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.logo}>glance</Text>
        </View>
       
        <SpendingCard
          title="Spent Today"
          amount={spendingData.today.amount}
          difference={spendingData.today.difference}
        />
       
        <SpendingCard
          title="Spent This Week"
          amount={spendingData.week.amount}
          difference={spendingData.week.difference}
        />
       
        <SpendingCard
          title="Spent This Month"
          amount={spendingData.month.amount}
          difference={spendingData.month.difference}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default HomeScreen;