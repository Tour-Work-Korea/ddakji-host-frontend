import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  TextInput,
  Image,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {uploadMultiImage} from '@utils/imageUploadHandler';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import XBtn from '@assets/images/x_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import ImageAddIcon from '@assets/images/add_image_gray.svg';
import PreviewIcon from '@assets/images/show_password.svg';
import BackIcon from '@assets/images/chevron_left_gray.svg';
import CheckWhite from '@assets/images/check_white.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const MAX_SECTIONS = 10;
const TITLE_MAX = 100;
const DESC_MAX = 5000;

const PillSubmitButton = ({disabled, onPress}) => (
  <TouchableOpacity
    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
    disabled={disabled}
    onPress={onPress}>
    <Text style={[FONTS.fs_14_medium, styles.submitText]}>적용하기</Text>
    <CheckWhite width={20} height={20} />
  </TouchableOpacity>
);

const normalizeInitialEvents = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map((e) => ({
    eventName: (typeof e?.eventName === 'string' ? e.eventName : (typeof e === 'string' ? e : '')) || '',
    eventDescription: typeof e?.eventDescription === 'string' ? e.eventDescription : '',
    // 단락당 1장만 쓰지만 API는 배열 요구 → 첫 번째만 사용
    imageUrl: Array.isArray(e?.partyEventImageUrls) && e.partyEventImageUrls.length ? e.partyEventImageUrls[0] : '',
  }));

const denormalizeForPayload = (sections = []) =>
  sections.map((s) => ({
    eventName: (s.eventName || '').trim(),
    eventDescription: (s.eventDescription || '').trim(),
    partyEventImageUrls: s.imageUrl ? [s.imageUrl] : [], // 1장 배열
  }));

const MeetEventModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialEvents = [],
}) => {
  const {keyboardHeight} = useKeyboardAwareScrollView({iosOnly: false});
  const isKeyboardVisible = keyboardHeight > 0;
  const [preview, setPreview] = useState(false);

  // [{eventName, eventDescription, imageUrl}]
  const [sections, setSections] = useState([]);
  // 마지막 적용값
  const [applied, setApplied] = useState(null);

  // 열릴 때 복원 로직
  useEffect(() => {
    if (!visible) return;

    setPreview(false);

    if (applied) {
      setSections(applied);
      return;
    }

    const normalized = normalizeInitialEvents(initialEvents);
    setSections((prev) => {
      const sameLen = prev.length === normalized.length;
      const same =
        sameLen &&
        prev.every(
          (p, i) =>
            p.eventName === normalized[i].eventName &&
            p.eventDescription === normalized[i].eventDescription &&
            p.imageUrl === normalized[i].imageUrl,
        );
      return same ? prev : normalized;
    });
  }, [visible]);

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (applied) setSections(applied);
      else setSections([]);
      setPreview(false);
    }
    onClose();
  };

  // 섹션 조작
  const addSection = () => {
    if (sections.length >= MAX_SECTIONS) return;
    setSections((prev) => [...prev, {eventName: '', eventDescription: '', imageUrl: ''}]);
  };

  const removeSection = (idx) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const setField = (idx, key, value) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? {...s, [key]: value} : s)));
  };

  const pickImage = async (idx) => {
    const urls = await uploadMultiImage(1);
    if (urls?.length) {
      setField(idx, 'imageUrl', urls[0]);
    }
  };

  // 유효성 검사
  const allValid =
    sections.length > 0 &&
    sections.length <= MAX_SECTIONS &&
    sections.every(
      (s) =>
        s.imageUrl &&
        s.eventName.trim().length > 0 &&
        s.eventName.trim().length <= TITLE_MAX &&
        s.eventDescription.trim().length <= DESC_MAX,
    );

  const handleConfirm = () => {
    if (!allValid) return;
    setApplied(sections);
    onSelect?.({partyEvents: denormalizeForPayload(sections)});
    onClose();
  };

  const HeaderBar = () => (
    <View style={styles.header}>
      <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
        소개글
      </Text>
      <View style={{position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'center'}}>
        {!preview ? (
          <TouchableOpacity
            onPress={() => setPreview(true)}
            style={[styles.iconBtn, {marginRight: 8}]}>
            <PreviewIcon width={22} height={22} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setPreview(false)}
            style={[styles.iconBtn, {marginRight: 8}]}>
            <BackIcon width={22} height={22} />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={handleModalClose}>
          <XBtn width={24} height={24} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleModalClose}>
      <TouchableWithoutFeedback onPress={() => (isKeyboardVisible ? Keyboard.dismiss() : handleModalClose())}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
                <HeaderBar />

                {!preview ? (
                  <ScrollView
                    style={styles.body}
                    contentContainerStyle={{
                      paddingBottom: keyboardHeight + 96,
                    }}
                    keyboardShouldPersistTaps="handled">
                    {/* 상단 설명 + 추가 버튼 */}
                    <View style={styles.topRow}>
                      <Text style={[FONTS.fs_16_medium, {color: COLORS.grayscale_800}]}>
                        사진과 함께 자유롭게 작성해 보세요
                      </Text>
                      <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400, marginRight: 8}]}>
                          {sections.length}/{MAX_SECTIONS}
                        </Text>
                        <TouchableOpacity onPress={addSection} style={styles.circleBtn}>
                          <PlusIcon width={20} height={20} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* 섹션 리스트 */}
                    <View style={{paddingBottom: 120}}>
                      {sections.map((s, idx) => {
                        const order = idx + 1;
                        const titleLen = s.eventName.length;
                        const descLen = s.eventDescription.length;
                        return (
                          <View key={`sec-${idx}`} style={styles.sectionCard}>
                            {/* 섹션 헤더 */}
                            <View style={styles.sectionHeader}>
                              <Text style={[FONTS.fs_16_semibold, {color: COLORS.grayscale_900}]}>
                                단락 {order}
                              </Text>
                              <TouchableOpacity onPress={() => removeSection(idx)} style={styles.circleBtnSmall}>
                                <MinusIcon width={18} height={18} />
                              </TouchableOpacity>
                            </View>

                            {/* 이미지 (1장 필수) */}
                            <TouchableOpacity
                              onPress={() => pickImage(idx)}
                              activeOpacity={0.8}
                              style={styles.imageInputBox}>
                              {s.imageUrl ? (
                                <Image source={{uri: s.imageUrl}} style={styles.imagePreview} />
                              ) : (
                                <View style={styles.imagePlaceholder}>
                                  <ImageAddIcon width={28} height={28} />
                                  <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400, marginTop: 6}]}>
                                    대표 사진 추가
                                  </Text>
                                </View>
                              )}
                            </TouchableOpacity>

                            {/* 제목 */}
                            <View style={styles.rowBetween}>
                              <Text style={[FONTS.fs_14_medium, {color: COLORS.grayscale_600}]}>
                                제목
                              </Text>
                              <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400}]}>
                                {titleLen}/{TITLE_MAX}
                              </Text>
                            </View>
                            <TextInput
                              value={s.eventName}
                              onChangeText={(t) => setField(idx, 'eventName', t.slice(0, TITLE_MAX))}
                              placeholder="예) 포틀럭 & 불멍"
                              placeholderTextColor={COLORS.grayscale_400}
                              style={[FONTS.fs_14_regular, styles.textInput]}
                              maxLength={TITLE_MAX}
                              returnKeyType="done"
                            />

                            {/* 내용 */}
                            <View style={[styles.rowBetween, {marginTop: 12}]}>
                              <Text style={[FONTS.fs_14_medium, {color: COLORS.grayscale_600}]}>
                                내용
                              </Text>
                              <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_400}]}>
                                {descLen}/{DESC_MAX}
                              </Text>
                            </View>
                            <TextInput
                              value={s.eventDescription}
                              onChangeText={(t) => setField(idx, 'eventDescription', t.slice(0, DESC_MAX))}
                              placeholder="예) 본격적인 포틀럭과 불멍 타임입니다."
                              placeholderTextColor={COLORS.grayscale_400}
                              style={[FONTS.fs_14_regular, styles.textArea]}
                              multiline
                              maxLength={DESC_MAX}
                              textAlignVertical="top"
                            />
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>
                ) : (
                  // 미리보기 (블로그 스타일): 이미지 → 제목 → 내용
                  <ScrollView
                    style={styles.previewBody}
                    contentContainerStyle={{
                      paddingBottom: keyboardHeight + 96,
                    }}>
                    <View>
                      {sections.map((s, idx) => (
                        <View key={`pv-${idx}`} style={styles.previewCard}>
                          <Text style={[FONTS.fs_12_medium, {color: COLORS.grayscale_500, marginBottom: 8}]}>
                            단락 {idx + 1}
                          </Text>
                          {s.imageUrl ? (
                            <Image source={{uri: s.imageUrl}} style={styles.previewImage} />
                          ) : (
                            <View style={[styles.previewImage, {backgroundColor: COLORS.grayscale_100}]} />
                          )}
                          {!!s.eventName && (
                            <Text style={[FONTS.fs_16_semibold, {color: COLORS.grayscale_900, marginTop: 12}]}>
                              {s.eventName}
                            </Text>
                          )}
                          {!!s.eventDescription && (
                            <Text style={[FONTS.fs_14_regular, {color: COLORS.grayscale_700, marginTop: 8, lineHeight: 22}]}>
                              {s.eventDescription}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  </ScrollView>
                )}
                <View
                  style={[
                    styles.footer,
                    {bottom: keyboardHeight > 0 ? keyboardHeight + 12 : 24},
                  ]}>
                  <PillSubmitButton disabled={!allValid} onPress={handleConfirm} />
                </View>
              </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default MeetEventModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: MODAL_HEIGHT,
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  // 헤더
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 999,
    backgroundColor: COLORS.grayscale_100,
  },
  XBtn: { position: 'absolute', right: 0 },

  // 편집 본문
  body: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionCard: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  imageInputBox: {
    height: 160,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
    overflow: 'hidden',
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  imagePreview: { width: '100%', height: '100%' },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  textInput: {
    marginTop: 6,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    color: COLORS.grayscale_900,
  },
  textArea: {
    marginTop: 6,
    padding: 12,
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    color: COLORS.grayscale_900,
  },

  // 미리보기
  previewBody: { flex: 1 },
  previewCard: {
    marginTop: 12,
    paddingBottom: 12,
  },
  previewImage: { width: '100%', height: 200 },

  // 작은 버튼들
  circleBtn: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleBtnSmall: {
    padding: 6,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
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
  submitText: {
    color: COLORS.grayscale_0,
  },
});
