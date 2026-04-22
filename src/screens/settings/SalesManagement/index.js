import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useUserStore from '@stores/userStore';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';
import Header from '@components/Header';
import ChevronLeftBlack from '@assets/images/chevron_left_black.svg';
import ChevronLeftIcon from '@assets/images/chevron_left_black.svg';
import ChevronRightIcon from '@assets/images/chevron_right_black.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import Svg, { Circle, G } from 'react-native-svg';
import styles from './SalesManagement.styles';
import { COLORS } from '@constants/colors';

// --- MOCK DATA ---
const MOCK_SALES_DATA = {
  '2026-03': {
    totalSales: 21500000,
    growthRate: 15.4,
    insightMsg: "지난 달보다 주말 예약이 크게 늘어 매출이 15% 상승했어요! ✨",
    totalReservations: 142,
    totalCancellations: 12,
    avgRoomRate: 151000,
    occRate: 78.5,
    paidAmount: 23000000,
    refundAmount: 1500000,
    netSales: 21500000,
    roomRankings: [
      { name: '여성 2인실(전이수갤러리) 1인...', revenue: 8269200 },
      { name: '남성 2인실 (서남향) 1인가격', revenue: 8257500 },
      { name: '남자 2인실(원피스방) 1인가격', revenue: 6352800 },
      { name: '여성 1인실(햇살가득)', revenue: 6115200 },
      { name: '여성 2인실(오사카 저상형침대...', revenue: 2712000 },
    ],
    reservationMetrics: {
      applied: { count: 751, diffCount: 5, diffPercent: 0.7 },
      completed: { count: 609, diffCount: -16, diffPercent: -2.6 },
      canceled: { count: 145, diffCount: 25, diffPercent: 20.8 },
      confirmed: { count: 751, diffCount: 5, diffPercent: 0.7 },
    },
    customerAnalysis: {
      malePercent: 33,
      femalePercent: 67,
      ageStats: [
        { age: '10대', male: 0, female: 0 },
        { age: '20대', male: 100, female: 100 },
        { age: '30대', male: 0, female: 0 },
        { age: '40대', male: 0, female: 0 },
        { age: '50대', male: 0, female: 0 },
        { age: '60대', male: 0, female: 0 },
        { age: '70대', male: 0, female: 0 },
      ]
    },
    cancelStats: {
      rate: 19.34,
      rateChange: 2.67,
      reasons: [
        { name: '예약자 취소', count: 100 },
        { name: '사업자 취소', count: 46 }
      ]
    }
  },
  '2026-04': {
    totalSales: 24800000,
    growthRate: 15.3,
    insightMsg: "이번 달은 단체 예약 건수가 늘어 안정적인 매출을 기록 중입니다. 🎉",
    totalReservations: 185,
    totalCancellations: 18,
    avgRoomRate: 134000,
    occRate: 85.2,
    paidAmount: 26500000,
    refundAmount: 1700000,
    netSales: 24800000,
    roomRankings: [
      { name: '도미토리 A', revenue: 11200000 },
      { name: '도미토리 B', revenue: 8500000 },
      { name: '프라이빗 룸 1', revenue: 3100000 },
      { name: '프라이빗 룸 2', revenue: 2000000 },
    ],
    reservationMetrics: {
      applied: { count: 812, diffCount: 61, diffPercent: 8.1 },
      completed: { count: 650, diffCount: 41, diffPercent: 6.7 },
      canceled: { count: 120, diffCount: -25, diffPercent: -17.2 },
      confirmed: { count: 812, diffCount: 61, diffPercent: 8.1 },
    },
    customerAnalysis: {
      malePercent: 45,
      femalePercent: 55,
      ageStats: [
        { age: '10대', male: 10, female: 15 },
        { age: '20대', male: 60, female: 55 },
        { age: '30대', male: 30, female: 30 },
        { age: '40대', male: 0, female: 0 },
        { age: '50대', male: 0, female: 0 },
        { age: '60대', male: 0, female: 0 },
        { age: '70대', male: 0, female: 0 },
      ]
    },
    cancelStats: {
      rate: 15.10,
      rateChange: -4.24,
      reasons: [
        { name: '예약자 취소', count: 65 },
        { name: '사업자 취소', count: 12 }
      ]
    }
  },
  '2026-05': {
    totalSales: 16500000,
    growthRate: -33.4,
    insightMsg: "비수기 영향으로 매출이 다소 감소했습니다. 특가 이벤트를 진행해볼까요? 💡",
    totalReservations: 110,
    totalCancellations: 25,
    avgRoomRate: 150000,
    occRate: 60.4,
    paidAmount: 19800000,
    refundAmount: 3300000,
    netSales: 16500000,
    roomRankings: [
      { name: '여성 2인실(전이수갤러리) 1인...', revenue: 6000000 },
      { name: '도미토리 B', revenue: 5500000 },
      { name: '여성 1인실(햇살가득)', revenue: 3500000 },
      { name: '남자 2인실(원피스방) 1인가격', revenue: 1500000 },
    ],
    reservationMetrics: {
      applied: { count: 500, diffCount: -312, diffPercent: -38.4 },
      completed: { count: 420, diffCount: -230, diffPercent: -35.3 },
      canceled: { count: 160, diffCount: 40, diffPercent: 33.3 },
      confirmed: { count: 500, diffCount: -312, diffPercent: -38.4 },
    },
    customerAnalysis: {
      malePercent: 50,
      femalePercent: 50,
      ageStats: [
        { age: '10대', male: 5, female: 5 },
        { age: '20대', male: 80, female: 85 },
        { age: '30대', male: 15, female: 10 },
        { age: '40대', male: 0, female: 0 },
        { age: '50대', male: 0, female: 0 },
        { age: '60대', male: 0, female: 0 },
        { age: '70대', male: 0, female: 0 },
      ]
    },
    cancelStats: {
      rate: 22.50,
      rateChange: 7.40,
      reasons: [
        { name: '예약자 취소', count: 150 },
        { name: '사업자 취소', count: 35 }
      ]
    }
  }
};

