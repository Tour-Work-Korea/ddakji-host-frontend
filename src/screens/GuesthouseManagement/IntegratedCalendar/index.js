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
  getChannelColorStyle,
  normalizeBookingChannel,
} from '@constants/externalReservationSources';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
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

const getApiPayload = response => response?.data?.data ?? response?.data ?? {};

const getApiError = error => ({
  code: error?.response?.data?.code,
  message:
    error?.response?.data?.message ??
    '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
});

const createClientGeneratedId = () =>
  `host-web:${Date.now().toString(36)}:${Math.random()
    .toString(36)
    .slice(2, 10)}`;

const normalizeOptionalText = value => String(value ?? '').trim();
const normalizePhoneDigits = value => String(value ?? '').replace(/\D/g, '');

const normalizeRoom = room => ({
  roomId: room?.roomId ?? room?.id ?? null,
  roomName: room?.roomName ?? room?.name ?? '객실',
  roomType: room?.roomType ?? '',
  baseCapacity: Number(room?.roomCapacity ?? 1),
  minCapacity: Number(room?.roomMinCapacity ?? 1),
  maxCapacity: Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 1),
  capacity: Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 1),
  isVisible: room?.isVisible !== false,
  availabilityReliable: room?.availabilityReliable !== false,
  isClosed:
    room?.manuallyClosed === true ||
    room?.isClosed === true ||
    room?.available === false,
  isReserved:
    room?.reserved === true || Number(room?.availableQuantity ?? 1) === 0,
  remainingCapacity:
    room?.availableQuantity == null
      ? null
      : Math.max(0, Number(room.availableQuantity)),
});

const getRoomAvailabilityForDate = (roomInventories, dateKey) =>
  roomInventories.map(room => {
    const inventory = room.inventoryByDate?.[dateKey] ?? room;
    const availabilityReliable = inventory?.availabilityReliable !== false;
    const isUnavailable =
      inventory?.manuallyClosed === true ||
      inventory?.isClosed === true ||
      inventory?.isVisible === false ||
      inventory?.available === false;
    const availableQuantity =
      inventory?.availableQuantity ??
      inventory?.availableBeds ??
      inventory?.remainingCapacity;

    return {
      ...room,
      isClosed: isUnavailable,
      availabilityReliable,
      isReserved: Number(inventory?.reservedBeds ?? 0) > 0 || isUnavailable,
      remainingCapacity: availabilityReliable
        ? isUnavailable
          ? 0
          : Math.max(0, Number(availableQuantity ?? 0))
        : null,
    };
  });

