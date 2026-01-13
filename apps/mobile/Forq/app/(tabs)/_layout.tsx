import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors as AppColors } from '@/constants/colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = AppColors[colorScheme];
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          position: 'absolute',
          elevation: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <TouchableOpacity
              style={[styles.plusButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/modal')}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </TouchableOpacity>
          ),
          tabBarButton: (props) => (
            <View style={styles.plusButtonContainer}>
              <TouchableOpacity
                style={[styles.plusButton, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/modal')}
              >
                <Ionicons name="add" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  plusButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  plusButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
