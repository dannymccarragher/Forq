import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { formatMacro, calculatePercentage } from '@/utils/formatters';

interface MacroProgressBarProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

export const MacroProgressBar: React.FC<MacroProgressBarProps> = ({
  label,
  current,
  goal,
  unit,
  color,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const percentage = calculatePercentage(current, goal);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.stats, { color: colors.textSecondary }]}>
          {formatMacro(current)}/{formatMacro(goal)}{unit}
        </Text>
        <Text style={[styles.percentage, { color: colors.text }]}>
          {(percentage || 0).toFixed(0)}%
        </Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  stats: {
    fontSize: 13,
    marginRight: 12,
  },
  percentage: {
    fontSize: 15,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'right',
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
});
