import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, PanResponder } from 'react-native';
import Toast from 'react-native-toast-message';

import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import styles from './OpenManagement.styles';

import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import ChevronDown from '@assets/images/chevron_down_black.svg';
import ChevronUp from '@assets/images/chevron_up_black.svg';

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month - 1, 1).getDay();

const OpenManagement = ({ guesthouseId }) => {
  const [rooms, setRooms] = useState([]);
  const [selectedDates, setSelectedDates] = useState(new Set());

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  const currentMonthStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 90);
  const maxDateStr = `${maxDateObj.getFullYear()}-${String(maxDateObj.getMonth() + 1).padStart(2, '0')}-${String(maxDateObj.getDate()).padStart(2, '0')}`;

  const [gridSize, setGridSize] = useState({ width: 0, height: 0 });
  const selectedDatesRef = useRef(new Set());
  const dragModeRef = useRef(null);
  const lastToggledDateRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    selectedDatesRef.current = selectedDates;
  }, [selectedDates]);

  const handleTouchPoint = useCallback((x, y, phase) => {
    if (gridSize.width === 0) return;

    const cellWidth = gridSize.width / 7;
    const cellHeight = cellWidth / 0.7; // From aspectRatio: 0.7

    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);

    if (col < 0 || col > 6 || row < 0) return;

    const index = row * 7 + col;
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const day = index - firstDay + 1;

    if (day < 1 || day > daysInMonth) return;

    const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const isPast = dateStr < todayStr;
    const isTooFar = dateStr > maxDateStr;
    if (isPast || isTooFar) return;

    if (phase === 'start') {
      const isCurrentlySelected = selectedDatesRef.current.has(dateStr);
      const newMode = isCurrentlySelected ? 'deselect' : 'select';
      dragModeRef.current = newMode;
      lastToggledDateRef.current = dateStr;

      setSelectedDates(prev => {
        const next = new Set(prev);
        if (newMode === 'select') next.add(dateStr);
        else next.delete(dateStr);
        return next;
      });
    } else if (phase === 'move') {
      if (dateStr !== lastToggledDateRef.current) {
        lastToggledDateRef.current = dateStr;
        const mode = dragModeRef.current;
        if (!mode) return;

        setSelectedDates(prev => {
          const next = new Set(prev);
          if (mode === 'select') next.add(dateStr);
          else next.delete(dateStr);
          return next;
        });
      }
    }
  }, [gridSize, currentYear, currentMonth, todayStr, maxDateStr]);

  const handleTouchEnd = useCallback(() => {
    dragModeRef.current = null;
    lastToggledDateRef.current = null;
  }, []);

  const panResponder = React.useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      touchStartRef.current = {
        x: evt.nativeEvent.locationX,
        y: evt.nativeEvent.locationY,
      };
      handleTouchPoint(touchStartRef.current.x, touchStartRef.current.y, 'start');
    },
    onPanResponderMove: (evt, gestureState) => {
      const currentX = touchStartRef.current.x + gestureState.dx;
      const currentY = touchStartRef.current.y + gestureState.dy;
      handleTouchPoint(currentX, currentY, 'move');
    },
    onPanResponderRelease: handleTouchEnd,
    onPanResponderTerminate: handleTouchEnd,
  }), [handleTouchPoint, handleTouchEnd]);

  const fetchRooms = useCallback(async () => {
    if (!guesthouseId) return;
    try {
      setIsLoading(true);
      const response = await hostGuesthouseApi.getGuesthouseDetail(guesthouseId);
      const selectedGuesthouse = response?.data?.data ?? response?.data ?? {};
      const rawRooms = Array.isArray(selectedGuesthouse?.roomInfos)
        ? selectedGuesthouse.roomInfos
        : Array.isArray(selectedGuesthouse?.rooms)
        ? selectedGuesthouse.rooms
        : [];

      const validRooms = rawRooms.filter(r => r.roomId != null || r.id != null).map(r => ({
        ...r,
        roomId: r.roomId ?? r.id,
      }));
      setRooms(validRooms);
    } catch (error) {
      console.error('객실 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  }, [guesthouseId]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const fetchCalendarData = useCallback(async (yearMonth) => {
    if (!guesthouseId || rooms.length === 0 || !yearMonth) return;

    try {
      const [year, month] = yearMonth.split('-');
      const from = `${year}-${month}-01`;
      const toInclusive = `${year}-${month}-${getDaysInMonth(year, month)}`;

      const promises = rooms.map(room =>
        hostGuesthouseApi.getRoomInventoryCalendar(guesthouseId, room.roomId, from, toInclusive)
          .catch(e => {
            console.error(`객실 ${room.roomId} 일정 조회 실패:`, e);
            return null;
          })
      );

      const responses = await Promise.all(promises);

      const dataMap = {};

      responses.forEach(res => {
        if (!res) return;
        let payload = res.data?.data ?? res.data;
        let data = Array.isArray(payload) ? payload : payload?.days || payload?.inventories || [];

        data.forEach(item => {
          if (item.date) {
            const isItemClosed = item.isClosed === true || item.status === 'CLOSED';
            if (!dataMap[item.date]) {
              dataMap[item.date] = {
                date: item.date,
                isClosed: isItemClosed
              };
            } else {
              // 하나라도 오픈된 방이 있다면 전체 상태는 오픈(isClosed = false)
              dataMap[item.date].isClosed = dataMap[item.date].isClosed && isItemClosed;
            }
          }
        });
      });

      setCalendarData(prev => ({ ...prev, ...dataMap }));
    } catch (e) {
      console.error('예약 일정 전체 조회 실패:', e);
    }
  }, [guesthouseId, rooms]);

  useEffect(() => {
    if (rooms.length > 0) {
      fetchCalendarData(currentMonthStr);
    }
  }, [rooms, currentMonthStr, fetchCalendarData]);

  const handlePrevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentYear, currentMonth, 1));

  const handleSelectAllMonth = () => {
    const days = getDaysInMonth(currentYear, currentMonth);
    const newDates = new Set(selectedDates);

    let allSelected = true;
    const validMonthDates = [];

    for (let d = 1; d <= days; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isPast = dateStr < todayStr;
      const isTooFar = dateStr > maxDateStr;

      if (!isPast && !isTooFar) {
        validMonthDates.push(dateStr);
        if (!selectedDates.has(dateStr)) {
          allSelected = false;
        }
      }
    }

    if (validMonthDates.length === 0) {
      Toast.show({ type: 'info', text1: '이 달에는 선택할 수 있는 날짜가 없습니다.' });
      return;
    }

    if (allSelected) {
      validMonthDates.forEach(dateStr => newDates.delete(dateStr));
    } else {
      validMonthDates.forEach(dateStr => newDates.add(dateStr));
    }

    setSelectedDates(newDates);
  };

  const handleUpdateStatus = async (nextStatus) => {
    if (selectedDates.size === 0 || rooms.length === 0) return;

    try {
      setIsUpdateLoading(true);
      const datesArray = Array.from(selectedDates);

      const payload = datesArray.map(dateStr => ({
        date: dateStr,
        isClosed: nextStatus === 'CLOSED',
      }));

      await hostGuesthouseApi.updateAllRoomsStatusByDate(guesthouseId, payload);

      Toast.show({
        type: 'success',
        text1: `전체 객실이 예약 ${nextStatus === 'OPEN' ? '오픈' : '마감'} 처리되었습니다.`,
      });
      setSelectedDates(new Set());
      fetchCalendarData(currentMonthStr);
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: '일괄 상태 변경에 실패했습니다.' });
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (isLoading && rooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <ActivityIndicator color={COLORS.primary_orange} />
        </View>
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <Text style={[FONTS.fs_16_semibold, styles.emptyStateTitle]}>등록된 객실이 없습니다</Text>
          <Text style={[FONTS.fs_14_regular, styles.emptyStateDesc]}>객실을 먼저 등록해주세요.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.calendarHeader}>
          <Text style={[FONTS.fs_16_bold, styles.calendarTitle]}>전체 객실 통합 스케줄 달력</Text>
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotOpen]} />
              <Text style={[FONTS.fs_12_bold, styles.legendText]}>예약 오픈</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotClose]} />
              <Text style={[FONTS.fs_12_bold, styles.legendText]}>예약 마감</Text>
            </View>
          </View>
        </View>

        <View style={styles.calendarContainer}>

          <View style={styles.monthSelector}>
            <View style={styles.monthSelectorCenter}>
              <TouchableOpacity onPress={handlePrevMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ChevronLeft width={24} height={24} />
              </TouchableOpacity>
              <Text style={[FONTS.fs_18_bold, styles.monthTitle]}>
                {currentYear}년 {currentMonth}월
              </Text>
              <TouchableOpacity onPress={handleNextMonth} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <ChevronRight width={24} height={24} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAllMonth}>
              <Text style={[FONTS.fs_12_bold, styles.selectAllButtonText]}>이 달 전체 선택</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.weekDaysRow}>
            {['일', '월', '화', '수', '목', '금', '토'].map((d, i) => (
              <View key={d} style={styles.weekDayCell}>
                <Text style={[
                  FONTS.fs_12_bold,
                  styles.weekDayText,
                  i === 0 && styles.weekDayTextSun,
                  i === 6 && styles.weekDayTextSat,
                ]}>{d}</Text>
              </View>
            ))}
          </View>

          <View style={{ position: 'relative' }}>
            <View style={styles.daysGrid}>
              {blanks.map(b => <View key={`blank-${b}`} style={styles.dayCellBlank} />)}
              {days.map(d => {
                const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                const isPast = dateStr < todayStr;
                const isTooFar = dateStr > maxDateStr;
                const isDisabled = isPast || isTooFar;
                const isSelected = selectedDates.has(dateStr);
                const dayInfo = calendarData[dateStr] || {};
                const isClosed = isTooFar || dayInfo.isClosed === true || dayInfo.status === 'CLOSED';
                const isOpen = !isClosed;

                return (
                  <View key={dateStr} style={styles.dayCellWrapper}>
                    <View
                      style={[
                        styles.dayCell,
                        isDisabled ? styles.dayCellDisabled : null,
                        isSelected ? styles.dayCellSelected : null,
                        !isDisabled && !isSelected && isOpen ? styles.dayCellOpen : null,
                        !isDisabled && !isSelected && isClosed ? styles.dayCellClosed : null,
                        isTooFar ? styles.dayCellTooFar : null,
                      ]}
                    >
                      <Text style={[
                        FONTS.fs_14_bold,
                        styles.dayNumberText,
                        isSelected && styles.dayNumberTextSelected,
                        isDisabled && styles.dayNumberTextDisabled,
                      ]}>{d}</Text>
                      <View style={[
                        styles.dayStatusBadge,
                        isTooFar ? styles.dayStatusBadgeTooFar : isOpen ? styles.dayStatusBadgeOpen : styles.dayStatusBadgeClosed,
                      ]}>
                        <Text style={[
                          FONTS.fs_12_bold,
                          styles.dayStatusText,
                          isTooFar ? styles.dayStatusTextTooFar : isOpen ? styles.dayStatusTextOpen : styles.dayStatusTextClosed,
                        ]}>
                          {isOpen && !isTooFar ? '오픈됨' : '마감됨'}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
            <View
              style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }]}
              {...panResponder.panHandlers}
              onLayout={(e) => setGridSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
            />
          </View>
        </View>
      </ScrollView>

      {selectedDates.size > 0 && (
        <View style={styles.actionBar}>
          <View style={styles.actionBarHeader}>
            <Text style={[FONTS.fs_14_bold, styles.actionSelectedText]}>총 {selectedDates.size}개 날짜 선택됨</Text>
            <TouchableOpacity style={styles.deselectButton} onPress={() => setSelectedDates(new Set())}>
              <Text style={[FONTS.fs_12_bold, styles.deselectButtonText]}>선택 취소</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonOpen]}
              disabled={isUpdateLoading}
              onPress={() => handleUpdateStatus('OPEN')}
            >
              {isUpdateLoading ? (
                <ActivityIndicator color={COLORS.primary_blue} size="small" />
              ) : (
                <Text style={[FONTS.fs_14_bold, styles.actionButtonTextOpen]}>전체 객실 오픈</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonClose]}
              disabled={isUpdateLoading}
              onPress={() => handleUpdateStatus('CLOSED')}
            >
              {isUpdateLoading ? (
                <ActivityIndicator color={COLORS.semantic_red} size="small" />
              ) : (
                <Text style={[FONTS.fs_14_bold, styles.actionButtonTextClose]}>전체 객실 마감</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

export default OpenManagement;
