import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import AlertModal from '@components/modals/AlertModal';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import styles from './DormitoryBulkBed.styles';

import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import PlusIcon from '@assets/images/plus_black.svg';
import MinusIcon from '@assets/images/minus_black.svg';

const MENU_TOAST_TOP_OFFSET = Platform.OS === 'ios' ? 220 : 190;

const parseDate = (str) => {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const formatDateToISO = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const addDays = (dateStr, days) => {
  const date = parseDate(dateStr);
  date.setDate(date.getDate() + days);
  return formatDateToISO(date);
};

const getKoreanDayOfWeek = (date) => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
};

const formatShortDate = (dateStr) => {
  const d = parseDate(dateStr);
  const m = d.getMonth() + 1;
  const date = d.getDate();
  const day = getKoreanDayOfWeek(d);
  return `${m}.${date}.${day}`;
};

const formatDateRangeStr = (startStr, endStr) => {
  const startDate = parseDate(startStr);
  const endDate = parseDate(endStr);

  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth() + 1;
  const startDay = startDate.getDate();
  const startDayOfWeek = getKoreanDayOfWeek(startDate);

  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth() + 1;
  const endDay = endDate.getDate();
  const endDayOfWeek = getKoreanDayOfWeek(endDate);

  const startFormatted = `${startYear}. ${startMonth}. ${startDay}. ${startDayOfWeek}`;

  if (startYear === endYear) {
    return `${startFormatted} ~ ${endMonth}. ${endDay}. ${endDayOfWeek}`;
  } else {
    return `${startFormatted} ~ ${endYear}. ${endMonth}. ${endDay}. ${endDayOfWeek}`;
  }
};