const getShortRoomName = roomName => {
  const name = String(roomName ?? '객실').replace(/\s/g, '');
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
  const [bookingChannels, setBookingChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [createRequestId, setCreateRequestId] = useState(null);
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
        (calendarDays[selectedDate]?.rooms ?? []).map(normalizeRoom),
        selectedDate,
      ),
    [calendarDays, selectedDate],
  );
  const reservationFormCheckInDate =
    editingExternalReservation?.checkInDate ?? selectedDate;
  const reservationFormRoomAvailability = useMemo(
    () =>
      getRoomAvailabilityForDate(
        (calendarDays[reservationFormCheckInDate]?.rooms ?? []).map(
          normalizeRoom,
        ),
        reservationFormCheckInDate,
      ),
    [calendarDays, reservationFormCheckInDate],
  );

  const openExternalReservationForm = ({reservation = null, roomId = null}) => {
    setEditingExternalReservation(reservation);
    setCreateRequestId(reservation ? null : createClientGeneratedId());
    setPreferredExternalRoomId(roomId);
    setIsAddReservationVisible(true);
  };

  const handleOpenExternalReservationEdit = async reservation => {
    try {
      const response = await hostGuesthouseApi.getExternalReservation(
        guesthouseId,
        reservation.reservationId ?? reservation.id,
      );
      const latestReservation = {
        ...reservation,
        ...getApiPayload(response),
      };

      openExternalReservationForm({
        reservation: latestReservation,
        roomId: latestReservation.roomId ?? null,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getApiError(error).message,
        position: 'top',
      });
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCalendarDays = async () => {
      if (!guesthouseId) {
        setCalendarDays({});
        return;
      }

      setIsLoading(true);
      try {
        const [calendarResponse, channelsResponse] = await Promise.all([
          hostGuesthouseApi.getIntegratedCalendar(
            guesthouseId,
            rangeStart,
            rangeEnd,
          ),
          hostGuesthouseApi.getBookingChannels(guesthouseId),
        ]);
        const payload = getApiPayload(calendarResponse);
        const days = Array.isArray(payload?.days) ? payload.days : [];
        const channelsPayload = getApiPayload(channelsResponse);
        const nextCalendarDays = days.reduce((acc, item) => {
          if (item?.date) {
            acc[item.date] = item;
          }
          return acc;
        }, {});

        if (isMounted) {
          setCalendarDays(nextCalendarDays);
          setBookingChannels(
            (Array.isArray(channelsPayload) ? channelsPayload : [])
              .filter(channel => channel?.active !== false)
              .map(normalizeBookingChannel),
          );
        }
      } catch (error) {
        if (isMounted) {
          setCalendarDays({});
          Toast.show({
            type: 'error',
            text1: getApiError(error).message,
            position: 'top',
          });
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
  }, [guesthouseId, rangeEnd, rangeStart, refreshKey]);

  const moveMonth = amount => {
    setVisibleMonth(
      current =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1),
    );
  };

  const handlePressDate = cell => {
    setSelectedDate(cell.dateKey);

    if (!cell.isCurrentMonth) {
      setVisibleMonth(
        new Date(cell.date.getFullYear(), cell.date.getMonth(), 1),
      );
    }

    setIsDetailVisible(true);
  };

  const handleSaveExternalReservation = async reservation => {
    const isEditing = Boolean(editingExternalReservation);
    try {
      if (isEditing) {
        const updatePayload = {
          version: editingExternalReservation.version,
        };
        if (
          String(editingExternalReservation.channelId) !==
          String(reservation.channelId)
        ) {
          updatePayload.channelId = reservation.channelId;
        }
        if (
          String(editingExternalReservation.roomId) !==
          String(reservation.roomId)
        ) {
          updatePayload.roomId = reservation.roomId;
        }
        if (
          editingExternalReservation.checkOutDate !== reservation.checkOutDate
        ) {
          updatePayload.checkOutDate = reservation.checkOutDate;
        }
        if (
          Number(editingExternalReservation.guestCount) !==
          Number(reservation.guestCount)
        ) {
          updatePayload.guestCount = reservation.guestCount;
        }
        if (
          normalizeOptionalText(editingExternalReservation.guestName) !==
          reservation.guestName
        ) {
          updatePayload.guestName = reservation.guestName || null;
        }
        if (
          normalizePhoneDigits(editingExternalReservation.guestPhone) !==
          normalizePhoneDigits(reservation.guestPhone)
        ) {
          updatePayload.guestPhone = reservation.guestPhone || null;
        }
        if (
          normalizeOptionalText(editingExternalReservation.memo) !==
          reservation.memo
        ) {
          updatePayload.memo = reservation.memo || null;
        }

        await hostGuesthouseApi.updateExternalReservation(
          guesthouseId,
          editingExternalReservation.reservationId ??
            editingExternalReservation.id,
          updatePayload,
        );
      } else {
        await hostGuesthouseApi.createExternalReservation(guesthouseId, {
          channelId: reservation.channelId,
          roomId: reservation.roomId,
          checkInDate: reservation.checkInDate,
          checkOutDate: reservation.checkOutDate,
          guestCount: reservation.guestCount,
          guestName: reservation.guestName || null,
          guestPhone: reservation.guestPhone || null,
          memo: reservation.memo || null,
          clientGeneratedId: createRequestId,
        });
      }
      setPreferredExternalRoomId(null);
      setEditingExternalReservation(null);
      setCreateRequestId(null);
      setIsAddReservationVisible(false);
      setIsDetailVisible(false);
      setRefreshKey(value => value + 1);
      Toast.show({
        type: 'success',
        text1: isEditing ? '예약을 수정했습니다.' : '예약을 등록했습니다.',
        position: 'top',
      });
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError.code === 'STALE_RESERVATION_VERSION') {
        try {
          const latestResponse = await hostGuesthouseApi.getExternalReservation(
            guesthouseId,
            editingExternalReservation.reservationId ??
              editingExternalReservation.id,
          );
          setEditingExternalReservation(getApiPayload(latestResponse));
        } catch (refreshError) {}
      }
      Toast.show({type: 'error', text1: apiError.message, position: 'top'});
    }
  };

  const handleCancelExternalReservation = async reservation => {
    try {
      const detailResponse = await hostGuesthouseApi.getExternalReservation(
        guesthouseId,
        reservation.reservationId ?? reservation.id,
      );
      const latestReservation = getApiPayload(detailResponse);

      await hostGuesthouseApi.cancelExternalReservation(
        guesthouseId,
        latestReservation.reservationId ??
          reservation.reservationId ??
          reservation.id,
        latestReservation.version,
      );
      setRefreshKey(value => value + 1);
      Toast.show({
        type: 'success',
        text1: '예약을 취소했습니다.',
        position: 'top',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: getApiError(error).message,
        position: 'top',
      });
      throw error;
    }
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
            {' '}
            {visibleMonth.getFullYear()}년 {visibleMonth.getMonth() + 1}월
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
              const reservationBadges = [
                ...(daySummary.confirmedSources ?? []),
                ...(daySummary.completedSources ?? []),
              ]
                .filter(source => Number(source?.count ?? 0) > 0)
                .reduce((badges, source) => {
                  const value = source.channelKey ?? source.sourceType;
                  const existingBadge = badges.find(
                    badge => badge.value === value,
                  );
                  if (existingBadge) {
                    existingBadge.count += Number(source.count);
                    return badges;
                  }

                  badges.push({
                    value,
                    label: source.channelLabel,
                    count: Number(source.count),
                    ...(source.sourceType === 'DDAKJI'
                      ? {
                          backgroundColor:
                            DDAKJI_RESERVATION_SOURCE.backgroundColor,
                          textColor: DDAKJI_RESERVATION_SOURCE.textColor,
                        }
                      : getChannelColorStyle(source.channelColorKey)),
                  });
                  return badges;
                }, []);
              const ddakjiBadge = reservationBadges.find(
                badge => badge.value === 'DDAKJI',
              );
              const externalSourceCounts = reservationBadges.filter(
                badge => badge.value !== 'DDAKJI',
              );
              const visibleReservationBadges =
                reservationBadges.length <= 4
                  ? reservationBadges
                  : [
                      ...(ddakjiBadge ? [ddakjiBadge] : []),
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
                (daySummary.rooms ?? []).map(normalizeRoom),
                cell.dateKey,
              );
              const hasInventory =
                daySummary.availabilityReliable !== false &&
                roomAvailability.length > 0;
              const roomSummary = getRoomAvailabilitySummary(roomAvailability);
              const visibleRoomSummary = roomSummary.slice(0, 4);
              const hiddenRoomCount = Math.max(0, roomSummary.length - 4);
              const isTotalView = availabilityView === AVAILABILITY_VIEWS.TOTAL;

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

        {isLoading ? (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator color={COLORS.primary_orange} size="small" />
          </View>
        ) : null}
      </View>

      <Modal
        visible={isDetailVisible || isAddReservationVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setIsAddReservationVisible(false);
          setIsDetailVisible(false);
        }}>
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => {
              setIsAddReservationVisible(false);
              setIsDetailVisible(false);
            }}
          />
          {isAddReservationVisible ? (
            <ExternalReservationForm
              key={editingExternalReservation?.id ?? 'new-external-reservation'}
              guesthouseId={guesthouseId}
              checkInDate={reservationFormCheckInDate}
              initialRoomId={preferredExternalRoomId}
              initialReservation={editingExternalReservation}
              bookingChannels={bookingChannels}
              roomAvailability={reservationFormRoomAvailability}
              onCancel={() => {
                setPreferredExternalRoomId(null);
                setEditingExternalReservation(null);
                setIsAddReservationVisible(false);
                setIsDetailVisible(false);
              }}
              onSave={handleSaveExternalReservation}
            />
          ) : (
            <IntegratedReservationDayModal
              guesthouseId={guesthouseId}
              targetDate={selectedDate}
              roomAvailability={selectedRoomAvailability}
              refreshKey={refreshKey}
              onClose={() => setIsDetailVisible(false)}
              onAdd={selectedRoom => {
                openExternalReservationForm({
                  roomId: selectedRoom?.roomId ?? null,
                });
              }}
              onEditExternal={handleOpenExternalReservationEdit}
              onDeleteExternal={handleCancelExternalReservation}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default IntegratedCalendar;
