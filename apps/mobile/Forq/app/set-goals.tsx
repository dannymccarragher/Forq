import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { requestNotificationPermissions, scheduleDailyNotifications } from '@/services/notificationService';

type MacroType = 'protein' | 'carbs' | 'fat' | 'calories' | 'fiber' | 'water';

interface MacroGoalInput {
  id: MacroType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  unit: string;
  defaultValue: number;
  color: string;
}

export default function SetGoalsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { selectedMacros, dailyGoals, setDailyGoals } = useApp();

  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState({
    calories: dailyGoals.calories.toString(),
    protein: dailyGoals.protein.toString(),
    carbs: dailyGoals.carbs.toString(),
    fat: dailyGoals.fat.toString(),
    fiber: dailyGoals.fiber.toString(),
    water: dailyGoals.water.toString(),
  });

  // Update goals when dailyGoals changes
  useEffect(() => {
    setGoals({
      calories: dailyGoals.calories.toString(),
      protein: dailyGoals.protein.toString(),
      carbs: dailyGoals.carbs.toString(),
      fat: dailyGoals.fat.toString(),
      fiber: dailyGoals.fiber.toString(),
      water: dailyGoals.water.toString(),
    });
  }, [dailyGoals]);

  const macroGoalInputs: MacroGoalInput[] = [
    {
      id: 'calories',
      label: 'Calories',
      icon: 'flame',
      unit: 'kcal',
      defaultValue: 2000,
      color: colors.calories,
    },
    {
      id: 'protein',
      label: 'Protein',
      icon: 'nutrition',
      unit: 'g',
      defaultValue: 150,
      color: colors.protein,
    },
    {
      id: 'carbs',
      label: 'Carbohydrates',
      icon: 'pizza',
      unit: 'g',
      defaultValue: 250,
      color: colors.carbs,
    },
    {
      id: 'fat',
      label: 'Fat',
      icon: 'restaurant',
      unit: 'g',
      defaultValue: 65,
      color: colors.fat,
    },
    {
      id: 'fiber',
      label: 'Fiber',
      icon: 'leaf',
      unit: 'g',
      defaultValue: 30,
      color: colors.fiber,
    },
    {
      id: 'water',
      label: 'Water',
      icon: 'water',
      unit: 'ml',
      defaultValue: 2000,
      color: colors.water,
    },
  ];

  // Filter to only show selected macros
  const visibleGoals = macroGoalInputs.filter((macro) =>
    selectedMacros.includes(macro.id)
  );

  const setupNotifications = async () => {
    try {
      const granted = await requestNotificationPermissions();

      if (granted) {
        // Schedule all daily notifications
        await scheduleDailyNotifications();
        console.log('Notifications scheduled successfully');
      } else {
        Alert.alert(
          'Notifications Disabled',
          'You can enable notifications later in your device settings to receive meal reminders and progress updates.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const goalsToSave = {
        calories: parseInt(goals.calories) || 2000,
        protein: parseInt(goals.protein) || 150,
        carbs: parseInt(goals.carbs) || 250,
        fat: parseInt(goals.fat) || 65,
        fiber: parseInt(goals.fiber) || 30,
        water: parseInt(goals.water) || 2000,
      };

      await setDailyGoals(goalsToSave);

      // Request notification permissions and schedule notifications
      await setupNotifications();

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to save goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = (macro: MacroType, value: string) => {
    setGoals((prev) => ({ ...prev, [macro]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Set Your Goals</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Set daily targets for the macros you've selected to track
          </Text>
        </View>

        {/* Goal Inputs */}
        <View style={styles.goalsContainer}>
          {visibleGoals.map((macro) => (
            <View
              key={macro.id}
              style={[
                styles.goalCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.goalHeader}>
                <View style={[styles.iconContainer, { backgroundColor: `${macro.color}20` }]}>
                  <Ionicons name={macro.icon} size={24} color={macro.color} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalLabel, { color: colors.text }]}>
                    {macro.label}
                  </Text>
                  <Text style={[styles.goalHint, { color: colors.textSecondary }]}>
                    Daily target
                  </Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  value={goals[macro.id]}
                  onChangeText={(value) => updateGoal(macro.id, value)}
                  keyboardType="numeric"
                  placeholder={macro.defaultValue.toString()}
                  placeholderTextColor={colors.textTertiary}
                />
                <Text style={[styles.unit, { color: colors.textSecondary }]}>
                  {macro.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Info Box */}
        <View
          style={[
            styles.infoBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You can adjust these goals anytime in your profile settings
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>Get Started</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  goalsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalHint: {
    fontSize: 13,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    textAlign: 'center',
  },
  unit: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 40,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
