import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import notificationApi from '@utils/api/notificationApi';
import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import useUserStore from '@stores/userStore';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';
import NotificationList from './NotificationList';

import ChevronLeftIcon from '@assets/images/chevron_left_gray.svg';
import ChevronDownIcon from '@assets/images/chevron_down_gray.svg';
import ChevronUpIcon from '@assets/images/chevron_up_gray.svg';
import SettingIcon from '@assets/images/settings_gray.svg';
import styles from './NotificationCenter.styles';

const FILTER_CHIPS = [
  { key: 'all', label: '전체' },
  { key: 'roomReservation', label: '객실 예약' },
  { key: 'partyReservation', label: '파티 예약' },
  { key: 'settlement', label: '정산' },
  { key: 'notice', label: '공지사항' },
];

const extractItems = data =>
  Array.isArray(data?.content)
    ? data.content
    : Array.isArray(data)
      ? data
      : [];

const formatDate = value => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return '방금 전';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}시간 전`;
  }

  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(1, '0');
  const day = String(date.getDate()).padStart(1, '0');
  return `${year}.${month}.${day}`;
};

const normalizeType = type => {
  const rawType = String(type || '').toUpperCase();

  if (rawType === 'ALL_NOTICE' || rawType === 'ALL_EVENT') {
    return 'notice';
  }

  if (rawType.startsWith('SETTLEMENT') || rawType.includes('SETTLEMENT')) {
    return 'settlement';
  }

  if (rawType.startsWith('PARTY_')) {
    return 'partyReservation';
  }

  return 'roomReservation';
};

const normalizeStatus = type => {
  const rawType = String(type || '').toUpperCase();

  if (
    rawType.includes('CANCELLED') ||
    rawType.includes('REFUND')
  ) {
    return 'cancelled';
  }

  if (rawType.includes('NEW')) {
    return 'pending';
  }

  return 'confirmed';
};

const buildLines = item => {
  const candidates = [
    item?.content,
    item?.body,
    item?.message,
    item?.description,
    item?.subtitle,
  ].filter(Boolean);

  const first = candidates[0];
  if (!first) {
    return ['알림 상세를 확인해주세요.'];
  }

  return String(first)
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, 2);
};

const mapNotificationItem = item => ({
  id: String(item?.id ?? `${Date.now()}-${Math.random()}`),
  notificationId: item?.id ?? null,
  type: normalizeType(item?.type),
  status: normalizeStatus(item?.type),
  title: item?.title || '새로운 알림',
  lines: buildLines(item),
  date: formatDate(item?.createdAt),
  isRead: Boolean(item?.isRead),
  guesthouseId: item?.guesthouseId || null,
  rawItem: item,
});

const NotificationCenter = () => {
  const navigation = useNavigation();
  const hostProfile = useUserStore(state => state.hostProfile);
  const globalSelectedGuesthouseId = useUserStore(state => state.selectedGuesthouseId);
  const setSelectedGuesthouseId = useUserStore(state => state.setSelectedGuesthouseId);
  const [selectedFilter, setSelectedFilter] = useState(FILTER_CHIPS[0].key);
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);

  const guesthouseProfiles = useMemo(
    () =>
      Array.isArray(hostProfile?.guesthouseProfiles)
        ? hostProfile.guesthouseProfiles
          .filter(
            item =>
              item?.applicationStatus === '승인 완료' ||
              item?.applicationStatus === 'APPROVED' ||
              item?.status === '승인 완료' ||
              item?.status === 'APPROVED',
          )
          .map((item, index) => {
            const ghId = String(item?.guesthouseId ?? item?.profileKey ?? `guesthouse-${index}`);
            // 현재 알림 리스트에서 해당 게하의 안 읽은 알림 개수를 계산
            const count = notifications.filter(
              n => !n.isRead && String(n.guesthouseId) === ghId
            ).length;

            return {
              id: ghId,
              guesthouseId: item?.guesthouseId ?? null,
              name: item?.guesthouseName || '게스트하우스',
              photoUrl: item?.profileImageUrl || null,
              noticeCount: count,
            };
          })
        : [],
    [hostProfile?.guesthouseProfiles, notifications],
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
      // 전역에서 선택된 게하가 있다면 그걸 우선 적용, 없으면 첫 번째 게하
      const match = guesthouseProfiles.find(
        p => String(p.id) === String(globalSelectedGuesthouseId) || String(p.guesthouseId) === String(globalSelectedGuesthouseId)
      );
      if (match) {
        setSelectedProfileId(match.id);
      } else {
        setSelectedProfileId(guesthouseProfiles[0].id);
      }
    }
  }, [guesthouseProfiles, selectedProfileId, globalSelectedGuesthouseId]);

  const selectedGuesthouse = useMemo(
    () =>
      guesthouseProfiles.find(item => item.id === selectedProfileId) ||
      guesthouseProfiles[0] ||
      null,
    [guesthouseProfiles, selectedProfileId],
  );

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // 전체 게스트하우스의 알림 갯수를 표시하기 위해 파라미터 없이 모두 불러옵니다.
      const { data } = await notificationApi.getMyNotifications();

      const items = extractItems(data);
      setNotifications(items.map(mapNotificationItem));
    } catch (error) {
      console.warn(
        '[NotificationCenter] failed to fetch notifications:',
        error?.message,
      );
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications]),
  );

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // 1. 게스트하우스별 필터링
    if (selectedGuesthouse) {
      result = result.filter(
        item =>
          item.type === 'notice' || // 시스템 공지사항(notice) 타입만 전체 허용
          (selectedGuesthouse.guesthouseId && String(item.guesthouseId) === String(selectedGuesthouse.guesthouseId))
      );
    }

    // 2. 탭 필터링 (전체, 객실 예약, 파티 예약 등)
    if (selectedFilter !== 'all') {
      result = result.filter(item => item.type === selectedFilter);
    }

    return result;
  }, [notifications, selectedFilter, selectedGuesthouse]);

  const handleReadAll = async () => {
    if (markingAllRead) {
      return;
    }

    try {
      setMarkingAllRead(true);
      await notificationApi.readAll();
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
    } catch (error) {
      console.warn(
        '[NotificationCenter] failed to mark all as read:',
        error?.message,
      );
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handlePressItem = (item) => {
    // 1. 알림 클릭 시 해당 알림의 게스트하우스 컨텍스트로 전역 상태 변경
    const targetGuesthouseId = item.guesthouseId || item.rawItem?.guesthouseId;
    if (targetGuesthouseId) {
      setSelectedGuesthouseId(targetGuesthouseId);
    }

    // 2. 각 타입별 화면 이동
    if (item.type === 'roomReservation') {
      const reservationId = item.rawItem?.reservationId;
      if (reservationId) {
        navigation.navigate('MyGuesthouseReservationDetail', {
          reservationId,
        });
      }
    } else if (item.type === 'settlement') {
      const batchId = item.rawItem?.batchId;
      if (batchId) {
        navigation.navigate('SettlementDetail', { batchId });
      } else {
        navigation.navigate('SettlementManagement');
      }
    } else if (item.type === 'notice') {
      const noticeId = item.rawItem?.noticeId;
      if (noticeId) {
        navigation.navigate('NoticeDetail', { noticeId });
      } else {
        navigation.navigate('NoticeList');
      }
    }
  };

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

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.8}
          onPress={handleReadAll}>
          <Text style={[FONTS.fs_12_medium, styles.actionButtonText]}>
            {markingAllRead ? '처리 중' : '전체 읽음'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color={COLORS.grayscale_500} />
        </View>
      ) : (
        <NotificationList items={filteredNotifications} onPressItem={handlePressItem} />
      )}

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