const getDatesInRange = (startStr, endStr) => {
  const dates = [];
  let curr = parseDate(startStr);
  const end = parseDate(endStr);
  while (curr <= end) {
    const y = curr.getFullYear();
    const m = String(curr.getMonth() + 1).padStart(2, '0');
    const d = String(curr.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

const DormitoryBulkBed = ({ route, navigation }) => {
  const { guesthouseId, rooms = [] } = route?.params || {};

  const todayStr = formatDateToISO(new Date());
  const maxAllowedEnd = addDays(todayStr, 90);

  const initialStartDate = (() => {
    const passed = route?.params?.selectedDate || todayStr;
    const passedDate = parseDate(passed);
    const todayDate = parseDate(todayStr);

    if (passedDate < todayDate) {
      return todayStr;
    }

    const maxStart = addDays(todayStr, 84); // 90 - 6
    if (passedDate > parseDate(maxStart)) {
      return maxStart;
    }
    return passed;
  })();

  const [startDate, setStartDate] = useState(initialStartDate);
  const endDate = addDays(startDate, 6);

  const isPrevDisabled = startDate <= todayStr;
  const isNextDisabled = parseDate(addDays(endDate, 7)) > parseDate(maxAllowedEnd);

  const dateRange = useMemo(() => getDatesInRange(startDate, endDate), [startDate, endDate]);

  const [roomStates, setRoomStates] = useState({});
  const [bulkValues, setBulkValues] = useState({});
  const [isInventoryLoading, setIsInventoryLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    visible: false,
    message: '',
  });
  const [capacityAlertModal, setCapacityAlertModal] = useState({
    visible: false,
    maxCapacity: 0,
  });

  const fetch7DayInventories = useCallback(async () => {
    if (rooms.length === 0 || !startDate || !endDate) {
      return;
    }
    setIsInventoryLoading(true);
    try {
      const results = await Promise.all(
        rooms.map(async room => {
          const roomId = room.roomId || room.id;
          try {
            const response = await hostGuesthouseApi.getRoomInventoryCalendar(
              guesthouseId,
              roomId,
              startDate,
              endDate,
            );
            const payload = response?.data?.data ?? response?.data ?? {};
            const list =
              payload?.inventories ??
              payload?.calendar ??
              payload?.content ??
              (Array.isArray(payload) ? payload : null) ??
              [];
            return { roomId, list };
          } catch (err) {
            console.error(`Error loading inventory for room ${roomId}:`, err);
            return { roomId, list: [] };
          }
        }),
      );

      const nextState = {};
      const initialBulk = {};

      results.forEach(({ roomId, list }) => {
        nextState[roomId] = {};
        const room = rooms.find(r => String(r.roomId || r.id) === String(roomId));
        const roomCap = Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 4);

        // Set default values for 7 dates
        dateRange.forEach(dateStr => {
          nextState[roomId][dateStr] = {
            isOpen: true,
            max: roomCap,
            reservedBeds: 0,
            roomMaxCapacity: Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 4),
          };
        });

        // Overlay actual API inventories
        list.forEach(inv => {
          const dateStr = inv.date;
          if (nextState[roomId][dateStr]) {
            nextState[roomId][dateStr] = {
              isOpen: !inv.isClosed,
              max: Number(inv.availableBeds ?? room?.roomMaxCapacity ?? room?.roomCapacity ?? 0),
              reservedBeds: Number(inv.reservedBeds ?? 0),
              roomMaxCapacity: Number(inv.roomMaxCapacity ?? room?.roomMaxCapacity ?? room?.roomCapacity ?? 0),
            };
          }
        });

        initialBulk[roomId] = {
          max: roomCap,
        };
      });

      setRoomStates(nextState);
      setBulkValues(initialBulk);
    } catch (err) {
      console.error('Failed to load 7-day inventories:', err);
    } finally {
      setIsInventoryLoading(false);
    }
  }, [guesthouseId, rooms, startDate, endDate, dateRange]);

  useEffect(() => {
    fetch7DayInventories();
  }, [fetch7DayInventories]);

  // Handler 1: Toggle Room Booking Status for a specific date (Web updateRoomStatusByDate sync)
  const toggleRoomDateStatus = async (roomId, dateStr) => {
    const room = rooms.find(r => String(r.roomId || r.id) === String(roomId));
    const roomName = room?.name ?? room?.roomName ?? '객실';
    const currentState = roomStates[roomId]?.[dateStr] || { isOpen: true };
    const nextIsOpen = !currentState.isOpen;
    const nextIsClosed = !nextIsOpen;

    // Optimistic UI update
    setRoomStates(prev => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || {}),
        [dateStr]: {
          ...(prev[roomId]?.[dateStr] || {}),
          isOpen: nextIsOpen,
        },
      },
    }));

    try {
      setActionLoading(true);
      await hostGuesthouseApi.updateRoomStatusByDate(guesthouseId, roomId, {
        date: dateStr,
        isClosed: nextIsClosed,
      });

      Toast.show({
        type: 'success',
        text1: nextIsClosed
          ? `'${roomName}' 객실이 예약 마감 처리되었습니다.`
          : `'${roomName}' 객실이 예약 가능 처리되었습니다.`,
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (e) {
      console.error('Toggle status failed', e);
      setErrorModal({ visible: true, message: '상태 변경에 실패했습니다. 다시 시도해 주세요.' });
      fetch7DayInventories(); // Revert on failure
    } finally {
      setActionLoading(false);
    }
  };

  // Handler 2: Edit Bulk Max State for a row in local state
  const handleRowBulkCapacity = (roomId, delta) => {
    setBulkValues(prev => {
      const room = rooms.find(r => String(r.roomId || r.id) === String(roomId));
      const roomCap = Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 4);
      const current = prev[roomId] ?? { max: roomCap };

      if (delta > 0 && current.max >= roomCap) {
        setCapacityAlertModal({
          visible: true,
          maxCapacity: roomCap,
        });
        return prev;
      }

      const nextMax = Math.max(0, current.max + delta);
      return {
        ...prev,
        [roomId]: {
          ...current,
          max: nextMax,
        },
      };
    });
  };

  // Handler 3: Apply Bulk Capacity to 7 days (Web updateAvailableBeds bulk sync)
  const handleApplyRowBulk = async (roomId) => {
    const bulk = bulkValues[roomId];
    if (!bulk) {
      return;
    }
    const room = rooms.find(r => String(r.roomId || r.id) === String(roomId));
    const roomCap = Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 4);
    const roomName = room?.name ?? room?.roomName ?? '객실';

    // Capping the bulk max to roomCap just in case
    const targetMax = Math.min(roomCap, bulk.max);

    // Calculate corrected capacity per day and Optimistic UI update
    const correctedStates = {};
    const bedPayload = dateRange.map(dateStr => {
      const state = roomStates[roomId]?.[dateStr];
      const maxCapacity = state?.roomMaxCapacity || room?.roomMaxCapacity || room?.roomCapacity || 4;
      const reservedBeds = state?.reservedBeds || 0;
      const maxSellableBeds = Math.max(0, maxCapacity - reservedBeds);
      const finalBeds = Math.min(maxSellableBeds, targetMax);

      correctedStates[dateStr] = {
        ...(state || {}),
        max: finalBeds,
      };

      return {
        date: dateStr,
        availableBeds: finalBeds,
      };
    });

    setRoomStates(prev => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || {}),
        ...correctedStates,
      },
    }));

    try {
      setActionLoading(true);
      await hostGuesthouseApi.bulkUpdateAvailableBeds(guesthouseId, roomId, bedPayload);

      Toast.show({
        type: 'success',
        text1: `"${roomName}" 객실의 7일간 잔여 수량이 ${targetMax}개로 변경되었습니다.`,
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (e) {
      console.error('Bulk update failed', e);
      setErrorModal({ visible: true, message: '수량 일괄 대입에 실패했습니다. 다시 시도해 주세요.' });
      fetch7DayInventories(); // Revert on failure
    } finally {
      setActionLoading(false);
    }
  };

  // Handler 4: Edit Single Date Capacity (+/-) (Web updateAvailableBeds sync)
  const handleEditCapacity = async (roomId, dateStr, delta) => {
    const room = rooms.find(r => String(r.roomId || r.id) === String(roomId));
    const roomCap = Number(room?.roomMaxCapacity ?? room?.roomCapacity ?? 4);
    const roomState = roomStates[roomId]?.[dateStr] || { max: 0, reservedBeds: 0, roomMaxCapacity: roomCap };

    const maxCapacity = roomState.roomMaxCapacity || roomCap;
    const reservedBeds = roomState.reservedBeds;
    const maxSellableBeds = Math.max(0, maxCapacity - reservedBeds);

    if (delta > 0 && roomState.max >= maxSellableBeds) {
      setCapacityAlertModal({
        visible: true,
        maxCapacity: maxCapacity,
      });
      return;
    }

    const nextMax = Math.min(maxSellableBeds, Math.max(0, roomState.max + delta));
    if (nextMax === roomState.max) {
      return;
    }

    // Optimistic UI update
    setRoomStates(prev => ({
      ...prev,
      [roomId]: {
        ...(prev[roomId] || {}),
        [dateStr]: {
          ...(prev[roomId]?.[dateStr] || {}),
          max: nextMax,
        },
      },
    }));

    try {
      setActionLoading(true);
      await hostGuesthouseApi.updateAvailableBeds(guesthouseId, roomId, {
        date: dateStr,
        availableBeds: nextMax,
      });

      Toast.show({
        type: 'success',
        text1: `"${room?.name ?? room?.roomName ?? '객실'}" 잔여 베드 수가 ${nextMax}개로 변경되었습니다.`,
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } catch (e) {
      console.error('Update capacity failed', e);
      setErrorModal({ visible: true, message: '수량 변경에 실패했습니다. 다시 시도해 주세요.' });
      fetch7DayInventories(); // Revert on failure
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.screen}>
        <Header title="베드 수 일괄 변경" />

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
          {/* Date Range Selector */}
          <Text style={[FONTS.fs_14_semibold, styles.fieldLabel]}>설정 기간</Text>

          <View style={styles.weekSelectorContainer}>
            <TouchableOpacity
              style={[styles.weekArrowButton, isPrevDisabled && styles.disabledOpacity]}
              onPress={() => !isPrevDisabled && setStartDate(prev => addDays(prev, -7))}
              disabled={isPrevDisabled}
            >
              <ChevronLeft width={20} height={20} color={isPrevDisabled ? COLORS.grayscale_300 : COLORS.primary_blue} />
            </TouchableOpacity>

            <View style={styles.weekSeparator} />

            <View style={styles.weekCenterButton}>
              <Text style={styles.weekText}>
                {formatDateRangeStr(startDate, endDate)}
              </Text>
            </View>

            <View style={styles.weekSeparator} />

            <TouchableOpacity
              style={[styles.weekArrowButton, isNextDisabled && styles.disabledOpacity]}
              onPress={() => !isNextDisabled && setStartDate(prev => addDays(prev, 7))}
              disabled={isNextDisabled}
            >
              <ChevronRight width={20} height={20} color={isNextDisabled ? COLORS.grayscale_300 : COLORS.primary_blue} />
            </TouchableOpacity>
          </View>

          {/* 안내사항 가이드 박스 */}
          <View style={styles.guideBox}>
            <View style={styles.guideBullet} />
            <Text style={[FONTS.fs_14_regular, styles.guideText]}>
              도미토리 객실의 숫자는 <Text style={FONTS.fs_14_semibold}>현재 예약 가능한 잔여 베드 수</Text>를 의미하며, <Text style={FONTS.fs_14_semibold}>일괄 설정 후 [전체 대입]</Text>을 눌러 보이는 7일간의 수량을 한 번에 변경할 수 있습니다.
            </Text>
          </View>

          {/* Web-like scrollable grid table */}
          <View style={styles.tableWrapper}>
            {isInventoryLoading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="small" color={COLORS.primary_orange} />
              </View>
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableScrollView}>
              <View style={styles.table}>
                {/* Headers */}
                <View style={styles.tableHeaderRow}>
                  <View style={[styles.tableHeaderCell, styles.roomInfoCell]}>
                    <Text style={[FONTS.fs_14_bold, styles.headerText]}>객실명</Text>
                  </View>
                  <View style={[styles.tableHeaderCell, styles.bulkCell, styles.bulkHeaderCell]}>
                    <Text style={[FONTS.fs_14_bold, { color: COLORS.primary_blue }]}>일괄 설정</Text>
                  </View>
                  {dateRange.map((dateStr, idx) => {
                    const d = parseDate(dateStr);
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.tableHeaderCell,
                          styles.dailyCell,
                          isWeekend && styles.tableHeaderCellWeekend,
                        ]}
                      >
                        <Text style={[FONTS.fs_12_bold, isWeekend ? styles.headerTextWeekend : styles.headerText]}>
                          {formatShortDate(dateStr)}
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Body Rows */}
                {rooms.map(room => {
                  const roomId = room.roomId || room.id;
                  const roomCap = Number(room.roomMaxCapacity || room.roomCapacity || 4);
                  const bulk = bulkValues[roomId] || { max: roomCap };

                  return (
                    <View key={roomId} style={styles.tableRow}>
                      {/* Room Info */}
                      <View style={[styles.tableCell, styles.roomInfoCell]}>
                        <Text style={[FONTS.fs_14_semibold, styles.roomNameText]} numberOfLines={2}>
                          {room.name ?? room.roomName}
                        </Text>
                        <Text style={[FONTS.fs_11_regular, styles.roomPriceText]}>
                          {room.roomPrice ? `${room.roomPrice.toLocaleString()}원` : ''}
                        </Text>
                      </View>

                      {/* Bulk Config */}
                      <View style={[styles.tableCell, styles.bulkCell, styles.bulkBodyCell]}>
                        <View style={styles.bulkControlRow}>
                          <TouchableOpacity
                            onPress={() => handleRowBulkCapacity(roomId, -1)}
                            disabled={bulk.max <= 0}
                            style={styles.bulkControlBtn}
                          >
                            <Text style={[styles.bulkControlBtnText, bulk.max > 0 && styles.bulkControlBtnTextActive]}>-</Text>
                          </TouchableOpacity>
                          <Text style={[FONTS.fs_14_bold, styles.bulkCountText]}>
                            {bulk.max}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleRowBulkCapacity(roomId, 1)}
                            style={styles.bulkControlBtn}
                          >
                            <Text style={[styles.bulkControlBtnText, styles.bulkControlBtnTextActive]}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.applyBtn}
                          onPress={() => handleApplyRowBulk(roomId)}
                          disabled={actionLoading}
                        >
                          <Text style={[FONTS.fs_11_bold, styles.applyBtnText]}>전체 대입</Text>
                        </TouchableOpacity>
                      </View>

                      {/* 7 Days Status */}
                      {dateRange.map((dateStr, idx) => {
                        const state = roomStates[roomId]?.[dateStr] || { isOpen: true, max: 0 };

                        return (
                          <View key={idx} style={[styles.tableCell, styles.dailyCell]}>
                            {/* Toggle Switch */}
                            <Switch
                              value={state.isOpen}
                              onValueChange={() => toggleRoomDateStatus(roomId, dateStr)}
                              disabled={actionLoading}
                              trackColor={{
                                false: COLORS.grayscale_300,
                                true: COLORS.primary_blue,
                              }}
                              thumbColor={COLORS.grayscale_0}
                              style={styles.switchStyle}
                            />

                            {/* Daily Capacity Control */}
                            <View style={[styles.cellControlRow, !state.isOpen && styles.disabledOpacity]}>
                              <TouchableOpacity
                                onPress={() => handleEditCapacity(roomId, dateStr, -1)}
                                disabled={!state.isOpen || state.max <= 0 || actionLoading}
                                style={[styles.cellControlBtn, (state.max <= 0 || !state.isOpen) && styles.disabledOpacity]}
                              >
                                <MinusIcon width={10} height={10} />
                              </TouchableOpacity>
                              <Text style={[FONTS.fs_12_bold, styles.cellCountText]}>
                                {state.max}
                              </Text>
                              <TouchableOpacity
                                onPress={() => handleEditCapacity(roomId, dateStr, 1)}
                                disabled={!state.isOpen || actionLoading}
                                style={styles.cellControlBtn}
                              >
                                <PlusIcon width={10} height={10} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      <AlertModal
        visible={errorModal.visible}
        message={errorModal.message}
        buttonText="확인"
        onPress={() => {
          setErrorModal({ visible: false, message: '' });
          fetch7DayInventories();
        }}
      />
      <AlertModal
        visible={capacityAlertModal.visible}
        message={`해당 객실의 최대 베드 수는 ${capacityAlertModal.maxCapacity}개입니다.\n${capacityAlertModal.maxCapacity} 이하로 설정해 주세요.`}
        buttonText="확인"
        onPress={() => {
          setCapacityAlertModal({ visible: false, maxCapacity: 0 });
        }}
      />
    </View>
  );
};

export default DormitoryBulkBed;
