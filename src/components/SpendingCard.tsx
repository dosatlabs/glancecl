import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient'; // Import from expo-linear-gradient


// DifferenceType is no longer used, but we keep the interface prop optional
type DifferenceType = {
  value: string;
  isPositive: boolean;
};

export interface SpendingCardProps {
  title: string;
  amount: string;
  difference?: DifferenceType | null; // Keep prop for potential future use? Or remove fully? Let's keep for now.
  iconName?: string;
  dateRange?: string;
  showChevron?: boolean;
}

const defaultGradient = ['#FFFFFF', '#FDFDFD'] as const;

const SpendingCard: React.FC<SpendingCardProps> = ({
  title,
  amount,
  // difference prop is received but no longer rendered
  iconName = 'help-circle-outline',
  dateRange,
  showChevron = true,
}) => {
  return (
    <LinearGradient
        colors={defaultGradient}
        style={styles.card}
    >
      {/* Combined Title and Date Range Row */}
      <View style={styles.titleRow}>
         {/* Left part: Icon and Title */}
         <View style={styles.titleLeftGroup}>
            <Icon name={iconName} size={18} color="#555555" style={styles.icon} />
            <Text style={styles.title}>{title}</Text>
         </View>
         {/* Right part: Date Range */}
         {dateRange && <Text style={styles.dateRange}>{dateRange}</Text>}
      </View>

      {/* Bottom section: Amount and Chevron */}
      <View style={styles.bottomSection}>
         <Text style={styles.amount}>{amount}</Text>
         {/* Removed the difference indicator rendering block */}
         {/* Right content now only potentially contains the chevron */}
         {showChevron && (
             <Icon name="chevron-right" size={24} color="#AAAAAA" style={styles.chevron} />
         )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  titleRow: {
    flexDirection: 'row',       // Arrange items horizontally
    alignItems: 'center',       // Align items vertically center
    justifyContent: 'space-between', // Push title group left, date range right
    marginBottom: 14,           // Space below the title row
  },
  titleLeftGroup: { // Group icon and title together
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  title: {
    fontSize: 15,
    fontFamily: 'RethinkSans-Medium',
    color: '#333333',
  },
  dateRange: {
      fontSize: 12,             // Slightly larger date range text
      fontFamily: 'RethinkSans', // Regular weight
      color: '#888888',         // Keep grey color
      // Removed marginTop and marginLeft
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: 8, // Added slight margin above amount row for balance
  },
  amount: {
    fontSize: 30,
    color: '#1A3A0A',
    fontFamily: 'RethinkSans-Bold',
    lineHeight: 34,
  },
  // differenceContainer, positiveContainer, negativeContainer, differenceText, positive, negative styles can now be REMOVED as they are unused.
  chevron: {
     // marginLeft is no longer needed as justifyContent handles positioning
     // Ensure it aligns nicely vertically if needed
  },
});

export default SpendingCard;