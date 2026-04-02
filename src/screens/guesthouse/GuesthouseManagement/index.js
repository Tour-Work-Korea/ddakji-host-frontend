import React, {useEffect, useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';

import ChevronLeftIcon from '@assets/images/chevron_left_gray.svg';
import ChevronDownIcon from '@assets/images/chevron_down_gray.svg';
import ChevronUpIcon from '@assets/images/chevron_up_gray.svg';
import styles from './GuesthouseManagement.styles';

const tabs = ['게하 정보', '객실 예약', '파티 정보', '파티 예약'];

const GuesthouseManagement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const hostProfile = useUserStore(state => state.hostProfile);
  const selectedGuesthouseId = useUserStore(
    state => state.selectedHostGuesthouseId,
  );
  const setSelectedGuesthouseId = useUserStore(
    state => state.setSelectedHostGuesthouseId,
  );
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);

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

    if (String(selectedGuesthouseId) !== String(routeGuesthouseId)) {
      setSelectedGuesthouseId(String(routeGuesthouseId));
    }
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

  const businessName = selectedGuesthouse?.name || routeBusinessName;

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}>
            <ChevronLeftIcon width={24} height={24} />
          </TouchableOpacity>
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
        <View style={[styles.chip, styles.chipActive]}>
          <Text style={[FONTS.fs_14_medium, styles.chipTextActive]}>
            나의 게하
          </Text>
        </View>
        <View style={styles.chip}>
          <Text style={[FONTS.fs_14_medium, styles.chipText]}>리뷰 관리</Text>
        </View>
      </View>

      <View style={styles.emptyState}>
        <Text style={[FONTS.fs_20_semibold, styles.emptyTitle]}>
          {`${businessName}에 대한 등록 심사가\n완료 되었습니다.\n게스트하우스 정보를\n작성해보세요!`}
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('MyGuesthouseAdd')}>
          <Text style={[FONTS.fs_14_medium, styles.primaryButtonText]}>
            게스트하우스 정보 작성
          </Text>
        </TouchableOpacity>
      </View>

      <GuesthouseProfileList
        visible={isGuesthouseListVisible}
        onClose={() => setIsGuesthouseListVisible(false)}
        items={guesthouseProfiles}
        selectedId={selectedGuesthouse?.id ?? null}
        onSelect={item => {
          setSelectedGuesthouseId(item.id);
          setIsGuesthouseListVisible(false);
        }}
        onAdd={() => {
          setIsGuesthouseListVisible(false);
          navigation.navigate('StoreRegisterForm1');
        }}
      />
    </View>
  );
};

export default GuesthouseManagement;
