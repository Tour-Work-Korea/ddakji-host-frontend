import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
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

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);

const normalize = initialValues => ({
  guesthouseId: initialValues?.guesthouseId ?? null,
  partyStartTime: initialValues?.partyStartTime || '20:00:00',
  partyEndTime: initialValues?.partyEndTime || '20:00:00',
  minAttendees: Number(initialValues?.minAttendees) || 10,
  maxAttendees: Number(initialValues?.maxAttendees) || 35,
  isGuest: initialValues?.isGuest ?? true,
  amount: initialValues?.amount ?? 0,
  femaleAmount: initialValues?.femaleAmount ?? 0,
  maleNonAmount: initialValues?.maleNonAmount ?? 0,
  femaleNonAmount: initialValues?.femaleNonAmount ?? 0,
});

const PillSubmitButton = ({disabled, onPress}) => (
  <TouchableOpacity
    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
    disabled={disabled}
    onPress={onPress}>
    <Text style={[FONTS.fs_16_semibold, styles.submitButtonText]}>적용하기</Text>
    <CheckWhite width={22} height={22} />
  </TouchableOpacity>
);

const Counter = ({value, onMinus, onPlus}) => (
  <View style={styles.counterRow}>
    <TouchableOpacity style={styles.circleButton} onPress={onMinus}>
      <MinusIcon width={20} height={20} />
    </TouchableOpacity>
    <View style={styles.counterValue}>
      <Text style={[FONTS.fs_20_medium, styles.counterText]}>{value}</Text>
    </View>
    <TouchableOpacity style={styles.circleButton} onPress={onPlus}>
      <PlusIcon width={20} height={20} />
    </TouchableOpacity>
  </View>
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
      Number(form.minAttendees) > 0 &&
      Number(form.maxAttendees) >= Number(form.minAttendees)
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
            <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
              <XBtn width={24} height={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <Text style={[FONTS.fs_24_semibold, styles.label]}>파티 시간</Text>
            <View style={styles.timeRow}>
              {['partyStartTime', 'partyEndTime'].map(key => (
                <TouchableOpacity
                  key={key}
                  style={styles.timeInput}
                  onPress={() => setTimePickerType(key)}>
                  <Text style={[FONTS.fs_16_medium, styles.timeInputText]}>
                    {formatLocalTimeToKorean12Hour(form[key])}
                  </Text>
                  <ClockIcon width={24} height={24} />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[FONTS.fs_24_semibold, styles.label, {marginTop: 22}]}>참여 인원</Text>
            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_20_medium, styles.infoLabel]}>최소</Text>
              <Counter
                value={form.minAttendees}
                onMinus={() => step('minAttendees', 'minus')}
                onPlus={() => step('minAttendees', 'plus')}
              />
            </View>
            <View style={styles.infoRow}>
              <Text style={[FONTS.fs_20_medium, styles.infoLabel]}>최대</Text>
              <Counter
                value={form.maxAttendees}
                onMinus={() => step('maxAttendees', 'minus')}
                onPlus={() => step('maxAttendees', 'plus')}
              />
            </View>

            <Text style={[FONTS.fs_24_semibold, styles.label, {marginTop: 22}]}>숙박 여부</Text>
            <View style={styles.segment}>
              <TouchableOpacity
                style={[styles.segmentItem, form.isGuest && styles.segmentItemActive]}
                onPress={() => setForm(prev => ({...prev, isGuest: true}))}>
                <Text
                  style={[
                    FONTS.fs_18_medium,
                    form.isGuest ? styles.segmentTextActive : styles.segmentText,
                  ]}>
                  숙박객만 참여가능
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.segmentItem, !form.isGuest && styles.segmentItemActive]}
                onPress={() => setForm(prev => ({...prev, isGuest: false}))}>
                <Text
                  style={[
                    FONTS.fs_18_medium,
                    !form.isGuest ? styles.segmentTextActive : styles.segmentText,
                  ]}>
                  비숙박객 참여가능
                </Text>
              </TouchableOpacity>
            </View>
          </View>

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
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 2,
  },
  body: {
    flex: 1,
    paddingTop: 10,
  },
  label: {
    color: COLORS.grayscale_900,
    marginBottom: 14,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timeInput: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeInputText: {
    color: COLORS.grayscale_500,
  },
  infoRow: {
    marginBottom: 18,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterValue: {
    width: 52,
    height: 52,
    borderRadius: 26,
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
    borderRadius: 10,
    padding: 4,
  },
  segmentItem: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: COLORS.grayscale_0,
  },
  segmentText: {
    color: COLORS.grayscale_400,
  },
  segmentTextActive: {
    color: COLORS.primary_orange,
  },
  footer: {
    paddingTop: 12,
    paddingBottom: 16,
    alignItems: 'flex-end',
  },
  submitButton: {
    height: 50,
    paddingHorizontal: 22,
    borderRadius: 25,
    backgroundColor: COLORS.primary_orange,
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
});
