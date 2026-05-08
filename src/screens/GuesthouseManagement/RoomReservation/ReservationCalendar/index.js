import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {useNavigation} from '@react-navigation/native';

import EmptyState from '@components/EmptyState';
import {CALENDAR_COMMON_PROPS, CALENDAR_THEME} from '@constants/calendarConfig';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {formatLocalDateToDot, formatLocalDateToDotWithDay} from '@utils/formatDate';
import styles from './ReservationCalendar.styles';

const RESERVATION_STATUS_STYLE = {
  대기: {
    badgeBackground: COLORS.secondary_yellow,
    badgeText: COLORS.semantic_yellow,
    label: '예약 대기',
  },
  확정: {
    badgeBackground: COLORS.secondary_blue,
    badgeText: COLORS.semantic_blue,
    label: '예약 확정',
  },
  취소: {
    badgeBackground: COLORS.secondary_red,
    badgeText: COLORS.primary_orange,
    label: '예약 취소',
  },
  완료: {
    badgeBackground: COLORS.grayscale_300,
    badgeText: COLORS.grayscale_0,
    label: '이용 완료',
  },
};

const STATUS_LABEL_MAP = {
  PENDING: '대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
  COMPLETED: '완료',
};
const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const DEFAULT_FLAG_STATE = {
  today: getTodayLocalDate(),
  flagsByDate: {},
};

const getNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) return 1;
  const diff = new Date(checkOutDate) - new Date(checkInDate);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const formatSelectedDateTitle = localDate => {
  return formatLocalDateToDotWithDay(localDate).replace(' (', ' ').replace(')', '');
};

const normalizeReservation = (reservation = {}) => {
  const status = STATUS_LABEL_MAP[reservation?.status] || reservation?.status || '완료';
  const checkInDate = reservation?.checkInDate?.split?.('T')?.[0] ?? reservation?.checkInDate;
  const checkOutDate =
    reservation?.checkOutDate?.split?.('T')?.[0] ?? reservation?.checkOutDate;

  return {
    ...reservation,
    id: reservation?.reservationId ?? reservation?.id,
    reservationId: reservation?.reservationId ?? reservation?.id,
    status,
    roomName: reservation?.roomName ?? reservation?.room ?? '-',
    checkInDate,
    checkOutDate,
  };
};

