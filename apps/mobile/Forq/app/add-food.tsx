import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { FoodSearchCard } from '@/components/FoodSearchCard';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import * as api from '@/services/api';
import { FatSecretFood, Food } from '@/types/api';

type TabType = 'search' | 'favorites' | 'barcode';

export default function AddFoodScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams();

  const { favorites, refreshFavorites } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FatSecretFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [barcodeScanned, setBarcodeScanned] = useState(false);

  useEffect(() => {
    refreshFavorites();

    // Check if we should open the barcode scanner
    if (params.tab === 'barcode') {
      setActiveTab('barcode');
    }
  }, [params.tab]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const response = await api.searchFoods(searchQuery);
      const foods = response.foods?.food || [];
      setSearchResults(Array.isArray(foods) ? foods : [foods]);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFoodPress = (food: FatSecretFood | Food) => {
    if ('food_id' in food) {
      // FatSecret food
      router.push(`/food-detail?foodId=${food.food_id}&source=fatsecret&mealType=${params.mealType || 'breakfast'}`);
    } else {
      // Database food
      router.push(`/food-detail?foodId=${food.id}&source=database&mealType=${params.mealType || 'breakfast'}`);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    if (barcodeScanned) return; // Prevent multiple scans

    setBarcodeScanned(true);
    try {
      const result = await api.scanBarcode(barcode);

      if (result && result.food_id) {
        // Navigate to food detail with the scanned food
        router.push(`/food-detail?foodId=${result.food_id}&source=fatsecret&mealType=${params.mealType || 'breakfast'}`);
      } else {
        Alert.alert(
          'Not Found',
          'No food found for this barcode. Try searching manually.',
          [{
            text: 'OK',
            onPress: () => {
              setBarcodeScanned(false);
              setActiveTab('search');
            }
          }]
        );
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      Alert.alert(
        'Scan Failed',
        'Unable to find food for this barcode. Please try again or search manually.',
        [{
          text: 'OK',
          onPress: () => {
            setBarcodeScanned(false);
            setActiveTab('search');
          }
        }]
      );
    }
  };

  const handleOpenScanner = () => {
    setBarcodeScanned(false); // Reset when opening scanner
    setActiveTab('barcode');
  };

  const handleCloseScanner = () => {
    setBarcodeScanned(false); // Reset when closing scanner
    setActiveTab('search');
  };

  const renderSearchTab = () => (
    <View style={styles.tabContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search for foods..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={handleSearch}
          disabled={loading || !searchQuery.trim()}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Ionicons name="search" size={20} color="#FFF" />
          )}
        </TouchableOpacity>
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>Searching...</Text>
        </View>
      ) : hasSearched && searchResults.length === 0 ? (
        <View style={styles.centerContent}>
          <Ionicons name="search-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            No results found
          </Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={({ item }) => (
            <FoodSearchCard food={item} onPress={() => handleFoodPress(item)} />
          )}
          keyExtractor={(item) => item.food_id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.centerContent}>
          <Ionicons name="restaurant-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            Search for foods to add
          </Text>
        </View>
      )}
    </View>
  );

  const renderFavoritesTab = () => (
    <View style={styles.tabContent}>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          renderItem={({ item }) => (
            <FoodSearchCard food={item} onPress={() => handleFoodPress(item)} />
          )}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.centerContent}>
          <Ionicons name="heart-outline" size={64} color={colors.textTertiary} />
          <Text style={[styles.centerText, { color: colors.textSecondary }]}>
            No favorite foods yet
          </Text>
          <Text style={[styles.centerSubtext, { color: colors.textTertiary }]}>
            Add foods to your favorites for quick access
          </Text>
        </View>
      )}
    </View>
  );

  const renderBarcodeTab = () => {
    return (
      <BarcodeScanner
        onScan={handleBarcodeScan}
        onClose={handleCloseScanner}
        isProcessing={barcodeScanned}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Add Food</Text>
        <TouchableOpacity onPress={handleOpenScanner} style={styles.createButton}>
          <Ionicons name="barcode-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'search' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('search')}
        >
          <Ionicons
            name="search"
            size={20}
            color={activeTab === 'search' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'search' ? colors.primary : colors.textSecondary },
            ]}
          >
            Search
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'favorites' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('favorites')}
        >
          <Ionicons
            name="heart"
            size={20}
            color={activeTab === 'favorites' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'favorites' ? colors.primary : colors.textSecondary },
            ]}
          >
            Favorites
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'barcode' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('barcode')}
        >
          <Ionicons
            name="barcode"
            size={20}
            color={activeTab === 'barcode' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'barcode' ? colors.primary : colors.textSecondary },
            ]}
          >
            Scan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'search' && renderSearchTab()}
      {activeTab === 'favorites' && renderFavoritesTab()}
      {activeTab === 'barcode' && renderBarcodeTab()}
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
  createButton: {
    padding: 8,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  centerText: {
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
  centerSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
