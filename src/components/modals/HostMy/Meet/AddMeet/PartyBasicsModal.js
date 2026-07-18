import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import TimePickerModal from '@components/modals/TimePickerModal';
import {formatLocalTimeToKorean12Hour} from '@utils/formatDate';

import XBtn from '@assets/images/x_gray.svg';
import CheckWhite from '@assets/images/check_white.svg';
import ClockIcon from '@assets/images/clock_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const normalize = initialValues => {
  const amount = initialValues?.amount ?? 0;
  const chargeType = ['FREE', 'PAID'].includes(initialValues?.chargeType)
    ? initialValues.chargeType
    : Number(amount) > 0 ? 'PAID' : 'FREE';

  return {
    guesthouseId: initialValues?.guesthouseId ?? null,
    partyStartTime: initialValues?.partyStartTime || '20:00:00',
    partyEndTime: initialValues?.partyEndTime || '20:00:00',
    applicationType: ['SAME_DAY', 'ADVANCE'].includes(
      initialValues?.applicationType,
    )
      ? initialValues.applicationType
      : 'SAME_DAY',
    minAttendees: Number(initialValues?.minAttendees) || 10,
    maxAttendees: Number(initialValues?.maxAttendees) || 15,
    isGuest: initialValues?.isGuest ?? true,
    chargeType,
    amount: chargeType === 'PAID' ? amount : 0,
    femaleAmount: initialValues?.femaleAmount ?? 0,
    maleNonAmount: initialValues?.maleNonAmount ?? 0,
    femaleNonAmount: initialValues?.femaleNonAmount ?? 0,
  };
};

const PillSubmitButton = ({disabled, onPress}) => (
  <TouchableOpacity
    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
    disabled={disabled}
    onPress={onPress}>
    <Text style={[FONTS.fs_14_medium, styles.submitButtonText]}>적용하기</Text>
    <CheckWhite width={20} height={20} />
  </TouchableOpacity>
);

const Counter = ({value, onMinus, onPlus}) => (
  <View style={styles.counterRow}>
    <TouchableOpacity style={styles.circleButton} onPress={onMinus}>
      <MinusIcon width={20} height={20} />
    </TouchableOpacity>
    <View style={styles.counterValue}>
      <Text style={[FONTS.fs_14_medium, styles.counterText]}>{value}</Text>
    </View>
    <TouchableOpacity style={styles.circleButton} onPress={onPlus}>
      <PlusIcon width={20} height={20} />
    </TouchableOpacity>
  </View>
);

