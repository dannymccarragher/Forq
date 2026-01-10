import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { CalorieRing } from '@/components/CalorieRing';
import { MacroCard } from '@/components/MacroCard';
import { MealSection } from '@/components/MealSection';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { formatDateShort } from '@/utils/formatters';
import { MealType } from '@/types/api';

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

  const handleAddFood = (mealType: MealType) => {
    router.push(`/add-food?mealType=${mealType}`);
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

  // Group logs by meal type
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
  const logsByMeal: { [key in MealType]: typeof foodLogs } = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  };

  foodLogs.forEach((log) => {
    const mealType = log.log.mealType as MealType;
    if (logsByMeal[mealType]) {
      logsByMeal[mealType].push(log);
    }
  });

  // Calculate calories per meal
  const caloriesByMeal: { [key in MealType]: number } = {
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    snack: 0,
  };

  if (dailySummary) {
    dailySummary.byMealType.forEach((meal) => {
      caloriesByMeal[meal.mealType as MealType] = meal.calories;
    });
  }

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
            {isToday() ? 'Today' : formatDateShort(selectedDate)}
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

      {/* Calorie Ring */}
      <View style={styles.ringContainer}>
        <CalorieRing current={currentCalories} goal={dailyGoals.calories} size={220} />
      </View>

      {/* Macros */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Macronutrients</Text>
        <View style={styles.macroGrid}>
          <MacroCard
            label="Protein"
            current={currentProtein}
            goal={dailyGoals.protein}
            unit="g"
            color={colors.protein}
          />
          <MacroCard
            label="Carbs"
            current={currentCarbs}
            goal={dailyGoals.carbs}
            unit="g"
            color={colors.carbs}
          />
        </View>
        <View style={styles.macroGrid}>
          <MacroCard
            label="Fat"
            current={currentFat}
            goal={dailyGoals.fat}
            unit="g"
            color={colors.fat}
          />
          <MacroCard
            label="Calories"
            current={currentCalories}
            goal={dailyGoals.calories}
            unit="kcal"
            color={colors.calories}
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={32} color={colors.info} />
            <Text style={[styles.actionText, { color: colors.text }]}>Search Foods</Text>
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

      {/* Food Diary - Meal Sections */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Food Diary</Text>
        {mealTypes.map((mealType) => (
          <MealSection
            key={mealType}
            mealType={mealType}
            logs={logsByMeal[mealType]}
            totalCalories={caloriesByMeal[mealType]}
            onAddFood={() => handleAddFood(mealType)}
            onDeleteLog={handleDeleteLog}
          />
        ))}
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
  ringContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
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
