import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
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
      // Bildirim izni alınamadı
      return;
    }
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
  } else {
    // Fiziksel cihaz gerekli
  }

  return token;
};

export const scheduleMatchNotification = async (
  matchId: string,
  title: string,
  body: string,
  trigger: Date
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { matchId },
    },
    trigger,
  });
};

export const cancelMatchNotification = async (matchId: string) => {
  await Notifications.cancelScheduledNotificationAsync(matchId);
}; 