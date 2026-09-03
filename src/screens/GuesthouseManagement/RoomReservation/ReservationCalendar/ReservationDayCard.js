import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {
  formatLocalDateToDot,
  formatLocalDateToDotWithDay,
} from '@utils/formatDate';
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
  반려: {
    badgeBackground: COLORS.secondary_brown,
    badgeText: COLORS.semantic_brown,
    label: '예약 반려',
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

const getNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) {
    return 1;
  }
  const diff = new Date(checkOutDate) - new Date(checkInDate);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const formatSelectedDateTitle = localDate => {
  return formatLocalDateToDotWithDay(localDate).replace(' (', ' ').replace(')', '');
};

const getGenderLabel = gender => {
  const normalizedGender = gender?.toUpperCase?.();

  if (normalizedGender === 'M') {
    return '남';
  }
  if (normalizedGender === 'F') {
    return '여';
  }

  return '';
};

const normalizeReservation = (reservation = {}) => {
  let status = STATUS_LABEL_MAP[reservation?.status] || reservation?.status || '완료';
  if (reservation?.status === 'CANCELLED' && reservation?.approvalStatus === 'REJECTED') {
    status = '반려';
  }
  const checkInDate = reservation?.checkInDate?.split?.('T')?.[0] ?? reservation?.checkInDate;
  const checkOutDate =
    reservation?.checkOutDate?.split?.('T')?.[0] ?? reservation?.checkOutDate;
  const guestName = reservation?.guestName ?? reservation?.userName ?? reservation?.name ?? '게스트';
  const guestGender = reservation?.guestGender ?? reservation?.gender;

  return {
    ...reservation,
    id: reservation?.reservationId ?? reservation?.id,
    reservationId: reservation?.reservationId ?? reservation?.id,
    status,
    roomName: reservation?.roomName ?? reservation?.room ?? '-',
    checkInDate,
    checkOutDate,
    guestName,
    guestGender,
    genderLabel: getGenderLabel(guestGender),
  };
};

const ReservationDayCard = ({guesthouseId, targetDate, onNavigate, status}) => {
  const navigation = useNavigation();

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    if (!guesthouseId || !targetDate) {
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
          targetDate,
          ...(status ? {status} : {}),
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
  }, [guesthouseId, status, targetDate]);

  const loadNextPage = async () => {
    if (isLoading || isLoadingMore || !hasNextPage || !guesthouseId) {
      return;
    }

    const nextPage = currentPage + 1;
    setIsLoadingMore(true);
    try {
      const response = await hostGuesthouseApi.searchGuesthouseReservations({
        guesthouseId,
        targetDate,
        ...(status ? {status} : {}),
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

  return (
    <View style={styles.cardWrapper}>
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHeader}>
          <Text style={[FONTS.fs_16_medium, styles.listDateTitle]}>
            {formatSelectedDateTitle(targetDate)}
          </Text>
        </View>

        <View style={styles.listContainer}>
          {isLoading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator color={COLORS.primary_orange} size="small" />
            </View>
          ) : reservations.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={[FONTS.fs_14_medium, {color: COLORS.grayscale_400}]}>
                예약 내역이 없어요
              </Text>
            </View>
          ) : (
            <FlatList
              data={[...reservations].sort((a, b) => {
                const getOrder = (r) => {
                  if (r.status === '대기') {
                    return 1;
                  }
                  if (r.status === '확정') {
                    return 2;
                  }
                  if (r.status === '반려') {
                    return 3;
                  }
                  if (r.status === '취소') {
                    return 4;
                  }
                  return 5;
                };
                return getOrder(a) - getOrder(b);
              })}
              style={styles.listScroll}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, index) =>
                String(item.reservationId || item.id || index)
              }
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
                  RESERVATION_STATUS_STYLE[reservation.status] ||
                  RESERVATION_STATUS_STYLE.완료;
                const nights = getNights(
                  reservation.checkInDate,
                  reservation.checkOutDate,
                );

                return (
                  <TouchableOpacity
                    key={String(reservation.reservationId || reservation.id || index)}
                    activeOpacity={0.85}
                    style={styles.reservationItem}
                    onPress={() => {
                      if (onNavigate) {
                        onNavigate();
                      }
                      navigation.navigate('MyGuesthouseReservationDetail', {
                        reservationId: reservation.reservationId || reservation.id,
                        reservation: {
                          ...reservation,
                          room: reservation.roomName,
                          period: `${formatLocalDateToDot(
                            reservation.checkInDate,
                          )} ~ ${formatLocalDateToDot(reservation.checkOutDate)} (${nights}박)`,
                        },
                      });
                    }}>
                    <View style={styles.reservationHeader}>
                      <View
                        style={[
                           styles.statusBadge,
                           {backgroundColor: statusStyle.badgeBackground},
                        ]}>
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            styles.statusBadgeText,
                            {color: statusStyle.badgeText},
                          ]}>
                          {statusStyle.label}
                        </Text>
                      </View>
                      <View style={styles.reservationSummary}>
                        <Text
                          style={[FONTS.fs_14_semibold, styles.guestName]}
                          numberOfLines={1}>
                          {reservation.guestName}
                        </Text>
                        {reservation.genderLabel ? (
                          <View
                            style={[
                              styles.genderBadge,
                              reservation.genderLabel === '여' && styles.genderBadgeFemale,
                            ]}>
                            <Text
                              style={[
                                FONTS.fs_12_medium,
                                styles.genderBadgeText,
                                reservation.genderLabel === '여' &&
                                  styles.genderBadgeTextFemale,
                              ]}>
                              {reservation.genderLabel}
                            </Text>
                          </View>
                        ) : null}
                        <Text
                          style={[FONTS.fs_14_semibold, styles.roomName]}
                          numberOfLines={1}>
                          · {reservation.roomName}
                        </Text>
                      </View>
                    </View>

                    <Text style={[FONTS.fs_14_regular, styles.periodText]}>
                      {`${formatLocalDateToDot(
                        reservation.checkInDate,
                      )} ~ ${formatLocalDateToDot(
                        reservation.checkOutDate,
                      )} (${nights}박)`}
                    </Text>
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

export default ReservationDayCard;
