import React, { useCallback, useEffect, useState } from 'react';
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import adminApi from '@utils/api/adminApi';
import orderApi from '@utils/api/orderApi';
import settlementApi from '@utils/api/settlementApi';
import styles from './Home.styles';

import ChevronRightIcon from '@assets/images/chevron_right_gray.svg';
import PhoneIcon from '@assets/images/phone_black.svg';

const formatDateWithNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return '';
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const format = d => `${String(d.getFullYear()).slice(-2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
  return `${format(start)} - ${format(end)} (${diffDays || 1}박)`;
};

const getStatusBadgeText = (status) => {
  switch (status) {
    case 'PENDING': return '대기중';
    case 'CONFIRMED': return '예약 확정';
    case 'CANCELLED': return '예약 취소';
    case 'COMPLETED': return '이용 완료';
    default: return '예약 확정';
  }
};

const RESERVATION_METHOD_CONTENT = {
  closed: {
    title: '예약 마감',
    description: [
      '예약을 받지 않으며,',
      '게스트에게 예약 버튼이 보이지 않아요',
    ],
  },
  request: {
    title: '예약 요청 후 확정',
    description: [
      '요청을 확인하고 수락해야 예약이 확정돼요',
    ],
  },
  instant: {
    title: '즉시 예약 확정',
    description: [
      '결제 시 자동으로 예약이 확정돼요',
    ],
  },
};

const mapNoticeSummary = item => ({
  id: item?.id,
  key: String(item?.id ?? ''),
  categoryCode: item?.category || '',
  category: item?.categoryLabel || item?.category || '',
  title: item?.title || '',
  publishedAt: item?.publishedAt || item?.updatedAt || '',
});

const Home = ({ reservationMethod = 'closed', guesthouseId }) => {
  const navigation = useNavigation();
  const [latestNotice, setLatestNotice] = useState(null);
  const [settlementData, setSettlementData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedTab, setSelectedTab] = useState('TODAY_CONFIRMED');

  const reservationMethodContent =
    RESERVATION_METHOD_CONTENT[reservationMethod] ||
    RESERVATION_METHOD_CONTENT.closed;

  const fetchSettlementOverview = useCallback(async () => {
    if (!guesthouseId) return;
    try {
      const now = new Date();
      const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const response = await settlementApi.getSettlementOverview(guesthouseId, yearMonth);
      let result = response.data || response;
      if (result && result.data && !result.yearMonth) {
        result = result.data;
      }
      setSettlementData(result);
    } catch (error) {
      console.warn('[Home] failed to fetch settlement overview:', error?.message);
    }
  }, [guesthouseId]);

  const fetchDashboardData = useCallback(async () => {
    if (!guesthouseId) return;
    try {
      // baseDate 생략 시 서버에서 오늘을 기준으로 응답함
      const response = await orderApi.getReservationDashboard(guesthouseId);
      const result = response.data || response;
      setDashboardData(result);
    } catch (error) {
      console.warn('[Home] failed to fetch dashboard data:', error?.message);
    }
  }, [guesthouseId]);

  useFocusEffect(
    useCallback(() => {
      fetchSettlementOverview();
      fetchDashboardData();
    }, [fetchSettlementOverview, fetchDashboardData]),
  );

  const summaryItems = [
    { key: 'WAITING_APPROVAL', label: '확정 대기', value: String(dashboardData?.counts?.waitingApproval || 0) },
    { key: 'TODAY_CONFIRMED', label: '오늘 확정', value: String(dashboardData?.counts?.todayConfirmed || 0) },
    { key: 'TODAY_STAYING', label: '오늘 이용', value: String(dashboardData?.counts?.todayStaying || 0) },
    { key: 'TODAY_CANCELLED', label: '오늘 취소', value: String(dashboardData?.counts?.todayCancelled || 0) },
  ];

  const selectedSection = dashboardData?.sections?.find(s => s.type === selectedTab);
  const itemsToShow = selectedSection?.items || [];

  useEffect(() => {
    let isMounted = true;

    const fetchLatestNotice = async () => {
      try {
        const { data } = await adminApi.getHomeNotices();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.items)
            ? data.items
            : [];

        const latestItem = items
          .map(mapNoticeSummary)
          .sort((a, b) => {
            const aTime = new Date(a.publishedAt).getTime();
            const bTime = new Date(b.publishedAt).getTime();

            return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
          })[0] || null;

        if (!isMounted) {
          return;
        }

        setLatestNotice(latestItem);
      } catch (error) {
        console.warn(
          '[GuesthouseManagementHome] failed to fetch latest notice:',
          error?.message,
        );

        if (isMounted) {
          setLatestNotice(null);
        }
      }
    };

    fetchLatestNotice();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <Text style={[FONTS.fs_16_semibold, styles.cardTitle]}>
          {reservationMethodContent.title}
        </Text>
        {reservationMethodContent.description.map(line => (
          <Text key={line} style={[FONTS.fs_14_medium, styles.cardDescription]}>
            {line}
          </Text>
        ))}

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.actionButton}
          onPress={() =>
            navigation.navigate('ReservationMethodSettings', {
              selectedOption: reservationMethod,
              guesthouseId,
            })
          }>
          <Text style={[FONTS.fs_12_medium, styles.actionButtonText]}>
            설정 변경하기
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.noticeRow}
        onPress={() => navigation.navigate('NoticeList')}>
        <View
          style={[
            styles.noticeBadge,
            styles.noticeBadgeVariants[latestNotice?.categoryCode] ||
            styles.noticeBadgeBlue,
          ]}>
          <Text
            style={[
              FONTS.fs_14_semibold,
              styles.noticeBadgeText,
              styles.noticeBadgeTextVariants[latestNotice?.categoryCode] ||
              styles.noticeBadgeBlueText,
            ]}>
            {latestNotice?.category || '운영'}
          </Text>
        </View>
        <Text style={[FONTS.fs_14_medium, styles.noticeText]}>
          {latestNotice?.title || '공지사항이 없습니다.'}
        </Text>
        <ChevronRightIcon width={16} height={16} />
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={[FONTS.fs_18_semibold, styles.cardTitle]}>예약 현황</Text>

        <View style={styles.summaryRow}>
          {summaryItems.map(item => {
            const isSelected = selectedTab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.summaryItem}
                activeOpacity={0.8}
                onPress={() => setSelectedTab(item.key)}>
                <Text
                  style={[
                    FONTS.fs_22_bold,
                    styles.summaryValue,
                    !isSelected && styles.summaryValueInactive,
                  ]}>
                  {item.value}
                </Text>
                <Text
                  style={[
                    FONTS.fs_12_medium,
                    styles.summaryLabel,
                    isSelected ? FONTS.fs_12_bold : {},
                    !isSelected && styles.summaryLabelInactive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.reservationListContainer}>
          {itemsToShow.map(reservation => (
            <TouchableOpacity 
              key={reservation.reservationId} 
              style={styles.reservationCard}
              activeOpacity={0.8}
              onPress={() => {
                navigation.navigate('MyGuesthouseReservationDetail', {
                  reservationId: reservation.reservationId,
                });
              }}>
              <View style={styles.reservationCardHeader}>
                <Text style={[FONTS.fs_16_semibold, styles.reservationName]}>
                  {reservation.guestName || '게스트'}
                </Text>
                
                {selectedTab === 'TODAY_STAYING' ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={[
                        styles.reservationBadge,
                        reservation.guestGender === 'F' && styles.reservationBadgePink,
                      ]}>
                      <Text
                        style={[
                          styles.reservationBadgeText,
                          reservation.guestGender === 'F' && styles.reservationBadgeTextPink,
                        ]}>
                        {reservation.guestGender === 'F' ? '여' : '남'}
                      </Text>
                    </View>
                    {reservation.guestBirthDate && (
                      <Text style={styles.birthYearText}>
                        {reservation.guestBirthDate.substring(0, 4)}년생
                      </Text>
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.reservationBadge,
                      reservation.status === 'CANCELLED' && styles.reservationBadgeRed,
                      selectedTab === 'WAITING_APPROVAL' && styles.reservationBadgeWaiting,
                    ]}>
                    <Text
                      style={[
                        styles.reservationBadgeText,
                        reservation.status === 'CANCELLED' && styles.reservationBadgeTextRed,
                        selectedTab === 'WAITING_APPROVAL' && styles.reservationBadgeTextWaiting,
                      ]}>
                      {selectedTab === 'WAITING_APPROVAL' ? '대기중' : getStatusBadgeText(reservation.status)}
                    </Text>
                  </View>
                )}
                
                {selectedTab === 'WAITING_APPROVAL' && (
                  <View style={styles.waitingAlertRow}>
                    <View style={styles.waitingAlertIcon}>
                      <Text style={styles.waitingAlertIconText}>!</Text>
                    </View>
                    <Text style={styles.waitingAlertText}>30분 내 승인 필요</Text>
                  </View>
                )}
              </View>

              <Text style={[FONTS.fs_14_medium, styles.reservationInfoText]}>
                {reservation.roomName || '객실 정보 없음'}
                {reservation.guestCount ? `, ${reservation.guestCount}명` : ''}
              </Text>

              {selectedTab !== 'TODAY_STAYING' && (
                <Text
                  style={[
                    FONTS.fs_12_medium,
                    styles.reservationInfoText,
                    { color: COLORS.grayscale_500 },
                  ]}>
                  {formatDateWithNights(reservation.checkInDate, reservation.checkOutDate)}
                </Text>
              )}

              {selectedTab === 'TODAY_STAYING' ? (
                <View style={styles.phoneButtonWrapper}>
                  <TouchableOpacity
                    style={styles.phoneButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      if (reservation.guestPhone) {
                        Linking.openURL(`tel:${reservation.guestPhone}`);
                      }
                    }}>
                    <PhoneIcon width={20} height={20} />
                  </TouchableOpacity>
                </View>
              ) : selectedTab === 'WAITING_APPROVAL' ? (
                <TouchableOpacity
                  style={[styles.reservationButton, styles.reservationButtonPrimary]}
                  activeOpacity={0.8}>
                  <Text
                    style={[FONTS.fs_12_medium, styles.reservationButtonText, styles.reservationButtonTextPrimary]}>
                    예약 확정
                  </Text>
                </TouchableOpacity>
              ) : (
                reservation.status !== 'CANCELLED' && (
                  <TouchableOpacity
                    style={styles.reservationButton}
                    activeOpacity={0.8}>
                    <Text
                      style={[FONTS.fs_12_medium, styles.reservationButtonText]}>
                      예약 취소
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 정산 관리 요약 보드 */}
      <View style={{ marginBottom: 30 }}>
        <TouchableOpacity
          style={styles.settlementSectionTitleRow}
          activeOpacity={0.8}
          onPress={() => {
            if (guesthouseId) {
              navigation.navigate('SettlementManagement', { guesthouseId });
            }
          }}>
          <Text style={[FONTS.fs_18_semibold]}>정산 관리</Text>
          <ChevronRightIcon width={18} height={18} style={{ marginLeft: 4 }} />
        </TouchableOpacity>

        <View style={styles.settlementCardMain}>
          <Text style={[FONTS.fs_14_semibold, styles.settlementLabel]}>
            {settlementData?.nextPayoutDate || `${new Date().getMonth() + 1}월 입금 예정`}
          </Text>
          <Text style={[FONTS.fs_22_bold, styles.settlementValueBlue]}>
            {Number(settlementData?.upcomingPayoutAmount || 0).toLocaleString()}원
          </Text>

          <View style={styles.settlementDivider} />

          <Text style={[FONTS.fs_14_medium, styles.settlementLabel]}>
            {new Date().getMonth() + 1}월 누적 정산액
          </Text>
          <View style={styles.settlementAccumulatedRow}>
            <Text style={[FONTS.fs_22_bold, styles.settlementValueBlack]}>
              {Number(settlementData?.accumulatedSettlementAmount || 0).toLocaleString()}원
            </Text>
          </View>
        </View>

        <View style={styles.settlementSubRow}>
          <View style={[styles.settlementSubCard, styles.settlementSubCardSpacing]}>
            <Text style={[FONTS.fs_12_semibold, styles.settlementSubLabel]}>총 매출액 (부가세 포함)</Text>
            <Text style={[FONTS.fs_18_bold, styles.settlementSubValue]}>
              {Number(settlementData?.grossSalesAmount || 0).toLocaleString()}원
            </Text>
          </View>
          <View style={styles.settlementSubCard}>
            <Text style={[FONTS.fs_12_semibold, styles.settlementSubLabel]}>수수료 (3.4%)</Text>
            <Text style={[FONTS.fs_18_bold, styles.settlementSubValue]}>
              {Number(settlementData?.commissionAmount || 0).toLocaleString()}원
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;
