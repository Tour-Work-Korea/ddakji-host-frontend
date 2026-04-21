import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, LayoutAnimation, Platform, UIManager, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Header from '@components/Header';
import ChevronDownGray from '@assets/images/chevron_right_gray.svg'; 
import settlementApi from '@utils/api/settlementApi';
import {COLORS} from '@constants/colors';

import styles from './SettlementDetail.styles';

if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const SettlementDetail = () => {
  const route = useRoute();
  const batchId = route.params?.batchId;

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    const fetchDetail = async () => {
      if (!batchId) {
        setLoading(false);
        return;
      }
      try {
        const response = await settlementApi.getSettlementBatchDetail(batchId);
        let result = response.data || response;
        if (result && result.data && !result.batchId) {
          result = result.data;
        }
        setDetailData(result);
      } catch (err) {
        console.warn('Settlement Detail API Error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [batchId]);

  const toggleAccordion = (itemId) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  if (loading) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={COLORS.primary_blue} />
      </View>
    );
  }

  const data = detailData || {};
  const items = data.items || [];
  
  const formatNumber = num => Number(num || 0).toLocaleString();

  const getStatusBadgeStyle = status => {
    switch (status) {
      case 'PENDING':
        return [styles.badgeComplete, { backgroundColor: COLORS.secondary_yellow }];
      case 'COMPLETE':
      case 'COMPLETED':
      case 'PAID':
        return styles.badgeComplete;
      case 'HOLD':
        return [styles.badgeComplete, { backgroundColor: COLORS.secondary_red }];
      default:
        return styles.badgeComplete;
    }
  };
  
  const getStatusTextStyle = status => {
    switch (status) {
      case 'PENDING':
        return [styles.badgeCompleteText, { color: COLORS.semantic_yellow }];
      case 'COMPLETE':
      case 'COMPLETED':
      case 'PAID':
        return styles.badgeCompleteText;
      case 'HOLD':
        return [styles.badgeCompleteText, { color: COLORS.semantic_red }];
      default:
        return styles.badgeCompleteText;
    }
  };
  
  const getStatusLabel = status => {
    switch (status) {
      case 'PENDING': return '입금대기';
      case 'COMPLETE': 
      case 'COMPLETED': 
      case 'PAID': return '입금완료';
      case 'HOLD': return '입금보류';
      default: return status || '완료';
    }
  };

  const headerDateString = data.payoutDate ? `${data.payoutDate.split('-')[0]}년 ${parseInt(data.payoutDate.split('-')[1], 10)}월 ${parseInt(data.payoutDate.split('-')[2], 10)}일 정산` : '-';

  return (
    <View style={styles.container}>
      <Header title="정산 상세 내역" showBackButton={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}>
        
        {/* Top Header Card */}
        <View style={styles.card}>
          <View style={styles.headerCardTopRow}>
            <Text style={styles.headerDateText}>{headerDateString}</Text>
            <View style={getStatusBadgeStyle(data.payoutStatus)}>
              <Text style={getStatusTextStyle(data.payoutStatus)}>{getStatusLabel(data.payoutStatus)}</Text>
            </View>
          </View>
          <Text style={styles.headerAmount}>{formatNumber(data.finalSettlementAmount)}원</Text>
        </View>

        {/* Summary Box */}
        <View style={styles.card}>
          <View style={styles.summaryHeaderRow}>
            <Text style={styles.sectionTitle}>정산 요약</Text>
          </View>
          
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>총 매출액 (부가세 포함)</Text>
            <Text style={styles.rowValue}>{formatNumber(data.grossSalesAmount)}원</Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.rowLabel}>총 수수료</Text>
            <Text style={styles.rowValueRed}>-{formatNumber(data.commissionAmount)}원</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.rowItem}>
            <Text style={styles.finalLabel}>최종 정산액</Text>
            <Text style={styles.finalAmountRed}>{formatNumber(data.finalSettlementAmount)}원</Text>
          </View>
        </View>

        {/* Included Reservations Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionTitle}>포함된 예약 내역</Text>
          <Text style={styles.listCountText}>{items.length}건</Text>
        </View>

        {items.map((item) => {
          const isCancel = item.settlementType === 'CANCELED' || (item.cancellationLines && item.cancellationLines.length > 0);
          const hasDiffFee = isCancel && item.cancellationLines && item.cancellationLines.length > 1;
          const hasSingleCancelFee = isCancel && item.cancellationLines && item.cancellationLines.length === 1;
          const isExpanded = expandedItems[item.settlementItemId] || false;

          return (
            <View key={item.settlementItemId} style={styles.itemCard}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemName}>{item.guestName || '예약자'}</Text>
                <View style={isCancel ? styles.badgeCancel : styles.badgeNormal}>
                  <Text style={isCancel ? styles.badgeCancelText : styles.badgeNormalText}>
                    {isCancel ? '취소 정산' : '이용완료'}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemResNumber}>예약 번호: {item.reservationCode}</Text>

              <View style={styles.innerCalcBox}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>결제 금액</Text>
                  <Text style={isCancel ? styles.calcValueCancel : styles.calcValue}>₩ {formatNumber(item.originalOrderAmount)}</Text>
                </View>

                {hasDiffFee ? (
                  <>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>적용 규정</Text>
                      <TouchableOpacity 
                        style={styles.dropdownMockRow} 
                        onPress={() => toggleAccordion(item.settlementItemId)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.dropdownMockText}>차등 수수료 적용</Text>
                        <ChevronDownGray width={14} height={14} style={{transform: [{rotate: isExpanded ? '-90deg' : '90deg'}]}} />
                      </TouchableOpacity>
                    </View>

                    {isExpanded && (
                      <View style={styles.diffLevelBox}>
                        {item.cancellationLines.map((line, idx) => (
                          <View key={idx} style={[styles.diffLevelRow, idx === item.cancellationLines.length - 1 && {marginBottom: 0}]}>
                            <View>
                              <Text style={styles.diffLevelTitle}>
                                {line.sequence}차 ({line.stayDate ? line.stayDate.substring(5).replace('-', '.') : ''})
                              </Text>
                              <Text style={styles.diffLevelDesc}>{line.policyRuleLabel}</Text>
                            </View>
                            <Text style={line.settlementPenaltyAmount > 0 ? styles.diffLevelValueBold : styles.diffLevelValueNormal}>
                              위약금 {line.penaltyRate}% 발생 (₩{formatNumber(line.settlementPenaltyAmount)})
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={[styles.calcRow, isExpanded ? {marginTop: 12} : null]}>
                      <Text style={styles.calcLabel}>취소 위약금</Text>
                      <Text style={styles.calcValue}>₩ {formatNumber(item.cancellationLines.reduce((sum, line) => sum + (line.settlementPenaltyAmount || 0), 0))}</Text>
                    </View>
                  </>
                ) : hasSingleCancelFee ? (
                  <>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>적용 규정</Text>
                      <Text style={styles.cancelRuleTextRed}>
                        {item.cancellationLines[0].policyRuleLabel} (위약금 {item.cancellationLines[0].penaltyRate}% 발생)
                      </Text>
                    </View>
                    <View style={styles.calcRow}>
                      <Text style={styles.calcLabel}>취소 위약금</Text>
                      <Text style={styles.calcValue}>₩ {formatNumber(item.cancellationLines[0].settlementPenaltyAmount || 0)}</Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.calcRow}>
                    <Text style={styles.calcLabel}>정산 대상 금액</Text>
                    <Text style={styles.calcValue}>₩ {formatNumber(item.settlementBaseAmount)}</Text>
                  </View>
                )}

                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>수수료 ({(item.commissionRateBps / 100).toFixed(1)}%)</Text>
                  <Text style={styles.calcValueRed}>-₩ {formatNumber(item.commissionAmount)}</Text>
                </View>
                
                <View style={styles.finalCalcRow}>
                  <Text style={styles.finalCalcLabel}>최종 정산액</Text>
                  <Text style={styles.finalCalcValue}>₩ {formatNumber(item.finalSettlementAmount)}</Text>
                </View>
              </View>

              <Text style={styles.footerMetaText}>기준 일시: {item.recognizedDate?.replace(/-/g, '.')}</Text>
            </View>
          );
        })}

      </ScrollView>
    </View>
  );
};

export default SettlementDetail;
