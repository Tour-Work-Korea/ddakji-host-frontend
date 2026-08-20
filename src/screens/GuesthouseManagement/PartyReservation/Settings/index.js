import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import AlertModal from '@components/modals/AlertModal';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostMeetApi from '@utils/api/hostMeetApi';
import styles from './Settings.styles';

import CancelReservationIcon from '@assets/images/unbooked_orange.svg';
import MinusIcon from '@assets/images/minus_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';

const MENU_TOAST_TOP_OFFSET = Platform.OS === 'ios' ? 220 : 190;

const Settings = ({
  guesthouseId,
  selectedTemplateId,
  selectedTemplate,
  selectedDailyParty,
  isDailyPartyLoading,
  onUpdateDailyParty,
}) => {
  const [dailyParty, setDailyParty] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [isStatusUpdating, setIsStatusUpdating] = useState(false);
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [isTemplateApplyOpen, setIsTemplateApplyOpen] = useState(false);
  const [currentApplicantCount, setCurrentApplicantCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedTemplateId) {
        setDailyParty(null);
        setIsTemplateApplyOpen(false);
        setMaxCapacity(20);
        setCurrentApplicantCount(0);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        let templateApplyOpen =
          selectedTemplate?.isApplyOpen ?? selectedTemplate?.isApply;
        if (typeof templateApplyOpen !== 'boolean') {
          const templateResponse =
            await hostMeetApi.getPartyTemplateDetail(selectedTemplateId);
          templateApplyOpen =
            templateResponse?.data?.isApplyOpen ??
            templateResponse?.data?.isApply ??
            false;
        }
        setIsTemplateApplyOpen(Boolean(templateApplyOpen));

        if (!selectedDailyParty?.partyId) {
          setDailyParty(null);
          setMaxCapacity(20);
          setCurrentApplicantCount(0);
          return;
        }

        let partyData = selectedDailyParty;
        if (!partyData?.partyStatus) {
          const partyResponse = await hostMeetApi.getPartyDetail(
            selectedDailyParty.partyId,
          );
          partyData = {...selectedDailyParty, ...(partyResponse?.data ?? {})};
        }

        setDailyParty({
          ...partyData,
          templateId: selectedTemplateId,
          partyTitle: selectedTemplate?.partyTitle || '콘텐츠 이름 없음',
        });
        setMaxCapacity(Number(partyData?.maxAttendance) || 20);

        if (guesthouseId && selectedDailyParty.partyDate) {
          try {
            const summaryResponse =
              await hostMeetApi.getPartyReservationSummary(
                guesthouseId,
                selectedDailyParty.partyDate,
                selectedDailyParty.partyId,
              );
            const activeReservations = summaryResponse?.data?.reservations;
            setCurrentApplicantCount(
              Array.isArray(activeReservations)
                ? activeReservations.length
                : Number(partyData?.numOfAttendance) || 0,
            );
          } catch (error) {
            setCurrentApplicantCount(
              Number(partyData?.numOfAttendance) || 0,
            );
          }
        } else {
          setCurrentApplicantCount(Number(partyData?.numOfAttendance) || 0);
        }
      } catch (error) {
        console.error('Error fetching party settings:', error);
        setDailyParty(null);
        setIsTemplateApplyOpen(false);
        setMaxCapacity(20);
        setCurrentApplicantCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    guesthouseId,
    selectedDailyParty,
    selectedTemplate,
    selectedTemplateId,
  ]);

  if (loading || isDailyPartyLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary_orange} />
      </View>
    );
  }

  const currentAttendees = Number(dailyParty?.numOfAttendance) || 0;
  const normalizedPartyStatus = String(dailyParty?.partyStatus || '').toUpperCase();
  const isPartyCanceled =
    normalizedPartyStatus === 'CANCELED' ||
    normalizedPartyStatus === 'CANCELLED';
  const isPartyStatusLocked =
    isPartyCanceled ||
    normalizedPartyStatus === 'PARTY_END' ||
    normalizedPartyStatus === 'DELETED';
  const canApply =
    isTemplateApplyOpen && normalizedPartyStatus === 'RECRUIT';
  const partyTitle = dailyParty?.partyTitle || '콘텐츠 이름 없음';
  const applicationStatusLabel = canApply ? '신청 가능' : '신청 마감';
  const applicationStatusDescription = canApply
    ? '현재 선택한 날짜의 참여 신청을 받고 있어요.'
    : '현재 선택한 날짜의 신규 신청을 받지 않고 있어요.';

  const handleChangeCapacity = diff => {
    setMaxCapacity(prev => Math.max(currentAttendees, prev + diff));
  };

  const handleToggleRecruitment = async nextValue => {
    const partyId = dailyParty?.partyId;

    if (!partyId) {
      Toast.show({
        type: 'error',
        text1: '신청 상태를 변경할 콘텐츠 정보가 없어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    if (!isTemplateApplyOpen || isPartyStatusLocked || isStatusUpdating) {
      return;
    }

    const nextStatus = nextValue ? 'RECRUIT' : 'RECRUIT_BLOCK';

    try {
      setIsStatusUpdating(true);
      await hostMeetApi.updateDailyPartyStatus(partyId, nextStatus);
      setDailyParty(prev =>
        prev ? {...prev, partyStatus: nextStatus} : prev,
      );
      onUpdateDailyParty?.({partyStatus: nextStatus});
      Toast.show({
        type: 'success',
        text1: nextValue
          ? '선택한 날짜의 신청을 다시 받기 시작했어요.'
          : '선택한 날짜의 신청이 마감되었어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.message ||
          '신청 상태 변경 중 오류가 발생했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } finally {
      setIsStatusUpdating(false);
    }
  };

  const handleCancelParty = async () => {
    if (isPartyCanceled) {
      setCancelModalVisible(false);
      return;
    }

    const partyId = dailyParty?.partyId;

    if (!partyId) {
      setCancelModalVisible(false);
      Toast.show({
        type: 'error',
        text1: '취소할 콘텐츠 정보가 없어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      await hostMeetApi.cancelParty(partyId);
      setCancelModalVisible(false);
      onUpdateDailyParty?.({partyStatus: 'CANCELED'});
      Toast.show({
        type: 'success',
        text1: '선택한 날짜의 콘텐츠 일정이 취소되었어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      setCancelModalVisible(false);
      Toast.show({
        type: 'error',
        text1: '콘텐츠 일정 취소 중 오류가 발생했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    }
  };

  const handleApplyMaxAttendees = async () => {
    const partyId = dailyParty?.partyId;

    if (!partyId) {
      Toast.show({
        type: 'error',
        text1: '인원을 변경할 콘텐츠 정보가 없어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      await hostMeetApi.updatePartyMaxAttendees(partyId, maxCapacity);
      onUpdateDailyParty?.({maxAttendance: maxCapacity});
      Toast.show({
        type: 'success',
        text1: '최대 인원이 적용되었어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '최대 인원 변경 중 오류가 발생했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.sectionCard}>
        <View style={styles.cancelContentRow}>
          <CancelReservationIcon width={20} height={20} />
          <View style={styles.cancelTitleRow}>
            <Text style={[FONTS.fs_16_medium, styles.cancelTitle]}>
              {selectedDailyParty?.partyDate
                ? `${selectedDailyParty.partyDate} 일정 취소`
                : '일정 취소'}
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.cancelDescription]}>
              선택한 날짜의 콘텐츠를 진행할 수 없는 경우 사용하세요. 모든
              예약자에게 즉시 알림이 발송됩니다.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={isPartyCanceled ? 1 : 0.8}
          disabled={isPartyCanceled}
          style={[
            styles.cancelButton,
            isPartyCanceled && styles.cancelButtonDisabled,
          ]}
          onPress={() => setCancelModalVisible(true)}>
          <Text
            style={[
              FONTS.fs_12_medium,
              styles.cancelButtonText,
              isPartyCanceled && styles.cancelButtonTextDisabled,
            ]}>
            {isPartyCanceled
              ? '취소된 일정'
              : '선택한 날짜 일정 취소하기'}
          </Text>
        </TouchableOpacity>
      </View>

      {isTemplateApplyOpen ? (
        <View style={styles.section}>
          <Text style={[FONTS.fs_14_semibold, styles.sectionTitle]}>
            선택한 날짜 신청 상태
          </Text>

          <View style={styles.sectionCard}>
            <View style={styles.applicationStatusRow}>
              <View style={styles.applicationStatusTopRow}>
                <Text
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={[FONTS.fs_16_semibold, styles.partyTitle]}>
                  {partyTitle}
                </Text>

                <View style={styles.applicationStatusRightGroup}>
                  <View
                    style={[
                      styles.applicationStatusBadge,
                      canApply
                        ? styles.applicationStatusBadgeOpen
                        : styles.applicationStatusBadgeClosed,
                    ]}>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        canApply
                          ? styles.applicationStatusBadgeTextOpen
                          : styles.applicationStatusBadgeTextClosed,
                      ]}>
                      {applicationStatusLabel}
                    </Text>
                  </View>

                  <Switch
                    value={canApply}
                    onValueChange={handleToggleRecruitment}
                    disabled={isPartyStatusLocked || isStatusUpdating}
                    trackColor={{
                      false: COLORS.grayscale_300,
                      true: COLORS.primary_orange,
                    }}
                    thumbColor={COLORS.grayscale_0}
                  />
                </View>
              </View>

              <Text
                style={[
                  FONTS.fs_12_medium,
                  styles.applicationStatusDescription,
                ]}>
                {applicationStatusDescription}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={[FONTS.fs_14_semibold, styles.sectionTitle]}>
          선택한 날짜 콘텐츠 최대 인원
        </Text>

        <View style={styles.sectionCard}>
          <Text style={[FONTS.fs_14_medium, styles.capacityLabel]}>
            현재 신청: <Text style={styles.capacityValue}>{currentAttendees}</Text>명
          </Text>

          <View style={styles.capacityControlRow}>
            <TouchableOpacity
              activeOpacity={maxCapacity <= currentAttendees ? 1 : 0.8}
              style={[
                styles.capacityButton,
                maxCapacity <= currentAttendees && styles.capacityButtonDisabled,
              ]}
              onPress={() => handleChangeCapacity(-1)}>
              <MinusIcon width={16} height={16} />
            </TouchableOpacity>

            <View style={styles.capacityInputBox}>
              <Text style={[FONTS.fs_16_regular, styles.capacityInputText]}>
                {maxCapacity}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.capacityButton}
              onPress={() => handleChangeCapacity(1)}>
              <PlusIcon width={16} height={16} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.applyButton}
            onPress={handleApplyMaxAttendees}>
            <Text style={[FONTS.fs_12_medium, styles.applyButtonText]}>
              인원 적용하기
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <AlertModal
        visible={cancelModalVisible}
        title="정말로 선택한 날짜의 콘텐츠 일정을 취소하시겠어요?"
        customContent={
          <View style={styles.cancelModalContent}>
            <Text style={[FONTS.fs_14_medium, styles.cancelModalApplicant]}>
              현재 신청자:{' '}
              <Text
                style={[
                  FONTS.fs_14_semibold,
                  styles.cancelModalApplicantCount,
                ]}>
                {currentApplicantCount}명
              </Text>
            </Text>
            <Text style={[FONTS.fs_14_medium, styles.cancelModalDescription]}>
              취소 시 모든 예약이 자동으로 취소되며,{'\n'}
              신청자에게 알림이 발송됩니다.
            </Text>
          </View>
        }
        buttonText="취소하기"
        buttonText2="돌아가기"
        onPress={handleCancelParty}
        onPress2={() => setCancelModalVisible(false)}
      />
    </ScrollView>
  );
};

export default Settings;
