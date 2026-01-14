import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { formatMacro, calculatePercentage } from '@/utils/formatters';

interface MacroCardProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

export const MacroCard: React.FC<MacroCardProps> = ({ label, current, goal, unit, color }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const percentage = calculatePercentage(current, goal);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>

      <View style={styles.valuesContainer}>
        <View style={styles.values}>
          <Text style={[styles.current, { color: colors.text }]}>
            {formatMacro(current)}
          </Text>
          <Text style={[styles.separator, { color: colors.textTertiary }]}>/</Text>
          <Text style={[styles.goal, { color: colors.textSecondary }]}>
            {formatMacro(goal)}
          </Text>
          <Text style={[styles.unit, { color: colors.textTertiary }]}>{unit}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBar, { backgroundColor: colors.divider }]}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <Text style={[styles.percentage, { color: colors.textTertiary }]}>
        {(percentage || 0).toFixed(0)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  valuesContainer: {
    marginBottom: 12,
    overflow: 'hidden',
  },
  values: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
  current: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    fontSize: 16,
    marginHorizontal: 3,
  },
  goal: {
    fontSize: 14,
  },
  unit: {
    fontSize: 11,
    marginLeft: 3,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentage: {
    fontSize: 11,
    textAlign: 'right',
  },
});