const MOCK_YEAR_DATA = {
  '2025': {
    totalSales: 215000000,
    growthRate: 18.2,
    avgRoomRate: 142000,
    occRate: 72.1,
    insightMsg: "작년 한 해 동안 안정적인 성장을 이루었어요! 단골 고객이 대폭 증가했습니다. 🎊",
    monthlyTrend: [
      { month: 1, revenue: 15000 },
      { month: 2, revenue: 12000 },
      { month: 3, revenue: 18000 },
      { month: 4, revenue: 21000 },
      { month: 5, revenue: 25000 },
      { month: 6, revenue: 22000 },
      { month: 7, revenue: 28000 },
      { month: 8, revenue: 31000 },
      { month: 9, revenue: 16000 },
      { month: 10, revenue: 11000 },
      { month: 11, revenue: 8000 },
      { month: 12, revenue: 8000 },
    ]
  },
  '2026': {
    totalSales: 85200000,
    growthRate: 35.4,
    avgRoomRate: 149000,
    occRate: 81.3,
    insightMsg: "올해 들어 전반기 성장세가 가파릅니다! 역대 최고 매출을 기대해볼 만해요! 🚀",
    monthlyTrend: [
      { month: 1, revenue: 18000 },
      { month: 2, revenue: 20900 },
      { month: 3, revenue: 21500 },
      { month: 4, revenue: 24800 },
      { month: 5, revenue: 0 },
      { month: 6, revenue: 0 },
      { month: 7, revenue: 0 },
      { month: 8, revenue: 0 },
      { month: 9, revenue: 0 },
      { month: 10, revenue: 0 },
      { month: 11, revenue: 0 },
      { month: 12, revenue: 0 },
    ]
  }
};

const DATES = ['2026-03', '2026-04', '2026-05'];
const YEAR_DATES = ['2025', '2026'];