const formatWithComma = (num) => {
  if (!num && num !== 0) {
    return '';
  }
  if (num === 0) {
    return '';
  }
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const PriceInput = ({value, onChange}) => (
  <View style={styles.priceInputContainer}>
    <TextInput
      style={styles.priceInput}
      keyboardType="numeric"
      value={formatWithComma(value)}
      onChangeText={text => {
        const cleaned = text.replace(/[^0-9]/g, '');
        onChange(cleaned);
      }}
      placeholder="참가비를 입력해주세요"
      placeholderTextColor={COLORS.grayscale_300}
    />
    <Text style={[FONTS.fs_14_medium, styles.priceUnit]}>원</Text>
  </View>
);

const RadioOption = ({selected, label, onPress, style, textStyle}) => (
  <TouchableOpacity style={[styles.radioOption, style]} onPress={onPress}>
    {selected ? (
      <EnabledRadioButton width={28} height={28} />
    ) : (
      <DisabledRadioButton width={28} height={28} />
    )}
    <Text style={[FONTS.fs_16_medium, styles.radioOptionText, textStyle]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const PartyBasicsModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialValues,
}) => {
  const [form, setForm] = useState(normalize(initialValues));
  const [appliedData, setAppliedData] = useState(null);
  const [timePickerType, setTimePickerType] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setForm(appliedData || normalize(initialValues));
  }, [visible, appliedData, initialValues]);

  const isDisabled = useMemo(() => {
    return !(
      !!form.partyStartTime &&
      !!form.partyEndTime &&
      ['SAME_DAY', 'ADVANCE'].includes(form.applicationType) &&
      Number(form.minAttendees) > 0 &&
      Number(form.maxAttendees) >= Number(form.minAttendees) &&
      ['FREE', 'PAID'].includes(form.chargeType) &&
      (form.chargeType === 'FREE' || Number(form.amount) > 0)
    );
  }, [form]);

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      setForm(appliedData || normalize(initialValues));
    }
    onClose?.();
  };

  const handleConfirm = () => {
    if (isDisabled) return;
    setAppliedData(form);
    onSelect?.(form);
    onClose?.();
  };

  const step = (key, direction, min = 1, max = 99) => {
    setForm(prev => {
      const current = Number(prev[key]) || 0;
      const next = direction === 'minus' ? current - 1 : current + 1;
      return {
        ...prev,
        [key]: Math.min(max, Math.max(min, next)),
      };
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleModalClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleModalClose} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>기본 정보</Text>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[FONTS.fs_16_medium, styles.label]}>파티 시간</Text>
            <View style={styles.timeRow}>
              {['partyStartTime', 'partyEndTime'].map(key => (
                <TouchableOpacity
                  key={key}
                  style={styles.timeInput}
                  onPress={() => setTimePickerType(key)}>
                  <Text style={[FONTS.fs_14_regular, styles.timeInputText]}>
                    {formatLocalTimeToKorean12Hour(form[key])}
                  </Text>
                  <ClockIcon width={24} height={24} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[FONTS.fs_16_medium, styles.label, styles.sectionLabel]}>
              신청 기간
            </Text>
            <View style={styles.radioGroup}>
              <RadioOption
                style={styles.applicationTypeOption}
                textStyle={FONTS.fs_14_medium}
                selected={form.applicationType === 'SAME_DAY'}
                label="당일 신청만 가능"
                onPress={() =>
                  setForm(prev => ({...prev, applicationType: 'SAME_DAY'}))
                }
              />
              <RadioOption
                style={styles.applicationTypeOption}
                textStyle={FONTS.fs_14_medium}
                selected={form.applicationType === 'ADVANCE'}
                label="사전 신청 가능 (7일 전부터 신청 가능)"
                onPress={() =>
                  setForm(prev => ({...prev, applicationType: 'ADVANCE'}))
                }
              />
            </View>

            <Text style={[FONTS.fs_16_medium, styles.label, styles.sectionLabel]}>
              참여 인원
            </Text>
            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.infoLabel]}>최소</Text>
              <Counter
                value={form.minAttendees}
                onMinus={() => step('minAttendees', 'minus')}
                onPlus={() => step('minAttendees', 'plus')}
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_14_medium, styles.infoLabel]}>최대</Text>
              <Counter
                value={form.maxAttendees}
                onMinus={() => step('maxAttendees', 'minus')}
                onPlus={() => step('maxAttendees', 'plus')}
              />
            </View>

            <Text style={[FONTS.fs_16_medium, styles.label, styles.sectionLabel]}>
              참여 대상
            </Text>
            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentItem, !form.isGuest && styles.segmentItemActive]}
                onPress={() => setForm(prev => ({...prev, isGuest: false}))}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    !form.isGuest ? styles.segmentTextActive : styles.segmentText,
                  ]}>
                  누구나 참여
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentItem, form.isGuest && styles.segmentItemActive]}
                onPress={() => setForm(prev => ({...prev, isGuest: true}))}>
                <Text
                  style={[
                    FONTS.fs_14_medium,
                    form.isGuest ? styles.segmentTextActive : styles.segmentText,
                  ]}>
                  숙박객 전용
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[FONTS.fs_16_medium, styles.label, styles.sectionLabel]}>
              참가비
            </Text>
            <View style={styles.chargeTypeRow}>
              <RadioOption
                style={styles.chargeTypeOption}
                selected={form.chargeType === 'FREE'}
                label="무료"
                onPress={() =>
                  setForm(prev => ({...prev, chargeType: 'FREE', amount: 0}))
                }
              />
              <RadioOption
                style={styles.chargeTypeOption}
                selected={form.chargeType === 'PAID'}
                label="유료"
                onPress={() =>
                  setForm(prev => ({
                    ...prev,
                    chargeType: 'PAID',
                    amount: Number(prev.amount) > 0 ? prev.amount : '',
                  }))
                }
              />
            </View>
            {form.chargeType === 'PAID' ? (
              <PriceInput
                value={form.amount}
                onChange={v => setForm(prev => ({...prev, amount: v}))}
              />
            ) : null}

            <View style={{height: 20}} />
          </ScrollView>

          <View style={styles.footer}>
            <PillSubmitButton disabled={isDisabled} onPress={handleConfirm} />
          </View>
        </View>

        <TimePickerModal
          visible={!!timePickerType}
          initialValue={timePickerType ? form[timePickerType] : '20:00:00'}
          onClose={() => setTimePickerType(null)}
          onConfirm={value => {
            setForm(prev => ({...prev, [timePickerType]: value}));
            setTimePickerType(null);
          }}
        />
      </View>
    </Modal>
  );
};

export default PartyBasicsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  header: {
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 2,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  body: {
    flex: 1,
    paddingTop: 10,
  },
  label: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputText: {
    color: COLORS.grayscale_500,
  },
  infoRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: COLORS.grayscale_800,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleButton: {
    padding: 4,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    width: 48,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterText: {
    color: COLORS.grayscale_900,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 4,
  },
  segmentItem: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
  },
  segmentText: {
    color: COLORS.grayscale_400,
  },
  segmentTextActive: {
    color: COLORS.primary_orange,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'flex-end',
  },
  submitButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: COLORS.primary_blue,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.grayscale_300,
  },
  submitButtonText: {
    color: COLORS.grayscale_0,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  priceInput: {
    flex: 1,
    ...FONTS.fs_14_medium,
    color: COLORS.grayscale_900,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 24,
    height: 48,
    paddingHorizontal: 16,
  },
  priceUnit: {
    color: COLORS.grayscale_600,
    marginLeft: 12,
  },
  chargeTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioGroup: {
    gap: 16,
  },
  applicationTypeOption: {
    width: '100%',
    justifyContent: 'space-between',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chargeTypeOption: {
    flex: 1,
  },
  radioOptionText: {
    color: COLORS.grayscale_900,
    marginLeft: 12,
  },
  sectionLabel: {
    marginTop: 28,
  },
});
