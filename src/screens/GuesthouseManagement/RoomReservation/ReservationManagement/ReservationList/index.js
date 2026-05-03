import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import EmptyState from '@components/EmptyState';
import ButtonWhite from '@components/ButtonWhite';
import Loading from '@components/Loading';
import AlertModal from '@components/modals/AlertModal';
import ReservationCancelModal from '@components/modals/HostMy/Guesthouse/ReservationCancelModal';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {formatLocalDateToDotWithDay} from '@utils/formatDate';
import EmptyIcon from '@assets/images/search_empty.svg';
import InfoIcon from '@assets/images/info_circle_red.svg';
import Toast from 'react-native-toast-message';

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

const STATUS_LABEL_MAP = {
  PENDING: '대기',
  CONFIRMED: '확정',
  CANCELLED: '취소',
  COMPLETED: '완료',
};
const STATUS_SORT_ORDER = {
  대기: 0,
  취소: 1,
  확정: 2,
  완료: 3,
};
const APPROVAL_LIMIT_HOUR = 11;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
const REJECT_REASON_OPTIONS = ['객실 만실', '숙소 내부 사정', '예약 조건 미충족', '직접 입력'];
const DIRECT_INPUT_REASON = '직접 입력';

const toDate = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateKey = date => {
  if (!(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getApprovalDeadlineMeta = reservation => {
  const createdAt = toDate(reservation?.createdAt);
  if (!createdAt) {
    const fallbackDeadline = toDate(reservation?.approvalDeadlineAt);

    return fallbackDeadline
      ? {
          deadline: fallbackDeadline,
          unit: 'hour',
        }
      : null;
  }

  const checkInDate = reservation?.checkInDate?.split?.('T')?.[0] ?? reservation?.checkInDate;
  const isSameDayReservation = checkInDate && formatDateKey(createdAt) === checkInDate;
  const isSameDayAfterEleven = isSameDayReservation && createdAt.getHours() >= APPROVAL_LIMIT_HOUR;
  const limitMs = isSameDayAfterEleven ? 30 * MINUTE_MS : DAY_MS;

  return {
    deadline: new Date(createdAt.getTime() + limitMs),
    unit: isSameDayAfterEleven ? 'minute' : 'hour',
  };
};

const getApprovalDeadlineText = (reservation, now) => {
  if (reservation?.status !== '대기') return '';

  const deadlineMeta = getApprovalDeadlineMeta(reservation);
  if (!deadlineMeta?.deadline) return '';

  const diffMs = Math.max(0, deadlineMeta.deadline.getTime() - now.getTime());

  if (diffMs === 0) {
    return '기한 만료';
  }

  if (deadlineMeta.unit === 'minute' || diffMs < HOUR_MS) {
    const minutes = Math.ceil(diffMs / MINUTE_MS);
    return `${minutes}분 내 승인 필요`;
  }

  const hours = Math.ceil(diffMs / HOUR_MS);
  return `${hours}시간 내 승인 필요`;
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
    email: reservation?.userEmail ?? reservation?.email,
    serviceName: reservation?.guesthouseName ?? reservation?.serviceName,
    room: reservation?.roomName ?? reservation?.room,
    period,
    paymentStatus: reservation?.paymentStatus ?? (status === '취소' ? '환불' : '결제완료'),
    paymentState: reservation?.paymentState ?? (status === '취소' ? '환불' : '결제완료'),
    paymentAmount:
      reservation?.paymentAmount ??
      (Number.isFinite(amount) ? `${amount.toLocaleString('ko-KR')}원` : ''),
    showPendingActions:
      reservation?.showPendingActions != null
        ? reservation?.showPendingActions
        : status === '대기',
    showCancelButton:
      reservation?.showCancelButton != null
        ? reservation?.showCancelButton
        : status === '확정',
  };
};

const ReservationList = ({
  data,
  totalCount = 0,
  loading,
  loadingMore = false,
  onEndReached,
  onActionComplete,
}) => {
  const navigation = useNavigation();
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [decisionModalType, setDecisionModalType] = useState(null);
  const [decisionReasonOpen, setDecisionReasonOpen] = useState(false);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionReasonInput, setDecisionReasonInput] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, MINUTE_MS);

    return () => clearInterval(timer);
  }, []);

  const listData = Array.isArray(data)
    ? data.map(normalizeReservation).sort((a, b) => {
        const aOrder = STATUS_SORT_ORDER[a.status] ?? Number.MAX_SAFE_INTEGER;
        const bOrder = STATUS_SORT_ORDER[b.status] ?? Number.MAX_SAFE_INTEGER;
        return aOrder - bOrder;
      })
    : [];

  const handleOpenCancelModal = reservation => {
    setSelectedReservation({
      reservationId: reservation.reservationId || reservation.id,
      roomName: reservation.room,
      reservationUserName: reservation.name,
      reservationUserPhone: reservation.phone,
      age: reservation.age,
      reservationNumber: reservation.reservationNumber,
      guestCount: reservation.guestCount,
      period: reservation.period,
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
    });
    setCancelModalVisible(true);
  };

  const resetDecisionModal = () => {
    setDecisionModalType(null);
    setDecisionReasonOpen(false);
    setDecisionReason('');
    setDecisionReasonInput('');
    setDecisionSubmitting(false);
  };

  const handleOpenDecisionModal = (type, reservation) => {
    setSelectedReservation(reservation);
    setDecisionModalType(type);
    setDecisionReasonOpen(false);
    setDecisionReason('');
    setDecisionReasonInput('');
  };

  const handleConfirmDecision = async () => {
    const reservationId = selectedReservation?.reservationId ?? selectedReservation?.id;
    if (!reservationId || decisionSubmitting) return;

    if (decisionModalType === 'reject') {
      const finalReason =
        decisionReason === DIRECT_INPUT_REASON ? decisionReasonInput.trim() : decisionReason;

      if (!finalReason) {
        return;
      }

      try {
        setDecisionSubmitting(true);
        await hostGuesthouseApi.rejectGuesthouseReservationByHost(reservationId, {
          rejectReason: finalReason,
        });
        resetDecisionModal();
        Toast.show({
          type: 'success',
          text1: '예약이 반려되었어요.',
          position: 'top',
          visibilityTime: 2000,
        });
        await onActionComplete?.();
      } catch (error) {
        setDecisionSubmitting(false);
        Toast.show({
          type: 'error',
          text1: '예약 반려를 실패했어요.',
          position: 'top',
          visibilityTime: 2000,
        });
      }
      return;
    }

    try {
      setDecisionSubmitting(true);
      await hostGuesthouseApi.approveGuesthouseReservationByHost(reservationId);
      resetDecisionModal();
      Toast.show({
        type: 'success',
        text1: '예약이 확정되었어요.',
        position: 'top',
        visibilityTime: 2000,
      });
      await onActionComplete?.();
    } catch (error) {
      setDecisionSubmitting(false);
      Toast.show({
        type: 'error',
        text1: '예약 확정을 실패했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Loading title={'예약 내역을 불러오는 중 이에요'} />
      </View>
    );
  }

  if (Array.isArray(data) && data.length === 0) {
    return (
      <View style={styles.center}>
        <EmptyState
          icon={EmptyIcon}
          iconSize={{width: 100, height: 100}}
          title="예약 내역이 없어요"
          description=""
        />
      </View>
    );
  }

  const renderItem = ({item: reservation, index}) => {
    const statusStyle = STATUS_STYLE[reservation.status] || STATUS_STYLE.완료;
    const approvalDeadlineText = getApprovalDeadlineText(reservation, now);

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
            <View style={styles.userNameRow}>
              <Text style={[FONTS.fs_16_semibold, styles.userName]}>{reservation.name}</Text>
              {approvalDeadlineText ? (
                <View style={styles.approvalDeadlineWrap}>
                  <InfoIcon width={16} height={16} />
                  <Text style={[FONTS.fs_12_medium, styles.approvalDeadlineText]}>
                    {approvalDeadlineText}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[FONTS.fs_12_medium, styles.subText]}>{reservation.statusText}</Text>
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

        {reservation.showPendingActions ? (
          <View style={styles.pendingActionRow}>
            <ButtonWhite
              title="예약 확정"
              onPress={() => handleOpenDecisionModal('approve', reservation)}
              backgroundColor={COLORS.primary_orange}
              textColor={COLORS.grayscale_0}
              style={styles.pendingActionButton}
            />
            <ButtonWhite
              title="예약 반려"
              onPress={() => handleOpenDecisionModal('reject', reservation)}
              outlined
              borderColor={COLORS.grayscale_300}
              backgroundColor={COLORS.grayscale_0}
              textColor={COLORS.grayscale_700}
              style={[styles.pendingActionButton, styles.pendingActionButtonLast]}
            />
          </View>
        ) : null}

        {reservation.showCancelButton ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={e => {
                e.stopPropagation();
                handleOpenCancelModal(reservation);
              }}>
              <Text style={[FONTS.fs_14_medium, styles.cancelButtonText]}>예약취소</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {index !== listData.length - 1 ? <View style={styles.divider} /> : null}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={listData}
        keyExtractor={(item, index) => String(item.reservationId || item.id || index)}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <Text style={[FONTS.fs_18_semibold, styles.title]}>
            예약 <Text style={styles.titleHighlight}>{totalCount}</Text>건
          </Text>
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoading}>
              <ActivityIndicator color={COLORS.primary_orange} />
            </View>
          ) : null
        }
      />

      <ReservationCancelModal
        visible={cancelModalVisible}
        onClose={() => {
          setCancelModalVisible(false);
          setSelectedReservation(null);
        }}
        reservation={selectedReservation || {}}
        onSubmit={async () => {}}
      />

      <AlertModal
        visible={decisionModalType != null}
        title={decisionModalType === 'reject' ? '예약을 반려할까요?' : '예약을 확정할까요?'}
        message={
          decisionModalType === 'reject'
            ? '해당 예약을 반려하면 게스트에게 안내되며, 예약은 취소돼요'
            : '해당 예약을 확정하면\n게스트에게 예약 확정 알림이 전송돼요'
        }
        buttonText={decisionModalType === 'reject' ? '예약반려하기' : '예약확정하기'}
        buttonText2="취소"
        onPress={handleConfirmDecision}
        onPress2={resetDecisionModal}
        buttonDisabled={
          decisionSubmitting ||
          (decisionModalType === 'reject' &&
            !(
              decisionReason &&
              (decisionReason !== DIRECT_INPUT_REASON || decisionReasonInput.trim())
            ))
        }
        selectionLabel={decisionModalType === 'reject' ? '반려 사유' : undefined}
        selectionPlaceholder={decisionModalType === 'reject' ? '반려 사유를 선택해 주세요' : ''}
        selectionOptions={decisionModalType === 'reject' ? REJECT_REASON_OPTIONS : []}
        selectionOpen={decisionModalType === 'reject' ? decisionReasonOpen : false}
        selectedOption={decisionModalType === 'reject' ? decisionReason : ''}
        onToggleSelection={() => setDecisionReasonOpen(prev => !prev)}
        onSelectOption={option => {
          setDecisionReason(option);
          if (option !== DIRECT_INPUT_REASON) {
            setDecisionReasonInput('');
          }
          setDecisionReasonOpen(false);
        }}
        customOptionLabel={DIRECT_INPUT_REASON}
        customInputValue={decisionReasonInput}
        customInputPlaceholder="반려 사유를 입력해 주세요"
        onChangeCustomInput={setDecisionReasonInput}
      />
    </View>
  );
};

const InfoRow = ({label, value, isHighlight = false}) => {
  return (
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
};

export default ReservationList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 4,
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
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userName: {
    flex: 1,
    color: COLORS.grayscale_900,
  },
  approvalDeadlineText: {
    marginLeft: 4,
    color: COLORS.semantic_red,
  },
  approvalDeadlineWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
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
  },
  infoValueHighlight: {
    color: COLORS.primary_orange,
  },
  buttonRow: {
    alignItems: 'flex-end',
    marginTop: 16,
  },
  pendingActionRow: {
    flexDirection: 'row',
    marginTop: 16,
    width: '80%',
    alignSelf: 'flex-end',
  },
  pendingActionButton: {
    flex: 1,
    marginRight: 4,
  },
  pendingActionButtonLast: {
    marginRight: 0,
    marginLeft: 4,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_300,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: COLORS.grayscale_0,
  },
  cancelButtonText: {
    color: COLORS.grayscale_700,
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
