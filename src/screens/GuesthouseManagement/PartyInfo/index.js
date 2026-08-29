import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
  Switch,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { FONTS } from '@constants/fonts';
import { COLORS } from '@constants/colors';
import AlertModal from '@components/modals/AlertModal';
import hostMeetApi from '@utils/api/hostMeetApi';
import {
  ensureEndedLocalDateEventSample,
  removeLocalDateEvent,
  updateLocalDateEvent,
} from '@utils/localDateEventStorage';
import {
  formatLocalDateToDotWithDay,
  formatLocalTimeToKorean12Hour,
} from '@utils/formatDate';
import styles from './PartyInfo.styles';

import PeopleIcon from '@assets/images/people_gray.svg';
import PencilIcon from '@assets/images/edit_gray.svg';
import TrashIcon from '@assets/images/delete_gray.svg';
import PlusIcon from '@assets/images/plus_white.svg';

const MENU_TOAST_TOP_OFFSET = Platform.OS === 'ios' ? 220 : 190;

const getPartyKey = party => party?.localEventId ?? party?.templateId;

const getPartyImageUrl = party => {
  if (party?.partyImageUrl) {
    return party.partyImageUrl;
  }

  const images = Array.isArray(party?.partyImages) ? party.partyImages : [];
  return (
    images.find(image => image?.isThumbnail)?.imageUrl ??
    images[0]?.imageUrl ??
    ''
  );
};

const getDateEventScheduleText = party => {
  const dateKey = String(
    party?.partyStartDateTime ?? party?.eventDate ?? '',
  ).split('T')[0];
  if (!dateKey) {
    return '';
  }

  const startTime = formatLocalTimeToKorean12Hour(party?.partyStartTime);
  return `${formatLocalDateToDotWithDay(dateKey)} · ${startTime}`;
};

const isEndedDateEvent = party => {
  if (party?.scheduleType !== 'DATE_EVENT') {
    return false;
  }
  if (party?.eventStatus === 'ENDED') {
    return true;
  }

  const dateKey = String(
    party?.partyStartDateTime ?? party?.eventDate ?? '',
  ).split('T')[0];
  const endTime = party?.partyEndTime;
  if (!dateKey || !endTime) {
    return false;
  }

  const endDateTime = new Date(`${dateKey}T${endTime}`);
  return !Number.isNaN(endDateTime.getTime()) && endDateTime <= new Date();
};

const moveEndedEventsToBottom = parties =>
  [...parties].sort(
    (first, second) =>
      Number(isEndedDateEvent(first)) - Number(isEndedDateEvent(second)),
  );

const getPriceOptionText = party => {
  if (party?.chargeType === 'FREE') {
    return '무료';
  }

  const options = Array.isArray(party?.priceOptions)
    ? [...party.priceOptions]
      .sort((a, b) => {
        const aOrder = Number(a?.displayOrder);
        const bOrder = Number(b?.displayOrder);
        return (Number.isFinite(aOrder) ? aOrder : 0) -
          (Number.isFinite(bOrder) ? bOrder : 0);
      })
      .filter(option => option?.optionName && Number(option?.amount) >= 0)
    : [];

  if (options.length > 0) {
    return options
      .map(
        option =>
          `${option.optionName} ${Number(option.amount).toLocaleString('ko-KR')}원`,
      )
      .join(' · ');
  }

  const fallbackAmount = Number(party?.amount);
  return Number.isFinite(fallbackAmount) && fallbackAmount > 0
    ? `기본 참가비 ${fallbackAmount.toLocaleString('ko-KR')}원`
    : '';
};

