import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

import EmptyState from '@components/EmptyState';
import Header from '@components/Header';
import Loading from '@components/Loading';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {formatLocalDateToDotWithDay} from '@utils/formatDate';

const DEFAULT_PAGE = 0;
const DEFAULT_SIZE = 10;
const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

const STATUS_LABEL_MAP = {
  PENDING: '대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
  COMPLETED: '완료',
};

const STATUS_VALUE_MAP = {
  대기: 'PENDING',
  확정: 'CONFIRMED',
  취소: 'CANCELLED',
  완료: 'COMPLETED',
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
};

const STATUS_STYLE = {
  대기: {
    badgeBackground: COLORS.secondary_yellow,
    badgeText: COLORS.semantic_yellow,
  },
  취소: {
    badgeBackground: COLORS.secondary_red,
    badgeText: COLORS.semantic_red,
  },
  확정: {
    badgeBackground: COLORS.secondary_blue,
    badgeText: COLORS.semantic_blue,
  },
  완료: {
    badgeBackground: COLORS.grayscale_300,
    badgeText: COLORS.grayscale_0,
  },
};

const getCurrentYearMonth = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const normalizeReservation = reservation => {
  const status = STATUS_LABEL_MAP[reservation?.status] || reservation?.status || '완료';
  const completedTotal = Number(reservation?.completedTotal || 0);
  const canceledTotal = Number(reservation?.canceledTotal || 0);
  const amount = Number(reservation?.amount || 0);
  const checkInDate = reservation?.checkInDate;
  const checkOutDate = reservation?.checkOutDate;
  const period =
    checkInDate && checkOutDate
      ? `${formatLocalDateToDotWithDay(checkInDate)} ~ ${formatLocalDateToDotWithDay(
          checkOutDate,
        )}`
      : reservation?.period;
  const birthYear = reservation?.birthDate?.split?.('-')?.[0];

  return {
    ...reservation,
    id: reservation?.reservationId ?? reservation?.id,
    reservationId: reservation?.reservationId ?? reservation?.id,
    status,
    statusText: reservation?.statusText ?? `완료 ${completedTotal}, 취소 ${canceledTotal}`,
    name: reservation?.userName ?? reservation?.name,
    age: reservation?.age ?? (birthYear ? `${birthYear}년생` : ''),
    phone: reservation?.userPhone ?? reservation?.phone,
    reservationNumber: reservation?.reservationCode ?? reservation?.reservationNumber,
    guestCount:
      reservation?.guestCount != null && `${reservation?.guestCount}` !== ''
        ? `${reservation.guestCount}명`
        : reservation?.guestCount,
    room: reservation?.roomName ?? reservation?.room,
    period,
    paymentStatus: reservation?.paymentStatus ?? (status === '취소' ? '환불' : '결제완료'),
    paymentAmount:
      reservation?.paymentAmount ??
      (Number.isFinite(amount) ? `${amount.toLocaleString('ko-KR')}원` : ''),
  };
};

