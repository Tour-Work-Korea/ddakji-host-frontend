import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Pressable, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import {openNotificationTarget, subscribeForegroundNotification} from '@utils/notifications';

import GuesthouseConfirmedIcon from '@assets/images/noti_guesthouse_confirmed.svg';
import GuesthouseCancelledIcon from '@assets/images/noti_guesthouse_cancelled.svg';
import NoticeIcon from '@assets/images/noti_notice.svg';
import PartyConfirmedIcon from '@assets/images/noti_party_confirmed.svg';
import PartyCancelledIcon from '@assets/images/noti_party_cancelled.svg';
import StaffIcon from '@assets/images/noti_staff.svg';

const AUTO_HIDE_MS = 3200;

const normalizeType = data => {
  const rawType = String(data?.type || data?.targetType || '').toUpperCase();

  if (rawType.includes('NOTICE')) {
    return 'notice';
  }

  if (rawType.includes('PARTY') || rawType.includes('MEET')) {
    return 'partyReservation';
  }

  if (rawType.includes('RECRUIT') || rawType.includes('STAFF')) {
    return 'staff';
  }

  return 'roomReservation';
};

const normalizeStatus = data => {
  const rawStatus = String(data?.status || data?.eventType || '').toUpperCase();

  if (rawStatus.includes('CANCEL')) {
    return 'cancelled';
  }

  return 'confirmed';
};

const mapRemoteMessage = remoteMessage => {
  const data = remoteMessage?.data ?? {};
  const type = normalizeType(data);
  const title = remoteMessage?.notification?.title || '새로운 알림';
  const body =
    remoteMessage?.notification?.body ||
    data.body ||
    data.message ||
    '알림센터에서 자세한 내용을 확인해주세요.';
  const lines = String(body)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 2);

  return {
    title,
    lines: lines.length ? lines : ['알림센터에서 자세한 내용을 확인해주세요.'],
    type,
    status: normalizeStatus(data),
    timestamp: data.sentAt || data.createdAt || '방금 도착',
  };
};

const BannerIcon = ({type, status}) => {
  const isCancelled = status === 'cancelled';

  if (type === 'notice') {
    return (
      <View style={styles.iconWrap}>
        <NoticeIcon width={24} height={24} />
      </View>
    );
  }

  return (
    <View style={styles.iconWrap}>
      {type === 'staff' ? (
        <StaffIcon width={24} height={24} />
      ) : type === 'partyReservation' ? (
        isCancelled ? (
          <PartyCancelledIcon width={24} height={24} />
        ) : (
          <PartyConfirmedIcon width={24} height={24} />
        )
      ) : (
        isCancelled ? (
          <GuesthouseCancelledIcon width={24} height={24} />
        ) : (
          <GuesthouseConfirmedIcon width={24} height={24} />
        )
      )}
    </View>
  );
};

export default function InAppNotificationBanner() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState(null);
  const translateY = useRef(new Animated.Value(-140)).current;
  const hideTimerRef = useRef(null);
  const topOffset = Math.max(insets.top + 8, 16);

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const hideBanner = useCallback(() => {
    clearHideTimer();
    Animated.timing(translateY, {
      toValue: -140,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setMessage(null);
    });
  }, [translateY]);

  useEffect(() => {
    const unsubscribe = subscribeForegroundNotification(remoteMessage => {
      clearHideTimer();
      setMessage({
        remoteMessage,
        viewModel: mapRemoteMessage(remoteMessage),
      });

      translateY.setValue(-140);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();

      hideTimerRef.current = setTimeout(() => {
        hideBanner();
      }, AUTO_HIDE_MS);
    });

    return () => {
      clearHideTimer();
      unsubscribe();
    };
  }, [hideBanner, translateY]);

  const content = useMemo(() => message?.viewModel ?? null, [message]);

  if (!content) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.overlay, {top: topOffset, transform: [{translateY}]}]}>
      <Pressable
        style={styles.card}
        onPress={async () => {
          const remoteMessage = message?.remoteMessage;
          hideBanner();
          await openNotificationTarget(remoteMessage);
        }}>
        <BannerIcon type={content.type} status={content.status} />

        <View style={styles.content}>
          <Text style={[FONTS.fs_16_semibold, styles.title]} numberOfLines={1}>
            {content.title}
          </Text>

          {content.lines.map(line => (
            <Text
              key={`${content.title}-${line}`}
              style={[
                content.type === 'notice'
                  ? FONTS.fs_12_medium
                  : FONTS.fs_14_medium,
                styles.line,
                content.type === 'notice' && styles.noticeLine,
              ]}
              numberOfLines={1}>
              {line}
            </Text>
          ))}

          <Text style={[FONTS.fs_12_medium, styles.date]} numberOfLines={1}>
            {content.timestamp}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 999,
  },
  card: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
  },
  iconWrap: {
    width: 24,
    height: 24,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  content: {
    flex: 1,
    paddingTop: 1,
  },
  title: {
    color: COLORS.grayscale_800,
    lineHeight: 22,
    marginBottom: 2,
  },
  line: {
    color: COLORS.grayscale_700,
    lineHeight: 20,
  },
  noticeLine: {
    color: COLORS.grayscale_600,
    lineHeight: 18,
  },
  date: {
    color: COLORS.grayscale_500,
    lineHeight: 16,
    marginTop: 4,
  },
});
