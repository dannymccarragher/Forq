import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { Food, FatSecretFood } from '@/types/api';
import { truncateText } from '@/utils/formatters';

interface FoodSearchCardProps {
  food: FatSecretFood | Food;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

export const FoodSearchCard: React.FC<FoodSearchCardProps> = ({
  food,
  onPress,
  isFavorite,
  onToggleFavorite,
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Check if it's a FatSecretFood or regular Food
  const isFatSecretFood = 'food_name' in food;
  const name = isFatSecretFood ? food.food_name : food.name;
  const brand = isFatSecretFood ? food.brand_name : food.brand;
  const description = isFatSecretFood ? food.food_description : food.description;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
            {name}
          </Text>
          
          {brand && (
            <Text style={[styles.brand, { color: colors.textSecondary }]} numberOfLines={1}>
              {truncateText(brand, 40)}
            </Text>
          )}
          
          {description && (
            <Text style={[styles.description, { color: colors.textTertiary }]} numberOfLines={2}>
              {truncateText(description, 80)}
            </Text>
          )}
        </View>

        <View style={styles.actions}>
          {onToggleFavorite && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onToggleFavorite();
              }}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite ? colors.error : colors.textSecondary}
              />
            </TouchableOpacity>
          )}
          
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  brand: {
    fontSize: 13,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoriteButton: {
    padding: 4,
  },
});
