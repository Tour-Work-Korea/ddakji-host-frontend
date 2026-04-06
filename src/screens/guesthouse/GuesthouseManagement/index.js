import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Alert, Image, Text, TouchableOpacity, View} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import AlertModal from '@components/modals/AlertModal';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';
import MyGuesthouseReviewList from '@screens/guesthouse/MyGuesthouseReview/MyGuesthouseReviewList';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import LogoIcon from '@assets/images/logo_orange.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import MenuIcon from '@assets/images/menu_gray.svg';
import ChevronDownIcon from '@assets/images/chevron_down_gray.svg';
import ChevronUpIcon from '@assets/images/chevron_up_gray.svg';
import EditIcon from '@assets/images/edit_gray.svg';
import DeleteIcon from '@assets/images/delete_gray.svg';
import styles from './GuesthouseManagement.styles';

const tabs = ['게하 정보', '객실 예약', '파티 정보', '파티 예약'];

const GuesthouseManagement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const hostProfile = useUserStore(state => state.hostProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const selectedGuesthouseId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const setSelectedGuesthouseId = useUserStore(
    state => state.setSelectedHostGuesthouseId,
  );
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);
  const [guesthouseDetail, setGuesthouseDetail] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [activeChip, setActiveChip] = useState('guesthouse');
  const lastSyncedRouteGuesthouseIdRef = useRef(null);

  const routeGuesthouseId = route.params?.guesthouseId;
  const routeBusinessName = route.params?.businessName || '게스트하우스';

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(hostProfile?.guesthouseProfiles)
        ? hostProfile.guesthouseProfiles.map((item, index) => ({
            id: String(item?.guesthouseId ?? `guesthouse-${index}`),
            name: item?.guesthouseName || '이름 없음',
            photoUrl: item?.profileImageUrl || null,
            noticeCount: 0,
          }))
        : [],
    [hostProfile?.guesthouseProfiles],
  );

  useEffect(() => {
    if (!routeGuesthouseId) {
      return;
    }

    const nextRouteGuesthouseId = String(routeGuesthouseId);

    if (lastSyncedRouteGuesthouseIdRef.current === nextRouteGuesthouseId) {
      return;
    }

    lastSyncedRouteGuesthouseIdRef.current = nextRouteGuesthouseId;
    setSelectedGuesthouseId(nextRouteGuesthouseId);
    setActiveChip('guesthouse');
  }, [routeGuesthouseId, selectedGuesthouseId, setSelectedGuesthouseId]);

  useEffect(() => {
    if (!guesthouseProfiles.length) {
      return;
    }

    const hasSelected = guesthouseProfiles.some(
      profile => profile.id === String(selectedGuesthouseId),
    );

    if (!selectedGuesthouseId || !hasSelected) {
      setSelectedGuesthouseId(guesthouseProfiles[0].id);
    }
  }, [guesthouseProfiles, selectedGuesthouseId, setSelectedGuesthouseId]);

  const selectedGuesthouse = useMemo(
    () =>
      guesthouseProfiles.find(
        guesthouse => guesthouse.id === String(selectedGuesthouseId),
      ) || guesthouseProfiles[0] || null,
    [guesthouseProfiles, selectedGuesthouseId],
  );

  const effectiveGuesthouseId =
    selectedGuesthouse?.id ?? routeGuesthouseId ?? null;

  const fetchGuesthouseDetail = useCallback(async () => {
    if (!effectiveGuesthouseId) {
      setGuesthouseDetail(null);
      return;
    }

    try {
      const response = await hostGuesthouseApi.getGuesthouseDetail(
        effectiveGuesthouseId,
      );
      setGuesthouseDetail(response?.data ?? null);
    } catch (error) {
      setGuesthouseDetail(null);
    }
  }, [effectiveGuesthouseId]);

  useFocusEffect(
    useCallback(() => {
      fetchGuesthouseDetail();
    }, [fetchGuesthouseDetail]),
  );

  const businessName = selectedGuesthouse?.name || routeBusinessName;
  const thumbnailImage =
    guesthouseDetail?.guesthouseImages?.find(image => image?.isThumbnail)
      ?.guesthouseImageUrl ||
    guesthouseDetail?.guesthouseImages?.[0]?.guesthouseImageUrl ||
    selectedGuesthouse?.photoUrl ||
    null;
  const guesthouseAddress = [
    guesthouseDetail?.guesthouseAddress,
    guesthouseDetail?.guesthouseDetailAddress,
  ]
    .filter(Boolean)
    .join(' ');

  const mapDetailToEdit = detail => ({
    guesthouseName: detail?.guesthouseName || '',
    guesthouseAddress: detail?.guesthouseAddress || '',
    guesthouseDetailAddress: detail?.guesthouseDetailAddress || '',
    guesthousePhone: detail?.guesthousePhone || '',
    guesthouseShortIntro: detail?.guesthouseShortIntro || '',
    guesthouseLongDesc: detail?.guesthouseLongDesc || '',
    checkIn: detail?.checkIn || '15:00:00',
    checkOut: detail?.checkOut || '11:00:00',
    guesthouseImages: detail?.guesthouseImages || [],
    roomInfos: detail?.roomInfos || [],
    amenities: detail?.amenities || [],
    hashtagIds: (detail?.hashtags || []).map(tag => tag?.id).filter(Boolean),
    rules: detail?.rules || '',
  });

  const handleDelete = () => {
    if (!guesthouseDetail?.id) {
      return;
    }

    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!guesthouseDetail?.id) {
      setDeleteModalVisible(false);
      return;
    }

    try {
      await hostGuesthouseApi.deleteGuesthouse(guesthouseDetail.id);

      const nextProfiles = (hostProfile?.guesthouseProfiles || []).filter(
        item => String(item?.guesthouseId) !== String(guesthouseDetail.id),
      );

      setHostProfile({
        ...hostProfile,
        guesthouseProfiles: nextProfiles,
      });

      if (String(selectedGuesthouseId) === String(guesthouseDetail.id)) {
        setSelectedGuesthouseId(
          nextProfiles[0]?.guesthouseId
            ? String(nextProfiles[0].guesthouseId)
            : null,
        );
      }

      setGuesthouseDetail(null);
      setDeleteModalVisible(false);
    } catch (error) {
      setDeleteModalVisible(false);
      Alert.alert('삭제 실패', '잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MainTabs', {screen: '홈'})}>
          <LogoIcon width={60} height={28} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton} activeOpacity={0.8}>
            <BellIcon width={18} height={18} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', {screen: '마이'})}>
            <MenuIcon width={18} height={18} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.guesthouseSelectorButton}
          activeOpacity={0.8}
          onPress={() => setIsGuesthouseListVisible(prev => !prev)}>
          <Text
            style={[FONTS.fs_20_semibold, styles.topBarTitle]}
            numberOfLines={1}>
            {businessName}
          </Text>
          {isGuesthouseListVisible ? (
            <ChevronUpIcon width={16} height={16} />
          ) : (
            <ChevronDownIcon width={16} height={16} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab, index) => (
          <View
            key={tab}
            style={[styles.tabItem, index === 0 && styles.tabItemActive]}>
            <Text
              style={[
                FONTS.fs_14_medium,
                styles.tabText,
                index === 0 && styles.tabTextActive,
              ]}>
              {tab}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.chipRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.chip, activeChip === 'guesthouse' && styles.chipActive]}
          onPress={() => setActiveChip('guesthouse')}>
          <Text
            style={[
              FONTS.fs_14_medium,
              activeChip === 'guesthouse' ? styles.chipTextActive : styles.chipText,
            ]}>
            나의 게하
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={guesthouseDetail ? 0.8 : 1}
          style={[styles.chip, activeChip === 'review' && styles.chipActive]}
          disabled={!guesthouseDetail}
          onPress={() => {
            if (!guesthouseDetail) {
              return;
            }
            setActiveChip('review');
          }}>
          <Text
            style={[
              FONTS.fs_14_medium,
              activeChip === 'review' ? styles.chipTextActive : styles.chipText,
            ]}>
            리뷰 관리
          </Text>
        </TouchableOpacity>
      </View>

      {activeChip === 'review' && guesthouseDetail ? (
        <View style={styles.reviewContainer}>
          <MyGuesthouseReviewList
            guesthouseId={guesthouseDetail.id}
            key={guesthouseDetail.id}
          />
        </View>
      ) : guesthouseDetail ? (
        <View style={styles.contentContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.guesthouseCard}
            onPress={() =>
              navigation.navigate('MyGuesthousePreview', {
                id: guesthouseDetail.id,
                previewData: guesthouseDetail,
              })
            }>
            {thumbnailImage ? (
              <Image
                source={{uri: thumbnailImage}}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
            )}

            <View style={styles.cardTextWrap}>
              <Text
                style={[FONTS.fs_16_semibold, styles.cardTitle]}
                numberOfLines={1}>
                {guesthouseDetail.guesthouseName || businessName}
              </Text>
              <Text
                style={[FONTS.fs_12_medium, styles.cardAddress]}
                numberOfLines={2}>
                {guesthouseAddress}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('MyGuesthousePreview', {
                  id: guesthouseDetail.id,
                  previewData: guesthouseDetail,
                })
              }>
              <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
                수정하기
              </Text>
              <EditIcon width={20} height={20} />
            </TouchableOpacity>

            <View style={styles.actionButtonSpacer} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.actionButton}
              onPress={handleDelete}>
              <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
                삭제하기
              </Text>
              <DeleteIcon width={20} height={20} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Text style={[FONTS.fs_20_semibold, styles.emptyTitle]}>
            {`${businessName}에 대한 등록 심사가\n완료 되었습니다.\n게스트하우스 정보를\n작성해보세요!`}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.8}
            onPress={() =>
              navigation.navigate('MyGuesthouseAdd', {
                guesthouseId: routeGuesthouseId ?? effectiveGuesthouseId ?? null,
              })
            }>
            <Text style={[FONTS.fs_14_medium, styles.primaryButtonText]}>
              게스트하우스 정보 작성
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <GuesthouseProfileList
        visible={isGuesthouseListVisible}
        onClose={() => setIsGuesthouseListVisible(false)}
        items={guesthouseProfiles}
        selectedId={selectedGuesthouse?.id ?? null}
        onSelect={item => {
          setSelectedGuesthouseId(item.id);
          setActiveChip('guesthouse');
          setIsGuesthouseListVisible(false);
        }}
        onAdd={() => {
          setIsGuesthouseListVisible(false);
          navigation.navigate('StoreRegisterForm1');
        }}
      />

      <AlertModal
        visible={deleteModalVisible}
        title="게스트하우스 정보 삭제"
        message="정말 게스트하우스 정보를 삭제하시겠습니까?"
        buttonText="삭제"
        buttonText2="취소"
        onPress={confirmDelete}
        onPress2={() => setDeleteModalVisible(false)}
      />
    </View>
  );
};

export default GuesthouseManagement;
