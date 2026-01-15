import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { FoodLogWithFood } from '@/types/api';
import { formatCalories, formatMacro, formatTime, truncateText } from '@/utils/formatters';

interface FoodLogCardProps {
  log: FoodLogWithFood;
  onDelete?: (logId: number) => void;
  onEdit?: (log: FoodLogWithFood) => void;
  selectedMacros?: ('protein' | 'carbs' | 'fat' | 'calories' | 'fiber' | 'water')[];
}

export const FoodLogCard: React.FC<FoodLogCardProps> = ({ log, onDelete, onEdit, selectedMacros = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'water'] }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const formatServings = (servings: number): string => {
    if (servings === null || servings === undefined) return '0';
    const numValue = Number(servings);
    if (isNaN(numValue)) return '0';
    if (Number.isInteger(numValue)) {
      return numValue.toString();
    }
    return numValue.toFixed(2).replace(/\.?0+$/, '');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this food log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete?.(log.log.id),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.titleText}>
            <Text style={[styles.foodName, { color: colors.text }]} numberOfLines={1}>
              {log.food?.name || 'Unknown Food'}
            </Text>
            {log.food?.brand && (
              <Text style={[styles.brand, { color: colors.textSecondary }]} numberOfLines={1}>
                {truncateText(log.food.brand, 30)}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(log)} style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Servings */}
      <Text style={[styles.servings, { color: colors.textSecondary }]}>
        {formatServings(log.log.servings)} serving{log.log.servings !== 1 ? 's' : ''}
        {log.food?.servingSize && log.food?.servingUnit && log.log.servings &&
          ` (${formatServings((log.log.servings || 0) * (log.food.servingSize || 0))} ${log.food.servingUnit})`
        }
      </Text>

      {/* Macros */}
      <View style={styles.macros}>
        {selectedMacros.includes('calories') && (
          <View style={styles.macro}>
            <Text style={[styles.macroValue, { color: colors.calories }]}>
              {formatCalories(log.log.totalCalories)}
            </Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>cal</Text>
          </View>
        )}

        {selectedMacros.includes('protein') && (
          <View style={styles.macro}>
            <Text style={[styles.macroValue, { color: colors.protein }]}>
              {formatMacro(log.log.totalProtein)}g
            </Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>protein</Text>
          </View>
        )}

        {selectedMacros.includes('carbs') && (
          <View style={styles.macro}>
            <Text style={[styles.macroValue, { color: colors.carbs }]}>
              {formatMacro(log.log.totalCarbs)}g
            </Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>carbs</Text>
          </View>
        )}

        {selectedMacros.includes('fat') && (
          <View style={styles.macro}>
            <Text style={[styles.macroValue, { color: colors.fat }]}>
              {formatMacro(log.log.totalFat)}g
            </Text>
            <Text style={[styles.macroLabel, { color: colors.textTertiary }]}>fat</Text>
          </View>
        )}
      </View>

      {/* Notes */}
      {log.log.notes && (
        <Text style={[styles.notes, { color: colors.textSecondary }]}>
          Note: {log.log.notes}
        </Text>
      )}

      {/* Time */}
      <Text style={[styles.time, { color: colors.textTertiary }]}>
        {formatTime(log.log.createdAt)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  brand: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  servings: {
    fontSize: 13,
    marginBottom: 12,
  },
  macros: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  macro: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  macroLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  notes: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 8,
  },
  time: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'right',
  },
});
