import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
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
  return `${String(month).padStart(2, '0')}/${String(day).padStart(
    2,
    '0',
  )} (${DAY_LABELS[date.getDay()]})`;
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

const normalizeReservationItem = (item, isCanceled = false) => {
  let suffix = '신청';
  if (isCanceled) {
    suffix = item?.approvalStatus === 'REJECTED' ? '신청반려' : '신청취소';
  } else {
    suffix = item?.approvalStatus === 'WAITING_HOST' ? '신청' : '신청확정';
  }

  return {
    id: item?.reservationId ?? `${item?.phoneNumber}-${item?.actionTime}`,
    reservationId: item?.reservationId,
    partyId: item?.partyId,
    name: item?.reserverName ?? '',
    gender: mapGenderLabel(item?.gender),
    birthYear: item?.birthYear ?? '',
    time: formatActionTime(item?.actionTime, suffix),
    phone: formatPhoneNumber(item?.phoneNumber),
    isCanceled: Boolean(item?.isCanceled ?? isCanceled),
    isGuest: item?.isGuest ?? item?.isGuestStatus ?? false,
    approvalStatus: item?.approvalStatus ?? 'WAITING_HOST',
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

const ReservationCheck = ({ guesthouseId }) => {
  const navigation = useNavigation();
  const today = useMemo(() => getTodayLocalDate(), []);
  const formattedToday = useMemo(() => formatHeaderDate(today), [today]);

  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [reservations, setReservations] = useState([]);
  const [canceledReservations, setCanceledReservations] = useState([]);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);

  // Rejection modal states
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectReasonInput, setRejectReasonInput] = useState('');
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  const fetchReservationSummary = useCallback(async (isMounted = true) => {
    try {
      setIsLoading(true);
      const response = await hostMeetApi.getPartyReservationSummary(
        guesthouseId,
        today,
      );
      const data = response?.data ?? {};

      if (!isMounted) return;

      setReservations(
        Array.isArray(data?.reservations)
          ? data.reservations.map(item => normalizeReservationItem(item, false))
          : [],
      );
      setCanceledReservations(
        Array.isArray(data?.canceledReservations)
          ? data.canceledReservations.map(item => normalizeReservationItem(item, true))
          : [],
      );
      setMaleCount(Number(data?.maleCount) || 0);
      setFemaleCount(Number(data?.femaleCount) || 0);
    } catch (error) {
      if (!isMounted) return;

      setReservations([]);
      setCanceledReservations([]);
      setMaleCount(0);
      setFemaleCount(0);
      Toast.show({
        type: 'error',
        text1: error?.response?.data?.message || '신청 현황을 불러오지 못했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, [guesthouseId, today]);

  useEffect(() => {
    if (!guesthouseId) {
      setReservations([]);
      setCanceledReservations([]);
      setMaleCount(0);
      setFemaleCount(0);
      return;
    }

    let isMounted = true;
    fetchReservationSummary(isMounted);

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, today, fetchReservationSummary]);

  const summaryCards = useMemo(
    () => [
      { label: '남자', value: `${maleCount}명` },
      { label: '여자', value: `${femaleCount}명` },
      { label: '성비', value: buildRatioText(maleCount, femaleCount) },
    ],
    [femaleCount, maleCount],
  );

  const filteredReservations = useMemo(() => {
    const keyword = searchKeyword.trim();
    if (!keyword) return reservations;

    return reservations.filter(item => item.name.includes(keyword));
  }, [reservations, searchKeyword]);

  const waitingList = useMemo(() => {
    return filteredReservations.filter(item => item.approvalStatus === 'WAITING_HOST');
  }, [filteredReservations]);

  const confirmedList = useMemo(() => {
    return filteredReservations.filter(item => item.approvalStatus !== 'WAITING_HOST');
  }, [filteredReservations]);

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
      await hostMeetApi.approvePartyReservation(partyId, reservationId, true, '');
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
        text1: error?.response?.data?.message || '신청 승인 중 오류가 발생했습니다.',
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

  const renderReservationCard = item => {
    const isWaiting = item.approvalStatus === 'WAITING_HOST';

    return (
      <View key={item.id} style={styles.reservationCard}>
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
            <Text style={[FONTS.fs_12_medium, styles.metaText]}>
              {item.phone}
            </Text>
          </View>
        </View>

        {isWaiting ? (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.approveButton}
              onPress={() => handleApprove(item.partyId, item.reservationId)}>
              <Text style={[FONTS.fs_12_medium, styles.approveButtonText]}>
                신청 승인
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.rejectButton}
              onPress={() => handleOpenRejectModal(item)}>
              <Text style={[FONTS.fs_12_medium, styles.rejectButtonText]}>
                반려
              </Text>
            </TouchableOpacity>
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
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <Text style={[FONTS.fs_16_semibold, styles.headerTitle]}>
            오늘의 파티 신청 현황
          </Text>
          <Text style={[FONTS.fs_14_medium, styles.headerDate]}>
            {formattedToday}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          {summaryCards.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.summaryItem,
                index !== summaryCards.length - 1 && styles.summaryItemBorder,
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
          <Text style={[FONTS.fs_16_medium, styles.listTitle]}>신청 명단</Text>
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
              selectedDate: today,
            })
          }>
          <Text style={[FONTS.fs_12_medium, styles.sortButtonText]}>
            신청 취소 명단 보기 &gt;
          </Text>
        </TouchableOpacity>

        {isLoading ? (
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
          <View style={styles.listSection}>
            {waitingList.length > 0 && (
              <>
                <Text style={[FONTS.fs_14_semibold, styles.groupTitle]}>승인 대기</Text>
                {waitingList.map(item => renderReservationCard(item))}
              </>
            )}

            {confirmedList.length > 0 && (
              <>
                <Text style={[FONTS.fs_14_semibold, styles.groupTitle]}>확정 완료</Text>
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
