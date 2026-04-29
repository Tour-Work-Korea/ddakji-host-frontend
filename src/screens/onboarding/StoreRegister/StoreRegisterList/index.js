import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  Alert,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import Avatar from '@components/Avatar';
import Header from '@components/Header';
import AlertModal from '@components/modals/AlertModal';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import hostMyApi from '@utils/api/hostMyApi';
import EmptyState from '@components/EmptyState';
import useUserStore from '@stores/userStore';
import { normalizeHostProfile } from '@utils/hostProfile';

import styles from './StoreRegisterList.styles';
import { FONTS } from '@constants/fonts';
import EmptyIcon from '@assets/images/wa_blue_apply.svg';
import PlusIcon from '@assets/images/plus_orange.svg';
import MoreIcon from '@assets/images/more_v_gray.svg';

const StoreRegisterList = () => {
  const navigation = useNavigation();
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const [storeRegisters, setStoreRegisters] = useState([]);
  const [actionMenu, setActionMenu] = useState({
    visible: false,
    item: null,
    top: 0,
    left: 0,
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  useFocusEffect(
    useCallback(() => {
      tryFetchStoreRegister();
    }, []),
  );

  const tryFetchStoreRegister = async () => {
    try {
      const response = await hostGuesthouseApi.getHostApplications();
      setStoreRegisters(response.data);
    } catch (error) {
      console.warn('입점신청서 조회 실패: ', error);
      Alert.alert('입점 신청서 조회에 실패했습니다.');
    }
  };

  const syncHostProfile = async () => {
    const response = await hostMyApi.getMyProfile();
    const normalizedProfile = normalizeHostProfile(response?.data);

    setHostProfile(normalizedProfile);
  };

  const closeStoreActions = () => {
    setActionMenu(prev => ({
      ...prev,
      visible: false,
    }));
  };

  const openStoreActions = (item, event) => {
    const { pageX, pageY } = event.nativeEvent;
    const menuWidth = 200;
    const screenWidth = Dimensions.get('window').width;
    const horizontalMargin = 8;
    const left = Math.min(
      Math.max(pageX - menuWidth + 24, horizontalMargin),
      screenWidth - menuWidth - horizontalMargin,
    );

    setActionMenu({
      visible: true,
      item,
      top: pageY,
      left,
    });
  };

  const handleDeleteStore = () => {
    const applicationId = actionMenu.item?.id;

    closeStoreActions();

    if (!applicationId) {
      Alert.alert('삭제할 신청서 정보가 없습니다.');
      return;
    }

    setDeleteModalVisible(true);
  };

  const handleEditStore = () => {
    const guesthouseId = actionMenu.item?.guesthouseId;

    closeStoreActions();

    if (!guesthouseId) {
      Alert.alert('수정할 게스트하우스 정보가 없습니다.');
      return;
    }

    navigation.navigate('StoreRegisterEditForm', {
      guesthouseId,
    });
  };

  const confirmDeleteStore = async () => {
    const applicationId = actionMenu.item?.id;

    if (!applicationId) {
      setDeleteModalVisible(false);
      Alert.alert('삭제할 신청서 정보가 없습니다.');
      return;
    }

    try {
      await hostGuesthouseApi.deleteHostApplication(applicationId);
      setDeleteModalVisible(false);
      await syncHostProfile();
      await tryFetchStoreRegister();
      Toast.show({
        type: 'success',
        text1: '삭제가 완료되었어요.',
        position: 'top',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.warn('입점신청서 삭제 실패: ', error);
      setDeleteModalVisible(false);
      Alert.alert('삭제 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.listItem,
        index !== storeRegisters.length - 1 && styles.listItemBorder,
      ]}
      activeOpacity={item.status === '승인 완료' ? 0.8 : 1}
      disabled={item.status !== '승인 완료'}
      onPress={() => { }}>
      <View style={styles.listItemLeft}>
        <Avatar
          uri={item.guesthouseProfileImageUrl || null}
          size={36}
          borderRadius={10}
          iconSize={18}
          style={styles.avatar}
        />
        <Text style={[FONTS.fs_18_medium, styles.businessName]} numberOfLines={1}>
          {item.guesthouseName || item.businessName}
        </Text>
      </View>

      {item.status === '승인 완료' ? (
        <View style={styles.listItemRight}>
          <View style={styles.roleBadge}>
            <Text style={[FONTS.fs_14_semibold, styles.roleBadgeText]}>운영자</Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            activeOpacity={0.8}
            onPress={event => {
              event.stopPropagation();
              openStoreActions(item, event);
            }}>
            <MoreIcon width={24} height={24} />
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={[FONTS.fs_14_semibold, styles.pendingText]}>
          등록 심사중
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header title="내 게스트하우스" />

      <View style={styles.body}>
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.registerLink}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('StoreRegisterForm1')}>
            <View style={styles.registerPlus}>
              <PlusIcon height={16} width={16} />
            </View>
            <Text style={[FONTS.fs_14_medium, styles.registerLinkText]}>
              게스트하우스 등록
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={storeRegisters}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={null}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EmptyState
                icon={EmptyIcon}
                iconSize={{ width: 188, height: 84 }}
                title="게스트하우스가 없어요"
                description="지금 내 게스트하우스 등록을 해보세요!"
              />
            </View>
          }
        />
      </View>

      <Modal
        transparent
        visible={actionMenu.visible}
        animationType="fade"
        onRequestClose={closeStoreActions}>
        <Pressable style={styles.menuOverlay} onPress={closeStoreActions}>
          <View
            style={[
              styles.actionMenu,
              {
                top: actionMenu.top,
                left: actionMenu.left,
              },
            ]}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionMenuButton}
              onPress={handleEditStore}>
              <Text style={[FONTS.fs_16_medium, styles.actionMenuText]}>
                정보수정
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionMenuButton}
              onPress={handleDeleteStore}>
              <Text style={[FONTS.fs_16_medium, styles.actionMenuText]}>
                게스트하우스 삭제
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <AlertModal
        visible={deleteModalVisible}
        title="삭제하시겠습니까?"
        message={'삭제하시면 복구되지 않으며, \n새롭게 게스트하우스 등록을 진행하셔야 합니다.'}
        buttonText="삭제"
        buttonText2="취소"
        onPress={confirmDeleteStore}
        onPress2={() => setDeleteModalVisible(false)}
      />
    </View>
  );
};

export default StoreRegisterList;
