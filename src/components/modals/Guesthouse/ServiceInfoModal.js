import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import useGuesthouseMetaStore from '@stores/guesthouseMetaStore';
import {groupAmenitiesBySection} from '@utils/guesthouseMeta';

import XBtn from '@assets/images/x_gray.svg';

const ServiceInfoModal = ({ visible, onClose, selectedAmenities = [] }) => {
  const guesthouseAmenities = useGuesthouseMetaStore(
    state => state.guesthouseAmenities,
  );
  const amenitySections = groupAmenitiesBySection(guesthouseAmenities);
  // 선택된 항목의 이름만 뽑아냄
  const selectedNames = selectedAmenities
    .map(a => {
      if (typeof a === 'string') return a;
      return a?.amenityType || a?.name || a?.amenityName;
    })
    .filter(Boolean);

  const renderSection = (title, items) => (
    <View key={title}>
      <Text style={[FONTS.fs_16_medium, styles.sectionTitle]}>{title}</Text>
      <View style={styles.tagWrapper}>
        {items.map((item) => {
          const isSelected = selectedNames.includes(item.name);
          return (
            <View key={item.id} style={styles.tag}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tagText,
                  isSelected && { color: COLORS.primary_orange },
                  isSelected && FONTS.fs_14_semibold,
                ]}>
                {item.name}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={[FONTS.fs_20_semibold, styles.title]}>
              편의시설 및 서비스
            </Text>
            <TouchableOpacity style={styles.XButton} onPress={onClose}>
              <XBtn width={24} height={24}/>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {amenitySections.map(section =>
              renderSection(section.title, section.items),
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: COLORS.modal_background,
  },
  modalContainer: {
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  // 헤더
  header: {
    paddingVertical: 20, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
  },
  XButton: {
    position: 'absolute',
    right: 0,
  },

  // 각 섹션
  sectionTitle: {
    marginTop: 20,
  },
  tagWrapper: {
    marginTop: 12,
    backgroundColor: COLORS.grayscale_100,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    alignContent: 'center',
  },
  tag: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    padding: 10,
    width: '48%',
  },
  tagText: {
    color: COLORS.grayscale_400,
  },
});

export default ServiceInfoModal;
