import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type DifferenceType = {
  value: string;
  isPositive: boolean;
};

export interface SpendingCardProps {
  title: string;
  amount: string;
  difference?: DifferenceType | null; // Allows null values
}

const SpendingCard: React.FC<SpendingCardProps> = ({ title, amount, difference }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.amount}>{amount}</Text>
      {difference && (
        <View style={styles.differenceContainer}>
          <Text style={[
            styles.differenceText,
            difference.isPositive ? styles.positive : styles.negative
          ]}>
            {difference.isPositive ? '+' : '-'} {difference.value}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  differenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  differenceText: {
    fontSize: 14,
    fontWeight: '500',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
});

export default SpendingCard;