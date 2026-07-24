import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';

import ButtonWhite from '@components/ButtonWhite';
import Header from '@components/Header';
import AlertModal from '@components/modals/AlertModal';
import ReservationCancelModal from '@components/modals/HostMy/Guesthouse/ReservationCancelModal';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import { formatLocalDateToDotWithDay } from '@utils/formatDate';
import { formatPhoneNumber } from '@utils/formatPhoneNumber';
import Toast from 'react-native-toast-message';
import styles from './MyGuesthouseReservationDetail.styles';
import InfoIcon from '@assets/images/info_circle_red.svg';

const STATUS_STYLE = {
  대기: {
    badgeBackground: COLORS.secondary_yellow,
    badgeText: COLORS.semantic_yellow,
  },
  취소: {
    badgeBackground: COLORS.secondary_red,
    badgeText: COLORS.semantic_red,
  },
  반려: {
    badgeBackground: COLORS.secondary_brown,
    badgeText: COLORS.semantic_brown,
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
const REJECT_REASON_OPTIONS = ['객실 만실', '숙소 내부 사정', '예약 조건 미충족', '직접 입력'];
const DIRECT_INPUT_REASON = '직접 입력';
const APPROVAL_LIMIT_HOUR = 11;
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const getDateString = value => {
  if (!value) {
    return '';
  }

  return String(value).split('T')[0];
};

const getRoomIdFromReservation = reservation =>
  reservation?.roomId ??
  reservation?.roomInfoId ??
  reservation?.guesthouseRoomId ??
  reservation?.room?.roomId ??
  reservation?.room?.id ??
  null;

const toDate = value => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateKey = date => {
  if (!(date instanceof Date)) {
    return '';
  }

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
  if (reservation?.status !== '대기') {
    return '';
  }

  const deadlineMeta = getApprovalDeadlineMeta(reservation);
  if (!deadlineMeta?.deadline) {
    return '';
  }

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

const getGenderLabel = gender => {
  const normalizedGender = gender?.toUpperCase?.();

  if (normalizedGender === 'M') {
    return '남성';
  }
  if (normalizedGender === 'F') {
    return '여성';
  }

  return gender || '';
};

const mapReservationDetailToViewData = (reservation = {}) => {
  let status = STATUS_LABEL_MAP[reservation?.status] || reservation?.status || '완료';
  let isRejected = false;

  // 호스트가 반려한 경우 '취소' 대신 '반려'로 노출
  if (status === '취소' && reservation?.approvalStatus === 'REJECTED') {
    status = '반려';
    isRejected = true;
  }

  const completedTotal = Number(reservation?.completedTotal || 0);
  const canceledTotal = Number(reservation?.canceledTotal || 0);
  const birthYear = reservation?.birthDate?.split?.('-')?.[0];
  const amount = Number(reservation?.amount || 0);
  const period = reservation?.checkInDate && reservation?.checkOutDate
    ? `${formatLocalDateToDotWithDay(reservation.checkInDate)} ~ ${formatLocalDateToDotWithDay(
      reservation.checkOutDate,
    )}`
    : reservation?.period;

  return {
    ...reservation,
    reservationId: reservation?.reservationId ?? reservation?.id,
    status,
    isRejected,
    rejectedReason: reservation?.cancelledReason || reservation?.paymentCancelReason || '',
    rejectedAt: reservation?.refundAt || reservation?.createdAt || '',
    statusText: reservation?.statusText ?? `완료 ${completedTotal}, 취소 ${canceledTotal}`,
    name: reservation?.userName ?? reservation?.name,
    age: reservation?.age ?? (birthYear ? `${birthYear}년생` : ''),
    gender: getGenderLabel(reservation?.guestGender ?? reservation?.gender),
    phone: formatPhoneNumber(reservation?.userPhone ?? reservation?.phone),
    reservationNumber: reservation?.reservationCode ?? reservation?.reservationNumber,
    email: reservation?.userEmail ?? reservation?.email,
    guestCount:
      reservation?.guestCount != null && `${reservation?.guestCount}` !== ''
        ? `${reservation.guestCount}명`
        : reservation?.guestCount,
    serviceName: reservation?.guesthouseName ?? reservation?.serviceName,
    room: reservation?.roomName ?? reservation?.room,
    period,
    paymentMethod: reservation?.paymentMethod,
    paymentStatus: reservation?.paymentStatus ?? (status === '취소' ? '환불' : '결제완료'),
    paymentState: reservation?.paymentState ?? (status === '취소' ? '환불' : '결제완료'),
    paymentAmount:
      reservation?.paymentAmount ??
      (Number.isFinite(amount) ? `${amount.toLocaleString('ko-KR')}원` : ''),
    requests: reservation?.requests ?? '',
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

const formatDateWithTime = (dateStr) => {
  if (!dateStr) {
    return '';
  }

  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}.${month}.${day} ${hours}:${minutes}`;
};

const MyGuesthouseReservationDetail = ({ route }) => {
  const navigation = useNavigation();

  const handleCopyPhone = phone => {
    if (!phone) {
      return;
    }

    Clipboard.setString(String(phone));
    Toast.show({
      type: 'success',
      text1: '연락처가 복사되었습니다.',
      position: 'top',
    });
  };
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [decisionModalType, setDecisionModalType] = useState(null);
  const [decisionReasonOpen, setDecisionReasonOpen] = useState(false);
  const [decisionReason, setDecisionReason] = useState('');
  const [decisionReasonInput, setDecisionReasonInput] = useState('');
  const [decisionSubmitting, setDecisionSubmitting] = useState(false);
  const [roomCloseModal, setRoomCloseModal] = useState({
    visible: false,
    roomId: null,
    date: '',
    submitting: false,
  });
  const [now, setNow] = useState(() => new Date());
  const reservationId = route?.params?.reservationId;
  const [reservation, setReservation] = useState(
    mapReservationDetailToViewData(route?.params?.reservation || {}),
  );

  const fetchReservationDetail = useCallback(async () => {
    if (!reservationId) {
      return;
    }

    try {
      const response = await hostGuesthouseApi.getGuesthouseReservationDetail(reservationId);
      const payload = response?.data?.data ?? response?.data ?? {};
      setReservation(prev => ({
        ...prev,
        ...mapReservationDetailToViewData(payload),
      }));
    } catch (error) {
      console.error('게스트하우스 예약 상세 조회 실패:', error);
    }
  }, [reservationId]);

  useEffect(() => {
    fetchReservationDetail();
  }, [fetchReservationDetail]);

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, MINUTE_MS);

    return () => clearInterval(timer);
  }, []);

  const cancelModalReservation = {
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
  };

  const isCancelled = reservation.status === '취소';
  const isCompleted = reservation.status === '완료';
  const isConfirmed = reservation.status === '확정';
  const isRejected = reservation.isRejected;
  const isCancelledOrRejected = isCancelled || isRejected;

  const resetDecisionModal = () => {
    setDecisionModalType(null);
    setDecisionReasonOpen(false);
    setDecisionReason('');
    setDecisionReasonInput('');
    setDecisionSubmitting(false);
  };

  const handleOpenDecisionModal = type => {
    setDecisionModalType(type);
    setDecisionReasonOpen(false);
    setDecisionReason('');
    setDecisionReasonInput('');
  };

  const resolveGuesthouseId = () =>
    reservation?.guesthouseId ??
    route?.params?.guesthouseId ??
    route?.params?.reservation?.guesthouseId ??
    null;

  const resolveReservationRoomId = async () => {
    const directRoomId = getRoomIdFromReservation(reservation);
    const guesthouseId = resolveGuesthouseId();
    if (directRoomId) {
      return directRoomId;
    }

    if (!guesthouseId || !reservation?.room) {
      return null;
    }

    try {
      const response = await hostGuesthouseApi.getMyGuesthousesWithRooms();
      const payload = response?.data?.data ?? response?.data ?? [];
      const guesthouses = Array.isArray(payload) ? payload : [];
      const currentGuesthouse = guesthouses.find(
        item => String(item?.guesthouseId ?? item?.id) === String(guesthouseId),
      );
      const rooms = Array.isArray(currentGuesthouse?.rooms) ? currentGuesthouse.rooms : [];
      const matchedRoom = rooms.find(room => room?.roomName === reservation.room);

      return matchedRoom?.roomId ?? matchedRoom?.id ?? null;
    } catch (error) {
      return null;
    }
  };

  const getRoomClosePromptInfo = async () => {
    const guesthouseId = resolveGuesthouseId();
    const date = getDateString(reservation?.checkInDate);
    const roomId = await resolveReservationRoomId();

    if (!guesthouseId || !roomId || !date) {
      return null;
    }

    try {
      const response = await hostGuesthouseApi.getRoomInventoryCalendar(
        guesthouseId,
        roomId,
        date,
        date,
      );
      const payload = response?.data?.data ?? response?.data ?? {};
      const list =
        payload?.inventories ??
        payload?.calendar ??
        payload?.content ??
        (Array.isArray(payload) ? payload : null) ??
        [];
      const inventory = Array.isArray(list)
        ? list.find(item => item?.date === date) ?? list[0]
        : payload;

      return inventory?.isClosed === false
        ? {
            guesthouseId,
            roomId,
            date,
          }
        : null;
    } catch (error) {
      return null;
    }
  };

  const closeRoomCloseModal = async () => {
    setRoomCloseModal({
      visible: false,
      roomId: null,
      date: '',
      submitting: false,
    });
    Toast.show({
      type: 'success',
      text1: '예약이 반려되었어요.',
      position: 'top',
      visibilityTime: 2000,
    });
    await fetchReservationDetail();
  };

  const handleCloseRejectedRoom = async () => {
    const guesthouseId = resolveGuesthouseId();
    const {roomId, date, submitting} = roomCloseModal;
    if (!guesthouseId || !roomId || !date || submitting) {
      return;
    }

    try {
      setRoomCloseModal(prev => ({...prev, submitting: true}));
      await hostGuesthouseApi.updateRoomStatusByDate(guesthouseId, roomId, {
        date,
        isClosed: true,
      });
      setRoomCloseModal({
        visible: false,
        roomId: null,
        date: '',
        submitting: false,
      });
      Toast.show({
        type: 'success',
        text1: '객실이 마감 처리되었어요.',
        position: 'top',
        visibilityTime: 2000,
      });
      navigation.navigate('GuesthouseManagement', {
        guesthouseId,
        initialTab: '객실 예약',
        initialChip: '방관리',
        initialRoomManagementDate: date,
      });
    } catch (error) {
      setRoomCloseModal(prev => ({...prev, submitting: false}));
      Toast.show({
        type: 'error',
        text1: '객실 마감 처리에 실패했어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    }
  };

  const handleConfirmDecision = async () => {
    if (!reservationId || decisionSubmitting) {
      return;
    }

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
        const roomClosePromptInfo = await getRoomClosePromptInfo();
        resetDecisionModal();
        if (roomClosePromptInfo) {
          setRoomCloseModal({
            visible: true,
            roomId: roomClosePromptInfo.roomId,
            date: roomClosePromptInfo.date,
            submitting: false,
          });
        } else {
          Toast.show({
            type: 'success',
            text1: '예약이 반려되었어요.',
            position: 'top',
            visibilityTime: 2000,
          });
          await fetchReservationDetail();
        }
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
      await fetchReservationDetail();
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

  const paymentLabel = isCancelledOrRejected ? '환불 금액' : '결제금액';
  const paymentAmountText = isCancelledOrRejected
    ? reservation.refundAmount || reservation.paymentAmount
    : reservation.paymentAmount;

  const paymentStatusText = isCancelledOrRejected ? '환불완료' : (reservation.paymentStatus || reservation.paymentState);
  const paymentStatusColor = isCancelledOrRejected ? styles.highlightText : null;
  const paymentAmountColor = isCancelledOrRejected ? styles.highlightText : null;
  const requestsText = reservation?.requests?.trim?.() || '';

  const statusStyle = STATUS_STYLE[reservation.status] || STATUS_STYLE.완료;
  const approvalDeadlineText = getApprovalDeadlineText(reservation, now);

  return (
    <View style={styles.container}>
      <Header title="예약 상세정보" />

      <ScrollView style={styles.body} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.badgeBackground }]}>
            <Text style={[FONTS.fs_14_semibold, { color: statusStyle.badgeText }]}>
              {reservation.status}
            </Text>
          </View>

          <View style={styles.headerTextWrap}>
            <View style={styles.nameRow}>
              <Text style={[FONTS.fs_16_semibold, styles.nameText]}>{reservation.name}</Text>
              {approvalDeadlineText ? (
                <View style={styles.approvalDeadlineWrap}>
                  <InfoIcon width={16} height={16} />
                  <Text style={[FONTS.fs_12_medium, styles.approvalDeadlineText]}>
                    {approvalDeadlineText}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[FONTS.fs_12_medium, isRejected ? { color: COLORS.primary_orange } : styles.highlightText]}>{reservation.statusText}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <InfoRow label="예약자" value={reservation.name} />
          <InfoRow label="성별" value={reservation.gender} />
          <InfoRow label="나이" value={reservation.age} />
          <InfoRow
            label="전화번호"
            value={reservation.phone}
            onPress={
              reservation.phone
                ? () => handleCopyPhone(reservation.phone)
                : null
            }
          />
          <InfoRow label="예약번호" value={reservation.reservationNumber} />
          <InfoRow label="이메일" value={reservation.email} />
          <InfoRow label="인원수" value={reservation.guestCount} />
        </View>

        {/* <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>방문자 정보</Text>
          <InfoRow label="이름" value={reservation.serviceName} />
          <InfoRow label="전화번호" value={reservation.room} />
        </View> */}

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>예약내역</Text>
          <InfoRow label="서비스" value={reservation.serviceName} />
          <InfoRow label="객실" value={reservation.room} highlight />
          <InfoRow label="이용기간" value={reservation.period} highlight />
        </View>

        {requestsText ? (
          <>
            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>요청사항</Text>
              <View style={styles.requestContainer}>
                <Text style={[FONTS.fs_14_regular, styles.requestText]}>{requestsText}</Text>
              </View>
            </View>
          </>
        ) : null}

        {isRejected ? (
          <>
            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>반려 정보</Text>
              <InfoRow label="반려사유" value={reservation.rejectedReason} />
              <InfoRow label="반려 일시" value={formatDateWithTime(reservation.rejectedAt)} />
            </View>
          </>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.section}>
          <Text style={[FONTS.fs_16_semibold, styles.sectionTitle]}>결제정보</Text>
          <InfoRow
            label="결제상태"
            value={paymentStatusText}
            valueStyle={paymentStatusColor}
          />
          <InfoRow label="결제수단" value={reservation.paymentMethod} />
          <InfoRow
            label={paymentLabel}
            value={paymentAmountText}
            valueStyle={paymentAmountColor}
          />
        </View>

        {reservation.showPendingActions ? (
          <View style={styles.pendingActionRow}>
            <ButtonWhite
              title="예약 확정"
              onPress={() => handleOpenDecisionModal('approve')}
              backgroundColor={COLORS.primary_blue}
              textColor={COLORS.grayscale_0}
              style={styles.pendingActionButton}
            />
            <ButtonWhite
              title="예약 반려"
              onPress={() => handleOpenDecisionModal('reject')}
              outlined
              borderColor={COLORS.grayscale_300}
              backgroundColor={COLORS.grayscale_0}
              textColor={COLORS.grayscale_700}
              style={[styles.pendingActionButton, styles.pendingActionButtonLast]}
            />
          </View>
        ) : null}

        {isConfirmed && reservation.showCancelButton ? (
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setCancelModalVisible(true)}
            >
              <Text style={[FONTS.fs_14_medium, styles.cancelButtonText]}>예약취소</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isCancelled || isCompleted ? <View style={styles.bottomSpacing} /> : null}
      </ScrollView>

      <ReservationCancelModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        reservation={cancelModalReservation}
        onSubmit={async () => {}}
      />

      <AlertModal
        visible={decisionModalType != null}
        title={decisionModalType === 'reject' ? '예약을 반려할까요?' : '예약을 확정할까요?'}
        message={
          decisionModalType === 'reject'
            ? '해당 예약을 반려하면 게스트에게 안내되며, 예약은 취소돼요'
            : '해당 예약을 확정하면 게스트에게 예약 확정 알림이 전송돼요'
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

      <AlertModal
        visible={roomCloseModal.visible}
        title="해당 객실을 마감 처리할까요?"
        message={
          '예약 신청이 반려된 객실이\n현재 판매 중으로 노출되고 있어요\n다른 플랫폼에서 이미 예약되었다면 마감 처리를 권장드려요'
        }
        buttonText="객실 마감 하기"
        buttonText2="취소"
        onPress={handleCloseRejectedRoom}
        onPress2={closeRoomCloseModal}
        buttonDisabled={roomCloseModal.submitting}
      />
    </View>
  );
};

const InfoRow = ({
  label,
  value,
  highlight = false,
  valueStyle = null,
  onPress = null,
}) => {
  if (!value && value !== 0) {
    return null;
  }

  return (
    <View style={styles.infoRow}>
      <Text style={[FONTS.fs_14_medium, styles.infoLabel]}>{label}</Text>
      {onPress ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${label} ${value}, 복사`}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.infoValue,
              valueStyle,
            ]}>
            {value}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text
          style={[
            FONTS.fs_14_medium,
            styles.infoValue,
            highlight ? styles.highlightText : null,
            valueStyle,
          ]}>
          {value}
        </Text>
      )}
    </View>
  );
};

export default MyGuesthouseReservationDetail;
