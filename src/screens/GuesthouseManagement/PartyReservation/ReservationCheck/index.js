import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import AlertModal from '@components/modals/AlertModal';
import styles from './ReservationCheck.styles';

import SearchIcon from '@assets/images/search_gray.svg';
import ClockIcon from '@assets/images/history_gray.svg';
import PhoneIcon from '@assets/images/phone_black.svg';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const MENU_TOAST_TOP_OFFSET = Platform.OS === 'ios' ? 220 : 190;

const REJECT_REASON_OPTIONS = [
  '파티 정원 초과',
  '숙소 내부 사정',
  '예약 조건 미충족',
  '직접 입력',
];
const DIRECT_INPUT_REASON = '직접 입력';

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatHeaderDate = localDate => {
  const [year, month, day] = localDate.split('-').map(Number);
  const date = new Date(year, (month || 1) - 1, day || 1);
  return `${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')} (${
    DAY_LABELS[date.getDay()]
  })`;
};

const formatActionTime = (value, suffix) => {
  if (!value) return suffix;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return suffix;

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes} ${suffix}`;
};

const mapGenderLabel = gender => {
  if (!gender) return '';
  const g = String(gender).trim().toUpperCase();
  if (g === 'MALE' || g === 'M' || g === '남' || g === '남자') return '남';
  if (g === 'FEMALE' || g === 'F' || g === '여' || g === '여자') return '여';
  return '여';
};

const formatPhoneNumber = phone => {
  if (!phone) return '';
  const cleaned = String(phone).replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

const normalizeReservationItem = item => {
  const approvalStatus = item?.approvalStatus ?? 'NONE';
  const hasExplicitApprovalPermissions =
    typeof item?.canApprove === 'boolean' ||
    typeof item?.canReject === 'boolean';
  const canApprove = hasExplicitApprovalPermissions
    ? item?.canApprove === true
    : approvalStatus === 'WAITING_HOST';
  const canReject = hasExplicitApprovalPermissions
    ? item?.canReject === true
    : approvalStatus === 'WAITING_HOST';
  const suffix = canApprove || canReject ? '신청' : '신청확정';

  return {
    id: item?.reservationId ?? `${item?.phoneNumber}-${item?.actionTime}`,
    reservationId: item?.reservationId,
    partyId: item?.partyId,
    name: item?.reserverName ?? '',
    gender: mapGenderLabel(item?.gender),
    birthYear: item?.birthYear ?? '',
    time: formatActionTime(item?.actionTime, suffix),
    phone: formatPhoneNumber(item?.phoneNumber),
    isGuest: item?.isGuest ?? item?.isGuestStatus ?? false,
    canApprove,
    canReject,
    needsHostAction: canApprove || canReject,
  };
};

const buildRatioText = (maleCount, femaleCount) => {
  const male = Number(maleCount) || 0;
  const female = Number(femaleCount) || 0;

  if (male === 0 && female === 0) return '-';
  if (male === 0) return `0:${female}`;
  if (female === 0) return `${male}:0`;
  return `${male}:${female}`;
};

const getPartyStatusLabel = partyStatus => {
  switch (partyStatus) {
    case 'RECRUIT_BEFORE':
      return '모집 전';
    case 'RECRUIT':
      return '모집 중';
    case 'RECRUIT_BLOCK':
    case 'RECRUIT_END':
      return '신청 마감';
    case 'CANCELLED':
    case 'CANCELED':
      return '취소';
    case 'PARTY_END':
      return '종료';
    case 'CLOSED':
    case 'FINISHED':
      return '마감';
    default:
      return '';
  }
};

const ReservationCheck = ({
  guesthouseId,
  applicationType,
  dailyParties,
  selectedDailyParty,
  isDailyPartyLoading,
  initialReservationId,
  onReservationApproved,
}) => {
  const navigation = useNavigation();
  const today = useMemo(() => getTodayLocalDate(), []);

  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reservations, setReservations] = useState([]);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const reservationScrollRef = useRef(null);
  const listSectionOffsetRef = useRef(null);
  const targetCardOffsetRef = useRef(null);
  const scrolledReservationRef = useRef(null);
  const scrollTimerRef = useRef(null);

  // Rejection modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const selectedDate = selectedDailyParty?.partyDate ?? today;
  const formattedSelectedDate = useMemo(
    () => formatHeaderDate(selectedDate),
    [selectedDate],
  );
  const isAdvanceApplication = applicationType === 'ADVANCE';
  const selectedPartyStatusLabel = getPartyStatusLabel(
    selectedDailyParty?.partyStatus,
  );

  const resetReservationSummary = useCallback(() => {
    setReservations([]);
    setMaleCount(0);
    setFemaleCount(0);
  }, []);

  const fetchReservationSummary = useCallback(
    async (isMounted = true) => {
      if (!guesthouseId || !selectedDailyParty?.partyId) {
        resetReservationSummary();
        return;
      }

      try {
        setIsSummaryLoading(true);
        const response = await hostMeetApi.getPartyReservationSummary(
          guesthouseId,
          selectedDailyParty.partyDate,
          selectedDailyParty.partyId,
        );
        const data = response?.data ?? {};

        if (!isMounted) {
          return;
        }

        setReservations(
          Array.isArray(data?.reservations)
            ? data.reservations.map(normalizeReservationItem)
            : [],
        );
        setMaleCount(Number(data?.maleCount) || 0);
        setFemaleCount(Number(data?.femaleCount) || 0);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        resetReservationSummary();
        Toast.show({
          type: 'error',
          text1:
            error?.response?.data?.message || '신청 현황을 불러오지 못했어요.',
          position: 'top',
          topOffset: MENU_TOAST_TOP_OFFSET,
        });
      } finally {
        if (isMounted) {
          setIsSummaryLoading(false);
        }
      }
    },
    [guesthouseId, resetReservationSummary, selectedDailyParty],
  );

  useEffect(() => {
    if (!guesthouseId || !selectedDailyParty?.partyId) {
      resetReservationSummary();
      return;
    }

    let isMounted = true;
    fetchReservationSummary(isMounted);

    return () => {
      isMounted = false;
    };
  }, [
    fetchReservationSummary,
    guesthouseId,
    resetReservationSummary,
    selectedDailyParty,
  ]);

  const summaryCards = useMemo(
    () => [
      {label: '남자', value: `${maleCount}명`},
      {label: '여자', value: `${femaleCount}명`},
      {label: '성비', value: buildRatioText(maleCount, femaleCount)},
    ],
    [femaleCount, maleCount],
  );

  const filteredReservations = useMemo(() => {
    const keyword = searchKeyword.trim();
    const filtered = keyword
      ? reservations.filter(item => item.name.includes(keyword))
      : reservations;

    if (initialReservationId == null) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const aIsTarget =
        String(a.reservationId) === String(initialReservationId);
      const bIsTarget =
        String(b.reservationId) === String(initialReservationId);
      return Number(bIsTarget) - Number(aIsTarget);
    });
  }, [initialReservationId, reservations, searchKeyword]);

  const waitingList = useMemo(() => {
    return filteredReservations.filter(item => item.needsHostAction);
  }, [filteredReservations]);

  const confirmedList = useMemo(() => {
    return filteredReservations.filter(item => !item.needsHostAction);
  }, [filteredReservations]);

  useEffect(() => {
    listSectionOffsetRef.current = null;
    targetCardOffsetRef.current = null;
    scrolledReservationRef.current = null;

    return () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current);
      }
    };
  }, [initialReservationId, selectedDailyParty?.partyId]);

  const scrollToNotificationTarget = () => {
    if (
      initialReservationId == null ||
      listSectionOffsetRef.current == null ||
      targetCardOffsetRef.current == null ||
      String(scrolledReservationRef.current) === String(initialReservationId)
    ) {
      return;
    }

    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current);
    }

    scrollTimerRef.current = setTimeout(() => {
      reservationScrollRef.current?.scrollTo({
        y: Math.max(
          0,
          listSectionOffsetRef.current + targetCardOffsetRef.current - 12,
        ),
        animated: true,
      });
      scrolledReservationRef.current = initialReservationId;
    }, 100);
  };

  const handleApprove = async (partyId, reservationId) => {
    if (!partyId || !reservationId) {
      Toast.show({
        type: 'error',
        text1: '승인에 필요한 정보(partyId 또는 reservationId)가 부족합니다.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      await hostMeetApi.approvePartyReservation(
        partyId,
        reservationId,
        true,
        '',
      );
      onReservationApproved?.(partyId);
      Toast.show({
        type: 'success',
        text1: '신청이 승인되었습니다.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      fetchReservationSummary(true);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.message || '신청 승인 중 오류가 발생했습니다.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    }
  };

  const handleOpenRejectModal = item => {
    setSelectedItem(item);
    setRejectReason('');
    setRejectReasonInput('');
    setRejectReasonOpen(false);
    setRejectModalVisible(true);
  };

  const resetRejectModal = () => {
    setRejectModalVisible(false);
    setSelectedItem(null);
    setRejectReason('');
    setRejectReasonInput('');
    setRejectReasonOpen(false);
    setIsSubmittingReject(false);
  };

  const handleConfirmReject = async () => {
    if (!selectedItem || isSubmittingReject) return;

    const finalReason =
      rejectReason === DIRECT_INPUT_REASON
        ? rejectReasonInput.trim()
        : rejectReason;

    if (!finalReason) {
      return;
    }

    try {
      setIsSubmittingReject(true);
      await hostMeetApi.approvePartyReservation(
        selectedItem.partyId,
        selectedItem.reservationId,
        false,
        finalReason,
      );
      resetRejectModal();
      Toast.show({
        type: 'success',
        text1: '신청이 반려되었습니다.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      fetchReservationSummary(true);
    } catch (error) {
      setIsSubmittingReject(false);
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || '신청 반려를 실패했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    }
  };

  const handleCall = async phoneNumber => {
    const digits = String(phoneNumber || '').replace(/[^\d]/g, '');
    if (!digits) {
      return Toast.show({
        type: 'error',
        text1: '통화할 수 있는 번호가 없어요',
        position: 'top',
        visibilityTime: 2500,
      });
    }

    const url = `tel:${digits}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        return Toast.show({
          type: 'error',
          text1: '전화앱을 열 수 없어요',
          position: 'top',
          visibilityTime: 2500,
        });
      }
      await Linking.openURL(url);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '전화앱을 열 수 없어요',
        position: 'top',
        visibilityTime: 2500,
      });
    }
  };

  const handleCopyPhone = phoneNumber => {
    if (!phoneNumber) {
      return;
    }

    Clipboard.setString(String(phoneNumber));
    Toast.show({
      type: 'success',
      text1: '연락처가 복사되었습니다.',
      position: 'top',
      topOffset: MENU_TOAST_TOP_OFFSET,
    });
  };

  const renderReservationCard = item => {
    const isWaiting = item.needsHostAction;
    const isNotificationTarget =
      initialReservationId != null &&
      String(item.reservationId) === String(initialReservationId);

    return (
      <View
        key={item.id}
        onLayout={
          isNotificationTarget
            ? event => {
                targetCardOffsetRef.current = event.nativeEvent.layout.y;
                scrollToNotificationTarget();
              }
            : undefined
        }
        style={[
          styles.reservationCard,
          isNotificationTarget && styles.reservationCardHighlighted,
        ]}>
        <View style={styles.reservationInfo}>
          <View style={styles.nameRow}>
            <Text style={[FONTS.fs_16_semibold, styles.nameText]}>
              {item.name}
            </Text>
            <View
              style={[
                styles.genderBadge,
                item.gender === '남'
                  ? styles.genderMaleBadge
                  : styles.genderFemaleBadge,
              ]}>
              <Text
                style={[
                  FONTS.fs_12_medium,
                  item.gender === '남'
                    ? styles.genderMaleText
                    : styles.genderFemaleText,
                ]}>
                {item.gender}
              </Text>
            </View>
            <Text style={[FONTS.fs_12_medium, styles.birthText]}>
              {item.isGuest ? '숙박객' : '비숙박객'} · {item.birthYear}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[FONTS.fs_12_medium, styles.metaText]}>
              {item.time}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.metaDivider]}>|</Text>
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.phoneCopyButton}
              onPress={() => handleCopyPhone(item.phone)}
              accessibilityRole="button"
              accessibilityLabel={`연락처 ${item.phone}, 복사`}>
              <Text style={[FONTS.fs_12_medium, styles.metaText]}>
                {item.phone}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {isWaiting ? (
          <View style={styles.actionGroup}>
            {item.canApprove ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.approveButton}
                onPress={() => handleApprove(item.partyId, item.reservationId)}>
                <Text style={[FONTS.fs_12_medium, styles.approveButtonText]}>
                  신청 승인
                </Text>
              </TouchableOpacity>
            ) : null}
            {item.canReject ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.rejectButton}
                onPress={() => handleOpenRejectModal(item)}>
                <Text style={[FONTS.fs_12_medium, styles.rejectButtonText]}>
                  반려
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.callButton}
            onPress={() => handleCall(item.phone)}>
            <PhoneIcon width={18} height={18} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={reservationScrollRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={[FONTS.fs_16_semibold, styles.headerTitle]}>
            {isAdvanceApplication ? '선택한 날짜 신청 현황' : '오늘의 신청 현황'}
          </Text>
          {selectedDailyParty ? (
            <Text style={[FONTS.fs_14_medium, styles.headerDate]}>
              {formattedSelectedDate}
            </Text>
          ) : null}
        </View>

        {isDailyPartyLoading ? (
          <View style={styles.dailyPartyFeedback}>
            <ActivityIndicator color={COLORS.primary_orange} />
          </View>
        ) : dailyParties.length === 0 ? (
          <View style={styles.emptyPartyCard}>
            <Text style={[FONTS.fs_14_medium, styles.emptyPartyTitle]}>
              {isAdvanceApplication
                ? '현재 신청 관리할 사전 파티가 없어요.'
                : applicationType === 'SAME_DAY'
                ? '오늘 진행되는 파티가 없어요.'
                : '현재 신청 관리할 파티가 없어요.'}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.emptyPartyDescription]}>
              {isAdvanceApplication
                ? '파티가 생성되면 날짜별 신청 현황을 확인할 수 있어요.'
                : '오늘 파티가 생성되면 신청 현황을 확인할 수 있어요.'}
            </Text>
          </View>
        ) : (
          <>
            {selectedPartyStatusLabel ? (
              <View style={styles.selectedDateRow}>
                <Text style={[FONTS.fs_12_medium, styles.selectedPartyStatus]}>
                  {selectedPartyStatusLabel}
                </Text>
              </View>
            ) : null}

            <View style={styles.summaryCard}>
              {summaryCards.map((item, index) => (
                <View
                  key={item.label}
                  style={[
                    styles.summaryItem,
                    index !== summaryCards.length - 1 &&
                      styles.summaryItemBorder,
                  ]}>
                  <Text style={[FONTS.fs_12_medium, styles.summaryLabel]}>
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      FONTS.fs_18_semibold,
                      item.label === '남자'
                        ? styles.summaryMaleValue
                        : item.label === '여자'
                        ? styles.summaryFemaleValue
                        : styles.summaryRatio,
                    ]}>
                    {item.value}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.searchBox}>
              <SearchIcon width={20} height={20} />
              <TextInput
                placeholder="신청자 성함 검색"
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_14_medium, styles.searchInput]}
                value={searchKeyword}
                onChangeText={setSearchKeyword}
              />
            </View>

            <View style={styles.listHeader}>
              <Text style={[FONTS.fs_16_medium, styles.listTitle]}>
                신청 명단
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.listCount]}>
                {filteredReservations.length}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.sortButton}
              onPress={() =>
                navigation.navigate('ReservationCancelList', {
                  guesthouseId,
                  selectedDate,
                  partyId: selectedDailyParty?.partyId,
                })
              }>
              <Text style={[FONTS.fs_12_medium, styles.sortButtonText]}>
                신청 취소 명단 보기 &gt;
              </Text>
            </TouchableOpacity>

            {isSummaryLoading ? (
              <View style={styles.feedbackContainer}>
                <ActivityIndicator color={COLORS.primary_orange} />
              </View>
            ) : filteredReservations.length === 0 ? (
              <View style={styles.feedbackContainer}>
                <Text style={[FONTS.fs_14_medium, styles.feedbackText]}>
                  신청 내역이 없어요.
                </Text>
              </View>
            ) : (
              <View
                style={styles.listSection}
                onLayout={event => {
                  listSectionOffsetRef.current = event.nativeEvent.layout.y;
                  scrollToNotificationTarget();
                }}>
                {waitingList.length > 0 && (
                  <>
                    <Text style={[FONTS.fs_14_semibold, styles.groupTitle]}>
                      승인 대기
                    </Text>
                    {waitingList.map(item => renderReservationCard(item))}
                  </>
                )}

                {confirmedList.length > 0 && (
                  <>
                    <Text style={[FONTS.fs_14_semibold, styles.groupTitle]}>
                      확정 완료
                    </Text>
                    {confirmedList.map(item => renderReservationCard(item))}
                  </>
                )}
              </View>
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.historyButton}
              onPress={() =>
                navigation.navigate('PastReservationList', {
                  guesthouseId,
                })
              }>
              <ClockIcon width={16} height={16} />
              <Text style={[FONTS.fs_14_semibold, styles.historyButtonText]}>
                지난 신청 내역 확인하기
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <AlertModal
        visible={rejectModalVisible}
        title="신청을 반려할까요?"
        message="해당 신청을 반려하면 게스트에게 안내되며, 신청은 취소돼요."
        buttonText="반려하기"
        buttonText2="취소"
        color={COLORS.primary_orange}
        onPress={handleConfirmReject}
        onPress2={resetRejectModal}
        buttonDisabled={
          isSubmittingReject ||
          !rejectReason ||
          (rejectReason === DIRECT_INPUT_REASON && !rejectReasonInput.trim())
        }
        selectionLabel="반려 사유"
        selectionPlaceholder="반려 사유를 선택해 주세요"
        selectionOptions={REJECT_REASON_OPTIONS}
        selectionOpen={rejectReasonOpen}
        selectedOption={rejectReason}
        onToggleSelection={() => setRejectReasonOpen(prev => !prev)}
        onSelectOption={option => {
          setRejectReason(option);
          if (option !== DIRECT_INPUT_REASON) {
            setRejectReasonInput('');
          }
          setRejectReasonOpen(false);
        }}
        customOptionLabel={DIRECT_INPUT_REASON}
        customInputValue={rejectReasonInput}
        customInputPlaceholder="반려 사유를 직접 입력해 주세요"
        onChangeCustomInput={setRejectReasonInput}
        onRequestClose={resetRejectModal}
      />
    </View>
  );
};

export default ReservationCheck;
