import React, {useEffect, useState} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {FONTS} from '@constants/fonts';
import {COLORS} from '@constants/colors';
import ButtonScarlet from '@components/ButtonScarlet';
import CloseIcon from '@assets/images/x_gray.svg';

const PrevRecruitModal = ({visible, items = [], onClose, onPick}) => {
  const [selectedId, setSelectedId] = useState();

  useEffect(() => {
    if (!visible) setSelectedId(undefined); // 닫힐 때 선택 초기화
  }, [visible]);

  const handleSelectItem = id => {
    setSelectedId(prev => (prev === id ? undefined : id));
  };

  const handleSubmit = () => {
    if (selectedId == null) return;
    // 1. 외부 콜백 호출
    onPick?.(selectedId);
    // 2. 닫기
    onClose?.();
  };

  const renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => handleSelectItem(item.recruitId)}
      style={[
        styles.itemBox,
        selectedId === item.recruitId && styles.selectedBox,
      ]}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text style={styles.primaryText}>{item.guesthouseName}</Text>
        {!!item.deadline && (
          <Text style={styles.secondaryText}>{item.deadline}</Text>
        )}
      </View>
      <View>
        <Text style={styles.titleText}>{item.recruitTitle}</Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        {!!item.address && (
          <Text style={styles.secondaryText}>{item.address}</Text>
        )}
        {!!item.workDuration && (
          <Text style={styles.secondaryText}>{item.workDuration}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.closeButtonPlaceholder} />
            <Text style={[FONTS.fs_16_semibold, styles.title]}>
              불러올 공고를 선택해주세요
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <CloseIcon width={20} height={20} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.recruitId.toString()}
            showsVerticalScrollIndicator={false}
            style={{alignSelf: 'stretch', maxHeight: 380}} // 스크롤 영역 제어
            ListEmptyComponent={
              <Text
                style={[
                  styles.secondaryText,
                  {textAlign: 'center', marginVertical: 24},
                ]}>
                불러올 수 있는 공고가 없습니다.
              </Text>
            }
          />
          <View style={{marginTop: 18, width: 135}}>
            <ButtonScarlet
              title="불러오기"
              onPress={handleSubmit}
              disabled={selectedId == null}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  itemBox: {
    borderBottomWidth: 1,
    borderColor: COLORS.grayscale_200,
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: COLORS.grayscale_0,
    gap: 4,
    borderRadius: 8,
  },
  selectedBox: {
    borderWidth: 1,
    borderColor: COLORS.primary_orange,
    borderRadius: 8,
  },
  primaryText: {color: COLORS.grayscale_600, ...FONTS.fs_12_medium},
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    color: COLORS.grayscale_900,
    textAlign: 'center',
  },
  closeButtonPlaceholder: {
    width: 28,
    height: 28,
  },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {color: COLORS.grayscale_500, ...FONTS.fs_12_medium},
  titleText: {color: COLORS.grayscale_800, ...FONTS.fs_14_medium},
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: COLORS.grayscale_0,
    borderRadius: 16,
    padding: 20,
    width: '86%',
    alignItems: 'center',
  },
});

export default PrevRecruitModal;