const SalesManagement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const hostProfile = useUserStore(state => state.hostProfile);
  const passedGuesthouseId = route.params?.guesthouseId;
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(passedGuesthouseId ? String(passedGuesthouseId) : null);

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(hostProfile?.guesthouseProfiles) && hostProfile.guesthouseProfiles.length > 0
        ? hostProfile.guesthouseProfiles.map((item, index) => ({
          id: String(item.guesthouseId ?? `guesthouse-${index}`),
          name: item.guesthouseName || '이름 없음',
          photoUrl: item.profileImageUrl || null,
          noticeCount: 0,
        }))
        : [],
    [hostProfile?.guesthouseProfiles],
  );

  const selectedGuesthouse = useMemo(
    () => guesthouseProfiles.find(p => p.id === selectedProfileId) || guesthouseProfiles[0],
    [guesthouseProfiles, selectedProfileId],
  );

  const [viewMode, setViewMode] = useState('MONTHLY'); // 'MONTHLY' | 'YEARLY'
  const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
  const [currentYearIndex, setCurrentYearIndex] = useState(1);
  const [reservationMetricMode, setReservationMetricMode] = useState('count'); // 'count' | 'person'

  const handlePrev = () => {
    if (viewMode === 'MONTHLY' && currentMonthIndex > 0) {
      setCurrentMonthIndex(currentMonthIndex - 1);
    } else if (viewMode === 'YEARLY' && currentYearIndex > 0) {
      setCurrentYearIndex(currentYearIndex - 1);
    }
  };

  const handleNext = () => {
    if (viewMode === 'MONTHLY' && currentMonthIndex < DATES.length - 1) {
      setCurrentMonthIndex(currentMonthIndex + 1);
    } else if (viewMode === 'YEARLY' && currentYearIndex < YEAR_DATES.length - 1) {
      setCurrentYearIndex(currentYearIndex + 1);
    }
  };

  const isPrevDisabled = viewMode === 'MONTHLY' ? currentMonthIndex === 0 : currentYearIndex === 0;
  const isNextDisabled = viewMode === 'MONTHLY' ? currentMonthIndex === DATES.length - 1 : currentYearIndex === YEAR_DATES.length - 1;

  let displayDateStr = "";
  let data = null;

  if (viewMode === 'MONTHLY') {
    const currentMonthKey = DATES[currentMonthIndex];
    const [yearStr, monthStr] = currentMonthKey.split('-');
    displayDateStr = `${yearStr}년 ${parseInt(monthStr)}월`;
    data = MOCK_SALES_DATA[currentMonthKey];
  } else {
    const currentYearKey = YEAR_DATES[currentYearIndex];
    displayDateStr = `${currentYearKey}년`;
    data = MOCK_YEAR_DATA[currentYearKey];
  }

  // Monthly stats calculations
  const totalTransaction = data.paidAmount ? data.paidAmount + data.refundAmount : 1;
  const payPercent = totalTransaction > 0 ? (data.paidAmount / totalTransaction) * 100 : 0;
  const refundPercent = totalTransaction > 0 ? (data.refundAmount / totalTransaction) * 100 : 0;

  const maxRankRevenue = data.roomRankings && data.roomRankings.length > 0
    ? data.roomRankings[0].revenue
    : 1;

  const maxCancelCount = data.cancelStats && data.cancelStats.reasons.length > 0
    ? data.cancelStats.reasons[0].count
    : 1;

  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const halfCircumference = donutCircumference / 2;
  const maleDonutLength = data.customerAnalysis ? (data.customerAnalysis.malePercent / 100) * halfCircumference : 0;
  const femaleDonutLength = data.customerAnalysis ? (data.customerAnalysis.femalePercent / 100) * halfCircumference : 0;

  return (
    <View style={styles.container}>
      {/* 커스텀 헤더 (업장 선택기 내장) */}
      <View style={styles.customHeader}>
        <View style={styles.customHeaderInner}>
          <TouchableOpacity
            style={styles.customHeaderLeft}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeftBlack width={28} height={28} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customHeaderTitleBtn}
            onPress={() => setIsGuesthouseListVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.customHeaderTitleText}>
              {selectedGuesthouse?.name || '매출 분석'}
            </Text>
            {isGuesthouseListVisible ? (
              <ChevronUp width={24} height={24} />
            ) : (
              <ChevronDown width={24} height={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector Card */}
        <View style={[styles.card, styles.monthSelectorCard]}>
          <TouchableOpacity
            onPress={handlePrev}
            style={styles.monthSwitcherTouch}
            disabled={isPrevDisabled}
          >
            <ChevronLeftIcon width={20} height={20} opacity={isPrevDisabled ? 0.2 : 1} />
          </TouchableOpacity>
          <Text style={styles.monthTitleText}>
            {displayDateStr}
          </Text>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.monthSwitcherTouch}
            disabled={isNextDisabled}
          >
            <ChevronRightIcon width={20} height={20} opacity={isNextDisabled ? 0.2 : 1} />
          </TouchableOpacity>
        </View>

        {/* CONDITIONAL RENDER: MONTHLY MAIN CARD */}
        {viewMode === 'MONTHLY' && (
          <>
            {/* Main Sales Card */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: COLORS.grayscale_900, fontWeight: 'bold' }}>순매출</Text>
                <View style={{ width: 15, height: 15, borderRadius: 7.5, borderWidth: 1, borderColor: COLORS.grayscale_300, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>
                  <Text style={{ fontSize: 10, color: COLORS.grayscale_400, fontWeight: 'bold' }}>?</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setViewMode('YEARLY')} activeOpacity={0.8} style={{ backgroundColor: COLORS.grayscale_100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.grayscale_600 }}>연간 보기</Text>
              </TouchableOpacity>
            </View>

            {/* Main Sales Card */}
            <View style={styles.mainCard}>
              <View style={{ marginBottom: 24 }}>
                <View style={[styles.mainCardAmountRow, { marginBottom: 4 }]}>
                  <Text style={styles.mainCardAmount}>{(data.netSales || data.totalSales).toLocaleString()}</Text>
                  <Text style={styles.mainCardCurrency}>원</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500', marginRight: 4 }}>이전기간대비</Text>
                  <Text style={{ fontSize: 14, color: data.growthRate >= 0 ? COLORS.semantic_red : COLORS.semantic_blue, fontWeight: 'bold' }}>
                    {data.growthRate >= 0 ? '+' : ''}{Math.round((data.totalSales * data.growthRate) / 100).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>전체 매출</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>{(data.paidAmount || data.totalSales).toLocaleString()}원</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>취소/노쇼</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>
                    -{data.refundAmount ? data.refundAmount.toLocaleString() : '0'}원
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>취소수수료</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>
                    +{Math.floor((data.refundAmount || 0) * 0.1).toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>

            {/* AI Insight Box Removed */}
          </>
        )}

        {/* CONDITIONAL RENDER: YEARLY VIEWS */}
        {viewMode === 'YEARLY' ? (
          <View style={{ marginBottom: 40, marginTop: 16 }}>
            {/* CONDITIONAL RENDER: YEARLY MAIN CARD */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: COLORS.grayscale_900, fontWeight: 'bold' }}>{YEAR_DATES[currentYearIndex]}년 순매출</Text>
                <View style={{ width: 15, height: 15, borderRadius: 7.5, borderWidth: 1, borderColor: COLORS.grayscale_300, alignItems: 'center', justifyContent: 'center', marginLeft: 6 }}>
                  <Text style={{ fontSize: 10, color: COLORS.grayscale_400, fontWeight: 'bold' }}>?</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setViewMode('MONTHLY')} activeOpacity={0.8} style={{ backgroundColor: COLORS.grayscale_100, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.grayscale_600 }}>월간 보기</Text>
              </TouchableOpacity>
            </View>

            {/* CONDITIONAL RENDER: YEARLY MAIN CARD */}
            <View style={[styles.mainCard, { marginTop: 0 }]}>
              <View style={{ marginBottom: 24 }}>
                <View style={[styles.mainCardAmountRow, { marginBottom: 4 }]}>
                  <Text style={styles.mainCardAmount}>{(data.netSales || data.totalSales).toLocaleString()}</Text>
                  <Text style={styles.mainCardCurrency}>원</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500', marginRight: 4 }}>이전기간대비</Text>
                  <Text style={{ fontSize: 14, color: data.growthRate >= 0 ? COLORS.semantic_red : COLORS.semantic_blue, fontWeight: 'bold' }}>
                    {data.growthRate >= 0 ? '+' : ''}{Math.round((data.totalSales * data.growthRate) / 100).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>전체 매출</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>{(data.paidAmount || data.totalSales).toLocaleString()}원</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>취소/노쇼</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>
                    -{data.refundAmount ? data.refundAmount.toLocaleString() : '0'}원
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>취소수수료</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>
                    +{Math.floor((data.refundAmount || 0) * 0.1).toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.rankHeaderRow, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, marginTop: 40 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.sectionHeaderNoMargin}>월별 매출 추이</Text>
                <View style={styles.questionCircle}>
                  <Text style={styles.questionMark}>?</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                  <View style={{ width: 10, height: 10, backgroundColor: '#E8E8E8', borderRadius: 2, marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: '#888' }}>전년</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12 }}>
                  <View style={{ width: 10, height: 10, backgroundColor: '#EAF5EF', borderRadius: 2, marginRight: 4 }} />
                  <Text style={{ fontSize: 12, color: '#888' }}>올해</Text>
                </View>
                <Text style={{ fontSize: 12, color: '#888', fontWeight: '500' }}>(단위: 천만 원)</Text>
              </View>
            </View>

            <View style={styles.graphCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.graphScrollContent}
              >
                {data.monthlyTrend && (() => {
                  const currentYearKey = YEAR_DATES[currentYearIndex];
                  const prevYearKey = String(Number(currentYearKey) - 1);
                  const prevYearData = MOCK_YEAR_DATA[prevYearKey];

                  const allRevenues = data.monthlyTrend.map(m => m.revenue).concat(
                    prevYearData ? prevYearData.monthlyTrend.map(m => m.revenue) : []
                  );
                  const globalMaxRev = Math.max(...allRevenues, 1);
                  const curMaxRev = Math.max(...data.monthlyTrend.map(m => m.revenue), 1);

                  return data.monthlyTrend.map((item, idx) => {
                    const isMax = curMaxRev > 1 && item.revenue === curMaxRev; // Highlight the max of the *current year*

                    const prevRevenue = prevYearData?.monthlyTrend?.find(m => m.month === item.month)?.revenue || 0;
                    const heightPercent = (item.revenue / globalMaxRev) * 100;
                    const prevHeightPercent = (prevRevenue / globalMaxRev) * 100;

                    return (
                      <View key={`bar-${idx}`} style={[styles.graphBarCol, { width: 66 }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', width: '100%' }}>
                          {/* Previous Year Bar */}
                          <View style={{ alignItems: 'center', marginRight: 4, marginBottom: 8 }}>
                            <View style={[styles.graphBarBgWrapper, { width: 14, backgroundColor: 'transparent', marginVertical: 0 }]}>
                              {prevRevenue > 0 && (
                                <View
                                  style={[
                                    styles.graphBarFillBox,
                                    { height: `${prevHeightPercent}%`, backgroundColor: '#E8E8E8' }
                                  ]}
                                />
                              )}
                            </View>
                          </View>

                          {/* Current Year Bar */}
                          <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.graphBarValText, isMax && { color: '#8A2B3B' }]}>
                              {item.revenue > 0 ? `${(item.revenue / 10000).toLocaleString()}` : ''}
                            </Text>
                            <View style={[styles.graphBarBgWrapper, { marginVertical: 0, marginBottom: 8 }]}>
                              <View
                                style={[
                                  styles.graphBarFillBox,
                                  { height: `${heightPercent}%`, backgroundColor: isMax ? '#8A2B3B' : '#EAF5EF' }
                                ]}
                              />
                            </View>
                          </View>
                        </View>
                        <Text style={[styles.graphBarMonthText, isMax && { fontWeight: 'bold', color: '#8A2B3B' }]}>
                          {item.month}월
                        </Text>
                      </View>
                    );
                  });
                })()}
              </ScrollView>
            </View>
          </View>
        ) : (
          /* CONDITIONAL RENDER: MONTHLY VIEWS */
          <>
            {/* Reservation Metrics */}
            {data.reservationMetrics && (
              <View style={{ marginBottom: 16 }}>
                <View style={[styles.rankHeaderRow, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.sectionHeaderNoMargin}>예약 지표</Text>
                    <View style={styles.questionCircle}>
                      <Text style={styles.questionMark}>?</Text>
                    </View>
                  </View>
                  <View style={styles.pillRow}>
                    <TouchableOpacity
                      onPress={() => setReservationMetricMode('count')}
                      style={[reservationMetricMode === 'count' ? styles.pillActive : styles.pillInactive, { marginRight: 4 }]}
                    >
                      <Text style={reservationMetricMode === 'count' ? styles.pillTextActive : styles.pillTextInactive}>예약수</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setReservationMetricMode('person')}
                      style={reservationMetricMode === 'person' ? styles.pillActive : styles.pillInactive}
                    >
                      <Text style={reservationMetricMode === 'person' ? styles.pillTextActive : styles.pillTextInactive}>예약자수</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.metricGrid}>
                  {(() => {
                    const getMetric = (baseMetric) => {
                      if (reservationMetricMode === 'count') return baseMetric;
                      return {
                        count: Math.floor(baseMetric.count * 1.8),
                        diffCount: Math.floor(baseMetric.diffCount * 1.8),
                        diffPercent: baseMetric.diffPercent
                      };
                    };

                    const mApplied = getMetric(data.reservationMetrics.applied);
                    const mCompleted = getMetric(data.reservationMetrics.completed);
                    const mCanceled = getMetric(data.reservationMetrics.canceled);
                    const mConfirmed = getMetric(data.reservationMetrics.confirmed);

                    const unitText = reservationMetricMode === 'count' ? '건' : '명';

                    return (
                      <>
                        {/* 신청 (Applied) */}
                        <View style={styles.metricCardBox}>
                          <Text style={styles.metricCardTitle}>신청</Text>
                          <View style={styles.metricCardMainRow}>
                            <Text style={styles.metricCardMain}>{mApplied.count}</Text>
                            <Text style={styles.metricCardSub}>{unitText}</Text>
                          </View>
                          <View style={styles.metricDiffRow}>
                            <Text style={styles.metricDiffCount}>
                              {mApplied.diffCount > 0 ? '+' : ''}{mApplied.diffCount}
                            </Text>
                            <Text style={
                              mApplied.diffPercent >= 0 ? styles.metricDiffPercentP : styles.metricDiffPercentM
                            }>
                              {mApplied.diffPercent > 0 ? '+' : ''}{mApplied.diffPercent}%
                            </Text>
                          </View>
                        </View>

                        {/* 이용완료 (Completed) */}
                        <View style={styles.metricCardBox}>
                          <Text style={styles.metricCardTitle}>이용완료</Text>
                          <View style={styles.metricCardMainRow}>
                            <Text style={styles.metricCardMain}>{mCompleted.count}</Text>
                            <Text style={styles.metricCardSub}>{unitText}</Text>
                          </View>
                          <View style={styles.metricDiffRow}>
                            <Text style={styles.metricDiffCount}>
                              {mCompleted.diffCount > 0 ? '+' : ''}{mCompleted.diffCount}
                            </Text>
                            <Text style={
                              mCompleted.diffPercent >= 0 ? styles.metricDiffPercentP : styles.metricDiffPercentM
                            }>
                              {mCompleted.diffPercent > 0 ? '+' : ''}{mCompleted.diffPercent}%
                            </Text>
                          </View>
                        </View>

                        {/* 취소 (Canceled) */}
                        <View style={styles.metricCardBox}>
                          <Text style={styles.metricCardTitle}>취소</Text>
                          <View style={styles.metricCardMainRow}>
                            <Text style={styles.metricCardMain}>{mCanceled.count}</Text>
                            <Text style={styles.metricCardSub}>{unitText}</Text>
                          </View>
                          <View style={styles.metricDiffRow}>
                            <Text style={styles.metricDiffCount}>
                              {mCanceled.diffCount > 0 ? '+' : ''}{mCanceled.diffCount}
                            </Text>
                            <Text style={
                              mCanceled.diffPercent >= 0 ? styles.metricDiffPercentP : styles.metricDiffPercentM
                            }>
                              {mCanceled.diffPercent > 0 ? '+' : ''}{mCanceled.diffPercent}%
                            </Text>
                          </View>
                        </View>

                        {/* 확정 (Confirmed) */}
                        <View style={styles.metricCardBox}>
                          <Text style={styles.metricCardTitle}>확정</Text>
                          <View style={styles.metricCardMainRow}>
                            <Text style={styles.metricCardMain}>{mConfirmed.count}</Text>
                            <Text style={styles.metricCardSub}>{unitText}</Text>
                          </View>
                          <View style={styles.metricDiffRow}>
                            <Text style={styles.metricDiffCount}>
                              {mConfirmed.diffCount > 0 ? '+' : ''}{mConfirmed.diffCount}
                            </Text>
                            <Text style={
                              mConfirmed.diffPercent >= 0 ? styles.metricDiffPercentP : styles.metricDiffPercentM
                            }>
                              {mConfirmed.diffPercent > 0 ? '+' : ''}{mConfirmed.diffPercent}%
                            </Text>
                          </View>
                        </View>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}

            {/* Customer Analysis */}
            {data.customerAnalysis && (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.rankHeaderRow}>
                  <Text style={styles.sectionHeaderNoMargin}>고객분석</Text>
                  <View style={styles.questionCircle}>
                    <Text style={styles.questionMark}>?</Text>
                  </View>
                </View>

                <View style={styles.customerCard}>
                  <View style={styles.donutContainer}>

                    {/* SVG DONUT */}
                    <View style={styles.donutSvgWrapper}>
                      <Svg width="200" height="100" viewBox="0 0 200 100">
                        <G rotation="-180" origin="100, 100">
                          {/* Male (Blue) Arc */}
                          <Circle
                            cx="100" cy="100" r={donutRadius}
                            fill="none" stroke="#4A7EFC" strokeWidth="24"
                            strokeDasharray={`${maleDonutLength} 1000`}
                            strokeDashoffset="0"
                          />
                          {/* Gap between red and blue (white stroke) -> just let rotation handle it if we want */}
                          {/* Female (Red) Arc */}
                          <Circle
                            cx="100" cy="100" r={donutRadius}
                            fill="none" stroke="#ED5C6A" strokeWidth="24"
                            strokeDasharray={`${femaleDonutLength} 1000`}
                            rotation={(data.customerAnalysis.malePercent / 100) * 180 + 1}
                            origin="100,100"
                          />
                        </G>
                      </Svg>
                    </View>

                    {/* Left Male Label */}
                    <View style={styles.donutLeftLabel}>
                      <Text style={styles.donutPercentText}>{data.customerAnalysis.malePercent}<Text style={styles.percentSmall}>%</Text></Text>
                      <View style={styles.genderRow}>
                        <View style={[styles.dot, styles.dotBlue, { width: 6, height: 6 }]} />
                        <Text style={styles.genderLabelText}>남자</Text>
                      </View>
                    </View>

                    {/* Right Female Label */}
                    <View style={styles.donutRightLabel}>
                      <Text style={styles.donutPercentText}>{data.customerAnalysis.femalePercent}<Text style={styles.percentSmall}>%</Text></Text>
                      <View style={styles.genderRow}>
                        <View style={[styles.dot, styles.dotRed, { width: 6, height: 6, backgroundColor: '#ED5C6A' }]} />
                        <Text style={styles.genderLabelText}>여자</Text>
                      </View>
                    </View>
                  </View>

                  {/* Age Stats List */}
                  <View style={styles.ageGraphContainer}>
                    {data.customerAnalysis.ageStats.map((stat, idx) => (
                      <View key={`age-${idx}`} style={styles.ageRow}>
                        {/* Male Bar (Right to Left) */}
                        <View style={styles.ageSideBox}>
                          <Text style={[styles.agePercentText, { color: '#4A7EFC' }]}>{stat.male}%</Text>
                          <View style={[styles.ageBarBg, styles.ageBarBgLeft]}>
                            <View style={[styles.ageBarFillBlue, { width: `${stat.male}%` }]} />
                          </View>
                        </View>

                        {/* Age Label */}
                        <View style={styles.ageLabelBox}>
                          <Text style={styles.ageLabelText}>{stat.age}</Text>
                        </View>

                        {/* Female Bar (Left to Right) */}
                        <View style={styles.ageSideBox}>
                          <View style={[styles.ageBarBg, styles.ageBarBgRight]}>
                            <View style={[styles.ageBarFillRed, { width: `${stat.female}%` }]} />
                          </View>
                          <Text style={[styles.agePercentText, { color: '#ED5C6A' }]}>{stat.female}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Cancel Stats */}
            {data.cancelStats && (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.rankHeaderRow}>
                  <Text style={styles.sectionHeaderNoMargin}>취소율·취소주체</Text>
                  <View style={styles.questionCircle}>
                    <Text style={styles.questionMark}>?</Text>
                  </View>
                </View>

                <View style={styles.cancelCard}>
                  {/* Top Rate Box */}
                  <View style={[styles.cancelRateBox, { marginHorizontal: 20, width: 'auto' }]}>
                    <Text style={styles.cancelRateNumber}>
                      {data.cancelStats.rate}<Text style={styles.percentSmall}>%</Text>
                    </Text>
                    <View style={styles.cancelChangeRow}>
                      <Text style={styles.cancelChangeLabel}>이전기간대비 </Text>
                      <Text style={[
                        styles.cancelChangeValue,
                        data.cancelStats.rateChange >= 0 ? styles.cancelChangeRed : styles.cancelChangeBlue
                      ]}>
                        {data.cancelStats.rateChange > 0 ? '+' : ''}{data.cancelStats.rateChange}%p
                      </Text>
                    </View>
                  </View>

                  {/* Cancel Ranking */}
                  {data.cancelStats.reasons.map((reason, index) => {
                    const isFirst = index === 0;
                    const widthPercent = (reason.count / maxCancelCount) * 100;

                    return (
                      <View key={`cancel-${index}`}>
                        <View style={styles.cancelRankRowContent}>
                          {/* Background Bar */}
                          <View style={[
                            styles.rankRowBackground,
                            { width: `${widthPercent}%`, backgroundColor: isFirst ? '#EAF5EF' : '#F5F5F5' }
                          ]} />

                          <Text style={[styles.rankNumberText, isFirst && styles.rankTextGreen]}>
                            {index + 1}
                          </Text>
                          <Text
                            style={[styles.rankNameText, isFirst && styles.rankTextGreen]}
                            numberOfLines={1}
                          >
                            {reason.name}
                          </Text>
                          <Text style={[styles.rankRevenueText, isFirst && styles.rankTextGreen]}>
                            {reason.count}회
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Room Rankings */}
            {data.roomRankings && data.roomRankings.length > 0 && (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.rankHeaderRow}>
                  <Text style={styles.sectionHeaderNoMargin}>객실별 순매출</Text>
                  <View style={styles.questionCircle}>
                    <Text style={styles.questionMark}>?</Text>
                  </View>
                </View>

                <View style={styles.rankCard}>
                  {data.roomRankings.map((room, index) => {
                    const isFirst = index === 0;
                    const widthPercent = (room.revenue / maxRankRevenue) * 100;

                    return (
                      <View key={`rank-${index}`}>
                        <View style={styles.rankRowContent}>
                          {/* Background Bar */}
                          <View style={[
                            styles.rankRowBackground,
                            { width: `${widthPercent}%`, backgroundColor: isFirst ? '#EAF5EF' : '#F5F5F5' }
                          ]} />

                          <Text style={[styles.rankNumberText, isFirst && styles.rankTextGreen]}>
                            {index + 1}
                          </Text>
                          <Text
                            style={[styles.rankNameText, isFirst && styles.rankTextGreen]}
                            numberOfLines={1}
                          >
                            {room.name}
                          </Text>
                          <Text style={[styles.rankRevenueText, isFirst && styles.rankTextGreen]}>
                            {room.revenue.toLocaleString()}원
                          </Text>
                        </View>

                        {/* Standard border line below items except the last, like the image */}
                        {index < data.roomRankings.length - 1 && (
                          <View style={styles.rankDivider} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* 게스트하우스 풀 스크린 (바텀시트 느낌) */}
      <GuesthouseProfileList
        visible={isGuesthouseListVisible}
        onClose={() => setIsGuesthouseListVisible(false)}
        items={guesthouseProfiles}
        selectedId={selectedProfileId}
        onSelect={(item) => {
          setSelectedProfileId(item.id);
          setIsGuesthouseListVisible(false);
        }}
        onAdd={() => {
          setIsGuesthouseListVisible(false);
          navigation.navigate('StoreRegisterForm1');
        }}
      />
    </View>
  );
};

export default SalesManagement;
