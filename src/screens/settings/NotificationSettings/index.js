import React, {useState} from 'react';
import {Switch, Text, TouchableOpacity, View} from 'react-native';

import Header from '@components/Header';
import CheckWhiteIcon from '@assets/images/check_white.svg';
import CheckGrayIcon from '@assets/images/check_gray.svg';
import {COLORS} from '@constants/colors';
import styles from './NotificationSettings.styles';

const DEFAULT_NOTIFICATIONS = [
  {
    key: 'serviceNotice',
    label: '서비스 공지 알림',
    enabled: true,
  },
  {
    key: 'ddakjiReservation',
    label: '게딱지 예약 알림',
    enabled: true,
  },
  {
    key: 'guestReview',
    label: '방문자 리뷰 알림',
    enabled: true,
  },
  {
    key: 'todayCheckin',
    label: '오늘 체크인 예정 손님 알림',
    enabled: true,
  },
];

const NotificationSettings = () => {
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [notificationItems, setNotificationItems] = useState(
    DEFAULT_NOTIFICATIONS,
  );

  const handleToggleItem = key => {
    setNotificationItems(prev =>
      prev.map(item =>
        item.key === key ? {...item, enabled: !item.enabled} : item,
      ),
    );
  };

  return (
    <View style={styles.container}>
      <Header title="알림 설정" />

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
                onValueChange={setIsPushEnabled}
                trackColor={{
                  false: COLORS.grayscale_300,
                  true: COLORS.primary_orange,
                }}
                thumbColor={COLORS.grayscale_0}
                ios_backgroundColor={COLORS.grayscale_300}
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
              style={styles.listRow}
              activeOpacity={0.85}
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
