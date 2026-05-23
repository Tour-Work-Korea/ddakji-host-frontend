import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PanResponder, Platform, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';

import AlertModal from '@components/modals/AlertModal';
import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import { useNavigation } from '@react-navigation/native';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';
import styles from './RoomManagement.styles';

import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import MinusIcon from '@assets/images/minus_black.svg';

const SWIPE_THRESHOLD = 60;
const CENTER_TOAST_TOP_OFFSET = Platform.OS === 'ios' ? 220 : 190;

const normalizeRoom = (room = {}) => ({
  ...room,
  id: room?.roomId ?? room?.id,
  roomId: room?.roomId ?? room?.id,
  name: room?.roomName ?? room?.name ?? '이름 없음',
  isVisible: room?.isVisible != null ? Boolean(room?.isVisible) : true,
  isClosed: Boolean(room?.isClosed),
  displayBeds: Number(room?.roomCapacity ?? 0),
  availableBeds: Number(room?.roomCapacity ?? 0),
});

const normalizeInventory = (inventory = {}, fallbackRoom = {}) => ({
  ...inventory,
  roomId: inventory?.roomId ?? fallbackRoom?.roomId,
  roomName: inventory?.roomName ?? fallbackRoom?.roomName ?? '이름 없음',
  name: inventory?.roomName ?? fallbackRoom?.roomName ?? '이름 없음',
  roomType: inventory?.roomType ?? fallbackRoom?.roomType,
  isVisible:
    inventory?.isVisible != null
      ? Boolean(inventory?.isVisible)
      : fallbackRoom?.isVisible != null
        ? Boolean(fallbackRoom?.isVisible)
        : true,
  isClosed:
    inventory?.isClosed != null ? Boolean(inventory?.isClosed) : Boolean(fallbackRoom?.isClosed),
  reservedBeds: Number(inventory?.reservedBeds ?? 0),
  availableBeds: Number(inventory?.availableBeds ?? fallbackRoom?.roomCapacity ?? 0),
  sellableCapacity: Number(inventory?.sellableCapacity ?? fallbackRoom?.roomCapacity ?? 0),
  displayBeds: Number(inventory?.availableBeds ?? fallbackRoom?.roomCapacity ?? 0),
  roomMaxCapacity: Number(
    inventory?.roomMaxCapacity ?? fallbackRoom?.roomMaxCapacity ?? 0,
  ),
});


