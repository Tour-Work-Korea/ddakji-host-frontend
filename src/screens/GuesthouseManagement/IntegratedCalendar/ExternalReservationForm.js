import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

const parseDateKey = value => {
  const [year, month, day] = String(value).split('-').map(Number);
  return new Date(year, month - 1, day);
};

const formatDateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateLabel = value => String(value).replaceAll('-', '.');

const addDays = (dateKey, days) => {
  const date = parseDateKey(dateKey);
  date.setDate(date.getDate() + days);
  return formatDateKey(date);
};

const getNightsBetween = (checkInDate, checkOutDate) => {
  if (!checkInDate || !checkOutDate) {
    return 1;
  }
  const diff = parseDateKey(checkOutDate) - parseDateKey(checkInDate);
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
};

const formatPhoneNumber = value => {
  const digits = String(value).replace(/\D/g, '').slice(0, 11);

  if (digits.startsWith('02')) {
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 6) {
      return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    }
    const middle = digits.slice(2, -4);
    return `${digits.slice(0, 2)}-${middle}-${digits.slice(-4)}`;
  }

  if (digits.length <= 3) {
    return digits;
  }
  if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  }
  const middle = digits.slice(3, -4);
  return `${digits.slice(0, 3)}-${middle}-${digits.slice(-4)}`;
};

const isValidPhoneNumber = value =>
  !value || /^0\d{1,2}-\d{3,4}-\d{4}$/.test(value);

const toFiniteNumber = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeRoom = room => ({
  roomId: room?.roomId ?? room?.id ?? null,
  roomName: room?.roomName ?? room?.name ?? '객실',
  roomType: room?.roomType ?? '',
  baseCapacity: toFiniteNumber(room?.roomCapacity ?? room?.capacity, 1),
  minCapacity: toFiniteNumber(room?.roomMinCapacity ?? room?.minCapacity, 1),
  maxCapacity: toFiniteNumber(
    room?.roomMaxCapacity ?? room?.maxCapacity ?? room?.roomCapacity,
    1,
  ),
  capacity: toFiniteNumber(
    room?.roomMaxCapacity ?? room?.maxCapacity ?? room?.roomCapacity,
    1,
  ),
});

const isRoomUnavailable = room =>
  room?.isClosed ||
  room?.remainingCapacity === 0 ||
  (room?.roomType !== 'DORMITORY' && room?.isReserved);

const Stepper = ({value, unit, onDecrease, onIncrease}) => (
  <View style={styles.stepper}>
    <TouchableOpacity
      style={styles.stepperButton}
      activeOpacity={0.7}
      onPress={onDecrease}>
      <Text style={[FONTS.fs_20_medium, styles.stepperButtonText]}>−</Text>
    </TouchableOpacity>
    <Text style={[FONTS.fs_16_semibold, styles.stepperValue]}>
      {value}
      {unit}
    </Text>
    <TouchableOpacity
      style={styles.stepperButton}
      activeOpacity={0.7}
      onPress={onIncrease}>
      <Text style={[FONTS.fs_20_medium, styles.stepperButtonText]}>+</Text>
    </TouchableOpacity>
  </View>
);

