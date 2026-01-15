import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Switch, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/colors';
import { useApp } from '@/context/AppContext';
import { Appearance } from 'react-native';

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const { dailyGoals, user, logoutUser, selectedMacros } = useApp();
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Notification settings state
  const [notifications, setNotifications] = useState({
    dailyReminders: true,
    mealReminders: true,
    goalAchievements: true,
    weeklyProgress: false,
    motivational: true,
  });

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

  const handleOpenPrivacyPolicy = async () => {
    const url = 'https://dannymccarragher.github.io/';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the privacy policy URL');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while opening the privacy policy');
    }
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
          {selectedMacros.includes('calories') && (
            <>
              <View style={styles.goalRow}>
                <View style={styles.goalLabel}>
                  <Ionicons name="flame" size={20} color={colors.calories} />
                  <Text style={[styles.goalLabelText, { color: colors.text }]}>Calories</Text>
                </View>
                <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
                  {dailyGoals.calories} kcal
                </Text>
              </View>
              {(selectedMacros.includes('protein') || selectedMacros.includes('carbs') || selectedMacros.includes('fat')) && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            </>
          )}

          {selectedMacros.includes('protein') && (
            <>
              <View style={styles.goalRow}>
                <View style={styles.goalLabel}>
                  <Ionicons name="nutrition" size={20} color={colors.protein} />
                  <Text style={[styles.goalLabelText, { color: colors.text }]}>Protein</Text>
                </View>
                <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
                  {dailyGoals.protein}g
                </Text>
              </View>
              {(selectedMacros.includes('carbs') || selectedMacros.includes('fat')) && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            </>
          )}

          {selectedMacros.includes('carbs') && (
            <>
              <View style={styles.goalRow}>
                <View style={styles.goalLabel}>
                  <Ionicons name="pizza" size={20} color={colors.carbs} />
                  <Text style={[styles.goalLabelText, { color: colors.text }]}>Carbs</Text>
                </View>
                <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
                  {dailyGoals.carbs}g
                </Text>
              </View>
              {selectedMacros.includes('fat') && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            </>
          )}

          {selectedMacros.includes('fat') && (
            <View style={styles.goalRow}>
              <View style={styles.goalLabel}>
                <Ionicons name="water" size={20} color={colors.fat} />
                <Text style={[styles.goalLabelText, { color: colors.text }]}>Fat</Text>
              </View>
              <Text style={[styles.goalValue, { color: colors.textSecondary }]}>
                {dailyGoals.fat}g
              </Text>
            </View>
          )}
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

          <TouchableOpacity style={styles.settingRow} onPress={() => router.push('/select-macros')}>
            <View style={styles.settingLabel}>
              <Ionicons name="nutrition-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Tracked Macros</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {selectedMacros.length} selected
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowNotificationsModal(true)}>
            <View style={styles.settingLabel}>
              <Ionicons name="notifications-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow} onPress={() => setShowThemeModal(true)}>
            <View style={styles.settingLabel}>
              <Ionicons name="moon-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Theme</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
                {colorScheme === 'dark' ? 'Dark' : 'Light'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Ionicons name="language-outline" size={24} color={colors.text} />
              <Text style={[styles.settingText, { color: colors.text }]}>Language</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </TouchableOpacity> */}

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <TouchableOpacity style={styles.settingRow} onPress={handleOpenPrivacyPolicy}>
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

      {/* Theme Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Theme</Text>
              <TouchableOpacity onPress={() => setShowThemeModal(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: colors.border },
                colorScheme === 'light' && { backgroundColor: colors.primaryLight || colors.primary + '20' }
              ]}
              onPress={() => {
                Appearance.setColorScheme('light');
                setShowThemeModal(false);
              }}
            >
              <Ionicons name="sunny" size={24} color={colors.text} />
              <Text style={[styles.themeOptionText, { color: colors.text }]}>Light</Text>
              {colorScheme === 'light' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: colors.border },
                colorScheme === 'dark' && { backgroundColor: colors.primaryLight || colors.primary + '20' }
              ]}
              onPress={() => {
                Appearance.setColorScheme('dark');
                setShowThemeModal(false);
              }}
            >
              <Ionicons name="moon" size={24} color={colors.text} />
              <Text style={[styles.themeOptionText, { color: colors.text }]}>Dark</Text>
              {colorScheme === 'dark' && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.themeOption,
                { borderColor: colors.border },
              ]}
              onPress={() => {
                Appearance.setColorScheme(null);
                setShowThemeModal(false);
              }}
            >
              <Ionicons name="phone-portrait" size={24} color={colors.text} />
              <Text style={[styles.themeOptionText, { color: colors.text }]}>System Default</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            <ScrollView
              style={[styles.notificationsModal, { backgroundColor: colors.surface }]}
              contentContainerStyle={styles.notificationsContent}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Notification Settings</Text>
                <TouchableOpacity onPress={() => setShowNotificationsModal(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.notificationDescription, { color: colors.textSecondary }]}>
                Manage your notification preferences
              </Text>

              {/* Daily Reminders */}
              <View style={[styles.notificationItem, { borderColor: colors.border }]}>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>Daily Reminders</Text>
                  </View>
                  <Text style={[styles.notificationSubtext, { color: colors.textSecondary }]}>
                    Get reminded to log your meals daily
                  </Text>
                </View>
                <Switch
                  value={notifications.dailyReminders}
                  onValueChange={(value) => setNotifications({ ...notifications, dailyReminders: value })}
                  trackColor={{ false: colors.border, true: colors.primaryLight || colors.primary }}
                  thumbColor={notifications.dailyReminders ? colors.primary : colors.textTertiary}
                />
              </View>

              {/* Meal Reminders */}
              <View style={[styles.notificationItem, { borderColor: colors.border }]}>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Ionicons name="restaurant-outline" size={22} color={colors.primary} />
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>Meal Reminders</Text>
                  </View>
                  <Text style={[styles.notificationSubtext, { color: colors.textSecondary }]}>
                    Reminders for breakfast, lunch, and dinner
                  </Text>
                </View>
                <Switch
                  value={notifications.mealReminders}
                  onValueChange={(value) => setNotifications({ ...notifications, mealReminders: value })}
                  trackColor={{ false: colors.border, true: colors.primaryLight || colors.primary }}
                  thumbColor={notifications.mealReminders ? colors.primary : colors.textTertiary}
                />
              </View>

              {/* Goal Achievements */}
              <View style={[styles.notificationItem, { borderColor: colors.border }]}>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Ionicons name="trophy-outline" size={22} color={colors.primary} />
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>Goal Achievements</Text>
                  </View>
                  <Text style={[styles.notificationSubtext, { color: colors.textSecondary }]}>
                    Celebrate when you hit your nutrition goals
                  </Text>
                </View>
                <Switch
                  value={notifications.goalAchievements}
                  onValueChange={(value) => setNotifications({ ...notifications, goalAchievements: value })}
                  trackColor={{ false: colors.border, true: colors.primaryLight || colors.primary }}
                  thumbColor={notifications.goalAchievements ? colors.primary : colors.textTertiary}
                />
              </View>

              {/* Weekly Progress */}
              <View style={[styles.notificationItem, { borderColor: colors.border }]}>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Ionicons name="stats-chart-outline" size={22} color={colors.primary} />
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>Weekly Progress</Text>
                  </View>
                  <Text style={[styles.notificationSubtext, { color: colors.textSecondary }]}>
                    Get a summary of your weekly nutrition stats
                  </Text>
                </View>
                <Switch
                  value={notifications.weeklyProgress}
                  onValueChange={(value) => setNotifications({ ...notifications, weeklyProgress: value })}
                  trackColor={{ false: colors.border, true: colors.primaryLight || colors.primary }}
                  thumbColor={notifications.weeklyProgress ? colors.primary : colors.textTertiary}
                />
              </View>

              {/* Motivational Messages */}
              <View style={[styles.notificationItem, { borderColor: colors.border }]}>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
                    <Text style={[styles.notificationTitle, { color: colors.text }]}>Motivational Messages</Text>
                  </View>
                  <Text style={[styles.notificationSubtext, { color: colors.textSecondary }]}>
                    Receive motivational tips and encouragement
                  </Text>
                </View>
                <Switch
                  value={notifications.motivational}
                  onValueChange={(value) => setNotifications({ ...notifications, motivational: value })}
                  trackColor={{ false: colors.border, true: colors.primaryLight || colors.primary }}
                  thumbColor={notifications.motivational ? colors.primary : colors.textTertiary}
                />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  Alert.alert('Success', 'Notification preferences saved!');
                  setShowNotificationsModal(false);
                }}
              >
                <Text style={styles.saveButtonText}>Save Preferences</Text>
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
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
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
  },
  settingText: {
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  themeOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  notificationsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  notificationsContent: {
    padding: 20,
    paddingBottom: 40,
  },
  notificationDescription: {
    fontSize: 14,
    marginBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  notificationSubtext: {
    fontSize: 13,
    marginLeft: 30,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
