import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import {COLORS} from '@constants/colors';
import {
  DDAKJI_RESERVATION_SOURCE,
  EXTERNAL_RESERVATION_SOURCES,
} from '@constants/externalReservationSources';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {
  addExternalReservation,
  getExternalReservations,
  removeExternalReservation,
  updateExternalReservation,
} from '@utils/externalReservationStorage';
import ChevronLeftIcon from '@assets/images/chevron_left_gray.svg';
import ChevronRightIcon from '@assets/images/chevron_right_gray.svg';
import ExternalReservationForm from './ExternalReservationForm';
import IntegratedReservationDayModal from './IntegratedReservationDayModal';

import styles from './IntegratedCalendar.styles';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const AVAILABILITY_VIEWS = {
  TOTAL: 'TOTAL',
  ROOM: 'ROOM',
};

const formatDateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDateKey = () => formatDateKey(new Date());

const normalizeRoom = room => ({
  roomId: room?.roomId ?? room?.id ?? null,
  roomName: room?.roomName ?? room?.name ?? '객실',
  roomType: room?.roomType ?? '',
  baseCapacity: Number(room?.roomCapacity ?? 1),
  minCapacity: Number(room?.roomMinCapacity ?? 1),
  maxCapacity: Number(
    room?.roomMaxCapacity ?? room?.roomCapacity ?? 1,
  ),
  capacity: Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 1),
  isVisible: room?.isVisible !== false,
});

const getRoomAvailabilityForDate = (
  roomInventories,
  externalReservations,
  dateKey,
) =>
  roomInventories.map(room => {
    const inventory = room.inventoryByDate?.[dateKey];
    const isUnavailable =
      !inventory || inventory?.isClosed === true || inventory?.isVisible === false;
    const serverAvailableCapacity = Math.max(
      0,
      Number(inventory?.availableBeds ?? 0),
    );
    const matchingExternalReservations = externalReservations.filter(
      reservation =>
        String(reservation?.roomId) === String(room.roomId) &&
        reservation?.checkInDate <= dateKey &&
        reservation?.checkOutDate > dateKey,
    );
    const externalReservedCapacity = externalReservations.reduce(
      (total, reservation) => {
        const isMatchingRoom =
          String(reservation?.roomId) === String(room.roomId);
        const isStaying =
          reservation?.checkInDate <= dateKey &&
          reservation?.checkOutDate > dateKey;

        return isMatchingRoom && isStaying
          ? total + Number(reservation?.guestCount ?? 0)
          : total;
      },
      0,
    );

    return {
      ...room,
      isClosed: isUnavailable,
      isReserved:
        Number(inventory?.reservedBeds ?? 0) > 0 ||
        matchingExternalReservations.length > 0,
      remainingCapacity: isUnavailable
        ? 0
        : Math.max(0, serverAvailableCapacity - externalReservedCapacity),
    };
  });

const getShortRoomName = roomName => {
  const name = String(roomName ?? '객실').replace(/\s/g, '');
  const isDormitory = /도미토리|도미/.test(name);

  if (/여자|여성/.test(name)) {
    return isDormitory ? '여도미' : '여성';
  }
  if (/남자|남성/.test(name)) {
    return isDormitory ? '남도미' : '남성';
  }
  if (isDormitory) {
    return '도미';
  }
  return name.slice(0, 3);
};

const getRoomAvailabilitySummary = roomAvailability =>
  [...roomAvailability]
    .sort((firstRoom, secondRoom) => {
      const firstCapacity = firstRoom.isClosed
        ? -1
        : firstRoom.remainingCapacity;
      const secondCapacity = secondRoom.isClosed
        ? -1
        : secondRoom.remainingCapacity;
      return firstCapacity - secondCapacity;
    })
    .map(room => ({
      ...room,
      shortName: getShortRoomName(room.roomName),
    }));

