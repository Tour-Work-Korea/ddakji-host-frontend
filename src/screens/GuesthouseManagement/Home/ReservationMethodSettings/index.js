import React, {useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, Alert, Text, TouchableOpacity, View} from 'react-native';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';

import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import AlertModal from '@components/modals/AlertModal';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import styles from './ReservationMethodSettings.styles';

import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';
import ReservationRequestOrange from '@assets/images/reservation_request_orange.svg';
import ReservationRequestBlack from '@assets/images/reservation_request_black.svg';
import ReservationInstantBlack from '@assets/images/reservation_instant_black.svg';
import ReservationInstantOrange from '@assets/images/reservation_instant_orange.svg';
import UnbookedOrange from '@assets/images/unbooked_orange.svg';
import UnbookedBlack from '@assets/images/unbooked_black.svg';
import TrendingIcon from '@assets/images/trending_red.svg';

const RESERVATION_OPTIONS = [
  {
    key: 'closed',
    icons: {
      selected: UnbookedOrange,
      default: UnbookedBlack,
    },
    title: '예약 마감',
    description: [
      '현재 예약을 받지 않아요.',
      '게스트에게 예약 버튼이 노출되지 않습니다.',
    ],
  },
  {
    key: 'request',
    icons: {
      selected: ReservationRequestOrange,
      default: ReservationRequestBlack,
    },
    title: '예약 요청 후 확정',
    description: [
      '요청을 확인하고 수락해야 예약이 확정돼요.',
      '당일 오전 10시 이후 예약은 30분 내,',
      '그 외 예약은 24시간 내 미승인 시 자동 취소됩니다.',
    ],
  },
  {
    key: 'instant',
    icons: {
      selected: ReservationInstantOrange,
      default: ReservationInstantBlack,
    },
    title: '즉시 예약 확정',
    description: [
      '결제 시 자동으로 예약이 확정돼요.',
      '가장 빠른 예약 전환이 가능합니다.',
    ],
    recommended: true,
    notice: '결제와 동시에 예약이 확정되어 예약 전환에 유리해요.',
  },
];

const POLICY_TO_OPTION = {
  CLOSED: 'closed',
  REQUEST_CONFIRMATION: 'request',
  INSTANT_CONFIRMATION: 'instant',
};

const OPTION_TO_POLICY = {
  closed: 'CLOSED',
  request: 'REQUEST_CONFIRMATION',
  instant: 'INSTANT_CONFIRMATION',
};

const ReservationMethodSettings = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const guesthouseId = route.params?.guesthouseId;
  const [selectedOption, setSelectedOption] = useState(
    route.params?.selectedOption || 'instant',
  );
  const [isLoading, setIsLoading] = useState(Boolean(guesthouseId));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canChangeToClosed, setCanChangeToClosed] = useState(true);
  const [isBlockedClosedModalVisible, setIsBlockedClosedModalVisible] =
    useState(false);

  const selectedItem = useMemo(
    () =>
      RESERVATION_OPTIONS.find(option => option.key === selectedOption) ||
      RESERVATION_OPTIONS[0],
    [selectedOption],
  );

  useEffect(() => {
    let isMounted = true;

    const fetchReservationPolicy = async () => {
      if (!guesthouseId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await hostGuesthouseApi.getGuesthouseReservationPolicy(
          guesthouseId,
        );
        const reservationPolicyResponse = response?.data?.data ?? response?.data;
        const reservationPolicy = reservationPolicyResponse?.currentPolicy;

        if (!isMounted) {
          return;
        }

        setSelectedOption(POLICY_TO_OPTION[reservationPolicy] || 'closed');
        setCanChangeToClosed(
          reservationPolicyResponse?.canChangeToClosed !== false,
        );
      } catch (error) {
        if (isMounted) {
          Alert.alert('조회 실패', '예약 방식을 불러오지 못했습니다.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReservationPolicy();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId]);

  const handleApply = async () => {
    if (!guesthouseId || !selectedItem || isSubmitting) {
      return;
    }

    if (selectedOption === 'closed' && !canChangeToClosed) {
      setIsBlockedClosedModalVisible(true);
      return;
    }

    setIsSubmitting(true);

    try {
      await hostGuesthouseApi.updateGuesthouseReservationPolicy(
        guesthouseId,
        OPTION_TO_POLICY[selectedOption],
      );

      const state = navigation.getState();
      const previousRoute = state.routes[state.index - 1];

      if (previousRoute) {
        navigation.dispatch({
          ...CommonActions.setParams({
            reservationMethod: selectedOption,
          }),
          source: previousRoute.key,
        });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('저장 실패', '잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectOption = optionKey => {
    setSelectedOption(optionKey);
  };

  return (
    <View style={styles.container}>
      <Header title="예약 방식 설정" />

      <View style={styles.content}>
        <Text style={[FONTS.fs_18_semibold, styles.title]}>
          운영 상황에 맞는 예약 방식을 선택해주세요
        </Text>
        <Text style={[FONTS.fs_14_medium, styles.subtitle]}>
          선택하신 설정은 저장 즉시 모든 예약 상품에 적용됩니다
        </Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.primary_orange} />
          </View>
        ) : (
          <View style={styles.optionList}>
            {RESERVATION_OPTIONS.map(option => {
              const isSelected = selectedOption === option.key;
              const RadioIcon = isSelected
                ? EnabledRadioButton
                : DisabledRadioButton;
              const OptionIcon = isSelected
                ? option.icons.selected
                : option.icons.default;

              return (
                <TouchableOpacity
                  key={option.key}
                  activeOpacity={0.85}
                  style={[
                    styles.optionCard,
                    isSelected && styles.optionCardSelected,
                  ]}
                  onPress={() => handleSelectOption(option.key)}>
                  <View style={styles.optionHeader}>
                    <View style={styles.optionContent}>
                      <OptionIcon width={20} height={20} />

                      <View style={styles.optionTitleRow}>
                        <Text
                          style={[
                            FONTS.fs_16_medium,
                            styles.optionTitle,
                            isSelected && styles.optionTitleSelected,
                          ]}>
                          {option.title}
                        </Text>

                        {option.recommended ? (
                          <View style={styles.recommendedBadge}>
                            <Text
                              style={[
                                FONTS.fs_12_medium,
                                styles.recommendedBadgeText,
                              ]}>
                              RECOMMENDED
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <RadioIcon width={20} height={20} />
                  </View>

                  <View style={styles.descriptionWrap}>
                    {option.description.map(line => (
                      <Text
                        key={line}
                        style={[
                          FONTS.fs_14_medium,
                          styles.optionDescription,
                          isSelected && styles.optionDescriptionSelected,
                        ]}>
                        {line}
                      </Text>
                    ))}
                  </View>

                  {option.notice ? (
                    <View style={styles.noticeBox}>
                      <TrendingIcon width={16} height={16} />
                      <Text style={[FONTS.fs_12_medium, styles.noticeText]}>
                        {option.notice}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <ButtonScarlet
          title={isSubmitting ? '저장 중...' : '적용하기'}
          onPress={handleApply}
          disabled={!selectedItem || isLoading || isSubmitting || !guesthouseId}
        />
      </View>

      <AlertModal
        visible={isBlockedClosedModalVisible}
        message={
          '진행 중인 예약이 있어 예약 마감으로 변경할 수 없어요\n진행 중인 예약이 종료된 후 다시 시도해주세요'
        }
        buttonText="확인"
        onPress={() => setIsBlockedClosedModalVisible(false)}
      />
    </View>
  );
};

export default ReservationMethodSettings;