const RoomManagement = ({ guesthouseId, initialDate }) => {
  const navigation = useNavigation();

  const getTodayLocalDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const shiftDate = (baseDate, diffDays) => {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + diffDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [guesthouses, setGuesthouses] = useState([]);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [inventoryErrorMessage, setInventoryErrorMessage] = useState('');
  const [dormitoryRooms, setDormitoryRooms] = useState([]);
  const [normalRooms, setNormalRooms] = useState([]);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });
  const [limitModal, setLimitModal] = useState({
    visible: false,
    message: '',
  });

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate);
      setIsCalendarOpen(false);
    }
  }, [initialDate]);

  useEffect(() => {
    const fetchGuesthousesWithRooms = async () => {
      try {
        const response = await hostGuesthouseApi.getMyGuesthousesWithRooms();
        const payload = response?.data?.data ?? response?.data ?? [];
        const safeList = Array.isArray(payload) ? payload : [];

        setGuesthouses(safeList);
      } catch (error) {
        setGuesthouses([]);
      }
    };

    fetchGuesthousesWithRooms();
  }, []);

  const fetchInventoryBySelectedDate = useCallback(async () => {
    const current = guesthouses.find(
      item => String(item?.guesthouseId) === String(guesthouseId),
    );
    const rooms = Array.isArray(current?.rooms) ? current.rooms : [];
    const normalizedRooms = rooms.map(normalizeRoom).filter(room => room.roomId != null);

    if (!guesthouseId || normalizedRooms.length === 0) {
      setDormitoryRooms([]);
      setNormalRooms([]);
      setInventoryErrorMessage('');
      setIsInventoryLoading(false);
      return;
    }

    setIsInventoryLoading(true);
    setInventoryErrorMessage('');
    try {
      const inventoryResults = await Promise.all(
        normalizedRooms.map(async room => {
          try {
            const response = await hostGuesthouseApi.getRoomInventoryCalendar(
              guesthouseId,
              room.roomId,
              selectedDate,
              selectedDate,
            );
            const payload = response?.data?.data ?? response?.data ?? {};
            const list =
              payload?.inventories ??
              payload?.calendar ??
              payload?.content ??
              (Array.isArray(payload) ? payload : null) ??
              [];
            const matched = Array.isArray(list)
              ? list.find(item => item?.date === selectedDate) ?? list[0]
              : payload;
            return {
              ok: true,
              room: normalizeInventory(matched ?? {}, room),
            };
          } catch (error) {
            return {
              ok: false,
              room,
              message:
                error?.response?.data?.message ?? '객실 정보를 불러오지 못했습니다.',
            };
          }
        }),
      );

      const successfulRooms = inventoryResults
        .filter(result => result?.ok)
        .map(result => result.room)
        .filter(room => room?.isVisible !== false);
      const failedResults = inventoryResults.filter(result => !result?.ok);

      if (successfulRooms.length === 0 && failedResults.length > 0) {
        setDormitoryRooms([]);
        setNormalRooms([]);
        setInventoryErrorMessage(
          failedResults[0]?.message ?? '객실 정보를 불러오지 못했습니다.',
        );
        return;
      }

      setDormitoryRooms(
        successfulRooms.filter(room => room.roomType === 'DORMITORY'),
      );
      setNormalRooms(
        successfulRooms.filter(room => room.roomType !== 'DORMITORY'),
      );

      if (failedResults.length > 0) {
        setInventoryErrorMessage(
          failedResults[0]?.message ?? '일부 객실 정보를 불러오지 못했습니다.',
        );
      }
    } finally {
      setIsInventoryLoading(false);
    }
  }, [guesthouseId, guesthouses, selectedDate]);

  useEffect(() => {
    fetchInventoryBySelectedDate();
  }, [fetchInventoryBySelectedDate]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchInventoryBySelectedDate();
    });
    return unsubscribe;
  }, [navigation, fetchInventoryBySelectedDate]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          return isHorizontalSwipe && Math.abs(gestureState.dx) > 12;
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -SWIPE_THRESHOLD) {
            setSelectedDate(prev => shiftDate(prev, 1));
            setIsCalendarOpen(false);
            return;
          }

          if (gestureState.dx >= SWIPE_THRESHOLD) {
            setSelectedDate(prev => shiftDate(prev, -1));
            setIsCalendarOpen(false);
          }
        },
      }),
    [],
  );

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  };

  const handleToggleDormitoryRoom = async (roomId, nextValue) => {
    const nextIsClosed = !nextValue;
    setDormitoryRooms(prev =>
      prev.map(room => (room.roomId === roomId ? { ...room, isClosed: nextIsClosed } : room)),
    );
    try {
      await hostGuesthouseApi.updateRoomStatusByDate(guesthouseId, roomId, {
        date: selectedDate,
        isClosed: nextIsClosed,
      });
      Toast.show({
        type: 'success',
        text1: nextIsClosed ? '예약 마감 처리 되었습니다' : '예약 가능 처리 되었습니다',
        position: 'top',
        topOffset: CENTER_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      setErrorModal({ visible: true, message: '저장에 실패했습니다. 다시 시도해 주세요.' });
      fetchInventoryBySelectedDate();
    }
  };

  const handleToggleNormalRoom = async (roomId, nextValue) => {
    const nextIsClosed = !nextValue;
    setNormalRooms(prev =>
      prev.map(room => (room.roomId === roomId ? { ...room, isClosed: nextIsClosed } : room)),
    );
    try {
      await hostGuesthouseApi.updateRoomStatusByDate(guesthouseId, roomId, {
        date: selectedDate,
        isClosed: nextIsClosed,
      });
      Toast.show({
        type: 'success',
        text1: nextIsClosed ? '예약 마감 처리 되었습니다' : '예약 가능 처리 되었습니다',
        position: 'top',
        topOffset: CENTER_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      setErrorModal({ visible: true, message: '저장에 실패했습니다. 다시 시도해 주세요.' });
      fetchInventoryBySelectedDate();
    }
  };

  const handleChangeDormitoryBeds = async (roomId, diff) => {
    const room = dormitoryRooms.find(r => r.roomId === roomId);
    if (!room) {
      return;
    }

    const maxCapacity = Number(room?.roomMaxCapacity ?? 0);
    const reservedBeds = Number(room?.reservedBeds ?? 0);
    const maxSellableBeds =
      maxCapacity > 0 ? Math.max(0, maxCapacity - reservedBeds) : Number.MAX_SAFE_INTEGER;
    const nextBeds = Math.min(maxSellableBeds, Math.max(0, room.displayBeds + diff));

    if (nextBeds === room.displayBeds) {
      return;
    }

    setDormitoryRooms(prev =>
      prev.map(r => (r.roomId === roomId ? { ...r, displayBeds: nextBeds } : r)),
    );

    try {
      await hostGuesthouseApi.updateAvailableBeds(guesthouseId, roomId, {
        date: selectedDate,
        availableBeds: nextBeds,
      });
      Toast.show({
        type: 'success',
        text1: '변경 내용이 저장되었어요.',
        position: 'top',
        topOffset: CENTER_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      setErrorModal({ visible: true, message: '저장에 실패했습니다. 다시 시도해 주세요.' });
      fetchInventoryBySelectedDate();
    }
  };

  return (
    <View style={styles.container}>
      {isCalendarOpen ? (
        <TouchableOpacity
          activeOpacity={1}
          style={styles.searchFilterBackdrop}
          onPress={() => {
            setIsCalendarOpen(false);
          }}
        />
      ) : null}

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        {...panResponder.panHandlers}>

        <View style={styles.stickyHeaderContainer}>
          <View style={styles.dateSelectContainer}>
            <View style={styles.dateSelectBox}>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(prev => shiftDate(prev, -1));
                  setIsCalendarOpen(false);
                }}>
                <ChevronLeft width={24} height={24} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsCalendarOpen(prev => !prev);
                }}>
                <Text style={[FONTS.fs_16_medium]}>
                  {formatLocalDateToDotWithDay(selectedDate)}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setSelectedDate(prev => shiftDate(prev, 1));
                  setIsCalendarOpen(false);
                }}>
                <ChevronRight width={24} height={24} />
              </TouchableOpacity>
            </View>

            {isCalendarOpen ? (
              <View style={styles.calendarContainer}>
                <Calendar
                  current={selectedDate}
                  {...CALENDAR_COMMON_PROPS}
                  markedDates={markedDates}
                  onDayPress={day => {
                    setSelectedDate(day.dateString);
                    setIsCalendarOpen(false);
                  }}
                  theme={CALENDAR_THEME}
                />
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.sectionHeaderRow}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionHeaderTitle]}>도미토리</Text>
          {dormitoryRooms.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.sectionBulkButton}
              onPress={() => {
                navigation.navigate('DormitoryBulkBed', {
                  guesthouseId: guesthouseId,
                  rooms: dormitoryRooms,
                  selectedDate: selectedDate,
                });
              }}>
              <Text style={[FONTS.fs_12_bold, styles.sectionBulkButtonText]}>일괄 변경</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.roomList}>
          {isInventoryLoading ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              객실 정보를 불러오는 중입니다
            </Text>
          ) : inventoryErrorMessage ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              {inventoryErrorMessage}
            </Text>
          ) : dormitoryRooms.length === 0 ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              도미토리 객실이 없습니다
            </Text>
          ) : (
            dormitoryRooms.map(room => {
              const isExposed = !room?.isClosed;
              const roomMaxCapacity = Number(room?.roomMaxCapacity ?? 0);
              const reservedBeds = Number(room?.reservedBeds ?? 0);
              const hasCapacityLimit = roomMaxCapacity > 0;
              const maxAvailableBeds = hasCapacityLimit
                ? Math.max(0, roomMaxCapacity - reservedBeds)
                : Number.MAX_SAFE_INTEGER;
              const canIncreaseBeds =
                !hasCapacityLimit || Number(room?.displayBeds ?? 0) < maxAvailableBeds;

              return (
                <View key={String(room.roomId)} style={styles.roomCard}>
                  <View style={styles.roomTopRow}>
                    <Text
                      style={[FONTS.fs_14_medium, styles.roomName]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {room.name}
                    </Text>
                    <View style={styles.roomRightBox}>
                      <View
                        style={[
                          styles.exposureBadge,
                          isExposed ? styles.exposureBadgeOn : styles.exposureBadgeOff,
                        ]}>
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            isExposed ? styles.exposureTextOn : styles.exposureTextOff,
                          ]}>
                          {isExposed ? '예약 가능' : '예약 마감'}
                        </Text>
                      </View>
                      <Switch
                        value={isExposed}
                        onValueChange={nextValue =>
                          handleToggleDormitoryRoom(room.roomId, nextValue)
                        }
                        trackColor={{
                          false: COLORS.grayscale_300,
                          true: COLORS.primary_blue,
                        }}
                        thumbColor={COLORS.grayscale_0}
                      />
                    </View>
                  </View>

                  <View style={styles.bedControlRow}>
                    <Text style={[FONTS.fs_12_medium, styles.bedControlLabel]}>
                      현재 예약 가능 베드 수
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.bedControlButton}
                      onPress={() => handleChangeDormitoryBeds(room.roomId, -1)}>
                      <MinusIcon width={12} height={12} />
                    </TouchableOpacity>
                    <Text style={[FONTS.fs_12_medium, styles.bedCountText]}>
                      {room.displayBeds}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={canIncreaseBeds ? 0.8 : 1}
                      style={[styles.bedControlButton, !canIncreaseBeds && styles.disabledOpacity]}
                      onPress={() => {
                        if (canIncreaseBeds) {
                          handleChangeDormitoryBeds(room.roomId, 1);
                          return;
                        }

                        if (reservedBeds === 0) {
                          setLimitModal({
                            visible: true,
                            message: `해당 객실의 최대 베드 수는 ${roomMaxCapacity}개입니다.\n${roomMaxCapacity} 이하로 설정해 주세요.`,
                          });
                          return;
                        }

                        setLimitModal({
                          visible: true,
                          message: `현재 ${reservedBeds}개의 예약이 존재합니다.\n예약 가능 베드 수는 최대 ${maxAvailableBeds}개까지 설정할 수 있습니다.`,
                        });
                      }}>
                      <PlusIcon width={12} height={12} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.sectionHeaderRow, styles.normalSectionTitle]}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionHeaderTitle]}>일반 객실</Text>
        </View>
        <View style={styles.roomList}>
          {isInventoryLoading ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              객실 정보를 불러오는 중입니다
            </Text>
          ) : inventoryErrorMessage ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>
              {inventoryErrorMessage}
            </Text>
          ) : normalRooms.length === 0 ? (
            <Text style={[FONTS.fs_14_regular, styles.emptyText]}>일반 객실이 없습니다</Text>
          ) : (
            normalRooms.map(room => {
              const isExposed = !room?.isClosed;

              return (
                <View key={String(room.roomId)} style={styles.roomCard}>
                  <View style={styles.roomTopRow}>
                    <Text
                      style={[FONTS.fs_14_medium, styles.roomName]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {room.name}
                    </Text>
                    <View style={styles.roomRightBox}>
                      <View
                        style={[
                          styles.exposureBadge,
                          isExposed ? styles.exposureBadgeOn : styles.exposureBadgeOff,
                        ]}>
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            isExposed ? styles.exposureTextOn : styles.exposureTextOff,
                          ]}>
                          {isExposed ? '예약 가능' : '예약 마감'}
                        </Text>
                      </View>
                      <Switch
                        value={isExposed}
                        onValueChange={nextValue => handleToggleNormalRoom(room.roomId, nextValue)}
                        trackColor={{
                          false: COLORS.grayscale_300,
                          true: COLORS.primary_blue,
                        }}
                        thumbColor={COLORS.grayscale_0}
                      />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <AlertModal
        visible={errorModal.visible}
        message={errorModal.message}
        buttonText="확인"
        onPress={async () => {
          setErrorModal({ visible: false, message: '' });
          await fetchInventoryBySelectedDate();
        }}
      />

      <AlertModal
        visible={limitModal.visible}
        message={limitModal.message}
        buttonText="확인"
        onPress={() => {
          setLimitModal({ visible: false, message: '' });
        }}
      />

    </View>
  );
};

export default RoomManagement;
