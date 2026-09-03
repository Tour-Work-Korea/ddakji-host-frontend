import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import Toast from 'react-native-toast-message';

import {COLORS} from '@constants/colors';
import {
  DDAKJI_RESERVATION_SOURCE,
  getExternalReservationSource,
} from '@constants/externalReservationSources';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import {formatLocalDateToDotWithDay} from '@utils/formatDate';
import {formatPhoneNumber} from '@utils/formatPhoneNumber';
import PlusIcon from '@assets/images/plus_white.svg';

const DETAIL_TABS = {
  ROOMS: 'ROOMS',
  RESERVATIONS: 'RESERVATIONS',
};

const getNights = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) {
    return 1;
  }

  const diff = new Date(checkOutDate) - new Date(checkInDate);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const getReservationRoomId = reservation =>
  reservation?.roomId ??
  reservation?.roomInfoId ??
  reservation?.guesthouseRoomId ??
  reservation?.room?.roomId ??
  reservation?.room?.id ??
  null;

const isReservationForRoom = (reservation, room) => {
  const reservationRoomId = getReservationRoomId(reservation);
  if (reservationRoomId != null && room?.roomId != null) {
    return String(reservationRoomId) === String(room.roomId);
  }
  return reservation?.roomName === room?.roomName;
};

const normalizeIntegratedReservation = reservation => ({
  ...reservation,
  id: reservation?.reservationId ?? reservation?.id,
  reservationId: reservation?.reservationId ?? reservation?.id,
  unifiedReservationId:
    reservation?.unifiedReservationId ??
    `${reservation?.sourceType ?? 'DDAKJI'}:${
      reservation?.reservationId ?? reservation?.id
    }`,
  roomId: getReservationRoomId(reservation),
  sourceType: reservation?.sourceType ?? 'DDAKJI',
  source:
    reservation?.sourceType === 'EXTERNAL' ? reservation?.channelKey : 'DDAKJI',
  sourceLabel:
    reservation?.sourceType === 'EXTERNAL'
      ? reservation?.channelLabel ?? '외부'
      : '게딱지',
  guestName:
    reservation?.guestName ??
    reservation?.userName ??
    reservation?.name ??
    '게스트',
  roomName: reservation?.roomName ?? reservation?.room ?? '객실',
  checkInDate:
    reservation?.checkInDate?.split?.('T')?.[0] ?? reservation?.checkInDate,
  checkOutDate:
    reservation?.checkOutDate?.split?.('T')?.[0] ?? reservation?.checkOutDate,
  guestCount: Number(reservation?.guestCount ?? 0),
  guestPhone: formatPhoneNumber(
    reservation?.guestPhone ?? reservation?.userPhone ?? reservation?.phone,
  ),
});

const normalizeCalendarRoom = room => ({
  ...room,
  roomId: room?.roomId ?? room?.id,
  roomName: room?.roomName ?? room?.name ?? '객실',
  roomType: room?.roomType ?? '',
  capacity: Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 1),
  remainingCapacity:
    room?.availableQuantity == null
      ? null
      : Math.max(0, Number(room.availableQuantity)),
  isClosed:
    room?.manuallyClosed === true ||
    room?.isClosed === true ||
    room?.available === false,
  isReserved: room?.available === false,
});

