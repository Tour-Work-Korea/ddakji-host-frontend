import React, { useState, useEffect, useCallback } from 'react';
import {
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';

import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';
import hostGuesthouseApi from '@utils/api/hostGuesthouseApi';

import XIcon from '@assets/images/x_gray.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import AlertModal from '@components/modals/AlertModal';

const formatPrice = (price) => {
  if (!price) return '';
  return Number(price).toLocaleString('ko-KR');
};

const toastConfig = {
  success: (props) => <BasicToast {...props} />,
};

const MIN_ROOM_PRICE = 10000;
const PRICE_FIELD_LABELS = {
  weekdayPrice: '주중',
  fridayPrice: '금요일',
  saturdayPrice: '토요일',
  sundayPrice: '일요일',
};

const SEASON_COLORS = {
  SEASON_1: COLORS.secondary_yellow,
  SEASON_2: COLORS.secondary_blue,
  SEASON_3: COLORS.secondary_red,
  SEASON_4: COLORS.secondary_green,
  SEASON_5: COLORS.secondary_khaki,
};

const getSeasonColor = (seasonColorKey) => {
  if (!seasonColorKey) return 'transparent';
  return SEASON_COLORS[seasonColorKey] || COLORS.grayscale_200;
};

const getPriceNumber = value => parseInt(String(value || '').replace(/[^0-9]/g, '') || 0, 10);

const RoomPriceModal = ({ visible, onClose, room, guesthouseId }) => {
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [inputPrice, setInputPrice] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'season'

  // Backend state
  const [calendarData, setCalendarData] = useState({});
  const [seasons, setSeasons] = useState([]);

  const [datePickerConfig, setDatePickerConfig] = useState({ visible: false, targetIndex: null, targetField: null, currentDate: '' });
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', onConfirm: null });
  const manualPrice = getPriceNumber(inputPrice);
  const isManualPriceTooLow = inputPrice.length > 0 && manualPrice < MIN_ROOM_PRICE;
  const canApplyManualPrice =
    selectedDates.size > 0 && inputPrice.length > 0 && !isManualPriceTooLow;
  const invalidSeasonPrice = seasons.find(season =>
    Object.keys(PRICE_FIELD_LABELS).some(field => getPriceNumber(season[field]) < MIN_ROOM_PRICE),
  );
  const canSaveSeasons = seasons.length === 0 || !invalidSeasonPrice;

  const dismissKeyboard = useCallback(() => {
    if (Platform.OS === 'ios') {
      Keyboard.dismiss();
    }
  }, []);

  const handleClose = useCallback(() => {
    dismissKeyboard();
    onClose?.();
  }, [dismissKeyboard, onClose]);

  const showAlert = (title, message, onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, onConfirm });
  };

  const fetchCalendarData = useCallback(async (yearMonth) => {
    if (!guesthouseId || !room?.roomId || !yearMonth) return;
    try {
      const res = await hostGuesthouseApi.getRoomPricingCalendar(guesthouseId, room.roomId, yearMonth);
      console.log(`[API Response] 캘린더 데이터 (${yearMonth}):`, res.data);
      let payload = res.data?.data ?? res.data;
      let data = payload?.days; // Extract the 'days' array
      if (!Array.isArray(data)) data = [];
      
      const dataMap = {};
      data.forEach(item => {
        dataMap[item.date] = item;
      });
      setCalendarData(prev => ({ ...prev, ...dataMap }));
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: '요금 달력을 불러오지 못했습니다.', position: 'top' });
    }
  }, [guesthouseId, room?.roomId]);

  const fetchSeasonsData = useCallback(async () => {
    if (!guesthouseId || !room?.roomId) return;
    try {
      const res = await hostGuesthouseApi.getRoomPricingSeasons(guesthouseId, room.roomId);
      console.log(`[API Response] 시즌 데이터:`, res.data);
      let data = res.data?.data ?? res.data;
      if (!Array.isArray(data)) data = [];
      
      // Assign local _key for UI rendering purposes
      setSeasons(data.map((s, idx) => ({ ...s, _key: `season_${idx}_${Date.now()}` })));
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: '시즌 정보를 불러오지 못했습니다.', position: 'top' });
    }
  }, [guesthouseId, room?.roomId]);

  // 초기화 및 데이터 로딩
  useEffect(() => {
    if (visible && room) {
      setActiveTab('calendar');
      setSelectedDates(new Set());
      setInputPrice('');
      setCalendarData({});
      setSeasons([]);
      
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      setCurrentMonth(`${y}-${m}`);
      fetchCalendarData(`${y}-${m}`);
      
      // Load next month as well just in case
      const nextMonth = new Date(today);
      nextMonth.setMonth(today.getMonth() + 1);
      const ny = nextMonth.getFullYear();
      const nm = String(nextMonth.getMonth() + 1).padStart(2, '0');
      fetchCalendarData(`${ny}-${nm}`);
    }
  }, [visible, room, fetchCalendarData]);

  useEffect(() => {
    if (activeTab === 'season' && visible) {
      fetchSeasonsData();
    }
  }, [activeTab, visible, fetchSeasonsData]);

  const handleMonthChange = (date) => {
    const y = date.year;
    const m = String(date.month).padStart(2, '0');
    setCurrentMonth(`${y}-${m}`);
    fetchCalendarData(`${y}-${m}`);
  };

  const handleDayPress = (day) => {
    const dateStr = day.dateString;
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const handleApplyPrice = async () => {
    if (!canApplyManualPrice) {
      return;
    }
    if (selectedDates.size === 0) return;

    const payload = Array.from(selectedDates).map(date => ({
      date,
      price: manualPrice,
    }));
    
    console.log(`[API Request] 수동 요금 적용 (payload):`, payload);

    try {
      const res = await hostGuesthouseApi.updateRoomManualPriceOverrides(guesthouseId, room.roomId, payload);
      console.log(`[API Response] 수동 요금 적용 결과:`, res.data);
      Toast.show({ type: 'success', text1: '선택한 날짜의 요금이 변경되었습니다.', position: 'top' });
      setSelectedDates(new Set());
      setInputPrice('');
      
      // Refresh current month
      if (currentMonth) {
        fetchCalendarData(currentMonth);
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: '요금 변경에 실패했습니다.', position: 'top' });
    }
  };

  const handleClearManualPrice = async () => {
    if (selectedDates.size === 0) return;
    
    // Only clear if the selected dates have manual overrides
    const payload = { dates: Array.from(selectedDates) };

    console.log(`[API Request] 수동 요금 해제 (payload):`, payload);

    try {
      const res = await hostGuesthouseApi.clearRoomManualPriceOverrides(guesthouseId, room.roomId, payload);
      console.log(`[API Response] 수동 요금 해제 결과:`, res.data);
      Toast.show({ type: 'success', text1: '수동 요금 변경이 해제되었습니다.', position: 'top' });
      setSelectedDates(new Set());
      
      // Refresh current month
      if (currentMonth) {
        fetchCalendarData(currentMonth);
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: '요금 변경 해제에 실패했습니다.', position: 'top' });
    }
  };

  // --- 시즌 탭 관련 로직 ---
  const handleAddSeason = () => {
    if (seasons.length >= 5) {
      showAlert('알림', '시즌은 최대 5개까지만 등록할 수 있습니다.');
      return;
    }

    setSeasons(prev => [
      ...prev,
      {
        _key: `CUSTOM_${Date.now()}`,
        name: `새 시즌 ${prev.length + 1}`,
        startDate: '',
        endDate: '',
        weekdayPrice: '',
        fridayPrice: '',
        saturdayPrice: '',
        sundayPrice: '',
      }
    ]);
  };

  const handleRemoveSeason = (indexToRemove) => {
    setSeasons(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const updateSeasonField = (index, field, val) => {
    setSeasons(prev => prev.map((s, idx) => idx === index ? { ...s, [field]: val } : s));
  };

  const handleOpenDate = (index, field, currentVal) => {
    dismissKeyboard();
    setDatePickerConfig({ visible: true, targetIndex: index, targetField: field, currentDate: currentVal });
  };

  const handleSaveSeasons = async () => {
    // 1. 유효성 검사
    const validSeasons = [];
    for (const season of seasons) {
      if (!season.name || !season.startDate || !season.endDate) {
        showAlert('입력 오류', '모든 시즌의 이름과 기간을 입력해주세요.');
        return;
      }
      const start = new Date(season.startDate);
      const end = new Date(season.endDate);
      if (start > end) {
        showAlert('기간 오류', `${season.name}의 시작일이 종료일보다 늦습니다.`);
        return;
      }
      validSeasons.push({ name: season.name, start, end });
    }

    if (!canSaveSeasons) {
      return;
    }

    for (let i = 0; i < validSeasons.length; i++) {
      for (let j = i + 1; j < validSeasons.length; j++) {
        const a = validSeasons[i];
        const b = validSeasons[j];
        if (a.start <= b.end && b.start <= a.end) {
          showAlert('기간 중복 오류', `${a.name}와 ${b.name}의 기간이 겹칩니다.\n서로 중복되지 않게 설정해주세요.`);
          return;
        }
      }
    }

    const payload = seasons.map(s => ({
      name: s.name,
      startDate: s.startDate,
      endDate: s.endDate,
      weekdayPrice: parseInt(s.weekdayPrice || 0, 10),
      fridayPrice: parseInt(s.fridayPrice || 0, 10),
      saturdayPrice: parseInt(s.saturdayPrice || 0, 10),
      sundayPrice: parseInt(s.sundayPrice || 0, 10),
    }));

    console.log(`[API Request] 시즌 데이터 저장 (payload):`, payload);

    try {
      const res = await hostGuesthouseApi.updateRoomPricingSeasons(guesthouseId, room.roomId, payload);
      console.log(`[API Response] 시즌 데이터 저장 결과:`, res.data);
      Toast.show({ type: 'success', text1: '시즌 요금이 서버에 반영되었습니다.', position: 'top' });
      // Refresh data
      if (currentMonth) {
        fetchCalendarData(currentMonth);
      }
      fetchSeasonsData();
      setActiveTab('calendar');
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: '시즌 저장에 실패했습니다.', position: 'top' });
    }
  };

  const renderSeasonTab = () => {
    return (
      <ScrollView contentContainerStyle={styles.seasonScrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.seasonSection}>
          <Text style={[FONTS.fs_18_semibold, styles.seasonSectionTitle]}>시즌 등록</Text>
          <View style={styles.seasonTable}>
            <View style={[styles.seasonTableRow, { backgroundColor: COLORS.grayscale_100 }]}>
              <Text style={[FONTS.fs_14_medium, styles.seasonTableHeader, { width: 70 }]}>기간명</Text>
              <Text style={[FONTS.fs_14_medium, styles.seasonTableHeader, { flex: 1, textAlign: 'center' }]}>기간</Text>
            </View>

            {seasons.map((season, index) => (
              <View style={styles.seasonTableRow} key={season._key}>
                <TextInput
                  style={[FONTS.fs_14_medium, { width: 70, color: COLORS.grayscale_900, padding: 0 }]}
                  value={season.name}
                  onChangeText={(text) => updateSeasonField(index, 'name', text)}
                  placeholder="시즌명"
                  placeholderTextColor={COLORS.grayscale_400}
                />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TouchableOpacity
                    style={styles.seasonDateInput}
                    onPress={() => handleOpenDate(index, 'startDate', season.startDate)}
                  >
                    <Text style={[FONTS.fs_12_medium, { color: season.startDate ? COLORS.grayscale_900 : COLORS.grayscale_400 }]}>
                      {season.startDate ? season.startDate.replace(/-/g, '. ') : 'YY.MM.DD'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ color: COLORS.grayscale_500 }}>-</Text>
                  <TouchableOpacity
                    style={styles.seasonDateInput}
                    onPress={() => handleOpenDate(index, 'endDate', season.endDate)}
                  >
                    <Text style={[FONTS.fs_12_medium, { color: season.endDate ? COLORS.grayscale_900 : COLORS.grayscale_400 }]}>
                      {season.endDate ? season.endDate.replace(/-/g, '. ') : 'YY.MM.DD'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleRemoveSeason(index)} style={{ padding: 4 }}>
                    <Text style={[FONTS.fs_12_medium, { color: COLORS.semantic_red }]}>삭제</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.addSeasonBtn} onPress={handleAddSeason} activeOpacity={0.8}>
            <Text style={[FONTS.fs_14_semibold, styles.addSeasonBtnText]}>+ 시즌 추가</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.seasonSection}>
          <Text style={[FONTS.fs_18_semibold, styles.seasonSectionTitle]}>객실 가격</Text>
          <View style={styles.priceMatrixTable}>
            <View style={[styles.priceMatrixRow, { backgroundColor: COLORS.grayscale_100 }]}>
              <Text style={[FONTS.fs_14_medium, styles.seasonTableHeader, { width: 60, textAlign: 'center' }]}>요금</Text>
              <Text style={[FONTS.fs_14_medium, styles.seasonTableHeader, { flex: 1, textAlign: 'center' }]}>주중</Text>
              <Text style={[FONTS.fs_14_medium, styles.seasonTableHeader, { flex: 1, textAlign: 'center' }]}>금요일</Text>
              <Text style={[FONTS.fs_14_medium, styles.seasonTableHeader, { flex: 1, textAlign: 'center' }]}>토요일</Text>
              <Text style={[FONTS.fs_14_medium, styles.seasonTableHeader, { flex: 1, textAlign: 'center' }]}>일요일</Text>
            </View>

            {seasons.map((season, index) => (
              <View style={styles.priceMatrixRow} key={`price_${season._key}`}>
                <Text style={[FONTS.fs_14_medium, { width: 60, color: COLORS.grayscale_900, textAlign: 'center' }]} numberOfLines={1}>{season.name}</Text>

                {['weekdayPrice', 'fridayPrice', 'saturdayPrice', 'sundayPrice'].map(field => (
                  <View style={{ flex: 1, paddingHorizontal: 2 }} key={field}>
                    <View style={styles.matrixInputWrap}>
                      <TextInput
                        style={[FONTS.fs_12_medium, styles.matrixInput]}
                        keyboardType="numeric"
                        value={season[field] ? formatPrice(season[field]) : ''}
                        onChangeText={(t) => updateSeasonField(index, field, t.replace(/[^0-9]/g, ''))}
                        placeholder="0"
                        placeholderTextColor={COLORS.grayscale_400}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {!canSaveSeasons && (
          <Text style={[FONTS.fs_12_medium, styles.priceErrorText]}>
            시즌별 모든 요금은 10,000원 이상 입력해 주세요.
          </Text>
        )}
        <TouchableOpacity
          style={[styles.applyAllBtn, !canSaveSeasons && styles.applyAllBtnDisabled]}
          onPress={handleSaveSeasons}
          disabled={!canSaveSeasons}
          activeOpacity={0.8}>
          <Text style={[FONTS.fs_16_semibold, { color: COLORS.grayscale_0 }]}>반영하기</Text>
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  const renderSeasonDatePickerModal = () => {
    if (!datePickerConfig.visible) return null;
    return (
      <Modal visible transparent animationType="fade">
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => setDatePickerConfig({ ...datePickerConfig, visible: false })}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
          <View style={[styles.modalContainer, { height: 460 }]}>
            <View style={styles.header}>
              <Text style={[FONTS.fs_18_semibold, styles.title]}>날짜 선택</Text>
              <TouchableOpacity onPress={() => setDatePickerConfig({ ...datePickerConfig, visible: false })} style={styles.closeBtn}>
                <XIcon width={24} height={24} />
              </TouchableOpacity>
            </View>
            <Calendar
              {...CALENDAR_COMMON_PROPS}
              theme={CALENDAR_THEME}
              renderArrow={(direction) => (
                direction === 'left'
                  ? <ChevronLeft width={20} height={20} color={COLORS.grayscale_400} />
                  : <ChevronRight width={20} height={20} color={COLORS.grayscale_400} />
              )}
              onDayPress={(day) => {
                updateSeasonField(datePickerConfig.targetIndex, datePickerConfig.targetField, day.dateString);
                setDatePickerConfig({ ...datePickerConfig, visible: false });
              }}
              markedDates={datePickerConfig.currentDate ? {
                [datePickerConfig.currentDate]: { selected: true, selectedColor: COLORS.primary_orange }
              } : {}}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const renderHeader = (date) => {
    const d = new Date(date);
    return (
      <View style={styles.calendarHeader}>
        <Text style={[FONTS.fs_16_semibold, styles.calendarHeaderText]}>
          {`${d.getFullYear()}년 ${d.getMonth() + 1}월`}
        </Text>
      </View>
    );
  };

  const renderDay = ({ date, state }) => {
    if (!date) return <View style={styles.dayCellContainer} />;

    const dateStr = date.dateString;
    const isSelected = selectedDates.has(dateStr);

    const d = new Date(dateStr);
    const dayOfWeek = d.getDay();
    const isLeftmost = dayOfWeek === 1; // 1 = Monday
    const isRightmost = dayOfWeek === 0; // 0 = Sunday

    const prevDate = new Date(d); prevDate.setDate(d.getDate() - 1);
    const nextDate = new Date(d); nextDate.setDate(d.getDate() + 1);
    const fmt = (dt) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    };
    const isSelectedPrev = selectedDates.has(fmt(prevDate));
    const isSelectedNext = selectedDates.has(fmt(nextDate));

    const extendLeft = isSelected && isSelectedPrev && !isLeftmost;
    const extendRight = isSelected && isSelectedNext && !isRightmost;

    const dayInfo = calendarData[dateStr] || {};
    const dayPrice = dayInfo.effectivePrice || '';
    
    // UI 배경색: source가 SEASON이거나 seasonColorKey가 있으면 해당 시즌 색상
    let bgColor = 'transparent';
    if (dayInfo.seasonColorKey) {
      bgColor = getSeasonColor(dayInfo.seasonColorKey);
    }

    const radiusStyle = {
      borderTopLeftRadius: extendLeft ? 0 : 12,
      borderBottomLeftRadius: extendLeft ? 0 : 12,
      borderTopRightRadius: extendRight ? 0 : 12,
      borderBottomRightRadius: extendRight ? 0 : 12,
    };

    return (
      <View style={styles.dayCellContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => handleDayPress(date)}
          style={[
            styles.dayCell,
            radiusStyle,
            { backgroundColor: bgColor },
            isSelected && styles.dayCellSelectedModified 
          ]}
        >
          <Text style={[
            FONTS.fs_14_semibold,
            styles.dayNumber,
            isSelected && styles.dayNumberSelected
          ]}>
            {date.day}
          </Text>
          {dayPrice ? (
            <Text style={[FONTS.fs_12_medium, styles.dayPrice, isSelected && styles.dayNumberSelected]}>
              {formatPrice(dayPrice)}
            </Text>
          ) : null}
          {dayInfo.isManualOverride && (
            <View style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 5,
              height: 5,
              borderRadius: 3,
              backgroundColor: COLORS.primary_orange,
              zIndex: 10,
            }} />
          )}
        </TouchableOpacity>
        {isSelected && (
          <View pointerEvents="none" style={[
            styles.selectionConnector,
            radiusStyle,
            {
              left: extendLeft ? -10 : 0,
              right: extendRight ? -10 : 0,
              borderLeftWidth: extendLeft ? 0 : 2,
              borderRightWidth: extendRight ? 0 : 2,
              zIndex: 2,
            }
          ]} />
        )}
      </View>
    );
  };

  // Derive unique seasons for the legend based on current month calendarData
  const activeSeasonLegends = Array.from(
    new Map(
      Object.values(calendarData)
        .filter(d => d.seasonColorKey && d.seasonName)
        .map(d => [d.seasonColorKey, { colorKey: d.seasonColorKey, name: d.seasonName }])
    ).values()
  ).sort((a, b) => a.colorKey.localeCompare(b.colorKey));

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
            <View style={styles.dismissKeyboardArea}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[FONTS.fs_18_semibold, styles.title]} numberOfLines={1}>
                  {room?.name ?? '객실명 없음'}
                </Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <XIcon width={24} height={24} />
                </TouchableOpacity>
              </View>

              <View style={styles.tabRow}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'calendar' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('calendar')}
                >
                  <Text style={[FONTS.fs_16_medium, activeTab === 'calendar' ? styles.tabTextActive : styles.tabText]}>달력</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'season' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('season')}
                >
                  <Text style={[FONTS.fs_16_medium, activeTab === 'season' ? styles.tabTextActive : styles.tabText]}>시즌 설정</Text>
                </TouchableOpacity>
              </View>

              {activeTab === 'calendar' ? (
                <>
                  {/* Season Legend */}
                  <View style={styles.legendContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16, alignItems: 'center', paddingHorizontal: 20 }}>
                      {activeSeasonLegends.map(s => (
                        <View style={styles.legendItem} key={`legend_${s.colorKey}`}>
                          <View style={[styles.legendColorBox, { backgroundColor: getSeasonColor(s.colorKey) }]} />
                          <Text style={[FONTS.fs_12_medium, styles.legendText]}>{s.name}</Text>
                        </View>
                      ))}
                      <View style={styles.legendItem}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary_orange }} />
                        <Text style={[FONTS.fs_12_medium, styles.legendText]}>요금 수동 변경</Text>
                      </View>
                    </ScrollView>
                  </View>

                  {/* Calendar */}
                  <Calendar
                    {...CALENDAR_COMMON_PROPS}
                    onMonthChange={handleMonthChange}
                    dayComponent={renderDay}
                    renderHeader={renderHeader}
                    theme={{
                      ...CALENDAR_THEME,
                      'stylesheet.calendar.header': {
                        dayTextAtIndex0: { color: COLORS.grayscale_400 },
                        dayTextAtIndex1: { color: COLORS.grayscale_400 },
                        dayTextAtIndex2: { color: COLORS.grayscale_400 },
                        dayTextAtIndex3: { color: COLORS.grayscale_400 },
                        dayTextAtIndex4: { color: COLORS.grayscale_400 },
                        dayTextAtIndex5: { color: COLORS.grayscale_400 },
                        dayTextAtIndex6: { color: COLORS.grayscale_400 },
                      },
                    }}
                    renderArrow={(direction) => (
                      direction === 'left'
                        ? <ChevronLeft width={20} height={20} color={COLORS.grayscale_400} />
                        : <ChevronRight width={20} height={20} color={COLORS.grayscale_400} />
                    )}
                    style={styles.calendarStyle}
                  />

                  {/* Bottom Action Bar for Setting Price */}
                  {selectedDates.size > 0 && (
                    <View style={styles.bottomBar}>
                      <View style={styles.bottomBarTopRow}>
                        <Text style={[FONTS.fs_14_medium, styles.selectedCountText]}>
                          {selectedDates.size}개 날짜 선택됨
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 16 }}>
                          {Array.from(selectedDates).some(date => calendarData[date]?.isManualOverride) && (
                            <TouchableOpacity onPress={handleClearManualPrice}>
                              <Text style={[FONTS.fs_14_medium, styles.cancelText, { color: COLORS.semantic_red }]}>수동 해제</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity onPress={() => setSelectedDates(new Set())}>
                            <Text style={[FONTS.fs_14_medium, styles.cancelText]}>선택 해제</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View style={styles.priceInputRow}>
                        <View style={styles.inputWrap}>
                          <Text style={[FONTS.fs_14_medium, styles.wonText]}>₩</Text>
                          <TextInput
                            style={[FONTS.fs_16_medium, styles.priceInput]}
                            placeholder="새로운 요금 입력"
                            placeholderTextColor={COLORS.grayscale_400}
                            keyboardType="numeric"
                            value={inputPrice ? formatPrice(inputPrice) : ''}
                            onChangeText={(t) => setInputPrice(t.replace(/[^0-9]/g, ''))}
                          />
                        </View>
                        <TouchableOpacity
                          style={[styles.applyBtn, !canApplyManualPrice && styles.applyBtnDisabled]}
                          onPress={handleApplyPrice}
                          disabled={!canApplyManualPrice}
                          activeOpacity={0.8}
                        >
                          <Text style={[FONTS.fs_14_medium, styles.applyBtnText]}>요금 적용</Text>
                        </TouchableOpacity>
                      </View>
                      {isManualPriceTooLow && (
                        <Text style={[FONTS.fs_12_medium, styles.priceErrorText]}>
                          1박 요금은 10,000원 이상 입력해 주세요.
                        </Text>
                      )}
                    </View>
                  )}
                </>
              ) : (
                renderSeasonTab()
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
      {renderSeasonDatePickerModal()}
      <AlertModal
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttonText="확인"
        onPress={() => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (alertConfig.onConfirm) alertConfig.onConfirm();
        }}
      />
      <Toast config={toastConfig} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.modal_background,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    height: '92%',
    backgroundColor: COLORS.grayscale_0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    paddingTop: 8,
  },
  dismissKeyboardArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  title: {
    color: COLORS.grayscale_900,
    maxWidth: '70%',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_200,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary_orange,
  },
  tabText: {
    color: COLORS.grayscale_500,
  },
  tabTextActive: {
    color: COLORS.primary_orange,
  },
  seasonScrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  seasonSection: {
    marginBottom: 32,
  },
  seasonSectionTitle: {
    color: COLORS.grayscale_900,
    marginBottom: 16,
  },
  addSeasonBtn: {
    marginTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#FFF4F0',
    borderRadius: 12,
  },
  addSeasonBtnText: {
    color: COLORS.primary_orange,
  },
  seasonTable: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  seasonTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_100,
  },
  seasonTableHeader: {
    color: COLORS.grayscale_600,
  },
  seasonDateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 6,
  },
  priceMatrixTable: {
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  priceMatrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayscale_100,
  },
  matrixInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 6,
    paddingHorizontal: 6,
    height: 36,
    backgroundColor: COLORS.grayscale_0,
  },
  matrixInput: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 4,
    color: COLORS.grayscale_900,
    textAlign: 'right',
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    color: COLORS.grayscale_700,
  },
  applyAllBtn: {
    backgroundColor: COLORS.primary_orange,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  applyAllBtnDisabled: {
    backgroundColor: COLORS.grayscale_300,
  },
  calendarStyle: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
  calendarHeader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarHeaderText: {
    color: COLORS.grayscale_900,
  },
  dayCellContainer: {
    width: 46,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  selectionConnector: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderColor: COLORS.primary_orange,
    borderTopWidth: 2,
    borderBottomWidth: 2,
  },
  dayCell: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  dayCellSelectedModified: {
    borderColor: 'transparent',
  },
  dayNumber: {
    color: COLORS.grayscale_900,
    marginBottom: 2,
  },
  dayNumberSelected: {
    color: COLORS.grayscale_900,
  },
  dayPrice: {
    color: COLORS.grayscale_600,
    fontSize: 10,
    lineHeight: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.grayscale_0,
    borderTopWidth: 1,
    borderTopColor: COLORS.grayscale_200,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 36,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
  bottomBarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedCountText: {
    color: COLORS.grayscale_900,
  },
  cancelText: {
    color: COLORS.grayscale_500,
  },
  priceErrorText: {
    color: COLORS.semantic_red,
    marginTop: 8,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.grayscale_200,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    backgroundColor: COLORS.grayscale_100,
  },
  wonText: {
    color: COLORS.grayscale_600,
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    color: COLORS.grayscale_900,
    height: '100%',
  },
  applyBtn: {
    backgroundColor: COLORS.primary_orange,
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyBtnDisabled: {
    backgroundColor: COLORS.grayscale_300,
  },
  applyBtnText: {
    color: COLORS.grayscale_0,
  },
});

export default RoomPriceModal;