const ReservationMetricList = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    guesthouseId,
    title = '예약 지표',
    yearMonth,
    initialReservationStatus,
  } = route?.params ?? {};

  const metricYearMonth = YEAR_MONTH_PATTERN.test(yearMonth ?? '')
    ? yearMonth
    : getCurrentYearMonth();
  const status = STATUS_VALUE_MAP[initialReservationStatus] ?? undefined;
  const latestRequestRef = useRef(0);

  const [reservations, setReservations] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const requestParams = useCallback(
    (page = DEFAULT_PAGE) => ({
      guesthouseId,
      yearMonth: metricYearMonth,
      page,
      size: DEFAULT_SIZE,
      ...(status ? {status} : {}),
    }),
    [guesthouseId, metricYearMonth, status],
  );

  const fetchReservations = useCallback(
    async (page = DEFAULT_PAGE, append = false) => {
      if (!guesthouseId) {
        setReservations([]);
        setTotalCount(0);
        setHasNextPage(false);
        setCurrentPage(DEFAULT_PAGE);
        setIsLoading(false);
        setIsLoadingMore(false);
        return;
      }

      const requestId = latestRequestRef.current + 1;
      latestRequestRef.current = requestId;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await hostGuesthouseApi.searchGuesthouseReservations(
          requestParams(page),
        );
        const payload = response?.data?.data ?? response?.data ?? {};
        const content =
          payload?.reservations ??
          payload?.content ??
          response?.data?.reservations ??
          response?.data?.content ??
          [];
        const safeContent = Array.isArray(content) ? content : [];
        const next = Boolean(payload?.hasNext);
        const responsePage = Number(payload?.currentPage);
        const responseTotalCount = Number(payload?.totalCount);

        if (requestId !== latestRequestRef.current) {
          return;
        }

        setReservations(prev => (append ? [...prev, ...safeContent] : safeContent));
        setTotalCount(prevCount =>
          Number.isFinite(responseTotalCount)
            ? responseTotalCount
            : append
              ? prevCount + safeContent.length
              : safeContent.length,
        );
        setHasNextPage(next);
        setCurrentPage(Number.isFinite(responsePage) ? responsePage : page);
      } catch (error) {
        if (requestId !== latestRequestRef.current) {
          return;
        }

        if (!append) {
          setReservations([]);
          setTotalCount(0);
          setHasNextPage(false);
          setCurrentPage(DEFAULT_PAGE);
        }
      } finally {
        if (requestId !== latestRequestRef.current) {
          return;
        }

        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [guesthouseId, requestParams],
  );

  useFocusEffect(
    useCallback(() => {
      fetchReservations(DEFAULT_PAGE, false);
    }, [fetchReservations]),
  );

  const listData = useMemo(
    () => reservations.map(normalizeReservation),
    [reservations],
  );

  const loadNextPage = useCallback(() => {
    if (isLoading || isLoadingMore || !hasNextPage) {
      return;
    }

    fetchReservations(currentPage + 1, true);
  }, [currentPage, fetchReservations, hasNextPage, isLoading, isLoadingMore]);

  const renderItem = ({item: reservation, index}) => {
    const statusStyle = STATUS_STYLE[reservation.status] || STATUS_STYLE.완료;

    return (
      <TouchableOpacity
        key={String(reservation.reservationId || reservation.id || index)}
        style={styles.card}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('MyGuesthouseReservationDetail', {
            reservationId: reservation.reservationId || reservation.id,
            reservation,
          })
        }>
        <View style={styles.headerRow}>
          <View style={[styles.statusBadge, {backgroundColor: statusStyle.badgeBackground}]}>
            <Text style={[FONTS.fs_14_semibold, {color: statusStyle.badgeText}]}>
              {reservation.status}
            </Text>
          </View>

          <View style={styles.headerTextBox}>
            <Text style={[FONTS.fs_16_semibold, styles.userName]}>
              {reservation.name}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.subText]}>
              {reservation.statusText}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <InfoRow label="예약자" value={reservation.name} />
          <InfoRow label="나이" value={reservation.age} />
          <InfoRow label="전화번호" value={reservation.phone} />
          <InfoRow label="예약번호" value={reservation.reservationNumber} />
          <InfoRow label="인원수" value={reservation.guestCount} />
          <InfoRow label="객실" value={reservation.room} isHighlight />
          <InfoRow label="이용기간" value={reservation.period} isHighlight />
          {reservation.paymentStatus ? (
            <InfoRow label="결제상태" value={reservation.paymentStatus} isHighlight />
          ) : null}
        </View>

        {index !== listData.length - 1 ? <View style={styles.divider} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <Header title={title} />

      <View style={styles.body}>
        {isLoading ? (
          <View style={styles.center}>
            <Loading title="예약 내역을 불러오는 중 이에요" />
          </View>
        ) : listData.length === 0 ? (
          <View style={styles.center}>
            <EmptyState title="예약 내역이 없어요" description="" />
          </View>
        ) : (
          <FlatList
            data={listData}
            keyExtractor={(item, index) => String(item.reservationId || item.id || index)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.3}
            ListHeaderComponent={
              <Text style={[FONTS.fs_18_semibold, styles.title]}>
                예약 <Text style={styles.titleHighlight}>{totalCount}</Text>건
              </Text>
            }
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color={COLORS.primary_orange} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

const InfoRow = ({label, value, isHighlight = false}) => (
  <View style={styles.infoRow}>
    <Text style={[FONTS.fs_14_medium, styles.infoLabel]}>{label}</Text>
    <Text
      style={[
        FONTS.fs_14_medium,
        styles.infoValue,
        isHighlight && styles.infoValueHighlight,
      ]}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.grayscale_0,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 80,
  },
  listContent: {
    paddingBottom: 32,
  },
  title: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  titleHighlight: {
    color: COLORS.primary_orange,
  },
  card: {
    paddingVertical: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusBadge: {
    borderRadius: 999,
    height: 40,
    width: 40,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextBox: {
    flex: 1,
  },
  userName: {
    color: COLORS.grayscale_900,
  },
  subText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
  infoSection: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: COLORS.grayscale_500,
  },
  infoValue: {
    color: COLORS.grayscale_900,
    flexShrink: 1,
    textAlign: 'right',
  },
  infoValueHighlight: {
    color: COLORS.primary_orange,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginTop: 16,
  },
  footerLoading: {
    paddingVertical: 20,
  },
});

export default ReservationMetricList;