const IntegratedReservationDayModal = ({
  guesthouseId,
  targetDate,
  roomAvailability,
  refreshKey,
  onAdd,
  onClose,
  onEditExternal,
  onDeleteExternal,
}) => {
  const navigation = useNavigation();
  const [dayReservations, setDayReservations] = useState([]);
  const [dayRooms, setDayRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(DETAIL_TABS.ROOMS);
  const [selectedRoomFilter, setSelectedRoomFilter] = useState(null);
  const [isRoomFilterOpen, setIsRoomFilterOpen] = useState(false);
  const [selectedExternalReservation, setSelectedExternalReservation] =
    useState(null);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchReservations = async () => {
      if (!guesthouseId || !targetDate) {
        setDayReservations([]);
        setDayRooms([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await hostGuesthouseApi.getIntegratedCalendarDate(
          guesthouseId,
          targetDate,
        );
        const payload = response?.data?.data ?? response?.data ?? {};
        const list = [
          ...(payload?.confirmedReservations ?? []),
          ...(payload?.completedReservations ?? []),
          ...(payload?.pendingHostReservations ?? []),
          ...(payload?.cancelledReservations ?? []),
        ];

        if (isMounted) {
          setDayReservations(list.map(normalizeIntegratedReservation));
          setDayRooms((payload?.rooms ?? []).map(normalizeCalendarRoom));
        }
      } catch (error) {
        if (isMounted) {
          setDayReservations([]);
          setDayRooms([]);
          Toast.show({
            type: 'error',
            text1:
              error?.response?.data?.message ??
              '예약 상세를 불러오지 못했습니다.',
            position: 'top',
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchReservations();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, refreshKey, targetDate]);

  const reservations = dayReservations;
  const availableRooms = dayRooms.length > 0 ? dayRooms : roomAvailability;
  const availabilityReliable = availableRooms.every(
    room => room.remainingCapacity != null,
  );

  const filteredReservations = useMemo(() => {
    if (!selectedRoomFilter) {
      return reservations;
    }

    return reservations.filter(reservation =>
      isReservationForRoom(reservation, selectedRoomFilter),
    );
  }, [reservations, selectedRoomFilter]);

  const roomStatusSummary = useMemo(() => {
    const availableCount = availableRooms.filter(room => {
      const isDormitory = room.roomType === 'DORMITORY';
      return !(
        room.isClosed ||
        room.remainingCapacity === 0 ||
        (!isDormitory && room.isReserved)
      );
    }).length;

    return {
      availableCount,
      closedCount: availableRooms.length - availableCount,
    };
  }, [availableRooms]);

  const handlePressReservation = reservation => {
    if (reservation.sourceType === 'EXTERNAL') {
      setSelectedExternalReservation(reservation);
      setIsDeleteConfirmVisible(false);
      return;
    }

    onClose();
    navigation.navigate('MyGuesthouseReservationDetail', {
      reservationId: reservation.reservationId || reservation.id,
      reservation: {
        ...reservation,
        room: reservation.roomName,
        period: `${reservation.checkInDate} ~ ${
          reservation.checkOutDate
        } (${getNights(reservation.checkInDate, reservation.checkOutDate)}박)`,
      },
    });
  };

  const closeReservationActionModal = () => {
    if (isDeleting) {
      return;
    }
    setSelectedExternalReservation(null);
    setIsDeleteConfirmVisible(false);
  };

  const handleEditExternalReservation = () => {
    const reservation = selectedExternalReservation;
    if (!reservation) {
      return;
    }
    setSelectedExternalReservation(null);
    setIsDeleteConfirmVisible(false);
    onEditExternal(reservation);
  };

  const handleDeleteExternalReservation = async () => {
    if (!selectedExternalReservation || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteExternal(selectedExternalReservation);
      setSelectedExternalReservation(null);
      setIsDeleteConfirmVisible(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPhone = (phone, event) => {
    event?.stopPropagation?.();
    Clipboard.setString(String(phone));
    Toast.show({
      type: 'success',
      text1: '예약자 번호가 복사되었습니다.',
      position: 'top',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[FONTS.fs_18_semibold, styles.title]}>
          {formatLocalDateToDotWithDay(targetDate)
            .replace(' (', ' ')
            .replace(')', '')}
        </Text>
      </View>

      <View style={styles.tabList}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === DETAIL_TABS.ROOMS && styles.tabButtonSelected,
          ]}
          activeOpacity={0.75}
          accessibilityRole="tab"
          accessibilityState={{selected: activeTab === DETAIL_TABS.ROOMS}}
          onPress={() => {
            setIsRoomFilterOpen(false);
            setActiveTab(DETAIL_TABS.ROOMS);
          }}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.tabText,
              activeTab === DETAIL_TABS.ROOMS && styles.tabTextSelected,
            ]}>
            객실 현황 {availableRooms.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === DETAIL_TABS.RESERVATIONS && styles.tabButtonSelected,
          ]}
          activeOpacity={0.75}
          accessibilityRole="tab"
          accessibilityState={{
            selected: activeTab === DETAIL_TABS.RESERVATIONS,
          }}
          onPress={() => {
            setIsRoomFilterOpen(false);
            setSelectedRoomFilter(null);
            setActiveTab(DETAIL_TABS.RESERVATIONS);
          }}>
          <Text
            style={[
              FONTS.fs_14_medium,
              styles.tabText,
              activeTab === DETAIL_TABS.RESERVATIONS && styles.tabTextSelected,
            ]}>
            예약 내역{' '}
            {selectedRoomFilter
              ? filteredReservations.length
              : reservations.length}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === DETAIL_TABS.ROOMS ? (
        <View style={styles.availabilitySection}>
          <View style={styles.availabilityHeader}>
            <Text style={[FONTS.fs_14_semibold, styles.availabilityTitle]}>
              객실 현황
            </Text>
            <Text style={[FONTS.fs_12_medium, styles.availabilitySummary]}>
              {availabilityReliable
                ? `가능 ${roomStatusSummary.availableCount} · 마감 ${roomStatusSummary.closedCount}`
                : '과거 재고 미제공'}
            </Text>
          </View>
          {availableRooms.length === 0 ? (
            <View style={styles.center}>
              <Text style={[FONTS.fs_14_medium, styles.emptyText]}>
                등록된 객실이 없어요
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.availabilityScroll}
              contentContainerStyle={styles.availabilityContent}
              showsVerticalScrollIndicator={availableRooms.length > 6}>
              {availableRooms.map((room, index) => {
                const isDormitory = room.roomType === 'DORMITORY';
                const isAvailabilityUnknown = room.remainingCapacity == null;
                const isSoldOut =
                  room.isClosed ||
                  room.remainingCapacity === 0 ||
                  (!isDormitory && room.isReserved);
                const statusText = isAvailabilityUnknown
                  ? '재고 미제공'
                  : isDormitory
                  ? `잔여 ${room.remainingCapacity}베드`
                  : isSoldOut
                  ? '마감'
                  : '가능';
                return (
                  <TouchableOpacity
                    key={String(room.roomId)}
                    style={[
                      styles.availabilityRow,
                      index === availableRooms.length - 1 &&
                        styles.availabilityRowLast,
                    ]}
                    activeOpacity={0.72}
                    accessibilityRole="button"
                    accessibilityLabel={`${room.roomName} 예약 내역 보기`}
                    onPress={() => {
                      setIsRoomFilterOpen(false);
                      setSelectedRoomFilter({
                        roomId: room.roomId,
                        roomName: room.roomName,
                      });
                      setActiveTab(DETAIL_TABS.RESERVATIONS);
                    }}>
                    <View style={styles.availabilityRoomInfo}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          styles.availabilityRoomName,
                        ]}
                        numberOfLines={1}>
                        {room.roomName}
                      </Text>
                      <Text style={[FONTS.fs_12_medium, styles.roomTypeText]}>
                        {isDormitory ? '도미토리' : '일반 객실'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.availabilityStatusBadge,
                        isSoldOut
                          ? styles.soldOutStatusBadge
                          : styles.availableStatusBadge,
                      ]}>
                      <Text
                        style={[
                          FONTS.fs_12_semibold,
                          isSoldOut
                            ? styles.soldOutStatusText
                            : styles.availableStatusText,
                        ]}>
                        {statusText}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.roomFilterContainer}>
            <TouchableOpacity
              style={styles.roomFilterSelector}
              activeOpacity={0.72}
              accessibilityRole="button"
              accessibilityState={{expanded: isRoomFilterOpen}}
              onPress={() => setIsRoomFilterOpen(value => !value)}>
              <Text
                style={[FONTS.fs_14_medium, styles.roomFilterSelectorText]}
                numberOfLines={1}>
                {selectedRoomFilter
                  ? `${selectedRoomFilter.roomName} · ${filteredReservations.length}건`
                  : `전체 객실 · ${reservations.length}건`}
              </Text>
              <Text style={[FONTS.fs_14_medium, styles.roomFilterArrow]}>
                {isRoomFilterOpen ? '⌃' : '⌄'}
              </Text>
            </TouchableOpacity>

            {isRoomFilterOpen ? (
              <ScrollView
                style={styles.roomFilterOptions}
                nestedScrollEnabled
                showsVerticalScrollIndicator={availableRooms.length > 4}>
                <TouchableOpacity
                  style={[
                    styles.roomFilterOption,
                    !selectedRoomFilter && styles.roomFilterOptionSelected,
                  ]}
                  activeOpacity={0.72}
                  accessibilityRole="button"
                  onPress={() => {
                    setSelectedRoomFilter(null);
                    setIsRoomFilterOpen(false);
                  }}>
                  <Text
                    style={[
                      FONTS.fs_14_medium,
                      styles.roomFilterOptionText,
                      !selectedRoomFilter &&
                        styles.roomFilterOptionTextSelected,
                    ]}
                    numberOfLines={1}>
                    전체 객실
                  </Text>
                  <Text style={[FONTS.fs_12_medium, styles.roomFilterCount]}>
                    {reservations.length}건
                  </Text>
                </TouchableOpacity>
                {availableRooms.map(room => {
                  const isSelected =
                    String(selectedRoomFilter?.roomId) === String(room.roomId);
                  const reservationCount = reservations.filter(reservation =>
                    isReservationForRoom(reservation, room),
                  ).length;
                  return (
                    <TouchableOpacity
                      key={String(room.roomId)}
                      style={[
                        styles.roomFilterOption,
                        isSelected && styles.roomFilterOptionSelected,
                      ]}
                      activeOpacity={0.72}
                      accessibilityRole="button"
                      onPress={() => {
                        setSelectedRoomFilter({
                          roomId: room.roomId,
                          roomName: room.roomName,
                        });
                        setIsRoomFilterOpen(false);
                      }}>
                      <Text
                        style={[
                          FONTS.fs_14_medium,
                          styles.roomFilterOptionText,
                          isSelected && styles.roomFilterOptionTextSelected,
                        ]}
                        numberOfLines={1}>
                        {room.roomName}
                      </Text>
                      <Text
                        style={[FONTS.fs_12_medium, styles.roomFilterCount]}>
                        {reservationCount}건
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : null}
          </View>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={COLORS.primary_orange} size="small" />
            </View>
          ) : filteredReservations.length === 0 ? (
            <View style={styles.center}>
              <Text style={[FONTS.fs_14_medium, styles.emptyText]}>
                {selectedRoomFilter
                  ? '해당 객실의 예약이 없어요'
                  : '확정된 예약이 없어요'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredReservations}
              keyExtractor={(item, index) =>
                item.unifiedReservationId ??
                `${item.sourceType}-${String(item.id ?? index)}`
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({item}) => {
                const externalSource =
                  item.sourceType === 'EXTERNAL'
                    ? getExternalReservationSource(
                        item.source,
                        item.channelColorKey,
                        item.sourceLabel,
                      )
                    : null;
                const nights = getNights(item.checkInDate, item.checkOutDate);

                return (
                  <TouchableOpacity
                    style={styles.reservationItem}
                    activeOpacity={0.75}
                    onPress={() => handlePressReservation(item)}>
                    <View style={styles.reservationTopRow}>
                      <View
                        style={[
                          styles.sourceBadge,
                          externalSource
                            ? {backgroundColor: externalSource.backgroundColor}
                            : styles.ddakjiSourceBadge,
                        ]}>
                        <Text
                          style={[
                            FONTS.fs_12_medium,
                            externalSource
                              ? {color: externalSource.textColor}
                              : styles.ddakjiSourceText,
                          ]}>
                          {item.sourceLabel}
                        </Text>
                      </View>
                      <Text
                        style={[FONTS.fs_14_semibold, styles.guestName]}
                        numberOfLines={1}>
                        {item.guestName || '예약자명 미입력'}
                      </Text>
                    </View>

                    <Text
                      style={[FONTS.fs_14_medium, styles.roomText]}
                      numberOfLines={1}>
                      {item.roomName}
                      {item.guestCount > 0 ? ` · ${item.guestCount}명` : ''}
                    </Text>
                    <Text style={[FONTS.fs_12_medium, styles.periodText]}>
                      {String(item.checkInDate).replaceAll('-', '.')} ~{' '}
                      {String(item.checkOutDate).replaceAll('-', '.')} ({nights}
                      박)
                    </Text>
                    {item.guestPhone ? (
                      <TouchableOpacity
                        style={styles.phoneRow}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.guestPhone} 복사`}
                        onPress={event =>
                          handleCopyPhone(item.guestPhone, event)
                        }>
                        <Text style={[FONTS.fs_12_medium, styles.phoneText]}>
                          {item.guestPhone}
                        </Text>
                        <Text style={[FONTS.fs_12_medium, styles.copyText]}>
                          복사
                        </Text>
                      </TouchableOpacity>
                    ) : null}
                    {item.memo ? (
                      <View style={styles.memoBox}>
                        <Text
                          style={[FONTS.fs_12_medium, styles.memoText]}
                          numberOfLines={2}>
                          {item.memo}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="외부 예약 등록"
        onPress={() => onAdd(selectedRoomFilter)}>
        <PlusIcon width={22} height={22} />
      </TouchableOpacity>

      <Modal
        visible={Boolean(selectedExternalReservation)}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={closeReservationActionModal}>
        <View style={styles.actionModalOverlay}>
          <Pressable
            style={styles.actionModalBackdrop}
            onPress={closeReservationActionModal}
          />
          <View style={styles.actionModalCard}>
            {isDeleteConfirmVisible ? (
              <>
                <Text style={[FONTS.fs_18_semibold, styles.actionModalTitle]}>
                  예약을 취소할까요?
                </Text>
                <Text style={[FONTS.fs_14_medium, styles.actionModalMessage]}>
                  취소하면 남은 숙박일의 객실 재고가 다시 복구돼요.
                </Text>
                <View style={styles.actionModalButtonRow}>
                  <TouchableOpacity
                    style={[
                      styles.actionModalButton,
                      styles.actionModalCancelButton,
                    ]}
                    activeOpacity={0.75}
                    disabled={isDeleting}
                    onPress={() => setIsDeleteConfirmVisible(false)}>
                    <Text
                      style={[
                        FONTS.fs_14_semibold,
                        styles.actionModalCancelText,
                      ]}>
                      취소
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionModalButton,
                      styles.actionModalDeleteConfirmButton,
                    ]}
                    activeOpacity={0.75}
                    disabled={isDeleting}
                    onPress={handleDeleteExternalReservation}>
                    {isDeleting ? (
                      <ActivityIndicator
                        color={COLORS.grayscale_0}
                        size="small"
                      />
                    ) : (
                      <Text
                        style={[
                          FONTS.fs_14_semibold,
                          styles.actionModalDeleteConfirmText,
                        ]}>
                        예약 취소
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.actionModalHeader}>
                  <View
                    style={[
                      styles.actionModalSourceBadge,
                      {
                        backgroundColor:
                          getExternalReservationSource(
                            selectedExternalReservation?.source,
                            selectedExternalReservation?.channelColorKey,
                            selectedExternalReservation?.sourceLabel,
                          )?.backgroundColor ?? COLORS.grayscale_100,
                      },
                    ]}>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        {
                          color:
                            getExternalReservationSource(
                              selectedExternalReservation?.source,
                              selectedExternalReservation?.channelColorKey,
                              selectedExternalReservation?.sourceLabel,
                            )?.textColor ?? COLORS.grayscale_700,
                        },
                      ]}>
                      {selectedExternalReservation?.sourceLabel || '외부'}
                    </Text>
                  </View>
                  <Text
                    style={[FONTS.fs_18_semibold, styles.actionModalTitle]}
                    numberOfLines={1}>
                    {selectedExternalReservation?.guestName ||
                      '예약자명 미입력'}
                  </Text>
                </View>
                <Text style={[FONTS.fs_14_medium, styles.actionModalRoomText]}>
                  {selectedExternalReservation?.roomName}
                  {selectedExternalReservation?.guestCount > 0
                    ? ` · ${selectedExternalReservation.guestCount}명`
                    : ''}
                </Text>
                <Text
                  style={[FONTS.fs_12_medium, styles.actionModalPeriodText]}>
                  {String(selectedExternalReservation?.checkInDate).replaceAll(
                    '-',
                    '.',
                  )}{' '}
                  ~{' '}
                  {String(selectedExternalReservation?.checkOutDate).replaceAll(
                    '-',
                    '.',
                  )}
                </Text>

                <View style={styles.actionModalActions}>
                  <TouchableOpacity
                    style={styles.actionModalActionButton}
                    activeOpacity={0.72}
                    accessibilityRole="button"
                    accessibilityLabel="외부 예약 수정"
                    onPress={handleEditExternalReservation}>
                    <Text
                      style={[
                        FONTS.fs_14_semibold,
                        styles.actionModalEditText,
                      ]}>
                      예약 수정
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.actionModalActionButton,
                      styles.actionModalDeleteButton,
                    ]}
                    activeOpacity={0.72}
                    accessibilityRole="button"
                    accessibilityLabel="외부 예약 취소"
                    onPress={() => setIsDeleteConfirmVisible(true)}>
                    <Text
                      style={[
                        FONTS.fs_14_semibold,
                        styles.actionModalDeleteText,
                      ]}>
                      예약 취소
                    </Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.actionModalCloseButton}
                  activeOpacity={0.7}
                  onPress={closeReservationActionModal}>
                  <Text
                    style={[FONTS.fs_14_medium, styles.actionModalCloseText]}>
                    닫기
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '86%',
    height: '68%',
    borderRadius: 18,
    backgroundColor: COLORS.grayscale_0,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
  },
  actionModalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  actionModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 20, 28, 0.5)',
  },
  actionModalCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 20,
    backgroundColor: COLORS.grayscale_0,
  },
  actionModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionModalSourceBadge: {
    flexShrink: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
    borderRadius: 14,
  },
  actionModalTitle: {
    flexShrink: 1,
    color: COLORS.grayscale_900,
  },
  actionModalMessage: {
    marginTop: 10,
    marginBottom: 22,
    color: COLORS.grayscale_600,
    lineHeight: 21,
  },
  actionModalRoomText: {
    color: COLORS.grayscale_800,
  },
  actionModalPeriodText: {
    marginTop: 6,
    color: COLORS.grayscale_500,
  },
  actionModalActions: {
    flexDirection: 'row',
    marginTop: 22,
    gap: 10,
  },
  actionModalActionButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.primary_blue,
  },
  actionModalDeleteButton: {
    backgroundColor: '#FFF1F1',
  },
  actionModalEditText: {
    color: COLORS.grayscale_0,
  },
  actionModalDeleteText: {
    color: COLORS.semantic_red,
  },
  actionModalCloseButton: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  actionModalCloseText: {
    color: COLORS.grayscale_500,
  },
  actionModalButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionModalButton: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  actionModalCancelButton: {
    backgroundColor: COLORS.grayscale_100,
  },
  actionModalCancelText: {
    color: COLORS.grayscale_700,
  },
  actionModalDeleteConfirmButton: {
    backgroundColor: COLORS.semantic_red,
  },
  actionModalDeleteConfirmText: {
    color: COLORS.grayscale_0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tabList: {
    height: 42,
    padding: 3,
    marginBottom: 14,
    flexDirection: 'row',
    borderRadius: 10,
    backgroundColor: COLORS.grayscale_100,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabButtonSelected: {
    backgroundColor: COLORS.grayscale_0,
  },
  tabText: {
    color: COLORS.grayscale_500,
  },
  tabTextSelected: {
    color: COLORS.grayscale_900,
  },
  availabilitySection: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 10,
    overflow: 'hidden',
  },
  availabilityHeader: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.grayscale_100,
  },
  availabilityTitle: {
    color: COLORS.grayscale_800,
  },
  availabilitySummary: {
    color: COLORS.grayscale_500,
  },
  availabilityScroll: {
    flex: 1,
  },
  availabilityContent: {
    paddingBottom: 72,
  },
  availabilityRow: {
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  availabilityRowLast: {
    borderBottomWidth: 0,
  },
  availabilityRoomInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },
  availabilityRoomName: {
    color: COLORS.grayscale_800,
  },
  roomTypeText: {
    color: COLORS.grayscale_400,
    marginTop: 2,
  },
  availabilityStatusBadge: {
    minWidth: 66,
    minHeight: 30,
    paddingHorizontal: 9,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availableStatusBadge: {
    backgroundColor: COLORS.secondary_blue,
  },
  availableStatusText: {
    color: COLORS.primary_blue,
  },
  soldOutStatusBadge: {
    backgroundColor: COLORS.secondary_red,
  },
  soldOutStatusText: {
    color: COLORS.semantic_red,
  },
  title: {
    color: COLORS.grayscale_900,
  },
  listContainer: {
    flex: 1,
  },
  roomFilterContainer: {
    marginBottom: 12,
  },
  roomFilterSelector: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  roomFilterSelectorText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.grayscale_700,
  },
  roomFilterArrow: {
    color: COLORS.grayscale_500,
    marginLeft: 8,
  },
  roomFilterOptions: {
    maxHeight: 184,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_0,
  },
  roomFilterOption: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
  },
  roomFilterOptionSelected: {
    backgroundColor: COLORS.secondary_blue,
  },
  roomFilterOptionText: {
    flex: 1,
    minWidth: 0,
    color: COLORS.grayscale_700,
  },
  roomFilterOptionTextSelected: {
    color: COLORS.primary_blue,
  },
  roomFilterCount: {
    color: COLORS.grayscale_500,
    marginLeft: 10,
  },
  listContent: {
    paddingBottom: 72,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 52,
  },
  emptyText: {
    color: COLORS.grayscale_400,
  },
  reservationItem: {
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 10,
  },
  reservationTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceBadge: {
    minWidth: 52,
    minHeight: 28,
    paddingHorizontal: 8,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  ddakjiSourceBadge: {
    backgroundColor: DDAKJI_RESERVATION_SOURCE.backgroundColor,
  },
  ddakjiSourceText: {
    color: DDAKJI_RESERVATION_SOURCE.textColor,
  },
  guestName: {
    flex: 1,
    color: COLORS.grayscale_900,
  },
  roomText: {
    color: COLORS.grayscale_700,
    marginTop: 10,
  },
  periodText: {
    color: COLORS.grayscale_500,
    marginTop: 4,
  },
  phoneRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  phoneText: {
    color: COLORS.grayscale_600,
  },
  copyText: {
    color: COLORS.primary_blue,
    marginLeft: 8,
  },
  memoBox: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: COLORS.grayscale_100,
  },
  memoText: {
    color: COLORS.grayscale_600,
  },
  addButton: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.primary_blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.grayscale_900,
    shadowOpacity: 0.18,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 3},
    elevation: 4,
  },
});

export default IntegratedReservationDayModal;
