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
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';

import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import {uploadMultiImage} from '@utils/imageUploadHandler';

import AddImage from '@assets/images/add_image_gray.svg';
import CheckWhite from '@assets/images/check_white.svg';
import CheckOrange from '@assets/images/check_orange.svg';
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
    <Text style={[FONTS.fs_16_semibold, styles.submitButtonText]}>적용하기</Text>
    <CheckWhite width={22} height={22} />
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
              <Text style={[FONTS.fs_24_semibold, styles.label]}>파티 제목</Text>
              <TextInput
                value={form.partyTitle}
                onChangeText={text =>
                  setForm(prev => ({...prev, partyTitle: text.slice(0, TITLE_MAX)}))
                }
                placeholder="파티 제목을 입력해주세요."
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_16_medium, styles.roundInput]}
                maxLength={TITLE_MAX}
              />

              <View style={styles.sectionTopRow}>
                <Text style={[FONTS.fs_24_semibold, styles.label]}>배너 사진을 추가해주세요</Text>
                <Text style={[FONTS.fs_16_medium, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.partyImages.length}</Text>/{MAX_IMAGES}
                </Text>
              </View>
              <View style={styles.imageGrid}>
                {form.partyImages.map((item, index) => (
                  <View key={`${item.imageUrl}-${index}`} style={styles.imageCard}>
                    <Image source={{uri: item.imageUrl}} style={styles.image} />
                    <View style={styles.imageActionRow}>
                      <TouchableOpacity
                        style={styles.imageActionButton}
                        onPress={() => handleSelectThumbnail(index)}>
                        <CheckOrange width={16} height={16} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.imageActionButton}
                        onPress={() => handleDeleteImage(index)}>
                        <XBtn width={14} height={14} />
                      </TouchableOpacity>
                    </View>
                    {item.isThumbnail ? (
                      <View style={styles.thumbnailBadge}>
                        <Text style={[FONTS.fs_12_medium, styles.thumbnailBadgeText]}>대표</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
                {form.partyImages.length < MAX_IMAGES ? (
                  <TouchableOpacity style={styles.addCard} onPress={handleAddImage}>
                    <AddImage width={38} height={38} />
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={[styles.sectionTopRow, {marginTop: 18}]}>
                <Text style={[FONTS.fs_24_semibold, styles.label]}># 태그</Text>
                <Text style={[FONTS.fs_16_medium, styles.counterText]}>
                  <Text style={styles.counterAccent}>{form.tags.length}</Text>/{TAG_MAX}
                </Text>
              </View>
              <TextInput
                value={form.tags}
                onChangeText={text => setForm(prev => ({...prev, tags: text.slice(0, TAG_MAX)}))}
                placeholder="#방탈출 #포트럭 #불멍 #소규모 #따뜻한"
                placeholderTextColor={COLORS.grayscale_400}
                style={[FONTS.fs_16_medium, styles.roundInput]}
                maxLength={TAG_MAX}
              />
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
    marginBottom: 12,
  },
  roundInput: {
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 28,
    paddingHorizontal: 18,
    color: COLORS.grayscale_900,
  },
  sectionTopRow: {
    marginTop: 18,
    marginBottom: 12,
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
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  addCard: {
    width: 112,
    height: 112,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageCard: {
    width: 112,
    height: 112,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.grayscale_100,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageActionRow: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 6,
  },
  imageActionButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.primary_orange,
  },
  thumbnailBadgeText: {
    color: COLORS.grayscale_0,
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
