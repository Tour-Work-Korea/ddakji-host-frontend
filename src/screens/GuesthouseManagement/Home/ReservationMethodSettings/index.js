import React, {useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
import {FONTS} from '@constants/fonts';
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
    title: '예약 마감',
    description: [
      '현재 예약을 받지 않아요.',
      '게스트에게 예약 버튼이 노출되지 않습니다.',
    ],
  },
  {
    key: 'request',
    title: '예약 요청 후 확정',
    description: [
      '요청을 확인하고 수락해야 예약이 확정돼요.',
      '당일 오전 10시 이후 예약은 30분 내,',
      '그 외 예약은 24시간 내 미승인 시 자동 취소됩니다.',
    ],
  },
  {
    key: 'instant',
    title: '즉시 예약 확정',
    description: [
      '결제 시 자동으로 예약이 확정돼요.',
      '가장 빠른 예약 전환이 가능합니다.',
    ],
    recommended: true,
    notice: '결제와 동시에 예약이 확정되어 예약 전환에 유리해요.',
  },
];

const ReservationMethodSettings = () => {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('instant');

  const selectedItem = useMemo(
    () =>
      RESERVATION_OPTIONS.find(option => option.key === selectedOption) ||
      RESERVATION_OPTIONS[0],
    [selectedOption],
  );

  const handleApply = () => {
    navigation.goBack();
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

        <View style={styles.optionList}>
          {RESERVATION_OPTIONS.map(option => {
            const isSelected = selectedOption === option.key;
            const RadioIcon = isSelected
              ? EnabledRadioButton
              : DisabledRadioButton;

            return (
              <TouchableOpacity
                key={option.key}
                activeOpacity={0.85}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
                onPress={() => setSelectedOption(option.key)}>
                <View style={styles.optionHeader}>
                  <View style={styles.optionTitleRow}>
                    <Text
                      style={[
                        FONTS.fs_16_semibold,
                        styles.optionTitle,
                        isSelected && styles.optionTitleSelected,
                      ]}>
                      {option.title}
                    </Text>

                    {option.recommended ? (
                      <View style={styles.recommendedBadge}>
                        <Text
                          style={[
                            FONTS.fs_12_semibold,
                            styles.recommendedBadgeText,
                          ]}>
                          RECOMMENDED
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <RadioIcon width={24} height={24} />
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
                    <Text style={[FONTS.fs_12_medium, styles.noticeText]}>
                      {option.notice}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <ButtonScarlet
          title="적용하기"
          onPress={handleApply}
          disabled={!selectedItem}
          style={styles.applyButton}
        />
      </View>
    </View>
  );
};

export default ReservationMethodSettings;
