import * as Notifications from 'expo-notifications';
import notificationConfig from '@/config/notifications.json';

// Configure how notifications should be handled when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export interface NotificationSchedule {
  id: string;
  title: string;
  body: string;
  hour: number;
  minute: number;
}

/**
 * Schedule all daily notifications from the config
 */
export async function scheduleDailyNotifications(): Promise<void> {
  try {
    // Cancel any existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    const { dailyNotifications } = notificationConfig;

    for (const notification of dailyNotifications) {
      await scheduleNotification(notification);
    }

    console.log(`Scheduled ${dailyNotifications.length} daily notifications`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    throw error;
  }
}

/**
 * Schedule a single notification
 */
async function scheduleNotification(config: NotificationSchedule): Promise<string> {
  const trigger: Notifications.DailyTriggerInput = {
    type: Notifications.SchedulableTriggerInputTypes.DAILY,
    hour: config.hour,
    minute: config.minute,
  };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: config.title,
      body: config.body,
      data: { notificationId: config.id },
      sound: true,
    },
    trigger,
  });

  console.log(`Scheduled notification: ${config.id} at ${config.hour}:${config.minute}`);
  return identifier;
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('Cancelled all notifications');
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

  for (const notification of scheduledNotifications) {
    if (notification.content.data?.notificationId === notificationId) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      console.log(`Cancelled notification: ${notificationId}`);
      break;
    }
  }
}

/**
 * Get all currently scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Send an immediate notification (for testing)
 */
export async function sendTestNotification(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification 🔔",
      body: "Notifications are working!",
      data: { notificationId: 'test' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 2,
    },
  });
}

/**
 * Check if notifications are enabled
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}
