import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { FoodLogWithFood, MealType } from '@/types/api';
import { FoodLogCard } from './FoodLogCard';
import { formatMealType, getMealTypeEmoji, formatCalories } from '@/utils/formatters';

interface MealSectionProps {
  mealType: MealType;
  logs: FoodLogWithFood[];
  totalCalories: number;
  onAddFood: () => void;
  onDeleteLog?: (logId: number) => void;
  onEditLog?: (log: FoodLogWithFood) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  mealType,
  logs,
  totalCalories,
  onAddFood,
  onDeleteLog,
  onEditLog,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.emoji}>{getMealTypeEmoji(mealType)}</Text>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>
              {formatMealType(mealType)}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {formatCalories(totalCalories)} cal
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={onAddFood}
        >
          <Ionicons name="add" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Food Logs */}
      {logs.length > 0 ? (
        <View style={styles.logs}>
          {logs.map((log) => (
            <FoodLogCard
              key={log.log.id}
              log={log}
              onDelete={onDeleteLog}
              onEdit={onEditLog}
            />
          ))}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: colors.backgroundSecondary }]}>
          <Ionicons name="restaurant-outline" size={32} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No foods logged for {mealType}
          </Text>
          <TouchableOpacity
            style={[styles.emptyButton, { borderColor: colors.border }]}
            onPress={onAddFood}
          >
            <Text style={[styles.emptyButtonText, { color: colors.primary }]}>
              Add Food
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logs: {
    gap: 8,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
    marginBottom: 16,
  },
  emptyButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