const ExternalReservationForm = ({
  guesthouseId,
  checkInDate,
  initialRoomId,
  initialReservation,
  bookingChannels,
  roomAvailability,
  onCancel,
  onSave,
}) => {
  const [rooms, setRooms] = useState([]);
  const [isRoomsLoading, setIsRoomsLoading] = useState(true);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [selectedSource, setSelectedSource] = useState(
    () =>
      bookingChannels.find(
        source =>
          String(source.channelId) === String(initialReservation?.channelId) ||
          source.value ===
            (initialReservation?.channelKey ?? initialReservation?.source),
      ) ?? bookingChannels[0],
  );
  const [nights, setNights] = useState(() =>
    getNightsBetween(
      initialReservation?.checkInDate,
      initialReservation?.checkOutDate,
    ),
  );
  const [guestCount, setGuestCount] = useState(() =>
    toFiniteNumber(initialReservation?.guestCount, 1),
  );
  const [guestName, setGuestName] = useState(
    () => initialReservation?.guestName ?? '',
  );
  const [guestPhone, setGuestPhone] = useState(() =>
    formatPhoneNumber(initialReservation?.guestPhone ?? ''),
  );
  const [memo, setMemo] = useState(() => initialReservation?.memo ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [stayCapacity, setStayCapacity] = useState(null);
  const [isCapacityLoading, setIsCapacityLoading] = useState(false);

  useEffect(() => {
    const matchingChannel = bookingChannels.find(
      channel =>
        String(channel.channelId) === String(initialReservation?.channelId) ||
        channel.value ===
          (initialReservation?.channelKey ?? initialReservation?.source),
    );
    setSelectedSource(
      current => matchingChannel ?? current ?? bookingChannels[0],
    );
  }, [bookingChannels, initialReservation]);

  useEffect(() => {
    let isMounted = true;

    const fetchRooms = async () => {
      if (roomAvailability.length > 0) {
        const availableRooms = roomAvailability.filter(
          room =>
            !isRoomUnavailable(room) ||
            (initialReservation &&
              String(room.roomId) === String(initialReservation.roomId)),
        );
        const preferredRoom = availableRooms.find(
          room => String(room.roomId) === String(initialRoomId),
        );
        setRooms(roomAvailability);
        setSelectedRoomId(
          preferredRoom?.roomId ?? availableRooms[0]?.roomId ?? null,
        );
        setIsRoomsLoading(false);
        return;
      }

      setIsRoomsLoading(true);
      try {
        const response = await hostGuesthouseApi.getMyGuesthousesWithRooms();
        const payload = response?.data?.data ?? response?.data ?? [];
        const guesthouses = Array.isArray(payload) ? payload : [];
        const selectedGuesthouse = guesthouses.find(
          item => String(item?.guesthouseId) === String(guesthouseId),
        );
        const nextRooms = Array.isArray(selectedGuesthouse?.rooms)
          ? selectedGuesthouse.rooms
              .map(normalizeRoom)
              .filter(room => room.roomId != null)
          : [];

        if (isMounted) {
          const preferredRoom = nextRooms.find(
            room => String(room.roomId) === String(initialRoomId),
          );
          setRooms(nextRooms);
          setSelectedRoomId(
            preferredRoom?.roomId ?? nextRooms[0]?.roomId ?? null,
          );
        }
      } catch (error) {
        if (isMounted) {
          setRooms([]);
        }
      } finally {
        if (isMounted) {
          setIsRoomsLoading(false);
        }
      }
    };

    fetchRooms();

    return () => {
      isMounted = false;
    };
  }, [guesthouseId, initialReservation, initialRoomId, roomAvailability]);

  const selectedRoom = useMemo(
    () => rooms.find(room => String(room.roomId) === String(selectedRoomId)),
    [rooms, selectedRoomId],
  );
  const selectedDateCapacity =
    selectedRoom?.roomType !== 'DORMITORY' && !selectedRoom?.isClosed
      ? selectedRoom?.maxCapacity
      : selectedRoom?.remainingCapacity > 0
      ? selectedRoom.remainingCapacity
      : selectedRoom?.capacity > 0
      ? selectedRoom.capacity
      : 99;
  const checkOutDate = addDays(checkInDate, nights);
  const maxGuestCount = Math.max(
    1,
    toFiniteNumber(
      stayCapacity == null ? selectedDateCapacity : stayCapacity,
      1,
    ),
  );
  const minGuestCount =
    selectedRoom?.roomType === 'DORMITORY'
      ? 1
      : Math.max(1, toFiniteNumber(selectedRoom?.minCapacity, 1));
  const isPhoneValid = isValidPhoneNumber(guestPhone);
  const canSave =
    Boolean(selectedRoomId) &&
    Boolean(selectedSource?.channelId) &&
    guestCount >= minGuestCount &&
    isPhoneValid &&
    stayCapacity != null &&
    maxGuestCount > 0 &&
    !isCapacityLoading &&
    !isSaving;

  useEffect(() => {
    let isMounted = true;

    const fetchStayCapacity = async () => {
      if (!selectedRoomId) {
        setStayCapacity(null);
        return;
      }

      setIsCapacityLoading(true);
      try {
        const lastStayDate = addDays(checkInDate, nights - 1);
        const response = await hostGuesthouseApi.getRoomInventoryCalendar(
          guesthouseId,
          selectedRoomId,
          checkInDate,
          lastStayDate,
        );
        const payload = response?.data?.data ?? response?.data ?? [];
        const inventories = Array.isArray(payload)
          ? payload
          : payload?.inventories ?? [];
        const isDormitory = selectedRoom?.roomType === 'DORMITORY';
        const capacities = inventories.map(inventory => {
          const serverAvailableCapacity = toFiniteNumber(
            inventory?.availableBeds ?? inventory?.availableQuantity,
            0,
          );
          const isEditingSameRoom =
            initialReservation &&
            String(initialReservation.roomId) === String(selectedRoomId);
          const isPrivateRoomUnavailable =
            !isDormitory &&
            !isEditingSameRoom &&
            (toFiniteNumber(inventory?.reservedBeds, 0) > 0 ||
              serverAvailableCapacity === 0 ||
              inventory?.isClosed === true);

          if (
            inventory?.isClosed ||
            inventory?.isVisible === false ||
            isPrivateRoomUnavailable
          ) {
            return 0;
          }

          if (!isDormitory) {
            return toFiniteNumber(selectedRoom?.capacity, 1);
          }

          return Math.max(
            0,
            serverAvailableCapacity +
              (isEditingSameRoom
                ? toFiniteNumber(initialReservation.guestCount, 0)
                : 0),
          );
        });
        const nextCapacity =
          capacities.length > 0
            ? Math.min(...capacities)
            : selectedDateCapacity;

        if (isMounted) {
          setStayCapacity(toFiniteNumber(nextCapacity, selectedDateCapacity));
        }
      } catch (error) {
        if (isMounted) {
          setStayCapacity(selectedDateCapacity);
        }
      } finally {
        if (isMounted) {
          setIsCapacityLoading(false);
        }
      }
    };

    fetchStayCapacity();

    return () => {
      isMounted = false;
    };
  }, [
    checkInDate,
    guesthouseId,
    initialReservation,
    nights,
    selectedDateCapacity,
    selectedRoom?.capacity,
    selectedRoom?.roomType,
    selectedRoomId,
  ]);

  useEffect(() => {
    const safeGuestCount = toFiniteNumber(guestCount, minGuestCount);
    const nextGuestCount = Math.min(
      Math.max(safeGuestCount, minGuestCount),
      Math.max(minGuestCount, maxGuestCount),
    );
    if (guestCount !== nextGuestCount) {
      setGuestCount(nextGuestCount);
    }
  }, [guestCount, maxGuestCount, minGuestCount]);

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        channelId: selectedSource.channelId,
        roomId: selectedRoom.roomId,
        roomName: selectedRoom.roomName,
        roomType: selectedRoom.roomType,
        roomBaseCapacity: selectedRoom.baseCapacity,
        roomMinCapacity: selectedRoom.minCapacity,
        roomMaxCapacity: selectedRoom.maxCapacity,
        checkInDate,
        checkOutDate,
        guestCount,
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        memo: memo.trim(),
        status: 'CONFIRMED',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          <Text style={[FONTS.fs_18_semibold, styles.title]}>
            외부 예약 {initialReservation ? '수정' : '등록'}
          </Text>
          <Text style={[FONTS.fs_12_medium, styles.description]}>
            선택한 날짜를 체크인 날짜로 등록해요.
          </Text>

          <Text style={[FONTS.fs_14_semibold, styles.label]}>예약 경로</Text>
          <View style={styles.sourceOptionList}>
            {bookingChannels.map(source => {
              const isSelected =
                String(selectedSource?.channelId) === String(source.channelId);
              return (
                <TouchableOpacity
                  key={String(source.channelId)}
                  style={[
                    styles.optionChip,
                    isSelected && {
                      borderColor: source.textColor,
                      backgroundColor: source.backgroundColor,
                    },
                  ]}
                  activeOpacity={0.75}
                  onPress={() => setSelectedSource(source)}>
                  <Text
                    style={[
                      FONTS.fs_14_semibold,
                      styles.optionChipText,
                      isSelected && {color: source.textColor},
                    ]}>
                    {source.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {bookingChannels.length === 0 ? (
              <Text style={[FONTS.fs_12_medium, styles.emptyText]}>
                사용할 수 있는 예약 채널이 없어요.
              </Text>
            ) : null}
          </View>

          <Text style={[FONTS.fs_14_semibold, styles.label]}>객실</Text>
          {isRoomsLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={COLORS.primary_orange} size="small" />
            </View>
          ) : rooms.length === 0 ? (
            <Text style={[FONTS.fs_12_medium, styles.emptyText]}>
              등록 가능한 객실이 없어요.
            </Text>
          ) : (
            <View style={styles.roomList}>
              {rooms.map(room => {
                const isSelected =
                  String(selectedRoomId) === String(room.roomId);
                const isCurrentReservationRoom =
                  initialReservation &&
                  String(room.roomId) === String(initialReservation.roomId);
                const isUnavailable =
                  isRoomUnavailable(room) && !isCurrentReservationRoom;
                return (
                  <TouchableOpacity
                    key={String(room.roomId)}
                    style={[
                      styles.roomOption,
                      isSelected && styles.roomOptionSelected,
                      isUnavailable && styles.roomOptionDisabled,
                    ]}
                    activeOpacity={0.75}
                    disabled={isUnavailable}
                    onPress={() => {
                      setStayCapacity(null);
                      setSelectedRoomId(room.roomId);
                    }}>
                    <Text
                      style={[
                        FONTS.fs_14_medium,
                        styles.roomOptionText,
                        isSelected && styles.roomOptionTextSelected,
                        isUnavailable && styles.roomOptionTextDisabled,
                      ]}
                      numberOfLines={1}>
                      {room.roomName}
                      {room.remainingCapacity != null
                        ? room.roomType === 'DORMITORY'
                          ? ` · 잔여 ${room.remainingCapacity}베드`
                          : isUnavailable
                          ? ' · 마감'
                          : ' · 가능'
                        : ''}
                    </Text>
                    {room.roomType !== 'DORMITORY' ? (
                      <Text
                        style={[
                          FONTS.fs_12_medium,
                          styles.roomCapacityText,
                          isSelected && styles.roomCapacityTextSelected,
                          isUnavailable && styles.roomOptionTextDisabled,
                        ]}>
                        {room.minCapacity > 1
                          ? `최소 ${room.minCapacity}명`
                          : `기준 ${room.baseCapacity}명`}
                        {' · '}최대 {room.maxCapacity}명
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <Text style={[FONTS.fs_14_semibold, styles.label]}>숙박 날짜</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateBox}>
              <Text style={[FONTS.fs_12_medium, styles.dateCaption]}>
                체크인
              </Text>
              <Text style={[FONTS.fs_14_semibold, styles.dateValue]}>
                {formatDateLabel(checkInDate)}
              </Text>
            </View>
            <Text style={[FONTS.fs_16_medium, styles.dateArrow]}>→</Text>
            <View style={styles.dateBox}>
              <Text style={[FONTS.fs_12_medium, styles.dateCaption]}>
                체크아웃
              </Text>
              <Text style={[FONTS.fs_14_semibold, styles.dateValue]}>
                {formatDateLabel(checkOutDate)}
              </Text>
            </View>
          </View>
          <Stepper
            value={nights}
            unit="박"
            onDecrease={() => {
              setStayCapacity(null);
              setNights(value => Math.max(1, value - 1));
            }}
            onIncrease={() => {
              setStayCapacity(null);
              setNights(value => Math.min(30, value + 1));
            }}
          />
          <Text
            style={[
              FONTS.fs_12_medium,
              maxGuestCount > 0
                ? styles.capacityGuideText
                : styles.capacityUnavailableText,
            ]}>
            {isCapacityLoading
              ? '숙박 기간의 남은 인원을 확인하고 있어요.'
              : maxGuestCount > 0
              ? selectedRoom?.roomType === 'DORMITORY'
                ? `숙박 기간 전체에서 최대 ${maxGuestCount}베드까지 가능해요.`
                : '등록하면 해당 객실은 숙박 기간 동안 마감돼요.'
              : '선택한 기간에는 남은 자리가 없어요.'}
          </Text>

          <Text style={[FONTS.fs_14_semibold, styles.label]}>
            {selectedRoom?.roomType === 'DORMITORY'
              ? '인원 (사용 베드 수)'
              : '실제 투숙 인원'}
          </Text>
          {selectedRoom?.roomType !== 'DORMITORY' && selectedRoom ? (
            <Text style={[FONTS.fs_12_medium, styles.guestCapacityText]}>
              {selectedRoom.minCapacity > 1
                ? `최소 ${selectedRoom.minCapacity}명`
                : `기준 ${selectedRoom.baseCapacity}명`}
              {' · '}최대 {selectedRoom.maxCapacity}명
            </Text>
          ) : null}
          <Stepper
            value={guestCount}
            unit="명"
            onDecrease={() =>
              setGuestCount(value => Math.max(minGuestCount, value - 1))
            }
            onIncrease={() =>
              setGuestCount(value => Math.min(maxGuestCount, value + 1))
            }
          />

          <TextInput
            style={[FONTS.fs_14_medium, styles.infoInput]}
            value={guestName}
            onChangeText={setGuestName}
            placeholder="예약자명 (선택)"
            placeholderTextColor={COLORS.grayscale_400}
            maxLength={100}
          />
          <TextInput
            style={[
              FONTS.fs_14_medium,
              styles.infoInput,
              !isPhoneValid && styles.infoInputError,
            ]}
            value={guestPhone}
            onChangeText={value => setGuestPhone(formatPhoneNumber(value))}
            placeholder="예약자 번호 (선택)"
            placeholderTextColor={COLORS.grayscale_400}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            maxLength={13}
          />
          {!isPhoneValid ? (
            <Text style={[FONTS.fs_12_medium, styles.inputErrorText]}>
              올바른 전화번호 형식으로 입력해 주세요.
            </Text>
          ) : null}
          <TextInput
            style={[FONTS.fs_14_medium, styles.infoInput, styles.memoInput]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모 (선택)"
            placeholderTextColor={COLORS.grayscale_400}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.footerButton, styles.cancelButton]}
            activeOpacity={0.75}
            onPress={onCancel}>
            <Text style={[FONTS.fs_14_semibold, styles.cancelButtonText]}>
              취소
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.saveButton,
              !canSave && styles.saveButtonDisabled,
            ]}
            activeOpacity={0.75}
            disabled={!canSave}
            onPress={handleSave}>
            <Text style={[FONTS.fs_14_semibold, styles.saveButtonText]}>
              {isSaving
                ? initialReservation
                  ? '수정 중'
                  : '등록 중'
                : initialReservation
                ? '예약 수정'
                : '예약 등록'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    width: '88%',
    maxHeight: '88%',
  },
  container: {
    maxHeight: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.grayscale_0,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    color: COLORS.grayscale_900,
  },
  description: {
    color: COLORS.grayscale_500,
    marginTop: 4,
    marginBottom: 20,
  },
  label: {
    color: COLORS.grayscale_800,
    marginTop: 18,
    marginBottom: 8,
  },
  optionChip: {
    minWidth: 74,
    minHeight: 38,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.grayscale_200,
    backgroundColor: COLORS.grayscale_0,
  },
  sourceOptionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChipText: {
    color: COLORS.grayscale_500,
  },
  loadingRow: {
    minHeight: 46,
    justifyContent: 'center',
  },
  emptyText: {
    color: COLORS.semantic_red,
  },
  roomList: {
    gap: 8,
  },
  roomOption: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    justifyContent: 'center',
  },
  roomOptionSelected: {
    borderColor: COLORS.primary_blue,
    backgroundColor: COLORS.secondary_blue,
  },
  roomOptionDisabled: {
    backgroundColor: COLORS.grayscale_100,
    opacity: 0.65,
  },
  roomOptionText: {
    color: COLORS.grayscale_700,
  },
  roomOptionTextSelected: {
    color: COLORS.primary_blue,
  },
  roomOptionTextDisabled: {
    color: COLORS.grayscale_400,
  },
  roomCapacityText: {
    color: COLORS.grayscale_500,
    marginTop: 3,
  },
  roomCapacityTextSelected: {
    color: COLORS.primary_blue,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateBox: {
    flex: 1,
    minWidth: 0,
    padding: 10,
    borderRadius: 8,
    backgroundColor: COLORS.grayscale_100,
  },
  dateCaption: {
    color: COLORS.grayscale_500,
  },
  dateValue: {
    color: COLORS.grayscale_800,
    marginTop: 2,
  },
  dateArrow: {
    color: COLORS.grayscale_400,
  },
  stepper: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
  },
  stepperButton: {
    width: 48,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonText: {
    color: COLORS.primary_blue,
  },
  stepperValue: {
    color: COLORS.grayscale_900,
  },
  guestCapacityText: {
    color: COLORS.grayscale_500,
    marginTop: -4,
  },
  infoInput: {
    minHeight: 44,
    marginTop: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    color: COLORS.grayscale_900,
  },
  memoInput: {
    minHeight: 76,
    paddingTop: 12,
    paddingBottom: 12,
  },
  infoInputError: {
    borderColor: COLORS.semantic_red,
  },
  inputErrorText: {
    color: COLORS.semantic_red,
    marginTop: 5,
  },
  capacityGuideText: {
    color: COLORS.grayscale_600,
    marginTop: 6,
  },
  capacityUnavailableText: {
    color: COLORS.semantic_red,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
  },
  footerButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.grayscale_100,
  },
  cancelButtonText: {
    color: COLORS.grayscale_600,
  },
  saveButton: {
    backgroundColor: COLORS.primary_blue,
  },
  saveButtonDisabled: {
    backgroundColor: COLORS.grayscale_300,
  },
  saveButtonText: {
    color: COLORS.grayscale_0,
  },
});

export default ExternalReservationForm;
