import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

type MacroType = 'protein' | 'carbs' | 'fat' | 'calories';

interface MacroOption {
  id: MacroType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  color: string;
}

export default function SelectMacrosScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { selectedMacros, setSelectedMacros, hasSelectedMacros } = useApp();

  const [selected, setSelected] = useState<Set<MacroType>>(
    new Set(selectedMacros || ['protein', 'carbs', 'fat', 'calories'])
  );

  const macroOptions: MacroOption[] = [
    {
      id: 'protein',
      label: 'Protein',
      icon: 'nutrition',
      description: 'Track your daily protein intake',
      color: colors.protein,
    },
    {
      id: 'carbs',
      label: 'Carbohydrates',
      icon: 'pizza',
      description: 'Monitor your carb consumption',
      color: colors.carbs,
    },
    {
      id: 'fat',
      label: 'Fat',
      icon: 'water',
      description: 'Keep track of your fat intake',
      color: colors.fat,
    },
    {
      id: 'calories',
      label: 'Calories',
      icon: 'flame',
      description: 'Monitor your calorie consumption',
      color: colors.calories,
    },
  ];

  const toggleMacro = (macroId: MacroType) => {
    const newSelected = new Set(selected);
    if (newSelected.has(macroId)) {
      if (newSelected.size === 1) {
        Alert.alert('Minimum Required', 'Please select at least one macro to track');
        return;
      }
      newSelected.delete(macroId);
    } else {
      newSelected.add(macroId);
    }
    setSelected(newSelected);
  };

  const handleSave = async () => {
    await setSelectedMacros(Array.from(selected));
    if (hasSelectedMacros) {
      // User is editing, go back
      router.back();
    } else {
      // First time, go to set goals for selected macros
      router.replace('/set-goals');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          {hasSelectedMacros && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: colors.text }]}>
            {hasSelectedMacros ? 'Edit Your Macros' : 'Choose Your Macros'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {hasSelectedMacros 
              ? 'Select which macronutrients you want to track on your dashboard'
              : 'Select which macronutrients you want to track. You can change this anytime in settings.'
            }
          </Text>
        </View>

        {/* Macro Options */}
        <View style={styles.options}>
          {macroOptions.map((macro) => {
            const isSelected = selected.has(macro.id);
            return (
              <TouchableOpacity
                key={macro.id}
                style={[
                  styles.macroCard,
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: isSelected ? macro.color : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                  },
                ]}
                onPress={() => toggleMacro(macro.id)}
                activeOpacity={0.7}
              >
                <View style={styles.macroHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: `${macro.color}20` }]}>
                    <Ionicons name={macro.icon} size={28} color={macro.color} />
                  </View>
                  {isSelected && (
                    <View style={[styles.checkmark, { backgroundColor: macro.color }]}>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </View>
                  )}
                </View>
                <Text style={[styles.macroLabel, { color: colors.text }]}>{macro.label}</Text>
                <Text style={[styles.macroDescription, { color: colors.textSecondary }]}>
                  {macro.description}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="information-circle" size={20} color={colors.info} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            You can change these preferences anytime in your profile settings
          </Text>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Text style={[styles.selectedText, { color: colors.textSecondary }]}>
          {selected.size} macro{selected.size !== 1 ? 's' : ''} selected
        </Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    position: 'relative',
  },
  backButton: {
    marginBottom: 16,
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
  options: {
    gap: 16,
    marginBottom: 24,
  },
  macroCard: {
    padding: 20,
    borderRadius: 16,
    position: 'relative',
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  macroLabel: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  macroDescription: {
    fontSize: 14,
    lineHeight: 20,
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
  selectedText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
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
