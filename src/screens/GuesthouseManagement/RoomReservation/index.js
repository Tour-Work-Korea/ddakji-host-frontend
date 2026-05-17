import React, {useEffect, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';

import {FONTS} from '@constants/fonts';
import ReservationCalendar from './ReservationCalendar';
import ReservationManagement from './ReservationManagement';
import RoomList from './RoomList';
import RoomManagement from './RoomManagement';
import NotificationSettings from './NotificationSettings';
import OpenManagement from './OpenManagement';
import styles from './RoomReservation.styles';

import MoreVertIcon from '@assets/images/more_v_gray.svg';

const mainChips = ['예약 관리', '예약 캘린더', '방관리', '객실 목록'];
const moreChips = ['오픈 관리', '알림 설정'];

const RoomReservation = ({guesthouseId, initialChip, initialRoomManagementDate}) => {
  const allChips = [...mainChips, ...moreChips];
  const [activeChip, setActiveChip] = useState(
    allChips.includes(initialChip) ? initialChip : mainChips[0],
  );
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [roomManagementInitialDate, setRoomManagementInitialDate] = useState(
    initialRoomManagementDate ?? null,
  );

  useEffect(() => {
    if (allChips.includes(initialChip)) {
      setActiveChip(initialChip);
    }
  }, [initialChip, allChips]);

  useEffect(() => {
    if (initialRoomManagementDate) {
      setRoomManagementInitialDate(initialRoomManagementDate);
    }
  }, [initialRoomManagementDate]);

  return (
    <View style={styles.container}>
      {isMoreMenuOpen && (
        <TouchableOpacity
          style={styles.moreMenuBackdrop}
          activeOpacity={1}
          onPress={() => setIsMoreMenuOpen(false)}
        />
      )}

      <ScrollView
        style={styles.chipScrollView}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}>
        {mainChips.map(chip => (
          <TouchableOpacity
            key={chip}
            activeOpacity={0.8}
            style={[styles.chip, activeChip === chip && styles.chipActive]}
            onPress={() => {
              setActiveChip(chip);
              setIsMoreMenuOpen(false);
            }}>
            <Text
              style={[
                FONTS.fs_14_medium,
                activeChip === chip ? styles.chipTextActive : styles.chipText,
              ]}>
              {chip}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.chip,
            styles.moreChip,
            moreChips.includes(activeChip) && styles.chipActive,
          ]}
          onPress={() => setIsMoreMenuOpen(prev => !prev)}>
          <MoreVertIcon width={16} height={16} />
        </TouchableOpacity>
      </ScrollView>

      {isMoreMenuOpen && (
        <View style={styles.moreMenuDropdown}>
          {moreChips.map(chip => (
            <TouchableOpacity
              key={chip}
              style={styles.moreMenuItem}
              onPress={() => {
                setActiveChip(chip);
                setIsMoreMenuOpen(false);
              }}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.chipText,
                  activeChip === chip && styles.moreMenuTextActive,
                ]}>
                {chip}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {activeChip === '오픈 관리' ? (
        <OpenManagement guesthouseId={guesthouseId} />
      ) : activeChip === '예약 관리' ? (
        <ReservationManagement
          guesthouseId={guesthouseId}
          onMoveRoomManagement={({date}) => {
            setRoomManagementInitialDate(date || null);
            setActiveChip('방관리');
          }}
        />
      ) : activeChip === '예약 캘린더' ? (
        <ReservationCalendar guesthouseId={guesthouseId} />
      ) : activeChip === '방관리' ? (
        <RoomManagement
          guesthouseId={guesthouseId}
          initialDate={roomManagementInitialDate}
        />
      ) : activeChip === '객실 목록' ? (
        <RoomList guesthouseId={guesthouseId} />
      ) : (
        <NotificationSettings guesthouseId={guesthouseId} />
      )}
    </View>
  );
};

export default RoomReservation;
