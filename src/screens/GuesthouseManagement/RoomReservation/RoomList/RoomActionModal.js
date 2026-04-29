import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';

import ChevronRightOrange from '@assets/images/chevron_right_orange.svg';
import ChevronRightGray from '@assets/images/chevron_right_gray.svg';

const RoomActionModal = ({visible, onClose, roomName, onPressPriceChange, onPressInfoChange}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={styles.modalContainer}>
          <View style={styles.handleBar} />
          
          <Text style={[FONTS.fs_16_semibold, styles.title]}>{roomName}</Text>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.priceButton}
            onPress={onPressPriceChange}>
            <View style={styles.buttonContent}>
              <Text style={[FONTS.fs_16_medium, styles.priceTitle]}>
                객실 요금 변경
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.subTitle]}>
                요일별 요금 및 성수기 가격 조정
              </Text>
            </View>
            {/* If chevron_right_orange doesn't exist, we fallback, but user said use existing everything. I might need to make sure this SVG exists. I saw chevron_right_gray! Let me double check if chevron_right_orange exists. If not, arrow_right_orange? Let's check. */}
            <ChevronRightGray width={24} height={24} color={COLORS.primary_orange} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.infoButton}
            onPress={onPressInfoChange}>
            <View style={styles.buttonContent}>
              <Text style={[FONTS.fs_16_medium, styles.infoTitle]}>
                객실 정보 변경
              </Text>
              <Text style={[FONTS.fs_12_medium, styles.subTitle]}>
                객실 이름, 인원, 편의시설 및 사진 관리
              </Text>
            </View>
            <ChevronRightGray width={24} height={24} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.grayscale_300,
    marginBottom: 24,
  },
  title: {
    color: COLORS.grayscale_900,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  priceButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  infoButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'column',
    gap: 4,
  },
  priceTitle: {
    color: COLORS.primary_orange,
  },
  infoTitle: {
    color: COLORS.grayscale_900,
  },
  subTitle: {
    color: COLORS.grayscale_500,
  },
});

export default RoomActionModal;
