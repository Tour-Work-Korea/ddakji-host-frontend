import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ScrollView,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import CheckWhite from '@assets/images/check_white.svg';
import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const DETAIL_MAX = 5000;
const EXTRA_MAX = 500;

const SNACK_TAGS = [
  {key: 'PARTY_FOOD', label: '음식 제공'},
  {key: 'PARTY_ALCOHOL', label: '주류 제공'},
  {key: 'PARTY_INDIVIDUAL', label: '각자 준비'},
  {key: 'PARTY_TOGETHER', label: '같이 준비'},
  {key: 'PARTY_FREE', label: '자유'},
];

const normalize = initialValues => ({
  detailSchedule: initialValues?.detailSchedule ?? '',
  snackTagList: Array.isArray(initialValues?.snackTagList) ? initialValues.snackTagList : [],
  snacks: initialValues?.snacks ?? '',
  extraInfo: initialValues?.extraInfo ?? '',
});

const PillSubmitButton = ({disabled, onPress}) => (
  <TouchableOpacity
    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
    disabled={disabled}
    onPress={onPress}>
    <Text style={[FONTS.fs_14_medium, styles.submitButtonText]}>적용하기</Text>
    <CheckWhite width={20} height={20} />
  </TouchableOpacity>
);

const PartyDetailInfoModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialValues,
}) => {
  const {keyboardHeight} = useKeyboardAwareScrollView({iosOnly: false});
  const isKeyboardVisible = keyboardHeight > 0;
  const [form, setForm] = useState(normalize(initialValues));
  const [appliedData, setAppliedData] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setForm(appliedData || normalize(initialValues));
  }, [visible, appliedData, initialValues]);

  const isDisabled = useMemo(() => {
    return !(
      form.detailSchedule.trim().length > 0 &&
      Array.isArray(form.snackTagList) &&
      form.snackTagList.length > 0
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

  const toggleSnackTag = key => {
    setForm(prev => ({
      ...prev,
      snackTagList: prev.snackTagList.includes(key)
        ? prev.snackTagList.filter(item => item !== key)
        : [...prev.snackTagList, key],
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleModalClose}>
      <TouchableWithoutFeedback
        onPress={() => (isKeyboardVisible ? Keyboard.dismiss() : handleModalClose())}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => {}} />
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>상세 안내</Text>
              <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.body}
              contentContainerStyle={{
                paddingBottom: keyboardHeight + 96,
              }}
              keyboardShouldPersistTaps="handled">
              <View style={styles.sectionTopRow}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                  파티 세부 일정에 대해 작성해 주세요
                </Text>
                <Text style={[FONTS.fs_12_light, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.detailSchedule.length}</Text>/{DETAIL_MAX.toLocaleString()}
                </Text>
              </View>
              <TextInput
                value={form.detailSchedule}
                onChangeText={text =>
                  setForm(prev => ({...prev, detailSchedule: text.slice(0, DETAIL_MAX)}))
                }
                placeholder=""
                placeholderTextColor={COLORS.grayscale_400}
                style={[styles.largeTextArea, FONTS.fs_14_regular]}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.rewriteButton}
                onPress={() => setForm(prev => ({...prev, detailSchedule: ''}))}>
                <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>다시쓰기</Text>
              </TouchableOpacity>

                <Text style={[FONTS.fs_16_medium, styles.sectionTitle, {marginTop: 8}]}>
                음식 · 음료 제공 여부
              </Text>
              <View style={styles.tagGrid}>
                {SNACK_TAGS.map(item => {
                  const selected = form.snackTagList.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.tagButton, selected && styles.tagButtonSelected]}
                      onPress={() => toggleSnackTag(item.key)}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          selected ? styles.tagTextSelected : styles.tagText,
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.sectionTopRow, {marginTop: 20}]}>
                <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>
                  제공량/준비량 관련 안내
                </Text>
                <Text style={[FONTS.fs_12_light, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.extraInfo.length}</Text>/{EXTRA_MAX}
                </Text>
              </View>
              <TextInput
                value={form.extraInfo}
                onChangeText={text =>
                  setForm(prev => ({
                    ...prev,
                    extraInfo: text.slice(0, EXTRA_MAX),
                    snacks: text.slice(0, EXTRA_MAX),
                  }))
                }
                placeholder="본인이 드실 음료랑 주류를 사전에 준비해 주세요."
                placeholderTextColor={COLORS.grayscale_400}
                style={[styles.mediumTextArea, FONTS.fs_14_regular]}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.rewriteButton}
                onPress={() =>
                  setForm(prev => ({...prev, extraInfo: '', snacks: ''}))
                }>
                <Text style={[FONTS.fs_12_medium, styles.rewriteText]}>다시쓰기</Text>
              </TouchableOpacity>
            </ScrollView>
            <View
              style={[
                styles.footer,
                {bottom: keyboardHeight > 0 ? keyboardHeight + 12 : 24},
              ]}>
              <PillSubmitButton disabled={isDisabled} onPress={handleConfirm} />
            </View>
          </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default PartyDetailInfoModal;

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
  sectionTopRow: {
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: COLORS.grayscale_900,
  },
  counterText: {
    color: COLORS.grayscale_400,
  },
  counterAccent: {
    color: COLORS.primary_orange,
  },
  largeTextArea: {
    minHeight: 102,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.grayscale_900,
  },
  mediumTextArea: {
    minHeight: 126,
    maxHeight: 340,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.grayscale_900,
  },
  rewriteButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  rewriteText: {
    color: COLORS.grayscale_500,
  },
  tagGrid: {
    marginTop: 8,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    width: '48%',
    paddingHorizontal: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tagButtonSelected: {
  },
  tagText: {
    color: COLORS.grayscale_400,
  },
  tagTextSelected: {
    color: COLORS.primary_orange,
  },
  footer: {
    position: 'absolute',
    right: 20,
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
});
