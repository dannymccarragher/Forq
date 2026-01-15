import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { FoodLogCard } from '@/components/FoodLogCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MacroProgressBar } from '@/components/MacroProgressBar';
import { formatDateShort } from '@/utils/formatters';

export default function DiaryScreen() {
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
    foodLogs,
    deleteFoodLog,
    selectedMacros,
    dailyGoals,
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
    return <LoadingSpinner message="Loading your food diary..." />;
  }

  const currentCalories = dailySummary?.totals.calories || 0;
  const currentProtein = dailySummary?.totals.protein || 0;
  const currentCarbs = dailySummary?.totals.carbs || 0;
  const currentFat = dailySummary?.totals.fat || 0;
  const currentFiber = dailySummary?.totals.fiber || 0;
  const currentWater = dailySummary?.totals.water || 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Food Diary</Text>
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

      {/* Macro Progress Bars */}
      {selectedMacros.length > 0 && (
        <View style={styles.macrosSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Progress</Text>
            <TouchableOpacity onPress={() => router.push('/select-macros')}>
              <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressBarsContainer}>
            {selectedMacros.includes('calories') && (
              <MacroProgressBar
                label="Calories"
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
            {selectedMacros.includes('fiber') && (
              <MacroProgressBar
                label="Fiber"
                current={currentFiber}
                goal={dailyGoals.fiber}
                unit="g"
                color={colors.fiber}
              />
            )}
            {selectedMacros.includes('water') && (
              <MacroProgressBar
                label="Water"
                current={currentWater}
                goal={dailyGoals.water}
                unit="ml"
                color={colors.water}
              />
            )}
          </View>
        </View>
      )}

      {/* All Food Entries */}
      <View style={styles.section}>
        {foodLogs.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="restaurant-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No food logged yet
            </Text>
            <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
              Start tracking your meals
            </Text>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={handleAddFood}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addButtonText}>Add Food</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: colors.text }]}>
                All Food Entries
              </Text>
              <Text style={[styles.listCount, { color: colors.textSecondary }]}>
                {foodLogs.length} {foodLogs.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            {foodLogs.map((log) => (
              <FoodLogCard
                key={log.log.id}
                log={log}
                onDelete={handleDeleteLog}
                selectedMacros={selectedMacros}
              />
            ))}
          </>
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
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
  macrosSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
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
  progressBarsContainer: {
    paddingTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  listCount: {
    fontSize: 14,
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    height: 100,
  },
});
