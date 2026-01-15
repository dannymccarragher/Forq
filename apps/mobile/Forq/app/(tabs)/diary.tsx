import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { FoodLogCard } from '@/components/FoodLogCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
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

  // Group food logs by meal type
  const mealTypes: Array<'breakfast' | 'lunch' | 'dinner' | 'snack'> = ['breakfast', 'lunch', 'dinner', 'snack'];
  const groupedLogs = mealTypes.reduce((acc, mealType) => {
    acc[mealType] = foodLogs.filter(log => log.log.mealType === mealType);
    return acc;
  }, {} as Record<string, typeof foodLogs>);

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'sunny';
      case 'lunch':
        return 'restaurant';
      case 'dinner':
        return 'moon';
      case 'snack':
        return 'cafe';
      default:
        return 'nutrition';
    }
  };

  const getMealLabel = (mealType: string) => {
    return mealType.charAt(0).toUpperCase() + mealType.slice(1);
  };

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

      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total Calories</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {dailySummary?.totals.calories || 0}
            </Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Entries</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {dailySummary?.totals.entries || 0}
            </Text>
          </View>
        </View>
      </View>

      {/* Meals by Type */}
      {foodLogs.length === 0 ? (
        <View style={styles.section}>
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
        </View>
      ) : (
        mealTypes.map((mealType) => {
          const logs = groupedLogs[mealType];
          if (logs.length === 0) return null;

          return (
            <View key={mealType} style={styles.section}>
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <Ionicons name={getMealIcon(mealType)} size={24} color={colors.text} />
                  <Text style={[styles.mealTitle, { color: colors.text }]}>
                    {getMealLabel(mealType)}
                  </Text>
                </View>
                <Text style={[styles.mealCount, { color: colors.textSecondary }]}>
                  {logs.length} {logs.length === 1 ? 'item' : 'items'}
                </Text>
              </View>
              {logs.map((log) => (
                <FoodLogCard
                  key={log.log.id}
                  log={log}
                  onDelete={handleDeleteLog}
                  selectedMacros={selectedMacros}
                />
              ))}
            </View>
          );
        })
      )}

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
  summaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  mealCount: {
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
