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
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';

import CheckWhite from '@assets/images/check_white.svg';
import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const TEXT_MAX = 500;

const PARKING_TAGS = [
  {key: 'PARTY_PARKING', label: '주차 가능'},
  {key: 'PARTY_GUESTHOUSE_PARKING', label: '전용주차장'},
  {key: 'PARTY_PUBLIC_PARKING', label: '공용주차장'},
  {key: 'PARTY_NO_PARKING', label: '주차불가'},
  {key: 'PARTY_STREET_PARKING', label: '대로변 주차'},
];

const stringifyInfo = value => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value
      .map(item => {
        const title = item?.title?.trim?.() ?? '';
        const content = item?.content?.trim?.() ?? '';
        return [title, content].filter(Boolean).join(' ');
      })
      .filter(Boolean)
      .join('\n');
  }
  return '';
};

const normalize = initialValues => ({
  meetingPlace: typeof initialValues?.meetingPlace === 'string' ? initialValues.meetingPlace : '',
  trafficInfo: stringifyInfo(initialValues?.trafficInfo),
  parkingInfo: stringifyInfo(initialValues?.parkingInfo),
  parkingTag: Array.isArray(initialValues?.parkingTag) ? initialValues.parkingTag : [],
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

const PartyDirectionsModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialValues,
}) => {
  const [form, setForm] = useState(normalize(initialValues));
  const [appliedData, setAppliedData] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setForm(appliedData || normalize(initialValues));
  }, [visible, appliedData, initialValues]);

  const isDisabled = useMemo(() => false, []);

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      setForm(appliedData || normalize(initialValues));
    }
    onClose?.();
  };

  const handleConfirm = () => {
    setAppliedData(form);
    onSelect?.(form);
    onClose?.();
  };

  const toggleParkingTag = key => {
    setForm(prev => ({
      ...prev,
      parkingTag: prev.parkingTag.includes(key)
        ? prev.parkingTag.filter(item => item !== key)
        : [...prev.parkingTag, key],
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleModalClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleModalClose} />
        <KeyboardAvoidingView
          style={{width: '100%'}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContainer}>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleModalClose} style={styles.closeButton}>
                <XBtn width={24} height={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
              <View style={styles.sectionTopRow}>
                <Text style={[FONTS.fs_20_semibold, styles.sectionTitle]}>
                  참여자들이 모일 장소를 기재해 주세요
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.meetingPlace.length}</Text>/{TEXT_MAX}
                </Text>
              </View>
              <TextInput
                value={form.meetingPlace}
                onChangeText={text => setForm(prev => ({...prev, meetingPlace: text.slice(0, TEXT_MAX)}))}
                placeholder="1층 라운지에서 만나요~"
                placeholderTextColor={COLORS.grayscale_400}
                style={[styles.mediumTextArea, FONTS.fs_16_regular]}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.rewriteButton}
                onPress={() => setForm(prev => ({...prev, meetingPlace: ''}))}>
                <Text style={[FONTS.fs_14_medium, styles.rewriteText]}>다시쓰기</Text>
              </TouchableOpacity>

              <View style={[styles.sectionTopRow, {marginTop: 12}]}>
                <Text style={[FONTS.fs_20_semibold, styles.sectionTitle]}>
                  교통 정보 안내 글을 작성해주세요
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.trafficInfo.length}</Text>/{TEXT_MAX}
                </Text>
              </View>
              <TextInput
                value={form.trafficInfo}
                onChangeText={text => setForm(prev => ({...prev, trafficInfo: text.slice(0, TEXT_MAX)}))}
                placeholder="대중교통: 제주공항에서 버스로 20분"
                placeholderTextColor={COLORS.grayscale_400}
                style={[styles.mediumTextArea, FONTS.fs_16_regular]}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.rewriteButton}
                onPress={() => setForm(prev => ({...prev, trafficInfo: ''}))}>
                <Text style={[FONTS.fs_14_medium, styles.rewriteText]}>다시쓰기</Text>
              </TouchableOpacity>

              <Text style={[FONTS.fs_20_semibold, styles.sectionTitle, {marginTop: 12}]}>
                주차 가능 여부
              </Text>
              <View style={styles.tagGrid}>
                {PARKING_TAGS.map(item => {
                  const selected = form.parkingTag.includes(item.key);
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[styles.tagButton, selected && styles.tagButtonSelected]}
                      onPress={() => toggleParkingTag(item.key)}>
                      <Text
                        style={[
                          FONTS.fs_16_medium,
                          selected ? styles.tagTextSelected : styles.tagText,
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[styles.sectionTopRow, {marginTop: 20}]}>
                <Text style={[FONTS.fs_20_semibold, styles.sectionTitle]}>
                  주차 관련 안내 글을 작성해주세요
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.parkingInfo.length}</Text>/{TEXT_MAX}
                </Text>
              </View>
              <TextInput
                value={form.parkingInfo}
                onChangeText={text => setForm(prev => ({...prev, parkingInfo: text.slice(0, TEXT_MAX)}))}
                placeholder="숙소 자체 주차 공간은 협소하여 이용이 불가능합니다."
                placeholderTextColor={COLORS.grayscale_400}
                style={[styles.mediumTextArea, FONTS.fs_16_regular]}
                multiline
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={styles.rewriteButton}
                onPress={() => setForm(prev => ({...prev, parkingInfo: ''}))}>
                <Text style={[FONTS.fs_14_medium, styles.rewriteText]}>다시쓰기</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
              <PillSubmitButton disabled={isDisabled} onPress={handleConfirm} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default PartyDirectionsModal;

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
    paddingHorizontal: 14,
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
    paddingTop: 4,
  },
  sectionTopRow: {
    marginBottom: 10,
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
  mediumTextArea: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagButton: {
    width: '50%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tagButtonSelected: {
    backgroundColor: COLORS.grayscale_0,
  },
  tagText: {
    color: COLORS.grayscale_400,
  },
  tagTextSelected: {
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
