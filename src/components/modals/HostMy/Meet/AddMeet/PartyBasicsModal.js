import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Calendar} from 'react-native-calendars';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {
  CALENDAR_COMMON_PROPS,
  CALENDAR_THEME,
} from '@constants/calendarConfig';
import TimePickerModal from '@components/modals/TimePickerModal';
import {formatLocalTimeToKorean12Hour} from '@utils/formatDate';

import XBtn from '@assets/images/x_gray.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import ClockIcon from '@assets/images/clock_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import PlusOrangeIcon from '@assets/images/plus_orange.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import DeleteIcon from '@assets/images/delete_gray.svg';
import DisabledRadioButton from '@assets/images/radio_button_disabled.svg';
import EnabledRadioButton from '@assets/images/radio_button_enabled.svg';

const normalize = initialValues => {
  const amount = initialValues?.amount ?? 0;
  const chargeType = ['FREE', 'PAID'].includes(initialValues?.chargeType)
    ? initialValues.chargeType
    : Number(amount) > 0 ? 'PAID' : 'FREE';

  return {
    guesthouseId: initialValues?.guesthouseId ?? null,
    eventDate: initialValues?.eventDate ?? null,
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
    priceOptions: normalizePriceOptions(initialValues?.priceOptions, amount),
    femaleAmount: initialValues?.femaleAmount ?? 0,
    maleNonAmount: initialValues?.maleNonAmount ?? 0,
    femaleNonAmount: initialValues?.femaleNonAmount ?? 0,
  };
};

const formatDateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatEventDate = dateKey => {
  if (!dateKey) {
    return '날짜를 선택해주세요';
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  const dayLabel = ['일', '월', '화', '수', '목', '금', '토'][
    new Date(year, month - 1, day).getDay()
  ];
  return `${year}.${String(month).padStart(2, '0')}.${String(day).padStart(
    2,
    '0',
  )} (${dayLabel})`;
};

const normalizePriceOptions = (priceOptions, fallbackAmount = '') => {
  const normalized = Array.isArray(priceOptions)
    ? priceOptions
      .map((option, index) => ({
        ...(option?.id != null ? {id: option.id} : {}),
        optionName: String(option?.optionName ?? '').trim(),
        amount: option?.amount ?? '',
        displayOrder: Number.isFinite(Number(option?.displayOrder))
          ? Number(option.displayOrder)
          : index,
      }))
      .filter(option => option.optionName || option.amount !== '')
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((option, index) => ({...option, displayOrder: index}))
    : [];

  return normalized.length > 0
    ? normalized
    : [{optionName: '기본 참가비', amount: fallbackAmount || '', displayOrder: 0}];
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
  showEventDate = false,
  showApplicationPeriod = true,
}) => {
  const [form, setForm] = useState(normalize(initialValues));
  const [appliedData, setAppliedData] = useState(null);
  const [timePickerType, setTimePickerType] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setForm(appliedData || normalize(initialValues));
  }, [visible, appliedData, initialValues]);

  const isDisabled = useMemo(() => {
    const normalizedNames = form.priceOptions.map(option =>
      option.optionName.trim(),
    );
    const hasValidPriceOptions =
      form.priceOptions.length > 0 &&
      form.priceOptions.every(
        option => option.optionName.trim() && Number(option.amount) > 0,
      ) &&
      new Set(normalizedNames).size === normalizedNames.length;

    return !(
      !!form.partyStartTime &&
      !!form.partyEndTime &&
      (!showEventDate || !!form.eventDate) &&
      (!showApplicationPeriod ||
        ['SAME_DAY', 'ADVANCE'].includes(form.applicationType)) &&
      Number(form.minAttendees) > 0 &&
      Number(form.maxAttendees) >= Number(form.minAttendees) &&
      ['FREE', 'PAID'].includes(form.chargeType) &&
      (form.chargeType === 'FREE' || hasValidPriceOptions)
    );
  }, [form, showApplicationPeriod, showEventDate]);

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      setForm(appliedData || normalize(initialValues));
    }
    setIsDatePickerVisible(false);
    onClose?.();
  };

  const handleConfirm = () => {
    if (isDisabled) return;
    const priceOptions = form.priceOptions.map((option, index) => ({
      ...(option.id != null ? {id: option.id} : {}),
      optionName: option.optionName.trim(),
      amount: Number(option.amount),
      displayOrder: index,
    }));
    const nextForm = {
      ...form,
      amount: form.chargeType === 'PAID' ? priceOptions[0].amount : 0,
      priceOptions,
    };
    setAppliedData(nextForm);
    onSelect?.(nextForm);
    onClose?.();
  };

  const updatePriceOption = (index, key, value) => {
    setForm(prev => ({
      ...prev,
      priceOptions: prev.priceOptions.map((option, optionIndex) =>
        optionIndex === index ? {...option, [key]: value} : option,
      ),
    }));
  };

  const addPriceOption = () => {
    setForm(prev => ({
      ...prev,
      priceOptions: [
        ...prev.priceOptions,
        {
          optionName: '',
          amount: '',
          displayOrder: prev.priceOptions.length,
        },
      ],
    }));
  };

  const removePriceOption = index => {
    setForm(prev => ({
      ...prev,
      priceOptions:
        prev.priceOptions.length === 1
          ? [{optionName: '기본 참가비', amount: '', displayOrder: 0}]
          : prev.priceOptions
            .filter((_, optionIndex) => optionIndex !== index)
            .map((option, optionIndex) => ({
              ...option,
              displayOrder: optionIndex,
            })),
    }));
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
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleModalClose} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>기본 정보</Text>
            <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets>
            {showEventDate ? (
              <>
                <Text style={[FONTS.fs_16_medium, styles.label]}>진행 날짜</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  activeOpacity={0.72}
                  accessibilityRole="button"
                  accessibilityLabel="이벤트 진행 날짜 선택"
                  onPress={() => setIsDatePickerVisible(true)}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      form.eventDate
                        ? styles.dateInputText
                        : styles.dateInputPlaceholder,
                    ]}>
                    {formatEventDate(form.eventDate)}
                  </Text>
                  <CalendarIcon width={22} height={22} />
                </TouchableOpacity>
              </>
            ) : null}

            <Text
              style={[
                FONTS.fs_16_medium,
                styles.label,
                showEventDate && styles.sectionLabel,
              ]}>
              진행 시간
            </Text>
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

            {showApplicationPeriod ? (
              <>
                <Text
                  style={[
                    FONTS.fs_16_medium,
                    styles.label,
                    styles.sectionLabel,
                  ]}>
                  신청 기간
                </Text>
                <View style={styles.radioGroup}>
                  <RadioOption
                    style={styles.applicationTypeOption}
                    textStyle={FONTS.fs_14_medium}
                    selected={form.applicationType === 'SAME_DAY'}
                    label="당일 신청만 가능"
                    onPress={() =>
                      setForm(prev => ({
                        ...prev,
                        applicationType: 'SAME_DAY',
                      }))
                    }
                  />
                  <RadioOption
                    style={styles.applicationTypeOption}
                    textStyle={FONTS.fs_14_medium}
                    selected={form.applicationType === 'ADVANCE'}
                    label="사전 신청 가능 (7일 전부터 신청 가능)"
                    onPress={() =>
                      setForm(prev => ({
                        ...prev,
                        applicationType: 'ADVANCE',
                      }))
                    }
                  />
                </View>
              </>
            ) : null}

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
                    priceOptions: normalizePriceOptions(
                      prev.priceOptions,
                      prev.amount,
                    ),
                  }))
                }
              />
            </View>
            {form.chargeType === 'PAID' ? (
              <View style={styles.priceOptionsCard}>
                <View style={styles.priceColumnHeader}>
                  <Text style={[FONTS.fs_12_medium, styles.priceColumnName]}>
                    항목 이름
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.priceColumnAmount]}>
                    금액
                  </Text>
                  <View style={styles.priceColumnAction} />
                </View>
                {form.priceOptions.map((option, index) => (
                  <View
                    key={option.id ?? `price-option-${index}`}
                    style={styles.priceOptionRow}>
                    <TextInput
                      value={option.optionName}
                      onChangeText={value =>
                        updatePriceOption(index, 'optionName', value)
                      }
                      placeholder="옵션명을 입력해주세요"
                      placeholderTextColor={COLORS.grayscale_300}
                      style={[FONTS.fs_14_medium, styles.optionNameInput]}
                    />
                    <TextInput
                      value={formatWithComma(option.amount)}
                      onChangeText={text =>
                        updatePriceOption(
                          index,
                          'amount',
                          text.replace(/[^0-9]/g, ''),
                        )
                      }
                      placeholder="0"
                      placeholderTextColor={COLORS.grayscale_300}
                      keyboardType="numeric"
                      style={[FONTS.fs_14_medium, styles.optionAmountInput]}
                    />
                    <Text style={[FONTS.fs_14_medium, styles.priceUnit]}>원</Text>
                    <TouchableOpacity
                      style={styles.deleteOptionButton}
                      onPress={() => removePriceOption(index)}
                      accessibilityRole="button"
                      accessibilityLabel={`${option.optionName || `가격 옵션 ${index + 1}`} 삭제`}>
                      <DeleteIcon width={22} height={22} />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity style={styles.addOptionButton} onPress={addPriceOption}>
                  <PlusOrangeIcon width={22} height={22} />
                  <Text style={[FONTS.fs_16_semibold, styles.addOptionText]}>
                    요금 항목 추가
                  </Text>
                </TouchableOpacity>
                <View style={styles.priceInfoDivider} />
                <View style={styles.priceInfoRow}>
                  <Text style={[FONTS.fs_14_medium, styles.priceInfoIcon]}>ⓘ</Text>
                  <Text style={[FONTS.fs_12_medium, styles.priceInfoText]}>
                    다양한 대상이나 조건에 맞춰 요금을 다르게 설정할 수 있습니다.
                  </Text>
                </View>
              </View>
            ) : null}
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

        <Modal
          visible={isDatePickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsDatePickerVisible(false)}>
          <View style={styles.datePickerOverlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setIsDatePickerVisible(false)}
            />
            <View style={styles.datePickerCard}>
              <View style={styles.datePickerHeader}>
                <Text style={[FONTS.fs_18_semibold, styles.datePickerTitle]}>
                  진행 날짜 선택
                </Text>
                <TouchableOpacity
                  style={styles.datePickerCloseButton}
                  onPress={() => setIsDatePickerVisible(false)}>
                  <XBtn width={22} height={22} />
                </TouchableOpacity>
              </View>
              <Calendar
                {...CALENDAR_COMMON_PROPS}
                current={form.eventDate || formatDateKey(new Date())}
                minDate={formatDateKey(new Date())}
                markedDates={
                  form.eventDate
                    ? {
                        [form.eventDate]: {
                          selected: true,
                          selectedColor: COLORS.primary_orange,
                        },
                      }
                    : {}
                }
                onDayPress={day => {
                  setForm(prev => ({...prev, eventDate: day.dateString}));
                  setIsDatePickerVisible(false);
                }}
                theme={{
                  ...CALENDAR_THEME,
                  selectedDayBackgroundColor: COLORS.primary_orange,
                  selectedDayTextColor: COLORS.grayscale_0,
                  textDayFontFamily: FONTS.fs_14_medium.fontFamily,
                  textMonthFontFamily: FONTS.fs_16_semibold.fontFamily,
                  textDayHeaderFontFamily: FONTS.fs_12_medium.fontFamily,
                }}
              />
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
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
    height: '90%',
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
  },
  bodyContent: {
    paddingTop: 10,
    paddingBottom: 40,
  },
  label: {
    color: COLORS.grayscale_900,
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    backgroundColor: COLORS.grayscale_0,
  },
  dateInputText: {
    color: COLORS.grayscale_900,
  },
  dateInputPlaceholder: {
    color: COLORS.grayscale_400,
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
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: COLORS.modal_background,
  },
  datePickerCard: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale_0,
  },
  datePickerHeader: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  datePickerTitle: {
    color: COLORS.grayscale_900,
  },
  datePickerCloseButton: {
    position: 'absolute',
    right: 0,
    padding: 4,
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
  priceOptionsCard: {
    marginTop: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_0,
  },
  priceColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  priceColumnName: {
    flex: 1.2,
    color: COLORS.grayscale_500,
  },
  priceColumnAmount: {
    flex: 1,
    color: COLORS.grayscale_500,
  },
  priceColumnAction: {
    width: 48,
  },
  priceOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  optionNameInput: {
    flex: 1.2,
    color: COLORS.grayscale_900,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
  },
  optionAmountInput: {
    flex: 1,
    color: COLORS.grayscale_900,
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 12,
    textAlign: 'right',
  },
  deleteOptionButton: {
    width: 28,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addOptionButton: {
    height: 52,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary_orange,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addOptionText: {
    color: COLORS.primary_orange,
  },
  priceInfoDivider: {
    height: 1,
    backgroundColor: COLORS.grayscale_200,
    marginTop: 16,
    marginBottom: 14,
  },
  priceInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  priceInfoIcon: {
    color: COLORS.grayscale_500,
    marginRight: 6,
    lineHeight: 18,
  },
  priceInfoText: {
    flex: 1,
    color: COLORS.grayscale_500,
    lineHeight: 18,
  },
  priceUnit: {
    color: COLORS.grayscale_600,
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
