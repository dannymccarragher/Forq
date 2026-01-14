import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { MacroProgressBar } from '@/components/MacroProgressBar';
import { FoodLogCard } from '@/components/FoodLogCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDateShort } from '@/utils/formatters';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const {
    selectedDate,
    setSelectedDate,
    dailySummary,
    loadingSummary,
    refreshSummary,
    refreshLogs,
    dailyGoals,
    foodLogs,
    deleteFoodLog,
    selectedMacros,
  } = useApp();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshSummary(), refreshLogs()]);
    setRefreshing(false);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const isToday = () => {
    const today = new Date();
    return (
      selectedDate.getDate() === today.getDate() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getFullYear() === today.getFullYear()
    );
  };

  const handleAddFood = () => {
    router.push('/add-food');
  };

  const handleDeleteLog = async (logId: number) => {
    await deleteFoodLog(logId);
  };

  if (loadingSummary && !dailySummary) {
    return <LoadingSpinner message="Loading your daily summary..." />;
  }

  const currentCalories = dailySummary?.totals.calories || 0;
  const currentProtein = dailySummary?.totals.protein || 0;
  const currentCarbs = dailySummary?.totals.carbs || 0;
  const currentFat = dailySummary?.totals.fat || 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>
            {isToday()
              ? `Today, ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : formatDateShort(selectedDate)
            }
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Track your nutrition journey
          </Text>
        </View>
      </View>

      {/* Date Navigation */}
      <View style={[styles.dateNav, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity onPress={goToToday} style={styles.dateCenter}>
          <Text style={[styles.dateText, { color: colors.text }]}>
            {formatDateShort(selectedDate)}
          </Text>
          {!isToday() && (
            <Text style={[styles.todayLink, { color: colors.primary }]}>Go to Today</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Macros Progress Bars */}
      {selectedMacros.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Progress</Text>
            <TouchableOpacity onPress={() => router.push('/select-macros')}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarsContainer}>
            {selectedMacros.includes('calories') && (
              <MacroProgressBar
                label="Energy"
                current={currentCalories}
                goal={dailyGoals.calories}
                unit="kcal"
                color={colors.calories}
              />
            )}
            {selectedMacros.includes('protein') && (
              <MacroProgressBar
                label="Protein"
                current={currentProtein}
                goal={dailyGoals.protein}
                unit="g"
                color={colors.protein}
              />
            )}
            {selectedMacros.includes('carbs') && (
              <MacroProgressBar
                label="Net Carbs"
                current={currentCarbs}
                goal={dailyGoals.carbs}
                unit="g"
                color={colors.carbs}
              />
            )}
            {selectedMacros.includes('fat') && (
              <MacroProgressBar
                label="Fat"
                current={currentFat}
                goal={dailyGoals.fat}
                unit="g"
                color={colors.fat}
              />
            )}
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={handleAddFood}
          >
            <Ionicons name="add-circle" size={32} color={colors.primary} />
            <Text style={[styles.actionText, { color: colors.text }]}>Add Foods</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/favorites')}
          >
            <Ionicons name="heart" size={32} color={colors.error} />
            <Text style={[styles.actionText, { color: colors.text }]}>Favorites</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Food Diary */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Food Diary</Text>

        {foodLogs.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No food logged yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Start tracking your meals
            </Text>
          </View>
        ) : (
          foodLogs.map((log) => (
            <FoodLogCard
              key={log.log.id}
              log={log}
              onDelete={handleDeleteLog}
            />
          ))
        )}
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  dateButton: {
    padding: 8,
  },
  dateCenter: {
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  todayLink: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  progressBarsContainer: {
    paddingTop: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  mealCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealType: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '700',
  },
  mealMacros: {
    flexDirection: 'row',
    gap: 16,
  },
  mealMacro: {
    fontSize: 13,
  },
  footer: {
    height: 40,
  },
});
