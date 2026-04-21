import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useUserStore from '@stores/userStore';
import settlementApi from '@utils/api/settlementApi';
import Header from '@components/Header';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';

import ChevronLeftBlack from '@assets/images/chevron_left_black.svg';
import ChevronRightBlack from '@assets/images/chevron_right_black.svg';
import ChevronRightGray from '@assets/images/chevron_right_gray.svg';
import ChevronDown from '@assets/images/chevron_down_gray.svg';
import ChevronUp from '@assets/images/chevron_up_gray.svg';
import BankIcon from '@assets/images/guesthouse_gray.svg'; // Placeholder for bank icon

import styles from './SettlementManagement.styles';

const SettlementManagement = () => {
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
    () =>
      guesthouseProfiles.find(item => item.id === selectedProfileId) ||
      guesthouseProfiles[0] ||
      null,
    [guesthouseProfiles, selectedProfileId],
  );

  useEffect(() => {
    if (!guesthouseProfiles.length) {
      if (selectedProfileId !== null) setSelectedProfileId(null);
      return;
    }
    const hasSelected = guesthouseProfiles.some(profile => profile.id === selectedProfileId);
    if (!hasSelected) {
      if (passedGuesthouseId && guesthouseProfiles.some(p => p.id === String(passedGuesthouseId))) {
        setSelectedProfileId(String(passedGuesthouseId));
      } else {
        setSelectedProfileId(guesthouseProfiles[0].id);
      }
    }
  }, [guesthouseProfiles, selectedProfileId, passedGuesthouseId]);

  const guesthouseId = selectedGuesthouse?.id;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [overviewData, setOverviewData] = useState(null);

  const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const displayMonth = `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`;

  useEffect(() => {
    const fetchOverview = async () => {
      if (!guesthouseId) {
        console.warn('API FETCH 중단: guesthouseId가 없습니다 (게스트하우스 미선택 혹은 프로필 구조 다름)', hostProfile);
        return;
      }
      try {
        const response = await settlementApi.getSettlementOverview(guesthouseId, yearMonth);

        // 백엔드 구조가 { code, data: {...} } 형태의 래퍼(Wrapper)로 감싸져 있을 상황을 대비
        let result = response.data || response;
        if (result && result.data && !result.yearMonth) {
          result = result.data;
        }

        console.log('====== SETTLEMENT API RAW RESPONSE ======', JSON.stringify(result, null, 2));
        setOverviewData(result);
      } catch (err) {
        console.warn('Settlement API Error:', err);
      }
    };
    fetchOverview();
  }, [guesthouseId, yearMonth, hostProfile]);

  const handlePrevMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  const safeData = overviewData || {};
  const {
    settlementAccount = {
      bankName: '계좌 ',
      accountMasked: '미등록',
    },
    upcomingPayoutAmount = 0,
    accumulatedSettlementAmount = 0,
    grossSalesAmount = 0,
    commissionAmount = 0,
    batches = [],
  } = safeData;

  const formatNumber = (num) => Number(num || 0).toLocaleString();

  const getStatusBadgeStyle = status => {
    switch (status) {
      case 'PENDING':
        return [styles.badge, styles.badgePending];
      case 'COMPLETE':
      case 'COMPLETED':
      case 'PAID':
        return [styles.badge, styles.badgeComplete];
      case 'HOLD':
        return [styles.badge, styles.badgeHold];
      default:
        return [styles.badge, styles.badgeComplete];
    }
  };

  const getStatusTextStyle = status => {
    switch (status) {
      case 'PENDING':
        return [styles.badgeText, styles.badgePendingText];
      case 'COMPLETE':
      case 'COMPLETED':
      case 'PAID':
        return [styles.badgeText, styles.badgeCompleteText];
      case 'HOLD':
        return [styles.badgeText, styles.badgeHoldText];
      default:
        return [styles.badgeText, styles.badgeCompleteText];
    }
  };

  const getStatusLabel = status => {
    switch (status) {
      case 'PENDING':
        return '입금대기';
      case 'COMPLETE':
      case 'COMPLETED':
      case 'PAID':
        return '입금완료';
      case 'HOLD':
        return '입금보류';
      default:
        return status || '완료';
    }
  };

  return (
    <View style={styles.container}>
      {/* 커스텀 헤더 (업장 선택기 내장) */}
      <View style={styles.customHeader}>
        <View style={styles.customHeaderInner}>
          <TouchableOpacity
            style={styles.customHeaderLeft}
            onPress={() => navigation.goBack()}
          >
            {/* Header용 회색 아이콘 대신 기존 검은색 아이콘 활용 */}
            <ChevronLeftBlack width={28} height={28} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.customHeaderTitleBtn}
            onPress={() => setIsGuesthouseListVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.customHeaderTitleText}>
              {selectedGuesthouse?.name || '정산 관리'}
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
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>

        {/* Month Selector Card */}
        <View style={[styles.card, styles.monthSelectorCard]}>
          <TouchableOpacity style={styles.iconButton} onPress={handlePrevMonth}>
            <ChevronLeftBlack width={20} height={20} />
          </TouchableOpacity>
          <Text style={styles.monthText}>{displayMonth}</Text>
          <TouchableOpacity style={styles.iconButton} onPress={handleNextMonth}>
            <ChevronRightBlack width={20} height={20} />
          </TouchableOpacity>
        </View>

        {/* Action Account Info Card */}
        <TouchableOpacity style={[styles.card, styles.accountCard]} activeOpacity={0.8} onPress={() => navigation.navigate('SettlementAccountChange', { guesthouseId })}>
          <View style={styles.accountIconWrapper}>
            <BankIcon width={24} height={24} />
          </View>
          <View style={styles.accountInfoBox}>
            <Text style={styles.accountLabel}>정산 계좌 정보</Text>
            <Text style={styles.accountNumber}>{settlementAccount.bankName} {settlementAccount.accountMasked}</Text>
          </View>
          <ChevronRightGray width={20} height={20} />
        </TouchableOpacity>

        {/* Main Summary Card */}
        <View style={styles.card}>
          <Text style={styles.summarySubtext}>
            {safeData?.nextPayoutDate || `${currentDate.getMonth() + 1}월 입금 예정`}
          </Text>
          <Text style={styles.primaryAmountText}>{formatNumber(upcomingPayoutAmount)}원</Text>

          <View style={styles.divider} />

          <Text style={styles.cumulativeLabel}>{currentDate.getMonth() + 1}월 누적 정산액</Text>
          <View style={styles.settlementAccumulatedRow}>
            <Text style={styles.cumulativeAmount}>{formatNumber(accumulatedSettlementAmount)}원</Text>
          </View>
          {(safeData?.growthRate || '+12.5%') && (
            <Text style={styles.comparisonText}>
              {safeData?.growthRate || '+12.5%'} 대비 지난달
            </Text>
          )}
        </View>

        {/* Two Columns Row */}
        <View style={styles.rowContainer}>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.halfCardLabel}>총 매출액 (부가세 포함)</Text>
            <Text style={styles.halfCardAmount}>{formatNumber(grossSalesAmount)}원</Text>
          </View>
          <View style={[styles.card, styles.halfCard]}>
            <Text style={styles.halfCardLabel}>수수료 (3.4%)</Text>
            <Text style={styles.halfCardAmount}>{formatNumber(commissionAmount)}원</Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>상세 내역</Text>
          <TouchableOpacity style={styles.downloadButton}>
            <Text style={styles.downloadText}>엑셀 다운로드 ↓</Text>
          </TouchableOpacity>
        </View>

        {/* Detail List */}
        {batches.map(item => (
          <TouchableOpacity
            key={item.batchId}
            style={[styles.card, styles.detailItemCard]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('SettlementDetail', { batchId: item.batchId })}
          >
            <View style={styles.detailItemHeader}>
              <View>
                <Text style={styles.detailItemDateTop}>정산액 입금일</Text>
                <Text style={styles.detailItemDateTopValue}>
                  {item.payoutDate ? item.payoutDate.replace(/-/g, '.') : '-'}
                </Text>
              </View>
              <View style={getStatusBadgeStyle(item.payoutStatus)}>
                <Text style={getStatusTextStyle(item.payoutStatus)}>
                  {getStatusLabel(item.payoutStatus)}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailItemBody}>
              <View style={styles.detailColLeft}>
                <View style={styles.detailMetaTextRow}>
                  <Text style={styles.detailMetaLabel}>건수</Text>
                  <Text style={styles.detailMetaValue}>{item.itemCount}건</Text>
                </View>
              </View>
              <View style={styles.detailColRight}>
                <Text style={styles.detailItemAmount}>{formatNumber(item.finalSettlementAmount)}원</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}

      </ScrollView>

      <GuesthouseProfileList
        visible={isGuesthouseListVisible}
        onClose={() => setIsGuesthouseListVisible(false)}
        items={guesthouseProfiles}
        selectedId={selectedProfileId}
        onSelect={item => {
          setSelectedProfileId(item.id);
          setIsGuesthouseListVisible(false);
          // When changed, reset overview data so it shows loading/empty gracefully
          setOverviewData(null);
        }}
        onAdd={() => {
          setIsGuesthouseListVisible(false);
          navigation.navigate('StoreRegisterForm1');
        }}
      />
    </View>
  );
};

export default SettlementManagement;
