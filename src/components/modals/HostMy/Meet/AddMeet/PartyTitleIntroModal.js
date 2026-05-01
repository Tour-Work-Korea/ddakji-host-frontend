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
  Image,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {uploadMultiImage} from '@utils/imageUploadHandler';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import AddImage from '@assets/images/add_image_gray.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckIcon from '@assets/images/star_filled.svg';
import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const MAX_IMAGES = 10;
const TITLE_MAX = 50;
const TAG_MAX = 200;

const stripDuplicatesByUrl = (arr = []) => {
  const seen = new Set();
  return arr.filter(item => {
    if (!item?.imageUrl) return false;
    if (seen.has(item.imageUrl)) return false;
    seen.add(item.imageUrl);
    return true;
  });
};

const enforceSingleThumbnail = (arr = []) => {
  let seen = false;
  return arr.map(item => {
    if (item?.isThumbnail && !seen) {
      seen = true;
      return {...item, isThumbnail: true};
    }
    return {...item, isThumbnail: false};
  });
};

const normalize = ({partyTitle = '', tags = '', partyImages = []} = {}) => ({
  partyTitle: typeof partyTitle === 'string' ? partyTitle : '',
  tags: typeof tags === 'string' ? tags : '',
  partyImages: Array.isArray(partyImages)
    ? enforceSingleThumbnail(stripDuplicatesByUrl(partyImages))
    : [],
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

const PartyTitleIntroModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialPartyTitle = '',
  initialTags = '',
  initialPartyImages = [],
}) => {
  const {keyboardHeight} = useKeyboardAwareScrollView({iosOnly: false});
  const isKeyboardVisible = keyboardHeight > 0;
  const [form, setForm] = useState(
    normalize({
      partyTitle: initialPartyTitle,
      tags: initialTags,
      partyImages: initialPartyImages,
    }),
  );
  const [appliedData, setAppliedData] = useState(null);

  useEffect(() => {
    if (!visible) return;

    setForm(
      appliedData ||
        normalize({
          partyTitle: initialPartyTitle,
          tags: initialTags,
          partyImages: initialPartyImages,
        }),
    );
  }, [visible, appliedData, initialPartyTitle, initialTags, initialPartyImages]);

  const isDisabled = useMemo(() => {
    const hasTitle = form.partyTitle.trim().length > 0;
    const hasTags = form.tags.trim().length > 0;
    const hasThumbnail =
      form.partyImages.length > 0 &&
      form.partyImages.some(item => item?.isThumbnail === true);

    return !(hasTitle && hasTags && hasThumbnail);
  }, [form]);

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      setForm(
        appliedData ||
          normalize({
            partyTitle: initialPartyTitle,
            tags: initialTags,
            partyImages: initialPartyImages,
          }),
      );
    }
    onClose?.();
  };

  const handleAddImage = async () => {
    if (form.partyImages.length >= MAX_IMAGES) return;

    const remain = Math.max(0, MAX_IMAGES - form.partyImages.length);
    const uploadedUrls = await uploadMultiImage(remain);
    if (!uploadedUrls?.length) return;

    const appended = [
      ...form.partyImages,
      ...uploadedUrls.map(url => ({imageUrl: url, isThumbnail: false})),
    ];
    const normalized = enforceSingleThumbnail(stripDuplicatesByUrl(appended));

    setForm(prev => ({
      ...prev,
      partyImages:
        normalized.length > 0 && !normalized.some(item => item.isThumbnail)
          ? normalized.map((item, index) => ({...item, isThumbnail: index === 0}))
          : normalized,
    }));
  };

  const handleDeleteImage = index => {
    const next = form.partyImages.filter((_, idx) => idx !== index);
    setForm(prev => ({
      ...prev,
      partyImages: next.map((item, idx) => ({
        ...item,
        isThumbnail: idx === 0,
      })),
    }));
  };

  const handleSelectThumbnail = index => {
    setForm(prev => ({
      ...prev,
      partyImages: prev.partyImages.map((item, idx) => ({
        ...item,
        isThumbnail: idx === index,
      })),
    }));
  };

  const handleConfirm = () => {
    if (isDisabled) return;

    const payload = {
      partyTitle: form.partyTitle.trim(),
      tags: form.tags.trim(),
      partyImages: form.partyImages,
    };

    setAppliedData(payload);
    onSelect?.(payload);
    onClose?.();
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
              <Text style={[FONTS.fs_20_semibold, styles.modalTitle]}>
                파티 제목 및 소개
              </Text>
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
              <Text style={[FONTS.fs_16_medium, styles.label, {marginBottom: 8}]}>파티 제목</Text>
              <TextInput
                value={form.partyTitle}
                onChangeText={text =>
                  setForm(prev => ({...prev, partyTitle: text.slice(0, TITLE_MAX)}))
                }
                placeholder="파티 제목을 입력해주세요."
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_14_regular, styles.roundInput]}
                maxLength={TITLE_MAX}
              />

              <View style={[styles.sectionTopRow, {marginBottom: 4}]}>
                <Text style={[FONTS.fs_16_medium, styles.label]}>배너 사진을 추가해주세요</Text>
                <Text style={[FONTS.fs_12_light, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.partyImages.length}</Text>/{MAX_IMAGES}
                </Text>
              </View>
              <Text style={[FONTS.fs_12_medium, styles.subText]}>
                대표로 보여줄 사진을 선택해주세요{'\n'}(선택된 사진에는 별이 표시됩니다)
              </Text>
              <View style={styles.imageGrid}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <TouchableOpacity
                    style={styles.addImageBox}
                    onPress={handleAddImage}
                    disabled={form.partyImages.length >= MAX_IMAGES}>
                    <AddImage width={30} height={30} />
                  </TouchableOpacity>

                  {form.partyImages.map((item, index) => (
                    <View key={`${item.imageUrl}-${index}`} style={{position: 'relative'}}>
                      <TouchableOpacity onPress={() => handleSelectThumbnail(index)}>
                        <Image source={{uri: item.imageUrl}} style={styles.uploadedImage} />
                        {item.isThumbnail && (
                          <View style={styles.checkIconContainer}>
                            <CheckIcon width={14} height={14} />
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDeleteImage(index)}>
                        <XBtn width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              </View>

              <View style={[styles.sectionTopRow, {marginTop: 18}]}>
                <Text style={[FONTS.fs_16_medium, styles.label]}># 태그</Text>
                <Text style={[FONTS.fs_12_light, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.tags.length}</Text>/{TAG_MAX}
                </Text>
              </View>
              <TextInput
                value={form.tags}
                onChangeText={text => setForm(prev => ({...prev, tags: text.slice(0, TAG_MAX)}))}
                placeholder="#방탈출 #포트럭 #불멍 #소규모 #따뜻한"
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_14_regular, styles.roundInput]}
                maxLength={TAG_MAX}
              />
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

export default PartyTitleIntroModal;

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
  },
  roundInput: {
    borderWidth: 1,
    padding: 12,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    color: COLORS.grayscale_900,
  },
  sectionTopRow: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  counterText: {
    color: COLORS.grayscale_400,
  },
  counterAccent: {
    color: COLORS.primary_orange,
  },
  subText: {
    color: COLORS.grayscale_400,
    marginBottom: 8,
  },
  imageGrid: {
    marginTop: 8,
  },
  addImageBox: {
    width: 100,
    height: 100,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  uploadedImage: {
    width: 100,
    height: 100,
    borderRadius: 4,
    marginRight: 8,
  },
  checkIconContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
    height: 18,
    width: 18,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    position: 'absolute',
    top: 4,
    right: 12,
    height: 18,
    width: 18,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 9,
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
  submitButtonText: {
    color: COLORS.grayscale_0,
  },
});