const ReservationCalendar = ({guesthouseId}) => {
  const navigation = useNavigation();

  const [selectedDate, setSelectedDate] = useState(getTodayLocalDate());
  const [visibleMonth, setVisibleMonth] = useState(getTodayLocalDate().slice(0, 7));
  const [reservations, setReservations] = useState([]);
  const [calendarFlags, setCalendarFlags] = useState(DEFAULT_FLAG_STATE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFlagsLoading, setIsFlagsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (!guesthouseId) {
      setReservations([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setCurrentPage(DEFAULT_PAGE);
      setHasNextPage(false);
      return;
    }

    const fetchReservations = async (page = DEFAULT_PAGE, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      try {
        const response = await hostGuesthouseApi.searchGuesthouseReservations({
          guesthouseId,
          targetDate: selectedDate,
          page,
          size: DEFAULT_SIZE,
        });
        const payload = response?.data?.data ?? response?.data ?? {};
        const list =
          payload?.reservations ??
          payload?.content ??
          (Array.isArray(payload) ? payload : null) ??
          response?.data?.reservations ??
          response?.data?.content ??
          (Array.isArray(response?.data) ? response.data : null) ??
          [];

        const safeList = Array.isArray(list) ? list.map(normalizeReservation) : [];
        setReservations(prev => (append ? [...prev, ...safeList] : safeList));
        setHasNextPage(Boolean(payload?.hasNext));
        setCurrentPage(
          Number.isFinite(Number(payload?.currentPage))
            ? Number(payload.currentPage)
            : page,
        );
      } catch (error) {
        if (!append) {
          setReservations([]);
          setHasNextPage(false);
          setCurrentPage(DEFAULT_PAGE);
        }
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    };

    fetchReservations(DEFAULT_PAGE, false);
  }, [guesthouseId, selectedDate]);

  useEffect(() => {
    if (!guesthouseId || !visibleMonth) {
      setCalendarFlags(DEFAULT_FLAG_STATE);
      setIsFlagsLoading(false);
      return;
    }

    const fetchCalendarFlags = async () => {
      setIsFlagsLoading(true);
      try {
        const response = await hostGuesthouseApi.getGuesthouseReservationCalendarFlags({
          guesthouseId,
          yearMonth: visibleMonth,
        });
        const payload = response?.data?.data ?? response?.data ?? {};
        const days = Array.isArray(payload?.days) ? payload.days : [];

        setCalendarFlags({
          today: payload?.today ?? getTodayLocalDate(),
          flagsByDate: days.reduce((acc, dayFlag) => {
            if (dayFlag?.date) {
              acc[dayFlag.date] = Boolean(dayFlag.hasReservation);
            }
            return acc;
          }, {}),
        });
      } catch (error) {
        setCalendarFlags(DEFAULT_FLAG_STATE);
      } finally {
        setIsFlagsLoading(false);
      }
    };

    fetchCalendarFlags();
  }, [guesthouseId, visibleMonth]);

  const loadNextPage = async () => {
    if (isLoading || isLoadingMore || !hasNextPage || !guesthouseId) return;

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await hostGuesthouseApi.searchGuesthouseReservations({
        guesthouseId,
        targetDate: selectedDate,
        page: nextPage,
        size: DEFAULT_SIZE,
      });
      const payload = response?.data?.data ?? response?.data ?? {};
      const list =
        payload?.reservations ??
        payload?.content ??
        (Array.isArray(payload) ? payload : null) ??
        response?.data?.reservations ??
        response?.data?.content ??
        (Array.isArray(response?.data) ? response.data : null) ??
        [];
      const safeList = Array.isArray(list) ? list.map(normalizeReservation) : [];
      setReservations(prev => [...prev, ...safeList]);
      setHasNextPage(Boolean(payload?.hasNext));
      setCurrentPage(
        Number.isFinite(Number(payload?.currentPage))
          ? Number(payload.currentPage)
          : nextPage,
      );
    } catch (error) {
      setHasNextPage(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderDay = ({date, state}) => {
    if (!date) return <View style={styles.dayCellContainer} />;

    const dateString = date.dateString;
    const isSelected = dateString === selectedDate;
    const hasReservation = Boolean(calendarFlags.flagsByDate?.[dateString]);
    const isPastDate = dateString < calendarFlags.today;
    const isDisabled = state === 'disabled';

    return (
      <Pressable
        onPress={() => setSelectedDate(dateString)}
        style={[
          styles.dayCellContainer,
          hasReservation && styles.dayCellContainerFlagged,
          isDisabled && styles.dayCellContainerDisabled,
        ]}>
        <View
          style={[
            styles.dayNumberWrap,
            isSelected && styles.dayNumberWrapSelected,
          ]}>
          <Text
            style={[
              styles.dayNumberText,
              isDisabled && styles.dayNumberTextDisabled,
              isSelected && styles.dayNumberTextSelected,
            ]}>
            {date.day}
          </Text>
        </View>

        {hasReservation ? (
          <View
            style={[
              styles.dayDot,
              isPastDate ? styles.dayDotPast : styles.dayDotFuture,
              isSelected && styles.dayDotSelected,
            ]}
          />
        ) : (
          <View style={styles.dayDotSpacer} />
        )}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.body}>
        <View style={styles.calendarContainer}>
          <Calendar
            current={selectedDate}
            {...CALENDAR_COMMON_PROPS}
            onDayPress={day => setSelectedDate(day.dateString)}
            onMonthChange={month =>
              setVisibleMonth(
                `${month.year}-${String(month.month).padStart(2, '0')}`,
              )
            }
            dayComponent={renderDay}
            theme={{
              ...CALENDAR_THEME,
              textMonthFontSize: 18,
              textDayFontSize: 16,
              textDayHeaderFontSize: 12,
            }}
          />
          {isFlagsLoading ? <View style={styles.flagsLoadingOverlay} /> : null}
        </View>

        <View style={styles.listContainer}>
          <Text style={[FONTS.fs_16_medium, styles.listDateTitle]}>
            {formatSelectedDateTitle(selectedDate)}
          </Text>

          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={COLORS.primary_orange} size="small" />
            </View>
          ) : reservations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState
                title="예약 내역이 없어요"
                description=""
              />
            </View>
          ) : (
            <FlatList
              data={reservations}
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) => String(item.reservationId || item.id || index)}
              onEndReached={loadNextPage}
              onEndReachedThreshold={0.3}
              ListFooterComponent={
                isLoadingMore ? (
                  <View style={styles.footerLoading}>
                    <ActivityIndicator color={COLORS.primary_orange} size="small" />
                  </View>
                ) : null
              }
              renderItem={({item: reservation, index}) => {
                const statusStyle =
                  RESERVATION_STATUS_STYLE[reservation.status] || RESERVATION_STATUS_STYLE.완료;
                const nights = getNights(reservation.checkInDate, reservation.checkOutDate);

                return (
                  <TouchableOpacity
                    key={String(reservation.reservationId || reservation.id || index)}
                    activeOpacity={0.85}
                    style={styles.reservationItem}
                    onPress={() =>
                      navigation.navigate('MyGuesthouseReservationDetail', {
                        reservationId: reservation.reservationId || reservation.id,
                        reservation: {
                          ...reservation,
                          room: reservation.roomName,
                          period: `${formatLocalDateToDot(
                            reservation.checkInDate,
                          )} ~ ${formatLocalDateToDot(reservation.checkOutDate)} (${nights}박)`,
                        },
                      })
                    }>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: statusStyle.badgeBackground},
                      ]}>
                      <Text
                        style={[
                          FONTS.fs_14_semibold,
                          styles.statusBadgeText,
                          {color: statusStyle.badgeText},
                        ]}>
                        {statusStyle.label}
                      </Text>
                    </View>

                    <View style={styles.reservationInfo}>
                      <Text style={[FONTS.fs_14_medium, styles.roomName]}>
                        {reservation.roomName}
                      </Text>
                      <Text style={[FONTS.fs_14_medium, styles.periodText]}>
                        {`${formatLocalDateToDot(
                          reservation.checkInDate,
                        )} ~ ${formatLocalDateToDot(reservation.checkOutDate)} (${nights}박)`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default ReservationCalendar;
