import React, {useEffect, useMemo, useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

import {FONTS} from '@constants/fonts';
import useUserStore from '@stores/userStore';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';

import ChevronLeftIcon from '@assets/images/chevron_left_gray.svg';
import ChevronDownIcon from '@assets/images/chevron_down_gray.svg';
import ChevronUpIcon from '@assets/images/chevron_up_gray.svg';
import SettingIcon from '@assets/images/settings_gray.svg';

import AllNotifications from './AllNotifications';
import RoomReservationNotifications from './RoomReservationNotifications';
import PartyReservationNotifications from './PartyReservationNotifications';
import NoticeNotifications from './NoticeNotifications';
import styles from './NotificationCenter.styles';

const FILTER_CHIPS = [
  {key: 'all', label: '전체'},
  {key: 'roomReservation', label: '객실 예약'},
  {key: 'partyReservation', label: '파티 예약'},
  {key: 'notice', label: '공지사항'},
];

const FILTER_COMPONENTS = {
  all: AllNotifications,
  roomReservation: RoomReservationNotifications,
  partyReservation: PartyReservationNotifications,
  notice: NoticeNotifications,
};

const NotificationCenter = () => {
  const navigation = useNavigation();
  const hostProfile = useUserStore(state => state.hostProfile);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_CHIPS[0].key);
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(hostProfile?.guesthouseProfiles)
        ? hostProfile.guesthouseProfiles
            .filter(
              item =>
                item?.applicationStatus !== 'PENDING' &&
                item?.status !== '심사중' &&
                item?.status !== '등록 심사중',
            )
            .map((item, index) => ({
              id: String(
                item?.profileKey ?? item?.guesthouseId ?? `guesthouse-${index}`,
              ),
              guesthouseId: item?.guesthouseId ?? null,
              name: item?.guesthouseName || '게스트하우스',
              photoUrl: item?.profileImageUrl || null,
              noticeCount: 0,
            }))
        : [],
    [hostProfile?.guesthouseProfiles],
  );

  useEffect(() => {
    if (!guesthouseProfiles.length) {
      if (selectedProfileId !== null) {
        setSelectedProfileId(null);
      }
      return;
    }

    const hasSelected = guesthouseProfiles.some(
      profile => profile.id === selectedProfileId,
    );

    if (!hasSelected) {
      setSelectedProfileId(guesthouseProfiles[0].id);
    }
  }, [guesthouseProfiles, selectedProfileId]);

  const selectedGuesthouse = useMemo(
    () =>
      guesthouseProfiles.find(item => item.id === selectedProfileId) ||
      guesthouseProfiles[0] ||
      null,
    [guesthouseProfiles, selectedProfileId],
  );
  const SelectedFilterScreen =
    FILTER_COMPONENTS[selectedFilter] || AllNotifications;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.8}
            onPress={() => navigation.goBack()}>
            <ChevronLeftIcon width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectorButton}
            activeOpacity={0.8}
            onPress={() => setIsGuesthouseListVisible(true)}>
            <Text
              style={[FONTS.fs_20_semibold, styles.selectorText]}
              numberOfLines={1}>
              {selectedGuesthouse?.name || '프로필 선택'}
            </Text>
            {isGuesthouseListVisible ? (
              <ChevronUpIcon width={16} height={16} />
            ) : (
              <ChevronDownIcon width={16} height={16} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconButton} activeOpacity={0.8}>
          <SettingIcon width={22} height={22} />
        </TouchableOpacity>
      </View>

      <View style={styles.chipRow}>
        {FILTER_CHIPS.map(chip => {
          const isSelected = chip.key === selectedFilter;

          return (
            <TouchableOpacity
              key={chip.key}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() => setSelectedFilter(chip.key)}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.chipText,
                  isSelected && styles.chipTextActive,
                ]}>
                {chip.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <SelectedFilterScreen />

      <GuesthouseProfileList
        visible={isGuesthouseListVisible}
        onClose={() => setIsGuesthouseListVisible(false)}
        items={guesthouseProfiles}
        selectedId={selectedProfileId}
        onSelect={item => {
          setSelectedProfileId(item.id);
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

export default NotificationCenter;
