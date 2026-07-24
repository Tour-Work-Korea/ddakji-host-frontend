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

const Settings = ({guesthouseId, selectedTemplateId}) => {
  const [dailyParty, setDailyParty] = useState(null);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [isExposed, setIsExposed] = useState(true);
  const [maxCapacity, setMaxCapacity] = useState(20);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [templateId, setTemplateId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!guesthouseId) {
        setDailyParty(null);
        setTemplateId(null);
        setIsApplyOpen(false);
        setIsExposed(true);
        setMaxCapacity(20);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setDailyParty(null);
        setTemplateId(null);
        setIsApplyOpen(false);
        setIsExposed(true);
        setMaxCapacity(20);
        const response = await hostMeetApi.getPartySettings(
          guesthouseId,
          selectedTemplateId,
        );
        const data = response?.data;
        if (data) {
          setTemplateId(data.templateId || null);
          setIsApplyOpen(Boolean(data.isApplyOpen));
          setIsExposed(Boolean(data.isVisible));
          setMaxCapacity(Number(data.maxAttendance) || 20);

          setDailyParty({
            partyId: data.partyId,
            templateId: data.templateId,
            partyTitle: data.partyTitle || '파티 이름 없음',
            isVisible: data.isVisible,
            maxAttendance: data.maxAttendance,
            numOfAttendance: data.numOfAttendance,
          });
        } else {
          setDailyParty(null);
          setTemplateId(null);
          setIsApplyOpen(false);
          setIsExposed(true);
          setMaxCapacity(20);
        }
      } catch (error) {
        console.error('Error fetching party settings:', error);
        setDailyParty(null);
        setTemplateId(null);
        setIsApplyOpen(false);
        setIsExposed(true);
        setMaxCapacity(20);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [guesthouseId, selectedTemplateId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary_orange} />
      </View>
    );
  }

  const currentAttendees = Number(dailyParty?.numOfAttendance) || 0;
  const partyTitle = dailyParty?.partyTitle || '파티 이름 없음';
  const exposureLabel = isExposed ? '노출중' : '미노출';
  const exposureDescription = isExposed
    ? '현재 유저에게 노출 중입니다'
    : '현재 유저에게 노출되지 않고 있습니다';

  const applyOpenDescription = isApplyOpen ? '현재 신청 가능' : '현재 신청 불가';

  const handleChangeCapacity = diff => {
    setMaxCapacity(prev => Math.max(currentAttendees, prev + diff));
  };

  const handleToggleVisibility = async nextValue => {
    const partyId = dailyParty?.partyId;

    if (!partyId) {
      Toast.show({
        type: 'error',
        text1: '노출 상태를 변경할 파티 정보가 없어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      await hostMeetApi.updatePartyVisibility(partyId, nextValue);
      setIsExposed(nextValue);
      Toast.show({
        type: 'success',
        text1: nextValue
          ? '파티가 노출 처리 되었습니다'
          : '파티가 숨김 처리 되었습니다',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '노출 상태 변경 중 오류가 발생했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    }
  };

  const handleToggleApplyOpen = async nextValue => {
    if (!templateId) {
      Toast.show({
        type: 'error',
        text1: '신청 오픈 상태를 변경할 파티 템플릿 정보가 없어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      await hostMeetApi.updatePartyApplicationOpen(templateId, nextValue);
      setIsApplyOpen(nextValue);
      Toast.show({
        type: 'success',
        text1: nextValue
          ? '파티 신청이 오픈되었습니다'
          : '파티 신청이 미오픈 처리되었습니다',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: '신청 오픈 상태 변경 중 오류가 발생했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    }
  };

  const handleCancelParty = async () => {
    const partyId = dailyParty?.partyId;

    if (!partyId) {
      setCancelModalVisible(false);
      Toast.show({
        type: 'error',
        text1: '취소할 파티 정보가 없어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      await hostMeetApi.cancelParty(partyId);
      setCancelModalVisible(false);
      Toast.show({
        type: 'success',
        text1: '오늘 파티가 취소되었어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      setCancelModalVisible(false);
      Toast.show({
        type: 'error',
        text1: '파티 취소 중 오류가 발생했어요.',
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
        text1: '인원을 변경할 파티 정보가 없어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      await hostMeetApi.updatePartyMaxAttendees(partyId, maxCapacity);
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
              오늘의 파티 취소
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.cancelDescription]}>
              예기치 못한 상황으로 오늘 파티를 진행할 수 없는 경우 사용하세요. 모든
              예약자에게 즉시 알림이 발송됩니다.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.cancelButton}
          onPress={() => setCancelModalVisible(true)}>
          <Text style={[FONTS.fs_12_medium, styles.cancelButtonText]}>
            오늘 파티 취소하기
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[FONTS.fs_14_semibold, styles.sectionTitle]}>
          파티 신청 관리
        </Text>

        <View style={styles.sectionCard}>
          <View style={styles.exposureRow}>
            <View style={styles.exposureTopRow}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={[FONTS.fs_16_semibold, styles.partyTitle]}>
                {partyTitle}
              </Text>

              <View style={styles.exposureRightGroup}>
                <View
                  style={[
                    styles.exposureBadge,
                    isExposed
                      ? styles.exposureBadgeVisible
                      : styles.exposureBadgeHidden,
                  ]}>
                  <Text
                    style={[
                      FONTS.fs_12_medium,
                      isExposed
                        ? styles.exposureBadgeTextVisible
                        : styles.exposureBadgeTextHidden,
                    ]}>
                    {exposureLabel}
                  </Text>
                </View>

                <Switch
                  value={isExposed}
                  onValueChange={handleToggleVisibility}
                  trackColor={{
                    false: COLORS.grayscale_300,
                    true: COLORS.primary_orange,
                  }}
                  thumbColor={COLORS.grayscale_0}
                />
              </View>
            </View>

            <Text style={[FONTS.fs_12_medium, styles.exposureDescription]}>
              {exposureDescription}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.applyOpenRow}>
            <View style={styles.applyOpenTopRow}>
              <Text style={[FONTS.fs_16_semibold, styles.applyOpenTitle]}>
                신청 오픈 설정
              </Text>

              <View style={styles.applyOpenRightGroup}>
                <Switch
                  value={isApplyOpen}
                  onValueChange={handleToggleApplyOpen}
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
                isApplyOpen
                  ? styles.applyOpenDescription
                  : styles.applyOpenDescriptionDisabled,
              ]}>
              {applyOpenDescription}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[FONTS.fs_14_semibold, styles.sectionTitle]}>
          파티 최대 인원
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
        title="정말로 오늘 파티를 취소하시겠어요?"
        message={
          `현재 신청자: ${currentAttendees}명\n취소 시 모든 예약이 자동으로 취소되며,\n신청자에게 알림이 발송됩니다.`
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
