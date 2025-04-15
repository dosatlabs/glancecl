import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type DifferenceType = {
  value: string;
  isPositive: boolean;
};

export interface SpendingCardProps {
  title: string;
  amount: string;
  difference?: DifferenceType | null;
  backgroundColor: string;
}

const SpendingCard: React.FC<SpendingCardProps> = ({ 
  title, 
  amount, 
  difference,
  backgroundColor 
}) => {
  return (
    <View style={styles.cardWrapper}>
      {/* Solid background shape for 3D effect */}
      <View style={[styles.cardShadow]} />
      
      {/* Main card */}
      <View style={[styles.card, { backgroundColor }]}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.amountRow}>
          <Text style={styles.amount}>{amount}</Text>
          {difference && (
            <View style={[
              styles.differenceContainer,
              difference.isPositive ? styles.positiveContainer : styles.negativeContainer
            ]}>
              <Text style={[
                styles.differenceText,
                difference.isPositive ? styles.positive : styles.negative
              ]}>
                {difference.isPositive ? '+' : '-'}{difference.value}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    position: 'relative',
    marginBottom: 28, // Increased for more space between cards
    height: 110, // Fixed height to ensure consistent appearance
  },
  cardShadow: {
    position: 'absolute',
    backgroundColor: '#6d7f5b', // Updated shadow color
    borderRadius: 20,
    top: 5, // Offset to create 3D effect
    left: 5, // Pushed 5px right to match design
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 5, // Space at right to show shadow
    bottom: 5, // Space at bottom to show shadow
    zIndex: 2,
  },
  title: {
    fontSize: 12,
    color: '#4a4a4a',
    marginBottom: 12,
    fontFamily: 'RethinkSans',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amount: {
    fontSize: 32,
    color: '#202020',
    fontFamily: 'RethinkSans-Bold',
  },
  differenceContainer: {
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positiveContainer: {
    backgroundColor: '#4caf5033', // Semi-transparent green
  },
  negativeContainer: {
    backgroundColor: '#f4433633', // Semi-transparent red
  },
  differenceText: {
    fontSize: 11,
    fontFamily: 'RethinkSans-Medium',
  },
  positive: {
    color: '#4CAF50',
  },
  negative: {
    color: '#F44336',
  },
});

export default SpendingCard;