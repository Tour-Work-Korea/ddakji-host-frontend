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
import AlertModal from '@components/modals/AlertModal';
import useKeyboardAwareScrollView from '@hooks/useKeyboardAwareScrollView';

import CheckWhite from '@assets/images/check_white.svg';
import PlusIcon from '@assets/images/plus_orange.svg';
import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const MAX_ANNOUNCEMENTS = 5;
const ANNOUNCEMENT_MAX = 60;

const normalize = (items = []) => {
  const list = Array.isArray(items)
    ? items
        .map(item => ({
          announcement:
            typeof item?.announcement === 'string'
              ? item.announcement
              : typeof item === 'string'
                ? item
                : '',
        }))
        .filter(item => item.announcement.trim() !== '')
    : [];

  return list.length > 0 ? list : [{announcement: ''}];
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

const PartyAnnouncementsModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialPartyAnnouncements = [],
}) => {
  const {keyboardHeight} = useKeyboardAwareScrollView({iosOnly: false});
  const isKeyboardVisible = keyboardHeight > 0;
  const [items, setItems] = useState(normalize(initialPartyAnnouncements));
  const [appliedData, setAppliedData] = useState(null);
  const [isLimitAlertVisible, setIsLimitAlertVisible] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setItems(appliedData || normalize(initialPartyAnnouncements));
  }, [visible, appliedData, initialPartyAnnouncements]);

  const isDisabled = useMemo(
    () => !items.some(item => (item.announcement ?? '').trim().length > 0),
    [items],
  );
  const showLimitGuide = useMemo(
    () => items.some(item => (item.announcement ?? '').length >= ANNOUNCEMENT_MAX),
    [items],
  );

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      setItems(appliedData || normalize(initialPartyAnnouncements));
    }
    onClose?.();
  };

  const handleAdd = () => {
    if (items.length >= MAX_ANNOUNCEMENTS) {
      setIsLimitAlertVisible(true);
      return;
    }
    setItems(prev => [...prev, {announcement: ''}]);
  };

  const handleDelete = index => {
    setItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirm = () => {
    if (isDisabled) return;
    const payload = items
      .map(item => ({announcement: (item.announcement ?? '').trim()}))
      .filter(item => item.announcement !== '');

    setAppliedData(payload);
    onSelect?.({partyAnnouncements: payload});
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
                필수 안내사항
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
              <Text style={[FONTS.fs_14_regular, styles.topGuide]}>
                참여자는 안내사항을 확인하고 동의해야만 신청할 수 있습니다
              </Text>

              <Text style={[FONTS.fs_16_medium, styles.label]}>필수 안내사항</Text>
              {showLimitGuide ? (
                <Text style={[FONTS.fs_12_regular, styles.limitGuide]}>
                  각 안내사항은 60자까지 입력할 수 있습니다
                </Text>
              ) : null}

              {items.map((item, index) => (
                <View key={`announcement-${index}`} style={styles.itemRow}>
                  <View style={styles.numberBadge}>
                    <Text style={[FONTS.fs_16_semibold, styles.numberBadgeText]}>{index + 1}</Text>
                  </View>
                  <TextInput
                    value={item.announcement}
                    onChangeText={text =>
                      setItems(prev =>
                        prev.map((current, idx) =>
                          idx === index
                            ? {
                                ...current,
                                announcement: text.slice(0, ANNOUNCEMENT_MAX),
                              }
                            : current,
                        ),
                      )
                    }
                    placeholder="예) 본 파티는 숙박객만 참가가능합니다."
                    placeholderTextColor={COLORS.grayscale_400}
                    style={[FONTS.fs_14_regular, styles.announcementInput]}
                    maxLength={ANNOUNCEMENT_MAX}
                  />
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(index)}>
                    <XBtn width={16} height={16} />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addRow} onPress={handleAdd}>
                <View style={styles.plusBtn}>
                  <PlusIcon width={14} height={14} />
                </View>
                <Text style={[FONTS.fs_14_medium, styles.addRowText]}>안내사항 추가</Text>
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

      <AlertModal
        visible={isLimitAlertVisible}
        message="안내사항은 최대 5개까지 등록 가능합니다"
        buttonText="확인"
        onPress={() => setIsLimitAlertVisible(false)}
      />
    </Modal>
  );
};

export default PartyAnnouncementsModal;

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
  topGuide: {
    color: COLORS.grayscale_800,
    marginBottom: 16,
  },
  label: {
    color: COLORS.grayscale_900,
    marginBottom: 4,
  },
  limitGuide: {
    color: COLORS.primary_orange,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    color: COLORS.grayscale_900,
  },
  announcementInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 20,
    color: COLORS.grayscale_900,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addRow: {
    alignSelf: 'flex-end',
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plusBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 100,
    borderColor: COLORS.primary_orange,
  },
  addRowText: {
    color: COLORS.grayscale_900,
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
