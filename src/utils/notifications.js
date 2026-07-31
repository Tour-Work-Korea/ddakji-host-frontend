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

const normalizeNotificationPayload = notification => {
  const data = notification?.data ?? notification ?? {};

  return {
    ...data,
    title: data.title ?? notification?.notification?.title,
    body: data.body ?? notification?.notification?.body,
  };
};

const normalizeNotificationType = payload =>
  String(payload?.type || payload?.targetType || '').toUpperCase();

const getFallbackGuesthouseId = () => {
  const {hostProfile, selectedGuesthouseId} = useUserStore.getState();

  return (
    normalizeNumber(selectedGuesthouseId) ??
    normalizeNumber(hostProfile?.guesthouseProfiles?.[0]?.guesthouseId) ??
    normalizeNumber(hostProfile?.guesthouseProfiles?.[0]?.profileKey)
  );
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
    const deviceId = await DeviceInfo.getUniqueId();
    await notificationApi.logoutToken(deviceId, jwtToken);
    return true;
  } catch (error) {
    console.warn('[notifications] unmapDeviceToken failed:', error?.message);
    return false;
  }
};

export const markNotificationAsRead = async notification => {
  const data = normalizeNotificationPayload(notification);
  const notificationId =
    normalizeNumber(data.notificationId) ??
    normalizeNumber(data.alarmId) ??
    normalizeNumber(data.id);

  if (!notificationId) {
    return false;
  }

  try {
    await notificationApi.getDetail(notificationId);
    return true;
  } catch (error) {
    console.warn(
      '[notifications] markNotificationAsRead failed:',
      error?.message,
    );
    return false;
  }
};

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getNotificationLocalDate = data => {
  const dateCandidate =
    data?.partyDate ||
    data?.date ||
    data?.partyStartDateTime;

  if (dateCandidate) {
    const d = new Date(dateCandidate);
    if (!Number.isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  return getTodayLocalDate();
};

export const resolveNotificationTarget = notification => {
  const data = normalizeNotificationPayload(notification);
  const type = normalizeNotificationType(data);
  const deepLink = data.deepLink || data.link || data.url || null;
  const explicitScreen = data.screen || data.targetScreen || data.routeName;
  const isPartyNotification =
    type.startsWith('PARTY_') ||
    type.includes('PARTY') ||
    type.includes('MEET');
  const isStaffNotification =
    type.includes('RECRUIT') || type.includes('STAFF');
  const isRecruitCommentNotification =
    type === 'RECRUIT_COMMENT_NEW' ||
    (type.includes('RECRUIT_COMMENT') && type.includes('NEW'));
  const isPartyCancelNotification =
    isPartyNotification && (type.includes('CANCEL') || type.includes('REFUND'));
  const isRoomReservationNotification =
    type.includes('GUESTHOUSE_RESERVATION') ||
    type.includes('ROOM_RESERVATION') ||
    (type.includes('RESERVATION') && !isPartyNotification);
  const isRoomReservationRequestNotification =
    isRoomReservationNotification && type.includes('NEW');
  const guesthouseId = normalizeNumber(data.guesthouseId);
  const fallbackGuesthouseId = guesthouseId ?? getFallbackGuesthouseId();
  const roomId = normalizeNumber(data.roomId);
  const isNoticeNotification =
    type.includes('NOTICE') || type.includes('EVENT');
  const noticeId =
    normalizeNumber(data.noticeId) ??
    normalizeNumber(data.targetNoticeId) ??
    normalizeNumber(data.notice?.id) ??
    (isNoticeNotification
      ? normalizeNumber(data.targetId) ??
        normalizeNumber(data.referenceId) ??
        normalizeNumber(data.resourceId)
      : null);
  const reservationId =
    normalizeNumber(data.reservationId) ??
    normalizeNumber(data.targetReservationId);
  const partyId =
    normalizeNumber(data.partyId) ?? normalizeNumber(data.targetPartyId);
  const templateId =
    normalizeNumber(data.templateId) ??
    normalizeNumber(data.partyTemplateId) ??
    normalizeNumber(data.targetTemplateId);
  const reviewId =
    normalizeNumber(data.reviewId) ?? normalizeNumber(data.targetReviewId);
  const batchId =
    normalizeNumber(data.batchId) ?? normalizeNumber(data.settlementId);
  const applicationId =
    normalizeNumber(data.applicationId) ??
    normalizeNumber(data.recruitApplicationId);
  const recruitId =
    normalizeNumber(data.recruitId) ?? normalizeNumber(data.targetRecruitId);

  const notificationLocalDate = getNotificationLocalDate(data);
  const todayLocalDate = getTodayLocalDate();

  if (deepLink) {
    return {kind: 'link', value: deepLink};
  }

  if (explicitScreen) {
    const targetId = normalizeNumber(data.id) ?? data.id;
    const isNoticeDetailScreen =
      String(explicitScreen).toUpperCase() === 'NOTICEDETAIL';

    return {
      kind: 'screen',
      value: explicitScreen,
      params:
        isNoticeDetailScreen && noticeId
          ? {noticeId}
          : targetId
            ? {id: targetId}
            : undefined,
    };
  }

  if (noticeId) {
    return {
      kind: 'screen',
      value: 'NoticeDetail',
      params: {noticeId},
    };
  }

  if (isNoticeNotification && guesthouseId) {
    return {
      kind: 'screen',
      value: 'GuesthouseManagement',
      params: {guesthouseId},
    };
  }

  if (isNoticeNotification) {
    return {
      kind: 'screen',
      value: 'NoticeList',
    };
  }

  if (isRecruitCommentNotification && recruitId) {
    return {
      kind: 'screen',
      value: 'StaffRecruitDetail',
      params: {
        id: recruitId,
        fromHost: true,
        commentId: normalizeNumber(data.commentId),
      },
    };
  }

  if (isStaffNotification) {
    if (applicationId) {
      return {
        kind: 'screen',
        value: 'ResumeDetail',
        params: {
          id: applicationId,
          role: 'HOST',
          headerTitle: '지원서',
        },
      };
    }

    return {
      kind: 'screen',
      value: 'GuesthouseManagement',
      params: {
        guesthouseId: fallbackGuesthouseId,
        initialTab: '스탭',
        recruitId,
      },
    };
  }

  if (isPartyCancelNotification) {
    return {
      kind: 'screen',
      value: 'ReservationCancelList',
      params: {
        guesthouseId: fallbackGuesthouseId,
        selectedDate: notificationLocalDate,
        partyId,
      },
    };
  }

  if (isPartyNotification) {
    const isPastDate = notificationLocalDate < todayLocalDate;

    if (isPastDate) {
      return {
        kind: 'screen',
        value: 'PastReservationList',
        params: {
          guesthouseId: fallbackGuesthouseId,
          selectedDate: notificationLocalDate,
          partyId,
        },
      };
    }

    return {
      kind: 'screen',
      value: 'GuesthouseManagement',
      params: {
        guesthouseId: fallbackGuesthouseId,
        initialTab: '파티 관리',
        reservationId,
        partyId,
        templateId,
      },
    };
  }

  if (isRoomReservationRequestNotification && guesthouseId) {
    return {
      kind: 'screen',
      value: 'GuesthouseManagement',
      params: {
        guesthouseId,
        initialTab: '객실 예약',
        initialChip: '예약 관리',
        reservationId,
        roomId,
      },
    };
  }

  if (reservationId && isRoomReservationNotification) {
    return {
      kind: 'screen',
      value: 'MyGuesthouseReservationDetail',
      params: {reservationId, guesthouseId, roomId},
    };
  }

  if (type.includes('REVIEW') && guesthouseId) {
    return {
      kind: 'screen',
      value: 'GuesthouseManagement',
      params: {
        guesthouseId,
        initialTab: '게하 정보',
        initialChip: '리뷰 관리',
        reviewId,
      },
    };
  }

  if (type.includes('SETTLEMENT')) {
    return {
      kind: 'screen',
      value: batchId ? 'SettlementDetail' : 'SettlementManagement',
      params: batchId ? {batchId, guesthouseId} : {guesthouseId},
    };
  }

  if (guesthouseId) {
    return {
      kind: 'screen',
      value: 'GuesthouseManagement',
      params: {
        guesthouseId,
        ...(isRoomReservationNotification
          ? {initialTab: '객실 예약', initialChip: '예약 관리'}
          : {}),
      },
    };
  }

  return {
    kind: 'screen',
    value: 'NotificationCenter',
  };
};

export const openNotificationTarget = async remoteMessage => {
  const target = resolveNotificationTarget(remoteMessage);
  const data = normalizeNotificationPayload(remoteMessage);
  const guesthouseId = normalizeNumber(data.guesthouseId);

  try {
    await markNotificationAsRead(remoteMessage);

    if (guesthouseId) {
      useUserStore.getState().setSelectedGuesthouseId(guesthouseId);
    }

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
  const unsubscribeForeground = messaging().onMessage(handleForegroundMessage);
  const unsubscribeOpened = messaging().onNotificationOpenedApp(
    handleNotificationOpen,
  );
  const unsubscribeTokenRefresh = messaging().onTokenRefresh(async () => {
    const accessToken = getCurrentAccessToken();
    if (accessToken) {
      await syncDeviceToken(accessToken);
    }
  });

  const accessToken = getCurrentAccessToken();
  if (accessToken) {
    await syncDeviceToken(accessToken);
  }

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
