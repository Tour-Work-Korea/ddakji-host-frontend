import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {FONTS} from '@constants/fonts';

import CalendarIcon from '@assets/images/calendar_gray.svg';
import MenuNoticeIcon from '@assets/images/menu_notice.svg';
import HostMeetReservationIcon from '@assets/images/host-meet-reservation-icon.svg';
import CheckWhiteIcon from '@assets/images/check_white.svg';
import XGrayIcon from '@assets/images/x_gray.svg';

import styles from './NotificationCenter.styles';

const renderLeadingIcon = item => {
  if (item.type === 'notice') {
    return (
      <View style={styles.iconWrap}>
        <MenuNoticeIcon width={20} height={20} />
      </View>
    );
  }

  if (item.type === 'partyReservation') {
    return (
      <View style={styles.iconWrap}>
        <HostMeetReservationIcon width={20} height={20} />
        <View
          style={[
            styles.statusBadge,
            item.status === 'cancelled'
              ? styles.statusBadgeCancel
              : styles.statusBadgeConfirm,
          ]}>
          {item.status === 'cancelled' ? (
            <XGrayIcon width={10} height={10} />
          ) : (
            <CheckWhiteIcon width={10} height={10} />
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.iconWrap}>
      <CalendarIcon width={20} height={20} />
      <View
        style={[
          styles.statusBadge,
          item.status === 'cancelled'
            ? styles.statusBadgeCancel
            : styles.statusBadgeConfirm,
        ]}>
        {item.status === 'cancelled' ? (
          <XGrayIcon width={10} height={10} />
        ) : (
          <CheckWhiteIcon width={10} height={10} />
        )}
      </View>
    </View>
  );
};

const NotificationList = ({items = []}) => {
  if (!items.length) {
    return <View style={styles.listContainer} />;
  }

  return (
    <ScrollView
      style={styles.listScrollView}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}>
      {items.map(item => (
        <View key={item.id} style={styles.notificationItem}>
          {renderLeadingIcon(item)}

          <View style={styles.notificationContent}>
            <Text style={[FONTS.fs_18_semibold, styles.notificationTitle]}>
              {item.title}
            </Text>

            {item.lines.map((line, index) => (
              <Text
                key={`${item.id}-${line}`}
                style={[
                  index === item.lines.length - 1 && item.type !== 'notice'
                    ? FONTS.fs_16_semibold
                    : item.type === 'notice'
                      ? FONTS.fs_14_regular
                      : FONTS.fs_16_medium,
                  styles.notificationLine,
                  item.type === 'notice' && styles.noticeLine,
                ]}>
                {line}
              </Text>
            ))}

            <Text style={[FONTS.fs_14_medium, styles.notificationDate]}>
              {item.date}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default NotificationList;
