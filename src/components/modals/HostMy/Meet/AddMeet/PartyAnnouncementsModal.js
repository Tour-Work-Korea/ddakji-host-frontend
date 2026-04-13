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
import PlusIcon from '@assets/images/plus_orange.svg';
import XBtn from '@assets/images/x_gray.svg';

const MODAL_HEIGHT = Math.round(Dimensions.get('window').height * 0.9);
const MAX_ANNOUNCEMENTS = 5;

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
    <Text style={[FONTS.fs_16_semibold, styles.submitButtonText]}>적용하기</Text>
    <CheckWhite width={22} height={22} />
  </TouchableOpacity>
);

const PartyAnnouncementsModal = ({
  visible,
  onClose,
  onSelect,
  shouldResetOnClose,
  initialPartyAnnouncements = [],
}) => {
  const [items, setItems] = useState(normalize(initialPartyAnnouncements));
  const [appliedData, setAppliedData] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setItems(appliedData || normalize(initialPartyAnnouncements));
  }, [visible, appliedData, initialPartyAnnouncements]);

  const isDisabled = useMemo(
    () => !items.some(item => (item.announcement ?? '').trim().length > 0),
    [items],
  );

  const handleModalClose = () => {
    if (shouldResetOnClose) {
      setItems(appliedData || normalize(initialPartyAnnouncements));
    }
    onClose?.();
  };

  const handleAdd = () => {
    if (items.length >= MAX_ANNOUNCEMENTS) return;
    setItems(prev => [...prev, {announcement: ''}]);
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
              <Text style={[FONTS.fs_16_medium, styles.topGuide]}>
                참여자는 안내사항을 확인하고 동의해야만 신청할 수 있습니다
              </Text>

              <Text style={[FONTS.fs_24_semibold, styles.label]}>필수 안내사항</Text>

              {items.map((item, index) => (
                <View key={`announcement-${index}`} style={styles.itemRow}>
                  <View style={styles.numberBadge}>
                    <Text style={[FONTS.fs_14_semibold, styles.numberBadgeText]}>{index + 1}</Text>
                  </View>
                  <TextInput
                    value={item.announcement}
                    onChangeText={text =>
                      setItems(prev =>
                        prev.map((current, idx) =>
                          idx === index
                            ? {...current, announcement: text.slice(0, 120)}
                            : current,
                        ),
                      )
                    }
                    placeholder="예) 본 파티는 숙박객만 참가가능합니다."
                    placeholderTextColor={COLORS.grayscale_400}
                    style={[FONTS.fs_16_medium, styles.announcementInput]}
                  />
                </View>
              ))}

              {items.length < MAX_ANNOUNCEMENTS ? (
                <TouchableOpacity style={styles.addRow} onPress={handleAdd}>
                  <PlusIcon width={18} height={18} />
                  <Text style={[FONTS.fs_16_medium, styles.addRowText]}>안내사항 추가</Text>
                </TouchableOpacity>
              ) : null}
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
    paddingHorizontal: 16,
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
    paddingTop: 8,
  },
  topGuide: {
    color: COLORS.grayscale_800,
    marginBottom: 16,
  },
  label: {
    color: COLORS.grayscale_900,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  numberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.grayscale_200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    color: COLORS.grayscale_800,
  },
  announcementInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 22,
    paddingHorizontal: 16,
    color: COLORS.grayscale_900,
  },
  addRow: {
    marginTop: 4,
    marginLeft: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addRowText: {
    color: COLORS.grayscale_900,
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
