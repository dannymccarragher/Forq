import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request permission to send push notifications
 */
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });

    // Create channel for dose reminders
    await Notifications.setNotificationChannelAsync('dose-reminders', {
      name: 'Dose Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'default',
      lightColor: '#007AFF',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    try {
      // Get the Expo push token (optional - only needed for remote push notifications)
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (projectId) {
        token = (
          await Notifications.getExpoPushTokenAsync({
            projectId,
          })
        ).data;
        console.log('Expo push token obtained:', token);
      } else {
        console.log('No projectId configured - local notifications will work, but remote push notifications require EAS project setup');
      }
    } catch (error) {
      console.log('Push token not available (this is normal for local development):', error.message);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

/**
 * Schedule a notification for a specific date/time
 */
export async function scheduleDoseReminder(
  doseDate: Date,
  medicationName: string,
  dose: string,
  hoursBeforeReminder: number = 2
) {
  // Cancel existing dose reminders first
  await cancelDoseReminders();

  // Calculate trigger time (X hours before dose)
  const reminderTime = new Date(doseDate);
  reminderTime.setHours(reminderTime.getHours() - hoursBeforeReminder);

  // Don't schedule if the reminder time is in the past
  if (reminderTime <= new Date()) {
    console.log('Reminder time is in the past, skipping notification');
    return null;
  }

  const trigger = {
    type: Notifications.SchedulableTriggerInputTypes.DATE,
    date: reminderTime,
  };

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💉 Dose Reminder',
      body: `Time to take your ${medicationName} (${dose})`,
      data: {
        type: 'dose-reminder',
        medicationName,
        dose,
        doseDate: doseDate.toISOString(),
      },
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
      categoryIdentifier: 'dose-reminder',
    },
    trigger,
  });

  console.log('Scheduled dose reminder:', notificationId);
  return notificationId;
}

/**
 * Schedule a daily reminder at a specific time
 */
export async function scheduleDailyReminder(
  hour: number,
  minute: number,
  medicationName: string
) {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🔔 Medication Reminder',
      body: `Don't forget to check your ${medicationName} schedule`,
      data: { type: 'daily-reminder' },
      sound: 'default',
      categoryIdentifier: 'daily-reminder',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour,
      minute,
      repeats: true,
    },
  });

  console.log('Scheduled daily reminder:', notificationId);
  return notificationId;
}

/**
 * Cancel all dose reminder notifications
 */
export async function cancelDoseReminders() {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduledNotifications) {
    if (notification.content.data?.type === 'dose-reminder') {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }
  }

  console.log('Cancelled all dose reminders');
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cancelled all notifications');
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Set up notification categories (for interactive notifications)
 */
export async function setupNotificationCategories() {
  await Notifications.setNotificationCategoryAsync('dose-reminder', [
    {
      identifier: 'dose-taken',
      buttonTitle: '✓ Taken',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'snooze',
      buttonTitle: 'Remind me in 30 min',
      options: {
        opensAppToForeground: false,
      },
    },
  ]);

  await Notifications.setNotificationCategoryAsync('daily-reminder', [
    {
      identifier: 'view-tracker',
      buttonTitle: 'View Tracker',
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
}

/**
 * Handle notification response (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Handle notification received (when notification arrives while app is open)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * TEST ONLY: Schedule a notification for testing (triggers in 5 seconds)
 */
export async function scheduleTestNotification() {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🧪 Test Notification',
      body: 'This is a test notification. If you see this, notifications are working!',
      data: { type: 'test' },
      sound: 'default',
    },
    trigger: {
      seconds: 5,
    },
  });

  console.log('Test notification scheduled (will appear in 5 seconds):', notificationId);
  return notificationId;
}

/**
 * TEST ONLY: Schedule an immediate notification
 */
export async function scheduleImmediateTestNotification() {
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💉 Dose Reminder (Test)',
      body: 'Time to take your medication! This is a test notification.',
      data: { type: 'test-dose-reminder' },
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      seconds: 1,
    },
  });

  console.log('Immediate test notification scheduled:', notificationId);
  return notificationId;
}
