import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { formatCalories, calculatePercentage } from '@/utils/formatters';
import Svg, { Circle } from 'react-native-svg';

interface CalorieRingProps {
  current: number;
  goal: number;
  size?: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({ current, goal, size = 200 }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const percentage = calculatePercentage(current, goal);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  const remaining = Math.max(0, goal - current);
  const over = Math.max(0, current - goal);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.divider}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      <View style={styles.content}>
        <View style={styles.center}>
          <Text style={[styles.current, { color: colors.text }]}>
            {formatCalories(current)}
          </Text>
          <Text style={[styles.separator, { color: colors.textTertiary }]}>of</Text>
          <Text style={[styles.goal, { color: colors.textSecondary }]}>
            {formatCalories(goal)}
          </Text>
          <Text style={[styles.label, { color: colors.textTertiary }]}>calories</Text>
        </View>

        {remaining > 0 ? (
          <Text style={[styles.remaining, { color: colors.success }]}>
            {formatCalories(remaining)} left
          </Text>
        ) : (
          <Text style={[styles.over, { color: colors.error }]}>
            {formatCalories(over)} over
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
  },
  current: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  separator: {
    fontSize: 12,
    marginVertical: 2,
  },
  goal: {
    fontSize: 20,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    marginTop: 4,
  },
  remaining: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  over: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});
