import {Linking, PermissionsAndroid, Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import DeviceInfo from 'react-native-device-info';

import useUserStore from '@stores/userStore';
import notificationApi from '@utils/api/notificationApi';
import {navigate, navigationRef} from '@utils/navigationService';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const foregroundListeners = new Set();

const waitForNavigationReady = async () => {
  let tries = 0;

  while (!navigationRef.isReady() && tries < 100) {
    await wait(30);
    tries += 1;
  }

  return navigationRef.isReady();
};

const normalizeNumber = value => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getCurrentAccessToken = () => useUserStore.getState().accessToken;

export const subscribeForegroundNotification = listener => {
  foregroundListeners.add(listener);

  return () => {
    foregroundListeners.delete(listener);
  };
};

const emitForegroundNotification = remoteMessage => {
  foregroundListeners.forEach(listener => {
    try {
      listener(remoteMessage);
    } catch (error) {
      console.warn(
        '[notifications] foreground listener failed:',
        error?.message,
      );
    }
  });
};

const requestAndroidNotificationPermission = async () => {
  if (Platform.OS !== 'android' || Platform.Version < 33) {
    return true;
  }

  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  return granted === PermissionsAndroid.RESULTS.GRANTED;
};

export const requestNotificationPermission = async () => {
  const androidGranted = await requestAndroidNotificationPermission();
  if (!androidGranted) {
    return false;
  }

  if (Platform.OS === 'ios') {
    await messaging().registerDeviceForRemoteMessages();
  }

  const authStatus = await messaging().requestPermission();

  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
};

export const syncDeviceToken = async (jwtToken = null) => {
  try {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return null;
    }

    const [deviceId, fcmToken] = await Promise.all([
      DeviceInfo.getUniqueId(),
      messaging().getToken(),
    ]);

    if (!deviceId || !fcmToken) {
      return null;
    }

    await notificationApi.upsertToken({deviceId, fcmToken}, jwtToken);
    return {deviceId, fcmToken};
  } catch (error) {
    console.warn('[notifications] syncDeviceToken failed:', error?.message);
    return null;
  }
};

export const unmapDeviceToken = async jwtToken => {
  if (!jwtToken) {
    return false;
  }

  try {
    await notificationApi.logoutToken(jwtToken);
    return true;
  } catch (error) {
    console.warn('[notifications] unmapDeviceToken failed:', error?.message);
    return false;
  }
};

const resolveNotificationTarget = remoteMessage => {
  const data = remoteMessage?.data ?? {};
  const type = String(data.type || data.targetType || '').toUpperCase();
  const deepLink = data.deepLink || data.link || data.url || null;
  const explicitScreen = data.screen || data.targetScreen || data.routeName;
  const noticeId =
    normalizeNumber(data.noticeId) ??
    normalizeNumber(data.targetId) ??
    (type === 'NOTICE' ? normalizeNumber(data.id) : null);
  const reservationId =
    normalizeNumber(data.reservationId) ??
    (type.includes('RESERVATION') || type.includes('BOOKING')
      ? normalizeNumber(data.id)
      : null);
  const partyId =
    normalizeNumber(data.partyId) ??
    (type.includes('PARTY') || type.includes('MEET')
      ? normalizeNumber(data.id)
      : null);

  if (deepLink) {
    return {kind: 'link', value: deepLink};
  }

  if (explicitScreen) {
    const targetId = normalizeNumber(data.id) ?? data.id;

    return {
      kind: 'screen',
      value: explicitScreen,
      params: targetId ? {id: targetId} : undefined,
    };
  }

  if (noticeId) {
    return {
      kind: 'screen',
      value: 'NoticeDetail',
      params: {noticeId},
    };
  }

  if (reservationId) {
    return {
      kind: 'screen',
      value: 'MyGuesthouseReservationDetail',
      params: {reservationId},
    };
  }

  if (partyId) {
    return {
      kind: 'screen',
      value: 'MyMeetDetail',
      params: {partyId},
    };
  }

  return {
    kind: 'screen',
    value: 'NotificationCenter',
  };
};

export const openNotificationTarget = async remoteMessage => {
  const target = resolveNotificationTarget(remoteMessage);

  try {
    if (target.kind === 'link' && target.value) {
      await Linking.openURL(target.value);
      return;
    }

    const navReady = await waitForNavigationReady();
    if (!navReady) {
      return;
    }

    navigate(target.value, target.params);
  } catch (error) {
    console.warn(
      '[notifications] openNotificationTarget failed:',
      error?.message,
    );
  }
};

export const handleBackgroundMessage = async remoteMessage => {
  console.log('[notifications] background message:', remoteMessage?.messageId);
};

export const handleForegroundMessage = async remoteMessage => {
  emitForegroundNotification(remoteMessage);
};

export const handleNotificationOpen = async remoteMessage => {
  if (!remoteMessage) {
    return;
  }

  await openNotificationTarget(remoteMessage);
};

export const initializeNotifications = async () => {
  await syncDeviceToken();

  const unsubscribeForeground = messaging().onMessage(handleForegroundMessage);
  const unsubscribeOpened = messaging().onNotificationOpenedApp(
    handleNotificationOpen,
  );
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async () => {
    await syncDeviceToken(getCurrentAccessToken());
  });

  const initialNotification = await messaging().getInitialNotification();
  if (initialNotification) {
    await handleNotificationOpen(initialNotification);
  }

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
    unsubscribeTokenRefresh();
  };
};
