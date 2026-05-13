import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import statisticsApi from '@utils/api/statisticsApi';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';
import { useGuesthouseProfiles } from '@hooks/useGuesthouseProfiles';
import MonthPickerModal from '@components/modals/MonthPickerModal';
import ChevronLeftBlack from '@assets/images/chevron_left_black.svg';
import ChevronLeftIcon from '@assets/images/chevron_left_black.svg';
import ChevronRightIcon from '@assets/images/chevron_right_black.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import Svg, { Circle, G } from 'react-native-svg';
import styles from './SalesManagement.styles';
import { COLORS } from '@constants/colors';

const RESERVATION_METRIC_ROUTE_MAP = {
  application: {
    title: '신청',
    status: '대기',
  },
  completed: {
    title: '이용완료',
    status: '완료',
  },
  cancelled: {
    title: '취소',
    status: '취소',
  },
  confirmed: {
    title: '확정',
    status: '확정',
  },
};

const unwrapApiPayload = response => {
  let result = response?.data ?? response;
  if (result?.data) {
    result = result.data;
  }
  return result;
};

const SalesManagement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { width: windowWidth } = useWindowDimensions();

  const passedGuesthouseId = route.params?.guesthouseId;
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(passedGuesthouseId ? String(passedGuesthouseId) : null);

  const { guesthouseProfiles } = useGuesthouseProfiles();

  const selectedGuesthouse = useMemo(
    () => guesthouseProfiles.find(p => p.id === selectedProfileId) || guesthouseProfiles[0],
    [guesthouseProfiles, selectedProfileId],
  );

  const [reservationMetricMode, setReservationMetricMode] = useState('count'); // 'count' | 'person'

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMonthPickerVisible, setIsMonthPickerVisible] = useState(false);
  const [salesData, setSalesData] = useState(null);
  const [reservationMetricsData, setReservationMetricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSalesData = async () => {
      if (!selectedGuesthouse?.id) {
        return;
      }
      setIsLoading(true);
      try {
        const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        const [salesResponse, reservationMetricsResponse] = await Promise.allSettled([
          statisticsApi.getSalesDashboard(selectedGuesthouse.id, yearMonth),
          statisticsApi.getReservationMetrics(selectedGuesthouse.id, yearMonth),
        ]);

        if (salesResponse.status === 'fulfilled') {
          setSalesData(unwrapApiPayload(salesResponse.value));
        } else {
          console.warn('Sales Dashboard Fetch Error:', salesResponse.reason);
          setSalesData(null);
        }

        if (reservationMetricsResponse.status === 'fulfilled') {
          setReservationMetricsData(unwrapApiPayload(reservationMetricsResponse.value));
        } else {
          console.warn('Reservation Metrics Fetch Error:', reservationMetricsResponse.reason);
          setReservationMetricsData(null);
        }
      } catch (err) {
        console.warn('Sales Dashboard Fetch Error:', err);
        setSalesData(null);
        setReservationMetricsData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSalesData();
  }, [selectedGuesthouse?.id, currentDate]);

  const handlePrev = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
  };

  const handleNext = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    const now = new Date();
    if (next <= now || (next.getFullYear() === now.getFullYear() && next.getMonth() === now.getMonth())) {
      setCurrentDate(next);
    }
  };

  const isPrevDisabled = false;
  const isNextDisabled = currentDate.getFullYear() === new Date().getFullYear() && currentDate.getMonth() === new Date().getMonth();

  const selectedYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const displayDateStr = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;
  const reservationMetrics = reservationMetricsData?.metrics ?? salesData?.reservationMetrics;
  const isCompactWidth = windowWidth < 360;
  const donutSvgWidth = isCompactWidth ? 168 : 200;
  const donutSvgHeight = donutSvgWidth / 2;
  const donutLabelSideOffset = isCompactWidth ? 4 : 20;
  const donutLabelTopOffset = isCompactWidth ? 34 : 40;

  const handleReservationMetricPress = metricKey => {
    const config = RESERVATION_METRIC_ROUTE_MAP[metricKey];
    if (!config || !selectedGuesthouse?.id) {
      return;
    }

    navigation.navigate('SalesReservationMetricList', {
      guesthouseId: selectedGuesthouse.id,
      title: `${config.title} 예약`,
      yearMonth: selectedYearMonth,
      initialReservationStatus: config.status,
    });
  };

  let maxCancelCount = 1;
  let maleDonutLength = 0;
  let femaleDonutLength = 0;
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const halfCircumference = donutCircumference / 2;

  if (salesData) {
    if (salesData.cancellationAnalysis && salesData.cancellationAnalysis.subjects && salesData.cancellationAnalysis.subjects.length > 0) {
      maxCancelCount = salesData.cancellationAnalysis.subjects[0].count;
    }
    if (salesData.customerAnalysis) {
      maleDonutLength = (salesData.customerAnalysis.maleShare / 100) * halfCircumference;
      femaleDonutLength = (salesData.customerAnalysis.femaleShare / 100) * halfCircumference;
    }
  }

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
            <Text
              style={styles.customHeaderTitleText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
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
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsMonthPickerVisible(true)}
            style={[{ flexDirection: 'row', alignItems: 'center' }, styles.customHeaderTitleBtn]}
          >
            <Text style={styles.monthTitleText}>
              {displayDateStr}
            </Text>
            <ChevronDown width={16} height={16} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNext}
            style={styles.monthSwitcherTouch}
            disabled={isNextDisabled}
          >
            <ChevronRightIcon width={20} height={20} opacity={isNextDisabled ? 0.2 : 1} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ flex: 1, minHeight: 300, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary_blue} />
          </View>
        ) : !salesData ? (
          <View style={{ flex: 1, minHeight: 300, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: COLORS.grayscale_500 }}>데이터가 존재하지 않습니다.</Text>
          </View>
        ) : (
          <>
            {/* Main Sales Card */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 18, color: COLORS.grayscale_900, fontWeight: 'bold' }}>순매출</Text>
              </View>
            </View>

            {/* Main Sales Card */}
            <View style={styles.mainCard}>
              <View style={{ marginBottom: 24 }}>
                <View style={[styles.mainCardAmountRow, { marginBottom: 4 }]}>
                  <Text style={styles.mainCardAmount}>{(salesData.salesSummary?.currentNetSales || 0).toLocaleString()}</Text>
                  <Text style={styles.mainCardCurrency}>원</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500', marginRight: 4 }}>이전기간대비</Text>
                  <Text style={{ fontSize: 14, color: salesData.salesSummary?.deltaNetSales >= 0 ? COLORS.semantic_red : COLORS.semantic_blue, fontWeight: 'bold' }}>
                    {salesData.salesSummary?.deltaNetSales > 0 ? '+' : ''}{(salesData.salesSummary?.deltaNetSales || 0).toLocaleString()}
                  </Text>
                </View>
              </View>

              <View style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>전체 매출</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>{(salesData.salesSummary?.currentGrossSales || 0).toLocaleString()}원</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>취소/노쇼</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>
                    -{(salesData.salesSummary?.currentCancelledSales || 0).toLocaleString()}원
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: COLORS.grayscale_600, fontWeight: '500' }}>취소수수료</Text>
                  <Text style={{ fontSize: 15, color: COLORS.grayscale_900, fontWeight: 'bold' }}>
                    +{(salesData.salesSummary?.currentCancellationFee || 0).toLocaleString()}원
                  </Text>
                </View>
              </View>
            </View>
            {/* Reservation Metrics */}
            {reservationMetrics && (
              <View style={{ marginBottom: 16 }}>
                <View style={[styles.rankHeaderRow, { justifyContent: 'space-between' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.sectionHeaderNoMargin}>예약 지표</Text>
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
                      if (!baseMetric) {
                        return { count: 0, diffCount: 0, diffPercent: 0 };
                      }
                      const target = reservationMetricMode === 'count' ? baseMetric.reservationCount : baseMetric.guestCount;
                      if (!target) {
                        return { count: 0, diffCount: 0, diffPercent: 0 };
                      }
                      return {
                        count: target.current || 0,
                        diffCount: target.delta || 0,
                        diffPercent: target.deltaRate || 0,
                      };
                    };

                    const mApplied = getMetric(reservationMetrics.application);
                    const mCompleted = getMetric(reservationMetrics.completed);
                    const mCanceled = getMetric(reservationMetrics.cancelled);
                    const mConfirmed = getMetric(reservationMetrics.confirmed);

                    const unitText = reservationMetricMode === 'count' ? '건' : '명';

                    return (
                      <>
                        {/* 신청 (Applied) */}
                        <TouchableOpacity
                          style={styles.metricCardBox}
                          activeOpacity={0.85}
                          onPress={() => handleReservationMetricPress('application')}
                        >
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
                        </TouchableOpacity>

                        {/* 이용완료 (Completed) */}
                        <TouchableOpacity
                          style={styles.metricCardBox}
                          activeOpacity={0.85}
                          onPress={() => handleReservationMetricPress('completed')}
                        >
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
                        </TouchableOpacity>

                        {/* 취소 (Canceled) */}
                        <TouchableOpacity
                          style={styles.metricCardBox}
                          activeOpacity={0.85}
                          onPress={() => handleReservationMetricPress('cancelled')}
                        >
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
                        </TouchableOpacity>

                        {/* 확정 (Confirmed) */}
                        <TouchableOpacity
                          style={styles.metricCardBox}
                          activeOpacity={0.85}
                          onPress={() => handleReservationMetricPress('confirmed')}
                        >
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
                        </TouchableOpacity>
                      </>
                    );
                  })()}
                </View>
              </View>
            )}

            {/* Customer Analysis */}
            {salesData.customerAnalysis && (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.rankHeaderRow}>
                  <Text style={styles.sectionHeaderNoMargin}>고객분석</Text>
                </View>

                <View style={styles.customerCard}>
                  <View style={styles.donutContainer}>

                    {/* SVG DONUT */}
                    <View style={[styles.donutSvgWrapper, { height: donutSvgHeight }]}>
                      <Svg width={donutSvgWidth} height={donutSvgHeight} viewBox="0 0 200 100">
                        <G rotation="-180" origin="100, 100">
                          {/* Male (Blue) Arc */}
                          <Circle
                            cx="100" cy="100" r={donutRadius}
                            fill="none" stroke="#4A7EFC" strokeWidth="24"
                            strokeDasharray={`${maleDonutLength} 1000`}
                            strokeDashoffset="0"
                          />
                          {/* Female (Red) Arc */}
                          <Circle
                            cx="100" cy="100" r={donutRadius}
                            fill="none" stroke="#ED5C6A" strokeWidth="24"
                            strokeDasharray={`${femaleDonutLength} 1000`}
                            rotation={(salesData.customerAnalysis.maleShare / 100) * 180 + 1}
                            origin="100,100"
                          />
                        </G>
                      </Svg>
                    </View>

                    {/* Left Male Label */}
                    <View style={[styles.donutLeftLabel, { left: donutLabelSideOffset, top: donutLabelTopOffset }]}>
                      <Text style={styles.donutPercentText}>{salesData.customerAnalysis.maleShare}<Text style={styles.percentSmall}>%</Text></Text>
                      <View style={styles.genderRow}>
                        <View style={[styles.dot, styles.dotBlue, { width: 6, height: 6 }]} />
                        <Text style={styles.genderLabelText}>남자</Text>
                      </View>
                    </View>

                    {/* Right Female Label */}
                    <View style={[styles.donutRightLabel, { right: donutLabelSideOffset, top: donutLabelTopOffset }]}>
                      <Text style={styles.donutPercentText}>{salesData.customerAnalysis.femaleShare}<Text style={styles.percentSmall}>%</Text></Text>
                      <View style={styles.genderRow}>
                        <View style={[styles.dot, styles.dotRed, { width: 6, height: 6, backgroundColor: '#ED5C6A' }]} />
                        <Text style={styles.genderLabelText}>여자</Text>
                      </View>
                    </View>
                  </View>

                  {/* Age Stats List */}
                  <View style={styles.ageGraphContainer}>
                    {salesData.customerAnalysis.ageBands.map((stat, idx) => (
                      <View key={`age-${idx}`} style={styles.ageRow}>
                        {/* Male Bar (Right to Left) */}
                        <View style={styles.ageSideBox}>
                          <Text style={[styles.agePercentText, { color: '#4A7EFC' }]}>{stat.malePercent}%</Text>
                          <View style={[styles.ageBarBg, styles.ageBarBgLeft]}>
                            <View style={[styles.ageBarFillBlue, { width: `${stat.malePercent}%` }]} />
                          </View>
                        </View>

                        {/* Age Label */}
                        <View style={styles.ageLabelBox}>
                          <Text style={styles.ageLabelText}>{stat.label}</Text>
                        </View>

                        {/* Female Bar (Left to Right) */}
                        <View style={styles.ageSideBox}>
                          <View style={[styles.ageBarBg, styles.ageBarBgRight]}>
                            <View style={[styles.ageBarFillRed, { width: `${stat.femalePercent}%` }]} />
                          </View>
                          <Text style={[styles.agePercentText, { color: '#ED5C6A' }]}>{stat.femalePercent}%</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Cancel Stats */}
            {salesData.cancellationAnalysis && (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.rankHeaderRow}>
                  <Text style={styles.sectionHeaderNoMargin}>취소율·취소주체</Text>
                </View>

                <View style={styles.cancelCard}>
                  {/* Top Rate Box */}
                  <View style={[styles.cancelRateBox, { marginHorizontal: 20, width: 'auto' }]}>
                    <Text style={styles.cancelRateNumber}>
                      {salesData.cancellationAnalysis.cancellationRate}<Text style={styles.percentSmall}>%</Text>
                    </Text>
                    <View style={styles.cancelChangeRow}>
                      <Text style={styles.cancelChangeLabel}>이전기간대비 </Text>
                      <Text style={[
                        styles.cancelChangeValue,
                        salesData.cancellationAnalysis.deltaPercentagePoint >= 0 ? styles.cancelChangeRed : styles.cancelChangeBlue
                      ]}>
                        {salesData.cancellationAnalysis.deltaPercentagePoint > 0 ? '+' : ''}{salesData.cancellationAnalysis.deltaPercentagePoint}%p
                      </Text>
                    </View>
                  </View>

                  {/* Cancel Ranking */}
                  {salesData.cancellationAnalysis.subjects.map((reason, index) => {
                    const isFirst = index === 0;
                    const widthPercent = maxCancelCount > 0 ? (reason.count / maxCancelCount) * 100 : 0;

                    return (
                      <View key={`cancel-${index}`}>
                        <View style={styles.cancelRankRowContent}>
                          {/* Background Bar */}
                          <View style={[
                            styles.rankRowBackground,
                            { width: `${widthPercent}%`, backgroundColor: isFirst ? COLORS.secondary_blue : '#F5F5F5' }
                          ]} />

                          <Text style={[styles.rankNumberText, isFirst && styles.rankTextHighlight]}>
                            {index + 1}
                          </Text>
                          <Text
                            style={[styles.rankNameText, isFirst && styles.rankTextHighlight]}
                            numberOfLines={1}
                          >
                            {reason.label}
                          </Text>
                          <Text style={[styles.rankRevenueText, isFirst && styles.rankTextHighlight]}>
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
            {salesData.roomNetSales && salesData.roomNetSales.length > 0 && (
              <View style={{ marginBottom: 40 }}>
                <View style={styles.rankHeaderRow}>
                  <Text style={styles.sectionHeaderNoMargin}>객실별 순매출</Text>
                </View>

                <View style={styles.rankCard}>
                  {salesData.roomNetSales.map((room, index) => {
                    const isFirst = index === 0;
                    const maxRankRevenue = salesData.roomNetSales[0].netSales;
                    const widthPercent = maxRankRevenue > 0 ? (room.netSales / maxRankRevenue) * 100 : 0;

                    return (
                      <View key={`rank-${index}`}>
                        <View style={styles.rankRowContent}>
                          {/* Background Bar */}
                          <View style={[
                            styles.rankRowBackground,
                            { width: `${widthPercent}%`, backgroundColor: isFirst ? COLORS.secondary_blue : '#F5F5F5' }
                          ]} />

                          <Text style={[styles.rankNumberText, isFirst && styles.rankTextHighlight]}>
                            {index + 1}
                          </Text>
                          <Text
                            style={[styles.rankNameText, isFirst && styles.rankTextHighlight]}
                            numberOfLines={1}
                          >
                            {room.roomName}
                          </Text>
                          <Text style={[styles.rankRevenueText, isFirst && styles.rankTextHighlight]}>
                            {room.netSales.toLocaleString()}원
                          </Text>
                        </View>

                        {/* Standard border line below items except the last */}
                        {index < salesData.roomNetSales.length - 1 && (
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

      <MonthPickerModal
        visible={isMonthPickerVisible}
        initialDate={currentDate}
        onClose={() => setIsMonthPickerVisible(false)}
        onConfirm={(dateInfo) => {
          setCurrentDate(new Date(dateInfo.year, dateInfo.month - 1, 1));
          setIsMonthPickerVisible(false);
        }}
      />
    </View>
  );
};

export default SalesManagement;
