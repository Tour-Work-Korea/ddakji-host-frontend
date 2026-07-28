import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

import { FONTS } from '@constants/fonts';
import useUserStore from '@stores/userStore';
import AlertModal from '@components/modals/AlertModal';
import GuesthouseProfileList from '@components/modals/HostMy/Guesthouse/GuesthouseProfileList';
import { useGuesthouseProfiles } from '@hooks/useGuesthouseProfiles';
import Home from './Home';
import GuesthouseInfo from './GuesthouseInfo';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import hostMeetApi from '@utils/api/hostMeetApi';
import notificationApi from '@utils/api/notificationApi';
import PartyInfo from './PartyInfo';
import PartyReservation from './PartyReservation';
import RoomReservation from './RoomReservation';
import Staff from './Staff';
import LogoIcon from '@assets/images/logo_blue.svg';
import BellIcon from '@assets/images/bell_gray.svg';
import MenuIcon from '@assets/images/menu_gray.svg';
import ChevronDownIcon from '@assets/images/chevron_down_gray.svg';
import ChevronUpIcon from '@assets/images/chevron_up_gray.svg';
import styles from './GuesthouseManagement.styles';

const HOME_TAB = '홈';
const INFO_TAB = '게하 정보';
const ROOM_RESERVATION_TAB = '객실 예약';
const PARTY_INFO_TAB = '파티 정보';
const PARTY_RESERVATION_TAB = '파티 관리';
const STAFF_TAB = '스탭';

const tabs = [
  HOME_TAB,
  INFO_TAB,
  ROOM_RESERVATION_TAB,
  PARTY_INFO_TAB,
  PARTY_RESERVATION_TAB,
  STAFF_TAB,
];

const RESERVATION_POLICY_TO_METHOD = {
  CLOSED: 'closed',
  REQUEST_CONFIRMATION: 'request',
  INSTANT_CONFIRMATION: 'instant',
};

