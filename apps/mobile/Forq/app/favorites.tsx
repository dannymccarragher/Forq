import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { FoodSearchCard } from '@/components/FoodSearchCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function FavoritesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  
  const { favorites, loadingFavorites, refreshFavorites, toggleFavorite, isFavorite } = useApp();

  useEffect(() => {
    refreshFavorites();
  }, []);

  const handleFoodPress = (foodId: number) => {
    router.push(`/food-detail?foodId=${foodId}&source=database`);
  };

  const handleToggleFavorite = async (foodId: number) => {
    const food = favorites.find((f) => f.id === foodId);
    if (food) {
      await toggleFavorite(food);
      await refreshFavorites();
    }
  };

  if (loadingFavorites) {
    return <LoadingSpinner message="Loading your favorites..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <FoodSearchCard
              food={item}
              onPress={() => handleFoodPress(item.id)}
              isFavorite={isFavorite(item.id)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No favorite foods yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Foods you favorite will appear here for quick access
          </Text>
        </View>
      )}
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
  list: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
