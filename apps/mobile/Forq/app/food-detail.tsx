import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import * as api from '@/services/api';
import { FatSecretFoodDetail, FatSecretServing, MealType } from '@/types/api';
import { formatCalories, formatMacro, formatServing } from '@/utils/formatters';

export default function FoodDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams();

  const { userId, logFood, selectedDate } = useApp();

  type ServingOption = {
    id: string;
    serving: FatSecretServing;
    label: string;
    isMetricOnly: boolean;
  };

  const [foodDetail, setFoodDetail] = useState<FatSecretFoodDetail | null>(null);
  const [selectedServing, setSelectedServing] = useState<FatSecretServing | null>(null);
  const [selectedOption, setSelectedOption] = useState<ServingOption | null>(null);
  const [availableServings, setAvailableServings] = useState<FatSecretServing[]>([]);
  const [amount, setAmount] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>('breakfast');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showServingPicker, setShowServingPicker] = useState(false);

  // Build serving options - include standard servings + standalone metric units
  const buildServingOptions = (servings: FatSecretServing[]): ServingOption[] => {
    const options: ServingOption[] = [];
    const addedMetricUnits = new Set<string>();

    servings.forEach((serving) => {
      // Add standard serving with metric info
      if (serving.metric_serving_amount && serving.metric_serving_unit) {
        const metricAmount = Math.round(parseFloat(serving.metric_serving_amount));
        options.push({
          id: serving.serving_id,
          serving: serving,
          label: `${metricAmount}${serving.metric_serving_unit} (${serving.serving_description})`,
          isMetricOnly: false
        });

        // Add standalone metric unit (g, ml) if not already added
        if (!addedMetricUnits.has(serving.metric_serving_unit)) {
          options.push({
            id: `metric_${serving.metric_serving_unit}`,
            serving: serving,
            label: serving.metric_serving_unit,
            isMetricOnly: true
          });
          addedMetricUnits.add(serving.metric_serving_unit);
        }
      } else {
        // No metric info, just add the serving
        options.push({
          id: serving.serving_id,
          serving: serving,
          label: serving.serving_description,
          isMetricOnly: false
        });
      }
    });

    return options;
  };

  useEffect(() => {
    loadFoodDetail();
    if (params.mealType) {
      setSelectedMeal(params.mealType as MealType);
    }
  }, []);

  const loadFoodDetail = async () => {
    if (!params.foodId) return;

    setLoading(true);
    try {
      const detail = await api.getFoodById(params.foodId as string);

      // Validate that we have the required data structure
      if (!detail) {
        throw new Error('No food detail data received');
      }

      if (!detail.servings || !detail.servings.serving) {
        console.error('Invalid food detail structure:', detail);
        throw new Error('Food detail is missing serving information. This food may not be available for detailed tracking.');
      }

      setFoodDetail(detail);

      // Get all available servings
      const servingsData = detail.servings.serving;
      const servingsArray = Array.isArray(servingsData) ? servingsData : [servingsData];
      setAvailableServings(servingsArray);

      // Build serving options and select first by default
      const options = buildServingOptions(servingsArray);
      setSelectedServing(servingsArray[0]);
      setSelectedOption(options[0]);
      setAmount(options[0].isMetricOnly ? '100' : '1');
    } catch (error) {
      console.error('Failed to load food detail:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Failed to load food details. Please try another food item.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndLog = async () => {
    if (!foodDetail || !selectedServing) return;

    setSaving(true);
    try {
      // First, save the food to the database
      const saveResponse = await api.saveFoodFromApi(userId, foodDetail);

      // Calculate the correct multiplier to use as servings
      const servingsToLog = getMultiplier();

      // Then log it
      await logFood(
        saveResponse.food.id,
        selectedMeal,
        servingsToLog,
        notes || undefined
      );

      Alert.alert('Success', 'Food logged successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Failed to save and log food:', error);
      Alert.alert('Error', 'Failed to log food');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Food Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!foodDetail || !selectedServing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Food Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: colors.error }]}>Failed to load food details</Text>
        </View>
      </View>
    );
  }

  const servingOptions = buildServingOptions(availableServings);

  // Calculate multiplier based on selected option
  const getMultiplier = () => {
    if (!selectedOption) return 1;

    const inputAmount = parseFloat(amount) || 1;

    if (selectedOption.isMetricOnly && selectedServing.metric_serving_amount) {
      // User selected standalone metric unit (e.g., just "g")
      // Need to find a base serving to calculate from
      const baseMetricAmount = parseFloat(selectedServing.metric_serving_amount);
      return inputAmount / baseMetricAmount;
    } else {
      // Standard serving
      return inputAmount;
    }
  };

  const multiplier = getMultiplier();
  const calories = Math.round(parseFloat(selectedServing.calories || '0') * multiplier);
  const protein = Math.round(parseFloat(selectedServing.protein || '0') * multiplier);
  const carbs = Math.round(parseFloat(selectedServing.carbohydrate || '0') * multiplier);
  const fat = Math.round(parseFloat(selectedServing.fat || '0') * multiplier);

  // Get increment value based on selected option
  const getIncrement = () => {
    if (!selectedOption) return 1;
    return selectedOption.isMetricOnly ? 10 : 1;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Food Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Food Info */}
        <View style={styles.section}>
          <Text style={[styles.foodName, { color: colors.text }]}>
            {foodDetail.food_name}
          </Text>
          {foodDetail.brand_name && (
            <Text style={[styles.brandName, { color: colors.textSecondary }]}>
              {foodDetail.brand_name}
            </Text>
          )}
        </View>

        {/* Serving Size Selector */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Serving Size</Text>
          <TouchableOpacity
            style={[styles.servingSizeButton, { borderColor: colors.border }]}
            onPress={() => setShowServingPicker(!showServingPicker)}
          >
            <Text style={[styles.servingSizeText, { color: colors.text }]}>
              {selectedOption?.label || 'Select serving'}
            </Text>
            <Ionicons
              name={showServingPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {showServingPicker && (
            <View style={[styles.servingPickerContainer, { borderColor: colors.border }]}>
              {servingOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.servingOption,
                    selectedOption?.id === option.id &&
                    { backgroundColor: colors.primaryLight || colors.primary + '20' }
                  ]}
                  onPress={() => {
                    setSelectedServing(option.serving);
                    setSelectedOption(option);
                    setShowServingPicker(false);
                    // Set appropriate default amount
                    setAmount(option.isMetricOnly ? '100' : '1');
                  }}
                >
                  <Text style={[styles.servingOptionText, { color: colors.text }]}>
                    {option.label}
                  </Text>
                  {selectedOption?.id === option.id && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Amount Input */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Amount</Text>
          <View style={styles.servingRow}>
            <TouchableOpacity
              style={[styles.servingButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                const increment = getIncrement();
                setAmount((prev) => Math.max(increment, parseFloat(prev) - increment).toString());
              }}
            >
              <Ionicons name="remove" size={20} color="#FFF" />
            </TouchableOpacity>

            <TextInput
              style={[styles.servingInput, { color: colors.text, borderColor: colors.border }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={[styles.servingButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                const increment = getIncrement();
                setAmount((prev) => (parseFloat(prev) + increment).toString());
              }}
            >
              <Ionicons name="add" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nutrition Info */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Nutrition Facts</Text>

          <View style={styles.nutritionRow}>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Calories</Text>
            <Text style={[styles.nutritionValue, { color: colors.calories }]}>
              {calories} kcal
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.nutritionRow}>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Protein</Text>
            <Text style={[styles.nutritionValue, { color: colors.protein }]}>
              {protein}g
            </Text>
          </View>

          <View style={styles.nutritionRow}>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Carbohydrates</Text>
            <Text style={[styles.nutritionValue, { color: colors.carbs }]}>
              {carbs}g
            </Text>
          </View>

          <View style={styles.nutritionRow}>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Fat</Text>
            <Text style={[styles.nutritionValue, { color: colors.fat }]}>
              {fat}g
            </Text>
          </View>
        </View>

        {/* Meal Selection */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Meal</Text>
          <View style={styles.mealGrid}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.mealButton,
                  {
                    backgroundColor: selectedMeal === meal ? colors.primary : colors.backgroundSecondary,
                    borderColor: selectedMeal === meal ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setSelectedMeal(meal)}
              >
                <Text
                  style={[
                    styles.mealButtonText,
                    { color: selectedMeal === meal ? '#FFF' : colors.text },
                  ]}
                >
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notes */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Notes (Optional)</Text>
          <TextInput
            style={[styles.notesInput, { color: colors.text, borderColor: colors.border }]}
            placeholder="Add any notes..."
            placeholderTextColor={colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.footer} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.logButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveAndLog}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.logButtonText}>Log Food</Text>
          )}
        </TouchableOpacity>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  section: {
    padding: 20,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 16,
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  servingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  servingButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servingInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  servingDescription: {
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
  servingSizeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
  },
  servingSizeText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  servingPickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  servingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E5',
  },
  servingOptionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  nutritionLabel: {
    fontSize: 14,
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mealButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  mealButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notesInput: {
    fontSize: 14,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    height: 100,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  logButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