const GuesthouseManagement = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeGuesthouseId = route.params?.guesthouseId;
  const routeProfileKey = route.params?.profileKey;
  const routeBusinessName = route.params?.businessName || '게스트하우스';
  const routeReservationMethod = route.params?.reservationMethod;
  const routeInitialTab = tabs.includes(route.params?.initialTab)
    ? route.params.initialTab
    : HOME_TAB;
  const routeInitialChip = route.params?.initialChip;
  const routePartyId = route.params?.partyId;
  const routePartyTemplateId = route.params?.templateId;
  const routePartyReservationId = route.params?.reservationId;
  const routeInitialRoomManagementDate = route.params?.initialRoomManagementDate;
  const initialProfileKey =
    routeProfileKey != null
      ? String(routeProfileKey)
      : routeGuesthouseId != null
        ? String(routeGuesthouseId)
        : null;
  const hostProfile = useUserStore(state => state.hostProfile);
  const setHostProfile = useUserStore(state => state.setHostProfile);
  const setSelectedGuesthouseId = useUserStore(state => state.setSelectedGuesthouseId);
  const [isGuesthouseListVisible, setIsGuesthouseListVisible] = useState(false);
  const [guesthouseDetail, setGuesthouseDetail] = useState(null);
  const [hasPartyTemplate, setHasPartyTemplate] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(routeInitialTab);
  const [selectedProfileKey, setSelectedProfileKey] = useState(initialProfileKey);
  const lastSyncedRouteProfileKeyRef = useRef(initialProfileKey);
  const [unreadCount, setUnreadCount] = useState(0);
  const [reservationMethod, setReservationMethod] = useState(
    routeReservationMethod || 'closed',
  );
  const [pendingReservationPolicyRequest, setPendingReservationPolicyRequest] = useState(null);

  const { guesthouseProfiles } = useGuesthouseProfiles();

  useEffect(() => {
    const nextRouteProfileKey = initialProfileKey;

    if (!nextRouteProfileKey) {
      return;
    }

    if (lastSyncedRouteProfileKeyRef.current === nextRouteProfileKey) {
      return;
    }

    lastSyncedRouteProfileKeyRef.current = nextRouteProfileKey;
    setSelectedProfileKey(nextRouteProfileKey);

    setActiveTab(routeInitialTab);
  }, [initialProfileKey, routeInitialTab]);

  useEffect(() => {
    if (tabs.includes(routeInitialTab)) {
      setActiveTab(routeInitialTab);
    }
  }, [routeInitialTab]);

  useEffect(() => {
    if (!guesthouseProfiles.length) {
      return;
    }

    if (!selectedProfileKey) {
      setSelectedProfileKey(guesthouseProfiles[0].id);
      return;
    }

    const hasSelected = guesthouseProfiles.some(
      profile => profile.id === String(selectedProfileKey),
    );

    if (!hasSelected) {
      setSelectedProfileKey(guesthouseProfiles[0].id);
    }
  }, [guesthouseProfiles, selectedProfileKey]);

  useEffect(() => {
    setSelectedGuesthouseId(selectedProfileKey ?? null);
  }, [selectedProfileKey, setSelectedGuesthouseId]);

  const selectedGuesthouse = useMemo(() => {
    if (selectedProfileKey) {
      return (
        guesthouseProfiles.find(
          guesthouse => guesthouse.id === String(selectedProfileKey),
        ) || null
      );
    }

    return guesthouseProfiles[0] || null;
  }, [guesthouseProfiles, selectedProfileKey]);

  const effectiveGuesthouseId =
    selectedGuesthouse?.guesthouseId != null
      ? String(selectedGuesthouse.guesthouseId)
      : null;

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

  const fetchPartyTemplates = useCallback(async () => {
    if (!effectiveGuesthouseId) {
      setHasPartyTemplate(false);
      return;
    }

    try {
      const response = await hostMeetApi.getMyParties();
      const rawTemplates = response?.data;
      const templates = Array.isArray(rawTemplates)
        ? rawTemplates
        : rawTemplates?.content ?? [];
      const matchedTemplate = templates.some(
        item => String(item?.guesthouseId) === String(effectiveGuesthouseId),
      );

      setHasPartyTemplate(matchedTemplate);
    } catch (error) {
      setHasPartyTemplate(false);
    }
  }, [effectiveGuesthouseId]);

  const fetchReservationPolicy = useCallback(async () => {
    if (!effectiveGuesthouseId) {
      setReservationMethod('closed');
      return;
    }

    try {
      const response = await hostGuesthouseApi.getGuesthouseReservationPolicy(
        effectiveGuesthouseId,
      );
      const reservationPolicy =
        response?.data?.currentPolicy ??
        response?.data?.data?.currentPolicy ??
        response?.data;

      const pendingReq =
        response?.data?.pendingRequest ??
        response?.data?.data?.pendingRequest ??
        null;

      setReservationMethod(
        RESERVATION_POLICY_TO_METHOD[reservationPolicy] || 'closed',
      );
      setPendingReservationPolicyRequest(pendingReq);
    } catch (error) {
      console.warn(
        '[GuesthouseManagement] failed to fetch reservation policy:',
        error?.message,
      );
      setReservationMethod('closed');
    }
  }, [effectiveGuesthouseId]);

  useFocusEffect(
    useCallback(() => {
      fetchGuesthouseDetail();
      fetchPartyTemplates();
      fetchReservationPolicy();
    }, [fetchGuesthouseDetail, fetchPartyTemplates, fetchReservationPolicy]),
  );

  useEffect(() => {
    if (!routeReservationMethod) {
      return;
    }

    setReservationMethod(routeReservationMethod);
  }, [routeReservationMethod]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      const count = Number(
        data?.unreadCount ?? data?.count ?? data?.data ?? data ?? 0,
      );
      setUnreadCount(Number.isNaN(count) ? 0 : count);
    } catch (error) {
      console.warn(
        '[GuesthouseManagement] failed to fetch unread count:',
        error?.message,
      );
      setUnreadCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount]),
  );

  useEffect(() => {
    const isRouteRequestedTab =
      routeInitialTab === activeTab && routeInitialTab !== HOME_TAB;

    if (
      !guesthouseDetail &&
      activeTab !== HOME_TAB &&
      activeTab !== INFO_TAB &&
      !isRouteRequestedTab
    ) {
      setActiveTab(HOME_TAB);
    }
  }, [activeTab, guesthouseDetail, routeInitialTab]);

  useEffect(() => {
    const isRouteRequestedPartyReservationTab =
      routeInitialTab === PARTY_RESERVATION_TAB &&
      activeTab === PARTY_RESERVATION_TAB;

    if (
      activeTab === PARTY_RESERVATION_TAB &&
      !hasPartyTemplate &&
      !isRouteRequestedPartyReservationTab
    ) {
      setActiveTab(HOME_TAB);
    }
  }, [activeTab, hasPartyTemplate, routeInitialTab]);

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

      setSelectedProfileKey(
        nextProfiles[0]?.profileKey != null
          ? String(nextProfiles[0].profileKey)
          : nextProfiles[0]?.guesthouseId != null
            ? String(nextProfiles[0].guesthouseId)
            : null,
      );

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
          onPress={() => navigation.navigate('MainTabs', { screen: '홈' })}>
          <LogoIcon width={60} height={28} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('NotificationCenter')}>
            <BellIcon width={18} height={18} />
            {unreadCount > 0 ? (
              <View style={styles.unreadBadge}>
                <Text style={[FONTS.fs_12_medium, styles.unreadBadgeText]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconButton}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('MainTabs', { screen: '마이' })}>
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScrollView}
        contentContainerStyle={styles.tabRow}>
        {tabs.map(tab => {
          const isInactive = guesthouseDetail?.status === 'INACTIVE';
          const isPartyReservationTab = tab === PARTY_RESERVATION_TAB;
          const isRouteRequestedTab = tab === routeInitialTab && activeTab === tab;
          const isDisabled =
            (!isRouteRequestedTab &&
              (((!guesthouseDetail || isInactive) &&
                tab !== HOME_TAB &&
                tab !== INFO_TAB) ||
                (isPartyReservationTab && !hasPartyTemplate)));

          return (
            <TouchableOpacity
              key={tab}
              activeOpacity={isDisabled ? 1 : 0.8}
              disabled={isDisabled}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  FONTS.fs_14_medium,
                  styles.tabText,
                  isDisabled && styles.tabText,
                  activeTab === tab && styles.tabTextActive,
                ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {activeTab === HOME_TAB ? (
        <Home
          businessName={businessName}
          guesthouseAddress={guesthouseAddress}
          guesthouseDetail={guesthouseDetail}
          hasPartyTemplate={hasPartyTemplate}
          reservationMethod={reservationMethod}
          pendingReservationPolicyRequest={pendingReservationPolicyRequest}
          guesthouseId={effectiveGuesthouseId}
          onMoveTab={setActiveTab}
        />
      ) : activeTab === INFO_TAB ? (
        <GuesthouseInfo
          guesthouseDetail={guesthouseDetail}
          thumbnailImage={thumbnailImage}
          businessName={businessName}
          guesthouseAddress={guesthouseAddress}
          routeGuesthouseId={routeGuesthouseId}
          effectiveGuesthouseId={effectiveGuesthouseId}
          initialChip={routeInitialChip}
          onDelete={handleDelete}
        />
      ) : activeTab === ROOM_RESERVATION_TAB ? (
        <RoomReservation
          guesthouseId={effectiveGuesthouseId}
          initialChip={routeInitialChip}
          initialRoomManagementDate={routeInitialRoomManagementDate}
        />
      ) : activeTab === PARTY_INFO_TAB ? (
        <PartyInfo guesthouseId={effectiveGuesthouseId} />
      ) : activeTab === PARTY_RESERVATION_TAB ? (
        <PartyReservation
          guesthouseId={effectiveGuesthouseId}
          initialTemplateId={routePartyTemplateId}
          initialPartyId={routePartyId}
          initialReservationId={routePartyReservationId}
        />
      ) : (
        <Staff guesthouseId={effectiveGuesthouseId} />
      )}

      <GuesthouseProfileList
        visible={isGuesthouseListVisible}
        onClose={() => setIsGuesthouseListVisible(false)}
        items={guesthouseProfiles}
        selectedId={selectedProfileKey ?? selectedGuesthouse?.id ?? null}
        onSelect={item => {
          setSelectedProfileKey(item.id);
          setActiveTab(HOME_TAB);
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
