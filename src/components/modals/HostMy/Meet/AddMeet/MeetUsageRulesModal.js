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
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import XBtn from '@assets/images/x_gray.svg';
import PlusIcon from '@assets/images/plus_gray.svg';
import MinusIcon from '@assets/images/minus_gray.svg';
import PreviewIcon from '@assets/images/show_password.svg';
import BackIcon from '@assets/images/chevron_left_gray.svg';
import CheckWhite from '@assets/images/check_white.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const TITLE_MAX = 100;
const DESC_MAX = 5000;
const MAX_SECTIONS = 10;

const PillSubmitButton = ({disabled, onPress}) => (
  <TouchableOpacity
    style={[styles.submitButton, disabled && styles.submitButtonDisabled]}
    disabled={disabled}
    onPress={onPress}>
    <Text style={[FONTS.fs_14_medium, styles.submitText]}>적용하기</Text>
    <CheckWhite width={20} height={20} />
  </TouchableOpacity>
);

const normalizeInitialRules = (arr = []) =>
  (Array.isArray(arr) ? arr : []).map(r => ({
    title: typeof r?.title === 'string' ? r.title : '',
    content: typeof r?.content === 'string' ? r.content : '',
  }));

const denormalizeForPayload = (sections = []) =>
  sections.map(s => ({
    title: (s.title || '').trim(),
    content: (s.content || '').trim(),
  }));

const MeetUsageRulesModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialRules = [],
}) => {
  const {keyboardHeight} = useKeyboardAwareScrollView({iosOnly: false});
  const isKeyboardVisible = keyboardHeight > 0;
  const [preview, setPreview] = useState(false);

  const [sections, setSections] = useState([]);
  // 마지막 적용값
  const [applied, setApplied] = useState(null);

  // 열릴 때 복원 로직
  useEffect(() => {
    if (!visible) return;

    setPreview(false);

    if (applied !== null) {
      setSections(applied);
      return;
    }
    const normalized = normalizeInitialRules(initialRules);
    const next = normalized.length ? normalized : [{title: '', content: ''}];

    setSections(prev => {
      const sameLen = prev.length === next.length;
      const same =
        sameLen &&
        prev.every(
          (p, i) => p.title === next[i].title && p.content === next[i].content,
        );
      return same ? prev : next;
    });
  }, [visible, initialRules, applied]);

  const resetToInitial = () => {
    const normalized = normalizeInitialRules(initialRules);
    setSections(normalized.length ? normalized : [{title: '', content: ''}]);
    setPreview(false);
  };

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      if (applied !== null) setSections(applied);
      else resetToInitial();
      setPreview(false);
    }
    onClose?.();
  };

  // 섹션 조작
  const addSection = () => {
    if (sections.length >= MAX_SECTIONS) return;
    setSections(prev => [...prev, {title: '', content: ''}]);
  };

  const removeSection = idx => {
    setSections(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.length ? next : [{title: '', content: ''}];
    });
  };

  const setField = (idx, key, value) => {
    setSections(prev =>
      prev.map((s, i) => (i === idx ? {...s, [key]: value} : s)),
    );
  };

  const allValid = sections.every(s => {
    const t = (s.title || '').trim();
    const c = (s.content || '').trim();
    if (!t && !c) return true;      // 둘 다 비면 괜찮음
    return !!t && !!c;              // 하나만 있으면 안됨
  });

  const buildPayloadRules = (sections = []) =>
  denormalizeForPayload(sections)
    .filter(r => r.title.length > 0 || r.content.length > 0) // 완전 빈 단락 제거
    .filter(r => r.title.length > 0 && r.content.length > 0); 

  // 유효성 검사
  const handleConfirm = () => {
    const payloadRules = buildPayloadRules(sections);

    setApplied(sections);
    onSelect?.({
      rules: payloadRules.length ? payloadRules : undefined,
    });

    onClose?.();
  };

  const HeaderBar = () => (
    <View style={styles.header}>
      <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
        이용 규칙
      </Text>
      <View style={styles.headerRight}>
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
                      <Text style={[FONTS.fs_14_regular, styles.topDescription]}>
                        소등안내 등 이용 규칙에 대해 자유롭게 작성해 주세요
                      </Text>
                      <View style={styles.topRowActions}>
                        <Text style={[FONTS.fs_12_medium, styles.sectionCount]}>
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
                        const titleLen = (s.title || '').length;
                        const descLen = (s.content || '').length;
                        return (
                          <View key={`sec-${idx}`} style={styles.sectionCard}>
                            {/* 섹션 헤더 */}
                            <View style={styles.sectionHeader}>
                              <Text style={[FONTS.fs_16_medium, styles.sectionLabel]}>
                                단락 {order}
                              </Text>
                              <TouchableOpacity onPress={() => removeSection(idx)} style={styles.circleBtnSmall}>
                                <MinusIcon width={18} height={18} />
                              </TouchableOpacity>
                            </View>

                            {/* 제목 */}
                            <View style={styles.rowBetween}>
                              <Text style={[FONTS.fs_14_medium, styles.fieldLabel]}>
                                제목
                              </Text>
                              <Text style={[FONTS.fs_12_medium, styles.fieldCount]}>
                                {titleLen}/{TITLE_MAX}
                              </Text>
                            </View>
                            <TextInput
                              value={s.title}
                              onChangeText={(t) => setField(idx, 'title', t.slice(0, TITLE_MAX))}
                              placeholder="예) 퇴장 시간 엄수"
                              placeholderTextColor={COLORS.grayscale_400}
                              style={[FONTS.fs_14_regular, styles.textInput]}
                              maxLength={TITLE_MAX}
                              returnKeyType="done"
                            />

                            {/* 내용 */}
                            <View style={[styles.rowBetween, {marginTop: 12}]}>
                              <Text style={[FONTS.fs_14_medium, styles.fieldLabel]}>
                                내용
                              </Text>
                              <Text style={[FONTS.fs_12_medium, styles.fieldCount]}>
                                {descLen}/{DESC_MAX}
                              </Text>
                            </View>
                            <TextInput
                              value={s.content}
                              onChangeText={(t) => setField(idx, 'content', t.slice(0, DESC_MAX))}
                              placeholder="예) 공용 공간은 밤 11시 30분에 정리됩니다..."
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
                  // 미리보기
                  <ScrollView
                    style={styles.previewBody}
                    contentContainerStyle={{
                      paddingBottom: keyboardHeight + 96,
                    }}>
                    <View>
                      {sections.map((s, idx) => (
                        <View key={`pv-${idx}`} style={styles.previewCard}>
                          <Text style={[FONTS.fs_12_medium, styles.previewLabel]}>
                            규칙 {idx + 1}
                          </Text>

                          {!!(s.title || '').trim() && (
                            <Text style={[FONTS.fs_16_semibold, styles.previewTitle]}>
                              {(s.title || '').trim()}
                            </Text>
                          )}

                          {!!(s.content || '').trim() && (
                            <Text
                              style={[
                                FONTS.fs_14_regular,
                                styles.previewContent,
                              ]}>
                              {(s.content || '').trim()}
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

export default MeetUsageRulesModal;

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
  modalTitle: {
    color: COLORS.grayscale_900,
  },
  headerRight: {
    position: 'absolute',
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 2,
  },

  body: {flex: 1, paddingTop: 10},
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 12,
  },
  topDescription: {
    flex: 1,
    color: COLORS.grayscale_800,
  },
  topRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionCount: {
    color: COLORS.grayscale_400,
    marginRight: 8,
  },

  sectionCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionLabel: {
    color: COLORS.grayscale_900,
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  textInput: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    color: COLORS.grayscale_900,
  },
  textArea: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 140,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
    color: COLORS.grayscale_900,
  },

  previewBody: {flex: 1},
  previewCard: {
    marginTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  previewLabel: {
    color: COLORS.grayscale_500,
    marginBottom: 8,
  },
  previewTitle: {
    color: COLORS.grayscale_900,
  },
  previewContent: {
    color: COLORS.grayscale_700,
    marginTop: 8,
    lineHeight: 22,
  },
  fieldLabel: {
    color: COLORS.grayscale_600,
  },
  fieldCount: {
    color: COLORS.grayscale_400,
  },

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