const PartyInfo = ({ guesthouseId }) => {
  const navigation = useNavigation();
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [applyToggleTarget, setApplyToggleTarget] = useState(null);
  const [updatingTemplateIds, setUpdatingTemplateIds] = useState([]);

  const fetchParties = useCallback(async () => {
    let localEvents = [];
    try {
      setLoading(true);
      if (__DEV__) {
        localEvents = await ensureEndedLocalDateEventSample(guesthouseId);
      }

      const response = await hostMeetApi.getMyParties();
      const rawParties = response?.data;
      const allParties = Array.isArray(rawParties)
        ? rawParties
        : rawParties?.content ?? [];
      const filtered = allParties.filter(
        party => String(party.guesthouseId) === String(guesthouseId),
      );
      const resolvedParties = await Promise.all(
        filtered.map(async party => {
          const applyOpen = party?.isApplyOpen ?? party?.isApply;
          if (typeof applyOpen === 'boolean' || party?.templateId == null) {
            return party;
          }

          try {
            const detailResponse = await hostMeetApi.getPartyTemplateDetail(
              party.templateId,
            );
            return {...party, ...(detailResponse?.data ?? {})};
          } catch (error) {
            return party;
          }
        }),
      );
      setParties(moveEndedEventsToBottom([...localEvents, ...resolvedParties]));
    } catch (error) {
      console.log('Error fetching parties:', error);
      setParties(moveEndedEventsToBottom(localEvents));
    } finally {
      setLoading(false);
    }
  }, [guesthouseId]);

  useFocusEffect(
    useCallback(() => {
      if (guesthouseId) {
        fetchParties();
      }
    }, [guesthouseId, fetchParties]),
  );

  const handleRegister = () => {
    navigation.navigate('MyMeetTypeSelect', {guesthouseId});
  };

  const handleEdit = party => {
    if (party?.isLocalTestEvent) {
      navigation.navigate('MyMeetAdd', {
        localEventId: party.localEventId,
        guesthouseId,
        scheduleType: 'DATE_EVENT',
      });
      return;
    }
    navigation.navigate('MyMeetAdd', {
      templateId: party.templateId,
      guesthouseId,
    });
  };

  const handleDelete = party => {
    setDeleteTargetId({
      id: getPartyKey(party),
      isLocal: Boolean(party?.isLocalTestEvent),
    });
  };

  const handleReuse = party => {
    if (!party?.isLocalTestEvent) {
      return;
    }

    navigation.navigate('MyMeetAdd', {
      reuseLocalEventId: party.localEventId,
      guesthouseId,
      scheduleType: 'DATE_EVENT',
    });
  };

  const handleOpenApplyToggleModal = (party, nextValue) => {
    const partyId = getPartyKey(party);
    if (
      partyId == null ||
      updatingTemplateIds.some(id => String(id) === String(partyId))
    ) {
      return;
    }

    setApplyToggleTarget({
      partyId,
      nextValue,
      isLocal: Boolean(party?.isLocalTestEvent),
    });
  };

  const handleToggleApplyOpen = async (partyId, nextValue, isLocal) => {
    if (
      partyId == null ||
      updatingTemplateIds.some(id => String(id) === String(partyId))
    ) {
      return;
    }

    setUpdatingTemplateIds(prev => [...prev, partyId]);

    try {
      if (isLocal) {
        await updateLocalDateEvent(guesthouseId, partyId, {
          isApplyOpen: nextValue,
        });
      } else {
        await hostMeetApi.updatePartyApplicationOpen(partyId, nextValue);
      }
      setParties(prev =>
        prev.map(party =>
          String(getPartyKey(party)) === String(partyId)
            ? {...party, isApplyOpen: nextValue, isApply: nextValue}
            : party,
        ),
      );
      Toast.show({
        type: 'success',
        text1: nextValue
          ? '이제 콘텐츠 참여 신청을 받을 수 있어요.'
          : '이제 콘텐츠 정보만 보여줘요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1:
          error?.response?.data?.message ||
          '콘텐츠 신청 설정 변경 중 오류가 발생했어요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } finally {
      setUpdatingTemplateIds(prev =>
        prev.filter(id => String(id) !== String(partyId)),
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) {
      return;
    }

    try {
      if (deleteTargetId.isLocal) {
        await removeLocalDateEvent(guesthouseId, deleteTargetId.id);
      } else {
        await hostMeetApi.deleteParty(deleteTargetId.id);
      }
      setDeleteTargetId(null);
      fetchParties();
    } catch (error) {
      console.log('Delete party err:', error);
      setDeleteTargetId(null);
      Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
    }
  };

  const confirmApplyToggle = () => {
    if (!applyToggleTarget) {
      return;
    }

    const {partyId, nextValue, isLocal} = applyToggleTarget;
    setApplyToggleTarget(null);
    handleToggleApplyOpen(partyId, nextValue, isLocal);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary_orange} />
      </View>
    );
  }

  if (parties.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[FONTS.fs_20_medium, styles.emptyText]}>
          게스트하우스의 특별한 콘텐츠를{'\n'}게딱지에 소개해보세요!
        </Text>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={[FONTS.fs_14_medium, styles.registerButtonText]}>
            콘텐츠 등록하기
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const isApplyOpen = Boolean(item?.isApplyOpen ?? item?.isApply);
    const isDateEvent = item?.scheduleType === 'DATE_EVENT';
    const isEnded = isEndedDateEvent(item);
    const priceOptionText = getPriceOptionText(item);
    const partyImageUrl = getPartyImageUrl(item);
    const partyKey = getPartyKey(item);
    const isUpdating = updatingTemplateIds.some(
      id => String(id) === String(partyKey),
    );

    return (
      <View
        style={[
          styles.cardContainer,
          isEnded && styles.endedCardContainer,
        ]}>
        <View style={styles.card}>
          {partyImageUrl ? (
            <Image
              source={{uri: partyImageUrl}}
              style={[styles.thumbnail, isEnded && styles.endedThumbnail]}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                styles.thumbnail,
                styles.thumbnailPlaceholder,
                isEnded && styles.endedThumbnail,
              ]}>
              <Text style={[FONTS.fs_12_medium, styles.thumbnailPlaceholderText]}>
                이벤트
              </Text>
            </View>
          )}
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              {isDateEvent ? (
                <View style={styles.contentTypeRow}>
                  <View
                    style={[
                      styles.dateEventBadge,
                      isEnded && styles.endedTypeBadge,
                    ]}>
                    <Text
                      style={[
                        FONTS.fs_12_semibold,
                        styles.dateEventBadgeText,
                        isEnded && styles.endedTypeBadgeText,
                      ]}>
                      이벤트
                    </Text>
                  </View>
                  {item.isLocalTestEvent ? (
                    <View style={styles.testBadge}>
                      <Text
                        style={[FONTS.fs_12_medium, styles.testBadgeText]}>
                        테스트
                      </Text>
                    </View>
                  ) : null}
                  {isEnded ? (
                    <View style={styles.endedBadge}>
                      <Text style={[FONTS.fs_12_semibold, styles.endedBadgeText]}>
                        종료
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}
              <Text
                style={[
                  FONTS.fs_16_semibold,
                  styles.partyTitle,
                  isEnded && styles.endedPartyTitle,
                ]}
                numberOfLines={2}>
                {item.partyTitle}
              </Text>
              {isDateEvent ? (
                <Text
                  style={[FONTS.fs_12_medium, styles.eventScheduleText]}
                  numberOfLines={2}>
                  {getDateEventScheduleText(item)}
                </Text>
              ) : null}
              <View style={styles.attendanceRow}>
                <PeopleIcon width={14} height={14} />
                <Text style={[FONTS.fs_12_medium, styles.attendanceText]}>
                  최대인원 {item.maxAttendance ?? item.maxAttendees}명
                </Text>
              </View>
              {priceOptionText ? (
                <Text
                  style={[FONTS.fs_12_medium, styles.priceOptionText]}
                  numberOfLines={2}>
                  {priceOptionText}
                </Text>
              ) : null}
            </View>
          </View>
        </View>

        <View style={styles.actionButtonRow}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => (isEnded ? handleReuse(item) : handleEdit(item))}>
            <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
              {isEnded ? '다시 등록' : '수정'}
            </Text>
            <PencilIcon width={18} height={18} />
          </TouchableOpacity>

          <View style={styles.actionDivider} />

          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={() => handleDelete(item)}>
            <Text style={[FONTS.fs_14_medium, styles.actionButtonText]}>
              삭제
            </Text>
            <TrashIcon width={18} height={18} />
          </TouchableOpacity>
        </View>

        {!isDateEvent ? (
          <View style={styles.applicationSetting}>
            <View style={styles.applicationSettingTextWrap}>
              <View style={styles.applicationSettingLabelRow}>
                <Text
                  style={[
                    FONTS.fs_14_semibold,
                    styles.applicationSettingTitle,
                  ]}>
                  참여 신청
                </Text>
                <Text
                  style={[
                    FONTS.fs_12_semibold,
                    isApplyOpen
                      ? styles.applicationStatusOpen
                      : styles.applicationStatusClosed,
                  ]}>
                  {isApplyOpen ? '신청 받는 중' : '정보만 노출'}
                </Text>
              </View>
              <Text
                style={[
                  FONTS.fs_12_medium,
                  styles.applicationSettingDescription,
                ]}>
                {isApplyOpen
                  ? '게스트가 콘텐츠를 확인하고 참여 신청할 수 있어요.'
                  : '콘텐츠 정보만 보여주고 신규 신청은 받지 않아요.'}
              </Text>
            </View>
            <Switch
              value={isApplyOpen}
              onValueChange={nextValue =>
                handleOpenApplyToggleModal(item, nextValue)
              }
              disabled={isUpdating}
              trackColor={{
                false: COLORS.grayscale_300,
                true: COLORS.primary_orange,
              }}
              thumbColor={COLORS.grayscale_0}
            />
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={parties}
        keyExtractor={(item, index) =>
          getPartyKey(item) ? String(getPartyKey(item)) : String(index)
        }
        contentContainerStyle={styles.listContent}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.addButton, styles.addButtonLocation]}
        activeOpacity={0.8}
        onPress={handleRegister}>
        <Text style={[FONTS.fs_14_medium, styles.addButtonText]}>
          콘텐츠 등록하기
        </Text>
        <PlusIcon width={24} height={24} />
      </TouchableOpacity>

      <AlertModal
        visible={applyToggleTarget !== null}
        title={
          applyToggleTarget?.nextValue
            ? '참여 신청을 받을까요?'
            : '참여 신청을 받지 않을까요?'
        }
        message={
          applyToggleTarget?.nextValue
            ? '게스트가 콘텐츠를 확인하고 참여 신청할 수 있어요.'
            : '콘텐츠 정보는 계속 노출되지만 신규 참여 신청은 받을 수 없어요.'
        }
        buttonText={applyToggleTarget?.nextValue ? '신청 받기' : '신청 마감하기'}
        buttonText2="돌아가기"
        color={COLORS.primary_orange}
        onPress={confirmApplyToggle}
        onPress2={() => setApplyToggleTarget(null)}
        onRequestClose={() => setApplyToggleTarget(null)}
      />

      <AlertModal
        visible={deleteTargetId !== null}
        title="삭제 확인"
        message="정말로 이 콘텐츠를 삭제하시겠습니까?"
        buttonText="삭제"
        buttonText2="취소"
        onPress={confirmDelete}
        onPress2={() => setDeleteTargetId(null)}
      />
    </View>
  );
};

export default PartyInfo;
