import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Header from '@components/Header';
import CheckWhiteIcon from '@assets/images/check_white.svg';
import CheckGrayIcon from '@assets/images/check_gray.svg';
import {COLORS} from '@constants/colors';
import notificationApi from '@utils/api/notificationApi';
import styles from './NotificationSettings.styles';

const DEFAULT_NOTIFICATIONS = [
  {
    key: 'isNoticeEnabled',
    label: '서비스 공지 알림',
    enabled: true,
  },
  {
    key: 'isReviewEnabled',
    label: '방문자 리뷰 알림',
    enabled: true,
  },
  {
    key: 'isSettlementEnabled',
    label: '정산 알림',
    enabled: true,
  },
  {
    key: 'isCheckinEnabled',
    label: '오늘 체크인 예정 손님 알림',
    enabled: true,
  },
];

const DEFAULT_SETTINGS = {
  isPushEnabled: true,
  isNoticeEnabled: true,
  isReviewEnabled: true,
  isSettlementEnabled: true,
  isCheckinEnabled: true,
};

const normalizeSettings = data => {
  const nextSettings = {
    isPushEnabled: Boolean(
      data?.isPushEnabled ?? DEFAULT_SETTINGS.isPushEnabled,
    ),
    isNoticeEnabled: Boolean(
      data?.isNoticeEnabled ?? DEFAULT_SETTINGS.isNoticeEnabled,
    ),
    isReviewEnabled: Boolean(
      data?.isReviewEnabled ?? DEFAULT_SETTINGS.isReviewEnabled,
    ),
    isSettlementEnabled: Boolean(
      data?.isSettlementEnabled ?? DEFAULT_SETTINGS.isSettlementEnabled,
    ),
    isCheckinEnabled: Boolean(
      data?.isCheckinEnabled ?? DEFAULT_SETTINGS.isCheckinEnabled,
    ),
  };

  return nextSettings.isPushEnabled
    ? nextSettings
    : {
        isPushEnabled: false,
        isNoticeEnabled: false,
        isReviewEnabled: false,
        isSettlementEnabled: false,
        isCheckinEnabled: false,
      };
};

const buildItems = settings =>
  DEFAULT_NOTIFICATIONS.map(item => ({
    ...item,
    enabled: Boolean(settings[item.key]),
  }));

const NotificationSettings = () => {
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [notificationItems, setNotificationItems] = useState(
    DEFAULT_NOTIFICATIONS,
  );
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const applySettings = nextSettings => {
    setSettings(nextSettings);
    setIsPushEnabled(nextSettings.isPushEnabled);
    setNotificationItems(buildItems(nextSettings));
  };

  const persistSettings = async nextSettings => {
    const payload = normalizeSettings(nextSettings);
    applySettings(payload);

    try {
      setSaving(true);
      await notificationApi.updateSettings(payload);
    } catch (error) {
      applySettings(settings);
      Alert.alert('알림 설정 저장 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const {data} = await notificationApi.getSettings();
        applySettings(normalizeSettings(data));
      } catch (error) {
        console.warn(
          '[NotificationSettings] failed to fetch settings:',
          error?.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleTogglePush = value => {
    const nextSettings = value
      ? {
          isPushEnabled: true,
          isNoticeEnabled: true,
          isReviewEnabled: true,
          isSettlementEnabled: true,
          isCheckinEnabled: true,
        }
      : {
          isPushEnabled: false,
          isNoticeEnabled: false,
          isReviewEnabled: false,
          isSettlementEnabled: false,
          isCheckinEnabled: false,
        };

    persistSettings(nextSettings);
  };

  const handleToggleItem = key => {
    if (!settings.isPushEnabled || saving) {
      return;
    }

    persistSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <View style={styles.container}>
      <Header title="알림 설정" />

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={COLORS.grayscale_500} />
        </View>
      ) : null}

      <View style={styles.body}>
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.mainLabel}>푸시 알림 받기</Text>

            <View style={styles.pushControlRow}>
              <Text style={styles.pushStatus}>
                {isPushEnabled ? '받음' : '꺼짐'}
              </Text>
              <Switch
                value={isPushEnabled}
                onValueChange={handleTogglePush}
                disabled={saving}
                trackColor={{
                  false: COLORS.grayscale_300,
                  true: COLORS.primary_blue,
                }}
                thumbColor={COLORS.grayscale_0}
                style={styles.switch}
              />
            </View>
          </View>

          <Text style={styles.helperText}>
            소리와 진동으로 알려주는 알림입니다.
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.listSection}>
          {notificationItems.map(item => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.listRow,
                (!isPushEnabled || saving) && styles.listRowDisabled,
              ]}
              activeOpacity={0.85}
              disabled={!isPushEnabled || saving}
              onPress={() => handleToggleItem(item.key)}>
              <Text style={styles.itemLabel}>{item.label}</Text>

              <View
                style={[
                  styles.checkbox,
                  item.enabled && styles.checkboxChecked,
                ]}>
                {item.enabled ? (
                  <CheckWhiteIcon width={16} height={16} />
                ) : (
                  <CheckGrayIcon width={16} height={16} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

export default NotificationSettings;
