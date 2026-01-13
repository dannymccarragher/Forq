import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { dailyGoals, user, logoutUser } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logoutUser();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      {/* User Info Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="person" size={40} color="#FFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.username || `User #${user?.id}`}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email || 'No email'}
            </Text>
          </View>
        </View>
      </View>

      {/* Daily Goals Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Daily Goals</Text>
          <TouchableOpacity onPress={() => router.push('/goals')}>
            <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.goalRow}>
            <View style={styles.goalLabel}>
              <Ionicons name="flame" size={20} color={colors.calories} />
              <Text style={[styles.goalLabelText, { color: colors.text }]}>Calories</Text>
            </View>
            <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
              {dailyGoals.calories} kcal
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.goalRow}>
            <View style={styles.goalLabel}>
              <Ionicons name="nutrition" size={20} color={colors.protein} />
              <Text style={[styles.goalLabelText, { color: colors.text }]}>Protein</Text>
            </View>
            <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
              {dailyGoals.protein}g
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.goalRow}>
            <View style={styles.goalLabel}>
              <Ionicons name="pizza" size={20} color={colors.carbs} />
              <Text style={[styles.goalLabelText, { color: colors.text }]}>Carbs</Text>
            </View>
            <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
              {dailyGoals.carbs}g
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.goalRow}>
            <View style={styles.goalLabel}>
              <Ionicons name="water" size={20} color={colors.fat} />
              <Text style={[styles.goalLabelText, { color: colors.text }]}>Fat</Text>
            </View>
            <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
              {dailyGoals.fat}g
            </Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/goals')}>
            <View style={styles.settingLabel}>
              <Ionicons name="flag-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Daily Goals</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="moon-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Theme</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="language-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="document-text-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow} onPress={handleLogout}>
            <View style={styles.settingLabel}>
              <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
              <Text style={[styles.settingText, { color: '#FF3B30' }]}>Logout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Version</Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>1.0.0</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Build</Text>
            <Text style={[styles.aboutValue, { color: colors.text }]}>2026.01.08</Text>
          </View>
        </View>
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  goalLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  goalLabelText: {
    fontSize: 16,
  },
  goalValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    height: 40,
  },
});
