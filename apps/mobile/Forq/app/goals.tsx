import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

export default function GoalsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { dailyGoals, setDailyGoals, selectedMacros } = useApp();

  const [editing, setEditing] = useState(false);
  const [tempGoals, setTempGoals] = useState(dailyGoals);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDailyGoals(tempGoals);
      setEditing(false);
      Alert.alert('Success', 'Your daily goals have been updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setTempGoals(dailyGoals);
    setEditing(false);
  };

  const updateGoal = (key: 'calories' | 'protein' | 'carbs' | 'fat', value: string) => {
    const numValue = parseInt(value) || 0;
    setTempGoals({ ...tempGoals, [key]: numValue });
  };

  const calculateMacroPercentages = () => {
    const proteinCals = tempGoals.protein * 4;
    const carbsCals = tempGoals.carbs * 4;
    const fatCals = tempGoals.fat * 9;
    const totalCals = proteinCals + carbsCals + fatCals;

    return {
      protein: totalCals > 0 ? Math.round((proteinCals / totalCals) * 100) : 0,
      carbs: totalCals > 0 ? Math.round((carbsCals / totalCals) * 100) : 0,
      fat: totalCals > 0 ? Math.round((fatCals / totalCals) * 100) : 0,
    };
  };

  const percentages = calculateMacroPercentages();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Daily Goals</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight + '20', borderColor: colors.primaryLight }]}>
          <Ionicons name="information-circle" size={24} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Set your daily nutrition goals based on your personal needs and fitness objectives.
          </Text>
        </View>

        {/* Calories Goal */}
        {selectedMacros.includes('calories') && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Calorie Goal</Text>
            <View style={[styles.goalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.goalHeader}>
                <View style={styles.goalIcon}>
                  <Ionicons name="flame" size={32} color={colors.calories} />
                </View>
                <View style={styles.goalInfo}>
                  <Text style={[styles.goalLabel, { color: colors.textSecondary }]}>Calories</Text>
                  {editing ? (
                    <TextInput
                      style={[styles.goalInput, { color: colors.text, borderColor: colors.border }]}
                      value={tempGoals.calories.toString()}
                      onChangeText={(text) => updateGoal('calories', text)}
                      keyboardType="numeric"
                      placeholder="2000"
                      placeholderTextColor={colors.textTertiary}
                    />
                  ) : (
                    <Text style={[styles.goalValue, { color: colors.text }]}>
                      {dailyGoals.calories} kcal
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Macronutrients Goals */}
        {(selectedMacros.includes('protein') || selectedMacros.includes('carbs') || selectedMacros.includes('fat')) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Macronutrient Goals</Text>

            {/* Protein */}
            {selectedMacros.includes('protein') && (
              <View style={[styles.macroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.macroHeader}>
                  <View style={[styles.macroIconSmall, { backgroundColor: colors.protein + '20' }]}>
                    <Ionicons name="nutrition" size={24} color={colors.protein} />
                  </View>
                  <View style={styles.macroInfo}>
                    <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Protein</Text>
                    {editing ? (
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.macroInput, { color: colors.text, borderColor: colors.border }]}
                          value={tempGoals.protein.toString()}
                          onChangeText={(text) => updateGoal('protein', text)}
                          keyboardType="numeric"
                          placeholder="150"
                          placeholderTextColor={colors.textTertiary}
                        />
                        <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>g</Text>
                      </View>
                    ) : (
                      <Text style={[styles.macroValue, { color: colors.text }]}>
                        {dailyGoals.protein}g
                      </Text>
                    )}
                  </View>
                  <View style={styles.percentageContainer}>
                    <Text style={[styles.percentage, { color: colors.protein }]}>
                      {percentages.protein}%
                    </Text>
                    <Text style={[styles.percentageLabel, { color: colors.textTertiary }]}>of calories</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Carbs */}
            {selectedMacros.includes('carbs') && (
              <View style={[styles.macroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.macroHeader}>
                  <View style={[styles.macroIconSmall, { backgroundColor: colors.carbs + '20' }]}>
                    <Ionicons name="pizza" size={24} color={colors.carbs} />
                  </View>
                  <View style={styles.macroInfo}>
                    <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbohydrates</Text>
                    {editing ? (
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.macroInput, { color: colors.text, borderColor: colors.border }]}
                          value={tempGoals.carbs.toString()}
                          onChangeText={(text) => updateGoal('carbs', text)}
                          keyboardType="numeric"
                          placeholder="250"
                          placeholderTextColor={colors.textTertiary}
                        />
                        <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>g</Text>
                      </View>
                    ) : (
                      <Text style={[styles.macroValue, { color: colors.text }]}>
                        {dailyGoals.carbs}g
                      </Text>
                    )}
                  </View>
                  <View style={styles.percentageContainer}>
                    <Text style={[styles.percentage, { color: colors.carbs }]}>
                      {percentages.carbs}%
                    </Text>
                    <Text style={[styles.percentageLabel, { color: colors.textTertiary }]}>of calories</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Fat */}
            {selectedMacros.includes('fat') && (
              <View style={[styles.macroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.macroHeader}>
                  <View style={[styles.macroIconSmall, { backgroundColor: colors.fat + '20' }]}>
                    <Ionicons name="water" size={24} color={colors.fat} />
                  </View>
                  <View style={styles.macroInfo}>
                    <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Fat</Text>
                    {editing ? (
                      <View style={styles.inputRow}>
                        <TextInput
                          style={[styles.macroInput, { color: colors.text, borderColor: colors.border }]}
                          value={tempGoals.fat.toString()}
                          onChangeText={(text) => updateGoal('fat', text)}
                          keyboardType="numeric"
                          placeholder="65"
                          placeholderTextColor={colors.textTertiary}
                        />
                        <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>g</Text>
                      </View>
                    ) : (
                      <Text style={[styles.macroValue, { color: colors.text }]}>
                        {dailyGoals.fat}g
                      </Text>
                    )}
                  </View>
                  <View style={styles.percentageContainer}>
                    <Text style={[styles.percentage, { color: colors.fat }]}>
                      {percentages.fat}%
                    </Text>
                    <Text style={[styles.percentageLabel, { color: colors.textTertiary }]}>of calories</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tips</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                1 gram of protein = 4 calories
              </Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                1 gram of carbohydrates = 4 calories
              </Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                1 gram of fat = 9 calories
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {editing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={handleCancel}
              disabled={saving}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Goals</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => setEditing(true)}
          >
            <Ionicons name="create" size={20} color="#FFF" />
            <Text style={styles.editButtonText}>Edit Goals</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  goalIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  goalValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  goalInput: {
    fontSize: 28,
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
  macroCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  macroIconSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroInfo: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroInput: {
    fontSize: 20,
    fontWeight: '700',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    minWidth: 80,
  },
  inputUnit: {
    fontSize: 16,
  },
  percentageContainer: {
    alignItems: 'flex-end',
  },
  percentage: {
    fontSize: 20,
    fontWeight: '700',
  },
  percentageLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  tipCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    height: 100,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
