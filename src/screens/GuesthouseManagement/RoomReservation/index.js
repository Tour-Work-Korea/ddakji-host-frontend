import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {FONTS} from '@constants/fonts';
import ReservationCalendar from './ReservationCalendar';
import ReservationManagement from './ReservationManagement';
import RoomList from './RoomList';
import RoomManagement from './RoomManagement';
import NotificationSettings from './NotificationSettings';
import styles from './RoomReservation.styles';

const chips = ['예약 관리', '예약 캘린더', '방관리', '객실 목록', '알림 설정'];

const RoomReservation = ({guesthouseId, initialChip, initialRoomManagementDate}) => {
  const [activeChip, setActiveChip] = useState(
    chips.includes(initialChip) ? initialChip : chips[0],
  );
  const [roomManagementInitialDate, setRoomManagementInitialDate] = useState(
    initialRoomManagementDate ?? null,
  );

  useEffect(() => {
    if (chips.includes(initialChip)) {
      setActiveChip(initialChip);
    }
  }, [initialChip]);

  useEffect(() => {
    if (initialRoomManagementDate) {
      setRoomManagementInitialDate(initialRoomManagementDate);
    }
  }, [initialRoomManagementDate]);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.chipScrollView}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}>
        {chips.map(chip => (
          <TouchableOpacity
            key={chip}
            activeOpacity={0.8}
            style={[styles.chip, activeChip === chip && styles.chipActive]}
            onPress={() => setActiveChip(chip)}>
            <Text
              style={[
                FONTS.fs_14_medium,
                activeChip === chip ? styles.chipTextActive : styles.chipText,
              ]}>
              {chip}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {activeChip === chips[0] ? (
        <ReservationManagement
          guesthouseId={guesthouseId}
          onMoveRoomManagement={({date}) => {
            setRoomManagementInitialDate(date || null);
            setActiveChip('방관리');
          }}
        />
      ) : activeChip === chips[1] ? (
        <ReservationCalendar guesthouseId={guesthouseId} />
      ) : activeChip === chips[2] ? (
        <RoomManagement
          guesthouseId={guesthouseId}
          initialDate={roomManagementInitialDate}
        />
      ) : activeChip === chips[3] ? (
        <RoomList guesthouseId={guesthouseId} />
      ) : (
        <NotificationSettings embedded guesthouseId={guesthouseId} />
      )}
    </View>
  );
};

export default RoomReservation;