const getMonthCells = visibleMonth => {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const leadingDays = firstDay.getDay();
  const cellCount = Math.max(
    35,
    Math.ceil((leadingDays + lastDay.getDate()) / 7) * 7,
  );

  return Array.from({length: cellCount}, (_, index) => {
    const date = new Date(year, month, index - leadingDays + 1);
    return {
      date,
      dateKey: formatDateKey(date),
      day: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

const IntegratedCalendar = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const guesthouseId = route.params?.guesthouseId ?? null;
  const guesthouseName = route.params?.guesthouseName || '게스트하우스';
  const todayDateKey = getTodayDateKey();

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(todayDateKey);
  const [calendarDays, setCalendarDays] = useState({});
  const [roomInventories, setRoomInventories] = useState([]);
  const [externalReservations, setExternalReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [availabilityView, setAvailabilityView] = useState(
    AVAILABILITY_VIEWS.TOTAL,
  );
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [isAddReservationVisible, setIsAddReservationVisible] = useState(false);
  const [preferredExternalRoomId, setPreferredExternalRoomId] = useState(null);
  const [editingExternalReservation, setEditingExternalReservation] =
    useState(null);

  const monthCells = useMemo(() => getMonthCells(visibleMonth), [visibleMonth]);
  const weeks = useMemo(() => {
    const nextWeeks = [];
    for (let index = 0; index < monthCells.length; index += 7) {
      nextWeeks.push(monthCells.slice(index, index + 7));
    }
    return nextWeeks;
  }, [monthCells]);
  const rangeStart = monthCells[0]?.dateKey;
  const rangeEnd = monthCells[monthCells.length - 1]?.dateKey;
  const selectedRoomAvailability = useMemo(
    () =>
      getRoomAvailabilityForDate(
        roomInventories,
        externalReservations,
        selectedDate,
      ),
    [externalReservations, roomInventories, selectedDate],
  );
  const reservationFormExternalReservations = useMemo(
    () =>
      editingExternalReservation
        ? externalReservations.filter(
            reservation =>
              String(reservation?.id) !==
              String(editingExternalReservation.id),
          )
        : externalReservations,
    [editingExternalReservation, externalReservations],
  );
  const reservationFormCheckInDate =
    editingExternalReservation?.checkInDate ?? selectedDate;
  const reservationFormRoomAvailability = useMemo(
    () =>
      getRoomAvailabilityForDate(
        roomInventories,
        reservationFormExternalReservations,
        reservationFormCheckInDate,
      ),
    [
      reservationFormCheckInDate,
      reservationFormExternalReservations,
      roomInventories,
    ],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchCalendarDays = async () => {
      if (!guesthouseId) {
        setCalendarDays({});
        return;
      }

      setIsLoading(true);
      try {
        const response = await hostGuesthouseApi.getGuesthouseReservationCalendar({
          guesthouseId,
          from: rangeStart,
          to: rangeEnd,
        });
        const payload = response?.data?.data ?? response?.data ?? [];
        const days = Array.isArray(payload) ? payload : [];
        const nextCalendarDays = days.reduce((acc, item) => {
          if (item?.date) {
            acc[item.date] = item;
          }
          return acc;
        }, {});

        if (isMounted) {
          setCalendarDays(nextCalendarDays);
        }
      } catch (error) {
        if (isMounted) {
          setCalendarDays({});
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCalendarDays();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, rangeEnd, rangeStart]);

  useEffect(() => {
    let isMounted = true;

    const fetchRoomInventories = async () => {
      if (!guesthouseId || !rangeStart || !rangeEnd) {
        setRoomInventories([]);
        return;
      }

      setIsInventoryLoading(true);
      try {
        const guesthouseResponse =
          await hostGuesthouseApi.getMyGuesthousesWithRooms();
        const payload =
          guesthouseResponse?.data?.data ?? guesthouseResponse?.data ?? [];
        const guesthouses = Array.isArray(payload) ? payload : [];
        const selectedGuesthouse = guesthouses.find(
          item => String(item?.guesthouseId) === String(guesthouseId),
        );
        const rooms = Array.isArray(selectedGuesthouse?.rooms)
          ? selectedGuesthouse.rooms
              .map(normalizeRoom)
              .filter(room => room.roomId != null && room.isVisible)
          : [];

        const nextRoomInventories = await Promise.all(
          rooms.map(async room => {
            try {
              const response = await hostGuesthouseApi.getRoomInventoryCalendar(
                guesthouseId,
                room.roomId,
                rangeStart,
                rangeEnd,
              );
              const inventoryPayload =
                response?.data?.data ?? response?.data ?? [];
              const inventories = Array.isArray(inventoryPayload)
                ? inventoryPayload
                : inventoryPayload?.inventories ?? [];
              const inventoryByDate = inventories.reduce((acc, inventory) => {
                if (inventory?.date) {
                  acc[inventory.date] = inventory;
                }
                return acc;
              }, {});

              return {...room, inventoryByDate};
            } catch (error) {
              return {...room, inventoryByDate: {}};
            }
          }),
        );

        if (isMounted) {
          setRoomInventories(nextRoomInventories);
        }
      } catch (error) {
        if (isMounted) {
          setRoomInventories([]);
        }
      } finally {
        if (isMounted) {
          setIsInventoryLoading(false);
        }
      }
    };

    fetchRoomInventories();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, rangeEnd, rangeStart]);

  useEffect(() => {
    let isMounted = true;

    const loadExternalReservations = async () => {
      const reservations = await getExternalReservations(guesthouseId);
      if (isMounted) {
        setExternalReservations(reservations);
      }
    };

    loadExternalReservations();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId]);

  const moveMonth = amount => {
    setVisibleMonth(
      current => new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const handlePressDate = cell => {
    setSelectedDate(cell.dateKey);

    if (!cell.isCurrentMonth) {
      setVisibleMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }

    setIsDetailVisible(true);
  };

  const handleSaveExternalReservation = async reservation => {
    const isEditing = Boolean(editingExternalReservation);
    const nextReservations = isEditing
      ? await updateExternalReservation(
          guesthouseId,
          editingExternalReservation.id,
          reservation,
        )
      : await addExternalReservation(guesthouseId, reservation);
    setExternalReservations(nextReservations);
    setPreferredExternalRoomId(null);
    setEditingExternalReservation(null);
    setIsAddReservationVisible(false);
    setIsDetailVisible(true);
    if (isEditing) {
      Toast.show({
        type: 'success',
        text1: '예약을 수정했습니다.',
        position: 'top',
      });
    }
  };

  const handleDeleteExternalReservation = async reservationId => {
    const nextReservations = await removeExternalReservation(
      guesthouseId,
      reservationId,
    );
    setExternalReservations(nextReservations);
    Toast.show({
      type: 'success',
      text1: '예약을 삭제했습니다.',
      position: 'top',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeftIcon width={28} height={28} />
        </TouchableOpacity>

        <View style={styles.calendarTitleRow}>
          <Text
            style={[FONTS.fs_18_semibold, styles.guesthouseTitle]}
            numberOfLines={1}>
            {guesthouseName}
          </Text>
          <Text style={[FONTS.fs_18_semibold, styles.monthTitle]}>
            {' '}{visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
          </Text>
        </View>

        <View style={styles.monthActions}>
          <TouchableOpacity
            style={styles.monthMoveButton}
            activeOpacity={0.7}
            onPress={() => moveMonth(-1)}>
            <ChevronLeftIcon width={22} height={22} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.monthMoveButton}
            activeOpacity={0.7}
            onPress={() => moveMonth(1)}>
            <ChevronRightIcon width={22} height={22} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.viewToggleBar}>
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              availabilityView === AVAILABILITY_VIEWS.TOTAL &&
                styles.viewToggleButtonSelected,
            ]}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{
              selected: availabilityView === AVAILABILITY_VIEWS.TOTAL,
            }}
            onPress={() => setAvailabilityView(AVAILABILITY_VIEWS.TOTAL)}>
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.viewToggleText,
                availabilityView === AVAILABILITY_VIEWS.TOTAL &&
                  styles.viewToggleTextSelected,
              ]}>
              전체
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewToggleButton,
              availabilityView === AVAILABILITY_VIEWS.ROOM &&
                styles.viewToggleButtonSelected,
            ]}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{
              selected: availabilityView === AVAILABILITY_VIEWS.ROOM,
            }}
            onPress={() => setAvailabilityView(AVAILABILITY_VIEWS.ROOM)}>
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.viewToggleText,
                availabilityView === AVAILABILITY_VIEWS.ROOM &&
                  styles.viewToggleTextSelected,
              ]}>
              객실별
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((weekday, index) => (
          <View key={weekday} style={styles.weekdayCell}>
            <Text
              style={[
                FONTS.fs_12_medium,
                styles.weekdayText,
                index === 0 && styles.sundayText,
              ]}>
              {weekday}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.calendarGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.weekRow}>
            {week.map((cell, dayIndex) => {
              const isSelected = selectedDate === cell.dateKey;
              const daySummary = calendarDays[cell.dateKey] ?? {};
              const confirmedReservationCount = Math.max(
                0,
                Number(daySummary.confirmedCount ?? 0),
              );
              const externalSourceCounts = EXTERNAL_RESERVATION_SOURCES.map(
                source => ({
                  ...source,
                  count: externalReservations.filter(
                    reservation =>
                      reservation?.source === source.value &&
                      reservation?.checkInDate <= cell.dateKey &&
                      reservation?.checkOutDate > cell.dateKey,
                  ).length,
                }),
              ).filter(source => source.count > 0);
              const reservationBadges = [
                ...(confirmedReservationCount > 0
                  ? [
                      {
                        value: DDAKJI_RESERVATION_SOURCE.value,
                        label: DDAKJI_RESERVATION_SOURCE.label,
                        count: confirmedReservationCount,
                        backgroundColor:
                          DDAKJI_RESERVATION_SOURCE.backgroundColor,
                        textColor: DDAKJI_RESERVATION_SOURCE.textColor,
                      },
                    ]
                  : []),
                ...externalSourceCounts,
              ];
              const visibleReservationBadges =
                reservationBadges.length <= 2
                  ? reservationBadges
                  : [
                      ...(confirmedReservationCount > 0
                        ? [reservationBadges[0]]
                        : []),
                      {
                        value: 'EXTERNAL_SUMMARY',
                        label: '외부',
                        count: externalSourceCounts.reduce(
                          (total, source) => total + source.count,
                          0,
                        ),
                        backgroundColor: COLORS.secondary_blue,
                        textColor: COLORS.primary_blue,
                      },
                    ];
              const roomAvailability = getRoomAvailabilityForDate(
                roomInventories,
                externalReservations,
                cell.dateKey,
              );
              const totalRemainingCapacity = roomAvailability.reduce(
                (total, room) => total + room.remainingCapacity,
                0,
              );
              const hasInventory = roomAvailability.length > 0;
              const roomSummary = getRoomAvailabilitySummary(roomAvailability);
              const visibleRoomSummary = roomSummary.slice(0, 4);
              const hiddenRoomCount = Math.max(0, roomSummary.length - 4);
              const isTotalView =
                availabilityView === AVAILABILITY_VIEWS.TOTAL;

              return (
                <TouchableOpacity
                  key={cell.dateKey}
                  style={[
                    styles.dayCell,
                    dayIndex === 6 && styles.lastDayCell,
                    weekIndex === weeks.length - 1 && styles.lastWeekCell,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handlePressDate(cell)}>
                  <View
                    style={[
                      styles.dayNumberWrap,
                      isSelected && styles.dayNumberWrapSelected,
                    ]}>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.dayNumber,
                        dayIndex === 0 && styles.sundayText,
                        !cell.isCurrentMonth && styles.otherMonthText,
                        isSelected && styles.selectedDayText,
                      ]}>
                      {cell.day}
                    </Text>
                  </View>

                  {isTotalView && hasInventory ? (
                    <View
                      style={[
                        styles.availabilityBadge,
                        totalRemainingCapacity === 0
                          ? styles.soldOutBadge
                          : totalRemainingCapacity <= 2
                            ? styles.lowAvailabilityBadge
                            : styles.availableBadge,
                      ]}>
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.availabilityBadgeText,
                          totalRemainingCapacity === 0
                            ? styles.soldOutBadgeText
                            : totalRemainingCapacity <= 2
                              ? styles.lowAvailabilityBadgeText
                              : styles.availableBadgeText,
                        ]}
                        numberOfLines={1}>
                        {totalRemainingCapacity === 0
                          ? '만실'
                          : `잔여 ${totalRemainingCapacity}`}
                      </Text>
                    </View>
                  ) : null}

                  {!isTotalView && hasInventory ? (
                    <View style={styles.roomSummaryList}>
                      {visibleRoomSummary.map(room => {
                        const isUnavailable =
                          room.isClosed || room.remainingCapacity === 0;
                        return (
                          <Text
                            key={String(room.roomId)}
                            style={[
                              styles.roomSummaryText,
                              isUnavailable && styles.roomSummarySoldOutText,
                            ]}
                            numberOfLines={1}>
                            {room.shortName}{' '}
                            {room.isClosed ? '마감' : room.remainingCapacity}
                          </Text>
                        );
                      })}
                      {hiddenRoomCount > 0 ? (
                        <Text
                          style={styles.hiddenRoomCountText}
                          numberOfLines={1}>
                          +{hiddenRoomCount}개 객실
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  {isTotalView &&
                    visibleReservationBadges.map(badge => (
                    <View
                      key={badge.value}
                      style={[
                        styles.reservationBadge,
                        styles.externalReservationBadge,
                        {backgroundColor: badge.backgroundColor},
                      ]}>
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.reservationBadgeText,
                          {color: badge.textColor},
                        ]}
                        numberOfLines={1}>
                        {badge.label} {badge.count}
                      </Text>
                    </View>
                    ))}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}

        {isLoading || isInventoryLoading ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color={COLORS.primary_orange} size="small" />
          </View>
        ) : null}
      </View>

      <Modal
        visible={isDetailVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDetailVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsDetailVisible(false)}
          />
          <IntegratedReservationDayModal
            guesthouseId={guesthouseId}
            targetDate={selectedDate}
            externalReservations={externalReservations}
            roomAvailability={selectedRoomAvailability}
            onClose={() => setIsDetailVisible(false)}
            onAdd={selectedRoom => {
              setEditingExternalReservation(null);
              setPreferredExternalRoomId(selectedRoom?.roomId ?? null);
              setIsDetailVisible(false);
              setIsAddReservationVisible(true);
            }}
            onEditExternal={reservation => {
              setEditingExternalReservation(reservation);
              setPreferredExternalRoomId(reservation.roomId ?? null);
              setIsDetailVisible(false);
              setIsAddReservationVisible(true);
            }}
            onDeleteExternal={handleDeleteExternalReservation}
          />
        </View>
      </Modal>

      <Modal
        visible={isAddReservationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsAddReservationVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setIsAddReservationVisible(false)}
          />
          <ExternalReservationForm
            key={editingExternalReservation?.id ?? 'new-external-reservation'}
            guesthouseId={guesthouseId}
            checkInDate={reservationFormCheckInDate}
            initialRoomId={preferredExternalRoomId}
            initialReservation={editingExternalReservation}
            roomAvailability={reservationFormRoomAvailability}
            externalReservations={reservationFormExternalReservations}
            onCancel={() => {
              setPreferredExternalRoomId(null);
              setEditingExternalReservation(null);
              setIsAddReservationVisible(false);
            }}
            onSave={handleSaveExternalReservation}
          />
        </View>
      </Modal>
    </View>
  );
};

export default IntegratedCalendar;
