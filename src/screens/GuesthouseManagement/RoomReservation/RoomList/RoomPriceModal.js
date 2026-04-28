import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import Toast from 'react-native-toast-message';
import BasicToast from '@components/toasts/BasicToast';

import { CALENDAR_COMMON_PROPS, CALENDAR_THEME } from '@constants/calendarConfig';
import { COLORS } from '@constants/colors';
import { FONTS } from '@constants/fonts';

import XIcon from '@assets/images/x_gray.svg';
import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import CalendarIcon from '@assets/images/calendar_gray.svg';
import AlertModal from '@components/modals/AlertModal';

const getPriceColor = (valStr) => {
  if (!valStr || valStr === '0') return 'transparent';
  const val = parseInt(String(valStr).replace(/[^0-9]/g, ''), 10);
  if (isNaN(val) || val === 0) return 'transparent';

  const tier = Math.floor(val / 10000);
  switch (tier % 6) {
    case 2: return COLORS.secondary_yellow;
    case 3: return COLORS.secondary_pink;
    case 4: return COLORS.secondary_blue;
    case 5: return COLORS.secondary_green;
    case 0: return COLORS.secondary_khaki;
    case 1: return COLORS.secondary_red;
    default: return COLORS.secondary_yellow;
  }
};

const getSeasonColor = (dateStr, seasonData, seasonLabels) => {
  const seasonKey = seasonData[dateStr];
  if (seasonKey) {
    const found = seasonLabels.find(s => s.key === seasonKey);
    if (found) return found.color;
  }
  return 'transparent';
};

const formatPrice = (price) => {
  if (!price) return '';
  return Number(price).toLocaleString('ko-KR');
};

const toastConfig = {
  success: (props) => <BasicToast {...props} />,
};

const RoomPriceModal = ({ visible, onClose, room }) => {
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState(new Set([0, 1, 2, 3, 4, 5, 6]));
  const [priceData, setPriceData] = useState({});
  const [inputPrice, setInputPrice] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');

  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'season'

  const [seasonData, setSeasonData] = useState({});
  const [seasonLabels, setSeasonLabels] = useState([
    { key: 'OFF', label: '비수기', color: COLORS.secondary_yellow },
    { key: 'SHOULDER', label: '준성수기', color: COLORS.secondary_blue },
    { key: 'PEAK', label: '성수기', color: COLORS.secondary_red },
  ]);
  const [seasonDates, setSeasonDates] = useState({
    OFF: { start: '', end: '' },
    SHOULDER: { start: '', end: '' },
    PEAK: { start: '', end: '' },
  });
  const [seasonPrices, setSeasonPrices] = useState({
    OFF: { weekday: '', friday: '', saturday: '', sunday: '' },
    SHOULDER: { weekday: '', friday: '', saturday: '', sunday: '' },
    PEAK: { weekday: '', friday: '', saturday: '', sunday: '' },
  });

  const handleAddSeason = () => {
    const currentCustomCount = seasonLabels.filter(s => s.key.startsWith('CUSTOM_')).length;
    if (currentCustomCount >= 5) {
      showAlert('알림', '사용자 추가 시즌은 최대 5개까지만 등록할 수 있습니다.');
      return;
    }

    const newKey = `CUSTOM_${Date.now()}`;
    const colorOptions = [COLORS.secondary_green, COLORS.secondary_yellow, COLORS.secondary_blue, COLORS.secondary_red];

    setSeasonLabels(prev => {
      const customCount = prev.filter(s => s.key.startsWith('CUSTOM_')).length;
      const newColor = colorOptions[customCount % colorOptions.length];
      return [...prev, { key: newKey, label: `새 시즌 ${prev.length + 1}`, color: newColor }];
    });

    setSeasonDates(prev => ({ ...prev, [newKey]: { start: '', end: '' } }));
    setSeasonPrices(prev => ({ ...prev, [newKey]: { weekday: '', friday: '', saturday: '', sunday: '' } }));
  };

  const handleRemoveSeason = (keyToRemove) => {
    setSeasonLabels(prev => prev.filter(s => s.key !== keyToRemove));
    setSeasonDates(prev => {
      const next = { ...prev };
      delete next[keyToRemove];
      return next;
    });
    setSeasonPrices(prev => {
      const next = { ...prev };
      delete next[keyToRemove];
      return next;
    });
    setSeasonData(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(date => {
        if (next[date] === keyToRemove) {
          delete next[date];
        }
      });
      return next;
    });
  };
  const [datePickerConfig, setDatePickerConfig] = useState({ visible: false, targetSeason: null, targetField: null, currentDate: '' });
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', onConfirm: null });

  const showAlert = (title, message, onConfirm = null) => {
    setAlertConfig({ visible: true, title, message, onConfirm });
  };

  // 초기화
  useEffect(() => {
    if (visible && room) {
      setActiveTab('calendar');
      setSelectedDates(new Set());
      setSelectionStart(null);
      setInputPrice('');
      setSeasonData({});
      setSeasonLabels([
        { key: 'OFF', label: '비수기', color: COLORS.secondary_yellow },
        { key: 'SHOULDER', label: '준성수기', color: COLORS.secondary_blue },
        { key: 'PEAK', label: '성수기', color: COLORS.secondary_red },
      ]);
      setSeasonDates({
        OFF: { start: '', end: '' },
        SHOULDER: { start: '', end: '' },
        PEAK: { start: '', end: '' },
      });
      setSeasonPrices({
        OFF: { weekday: '', friday: '', saturday: '', sunday: '' },
        SHOULDER: { weekday: '', friday: '', saturday: '', sunday: '' },
        PEAK: { weekday: '', friday: '', saturday: '', sunday: '' },
      });

      // 초기 요금 세팅을 위해 오늘 기준 임시 생성 (실제로는 API에서 받아옴)
      // 현재는 방의 기본가(roomPrice)를 90일치만 임의로 깔아둠
      const defaultPrice = room?.roomPrice;
      const initialMap = {};

      if (defaultPrice != null && defaultPrice !== '') {
        const today = new Date();
        for (let i = 0; i < 90; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          initialMap[`${y}-${m}-${day}`] = defaultPrice;
        }
      }
      setPriceData(initialMap);
    }
  }, [visible, room]);

  const handleDayPress = (day) => {
    const dateStr = day.dateString;
    setSelectedDates(prev => {
      const next = new Set(prev);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      return next;
    });
  };

  const handleApplyPrice = () => {
    const numericPrice = inputPrice.replace(/[^0-9]/g, '');
    if (!numericPrice || numericPrice === '0') {
      showAlert('오류', '올바른 요금을 입력해주세요.');
      return;
    }

    setPriceData(prev => {
      const next = { ...prev };
      selectedDates.forEach(date => {
        next[date] = numericPrice;
      });
      return next;
    });

    setSelectedDates(new Set());
    setSelectionStart(null);
    setInputPrice('');
    Toast.show({
      type: 'success',
      text1: '선택한 날짜의 요금이 변경되었습니다.',
      position: 'top',
    });
  };

  const handleToggleDayOfWeek = (dayVal) => {
    setSelectedDaysOfWeek(prev => {
      const next = new Set(prev);
      if (next.has(dayVal)) {
        if (next.size > 1) next.delete(dayVal);
      } else {
        next.add(dayVal);
      }
      return next;
    });
  };

  const handleSaveAll = () => {
    // API 저장 로직을 이곳에 붙입니다.
    showAlert('저장 완료', '모든 객실 요금이 서버에 반영되었습니다.', () => {
      onClose();
    });
  };

  const applySeasonPricesToCalendar = () => {
    // 1. 기간 겹침 유효성 검사
    const validSeasons = [];
    for (const season of seasonLabels) {
      const s = seasonDates[season.key];
      if (s.start && s.end) {
        const start = new Date(s.start);
        const end = new Date(s.end);
        if (start > end) {
          showAlert('기간 오류', `${season.label}의 시작일이 종료일보다 늦습니다.`);
          return;
        }
        validSeasons.push({ label: season.label, start, end });
      }
    }

    for (let i = 0; i < validSeasons.length; i++) {
      for (let j = i + 1; j < validSeasons.length; j++) {
        const a = validSeasons[i];
        const b = validSeasons[j];
        if (a.start <= b.end && b.start <= a.end) {
          showAlert('기간 중복 오류', `${a.label}와 ${b.label}의 기간이 겹칩니다.\n서로 중복되지 않게 설정해주세요.`);
          return;
        }
      }
    }

    const nextPrices = { ...priceData };
    const nextSeasons = { ...seasonData };
    const checkDateAndSet = (seasonKey) => {
      const s = seasonDates[seasonKey];
      const p = seasonPrices[seasonKey];
      if (!s.start || !s.end) return;

      const start = new Date(s.start);
      const end = new Date(s.end);
      if (start > end) return;

      let current = new Date(start);
      while (current <= end) {
        const y = current.getFullYear();
        const m = String(current.getMonth() + 1).padStart(2, '0');
        const d = String(current.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${d}`;

        const dayOfWeek = current.getDay();
        let priceToApply = '';
        if (dayOfWeek === 5 && p.friday) {
          priceToApply = p.friday;
        } else if (dayOfWeek === 6 && p.saturday) {
          priceToApply = p.saturday;
        } else if (dayOfWeek === 0 && p.sunday) {
          priceToApply = p.sunday;
        } else if (p.weekday) {
          priceToApply = p.weekday;
        }

        if (priceToApply) {
          nextPrices[dateStr] = priceToApply;
          nextSeasons[dateStr] = seasonKey;
        }
        current.setDate(current.getDate() + 1);
      }
    };

    seasonLabels.forEach(s => checkDateAndSet(s.key));

    setPriceData(nextPrices);
    setSeasonData(nextSeasons);
    setActiveTab('calendar');
    Toast.show({
      type: 'success',
      text1: '시즌 규칙이 달력에 적용되었습니다.',
      position: 'top',
    });
  };

  const updateSeasonDate = (seasonKey, field, val) => {
    setSeasonDates(prev => ({
      ...prev,
      [seasonKey]: { ...prev[seasonKey], [field]: val }
    }));
  };

  const updateSeasonPrice = (seasonKey, field, val) => {
    setSeasonPrices(prev => ({
      ...prev,
      [seasonKey]: { ...prev[seasonKey], [field]: val }
    }));
  };

  const handleOpenDate = (seasonKey, field, currentVal) => {
    setDatePickerConfig({ visible: true, targetSeason: seasonKey, targetField: field, currentDate: currentVal });
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

            {seasonLabels.map(({ key, label }) => (
              <View style={styles.seasonTableRow} key={key}>
                <TextInput
                  style={[FONTS.fs_14_medium, { width: 70, color: COLORS.grayscale_900, padding: 0 }]}
                  value={label}
                  onChangeText={(text) => {
                    setSeasonLabels(prev => prev.map(s => s.key === key ? { ...s, label: text } : s));
                  }}
                  placeholder="시즌명"
                  placeholderTextColor={COLORS.grayscale_400}
                />
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <TouchableOpacity
                    style={styles.seasonDateInput}
                    onPress={() => handleOpenDate(key, 'start', seasonDates[key]?.start)}
                  >
                    <Text style={[FONTS.fs_12_medium, { color: seasonDates[key]?.start ? COLORS.grayscale_900 : COLORS.grayscale_400 }]}>
                      {seasonDates[key]?.start ? seasonDates[key].start.replace(/-/g, '. ') : 'YY.MM.DD'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={{ color: COLORS.grayscale_500 }}>-</Text>
                  <TouchableOpacity
                    style={styles.seasonDateInput}
                    onPress={() => handleOpenDate(key, 'end', seasonDates[key]?.end)}
                  >
                    <Text style={[FONTS.fs_12_medium, { color: seasonDates[key]?.end ? COLORS.grayscale_900 : COLORS.grayscale_400 }]}>
                      {seasonDates[key]?.end ? seasonDates[key].end.replace(/-/g, '. ') : 'YY.MM.DD'}
                    </Text>
                  </TouchableOpacity>
                  {key.startsWith('CUSTOM_') && (
                    <TouchableOpacity onPress={() => handleRemoveSeason(key)} style={{ padding: 4 }}>
                      <Text style={[FONTS.fs_12_medium, { color: COLORS.semantic_red }]}>삭제</Text>
                    </TouchableOpacity>
                  )}
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

            {seasonLabels.map(({ key, label }) => (
              <View style={styles.priceMatrixRow} key={`price_${key}`}>
                <Text style={[FONTS.fs_14_medium, { width: 60, color: COLORS.grayscale_900, textAlign: 'center' }]} numberOfLines={1}>{label}</Text>

                {['weekday', 'friday', 'saturday', 'sunday'].map(field => (
                  <View style={{ flex: 1, paddingHorizontal: 2 }} key={field}>
                    <View style={styles.matrixInputWrap}>
                      <TextInput
                        style={[FONTS.fs_12_medium, styles.matrixInput]}
                        keyboardType="numeric"
                        value={seasonPrices[key]?.[field] ? formatPrice(seasonPrices[key][field]) : ''}
                        onChangeText={(t) => updateSeasonPrice(key, field, t.replace(/[^0-9]/g, ''))}
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

        <TouchableOpacity style={styles.applyAllBtn} onPress={applySeasonPricesToCalendar}>
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
                updateSeasonDate(datePickerConfig.targetSeason, datePickerConfig.targetField, day.dateString);
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

    const dayPrice = priceData[dateStr] || '';
    const bgColor = getSeasonColor(dateStr, seasonData, seasonLabels);

    const assignedSeason = seasonData[dateStr];
    let isOverride = false;
    if (assignedSeason && dayPrice) {
      const p = seasonPrices[assignedSeason];
      let defaultPrice = '';
      if (dayOfWeek === 5 && p.friday) defaultPrice = p.friday;
      else if (dayOfWeek === 6 && p.saturday) defaultPrice = p.saturday;
      else if (dayOfWeek === 0 && p.sunday) defaultPrice = p.sunday;
      else if (p.weekday) defaultPrice = p.weekday;

      if (defaultPrice && dayPrice !== defaultPrice) {
        isOverride = true;
      }
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
            isSelected && styles.dayCellSelectedModified // 투명 보더 추가 (레이아웃 흔들림 방지 위함)
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
          {isOverride && (
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

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[FONTS.fs_18_semibold, styles.title]} numberOfLines={1}>
              {room?.name ?? '객실명 없음'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
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
                  {seasonLabels.map(s => (
                    <View style={styles.legendItem} key={`legend_${s.key}`}>
                      <View style={[styles.legendColorBox, { backgroundColor: s.color }]} />
                      <Text style={[FONTS.fs_12_medium, styles.legendText]}>{s.label}</Text>
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

              {/* Save Button */}
              <View style={styles.saveBtnContainer}>
                <Text style={[FONTS.fs_12_medium, { color: COLORS.grayscale_500, marginRight: 8 }]}>※ 저장 버튼을 눌러야 최종 적용됩니다.</Text>
                <TouchableOpacity onPress={handleSaveAll} style={styles.saveBtn}>
                  <Text style={[FONTS.fs_16_semibold, styles.saveBtnText]}>저장</Text>
                </TouchableOpacity>
              </View>

              {/* Bottom Action Bar for Setting Price */}
              {selectedDates.size > 0 && (
                <View style={styles.bottomBar}>
                  <View style={styles.bottomBarTopRow}>
                    <Text style={[FONTS.fs_14_medium, styles.selectedCountText]}>
                      {selectedDates.size}개 날짜 선택됨
                    </Text>
                    <TouchableOpacity onPress={() => {
                      setSelectedDates(new Set());
                      setSelectionStart(null);
                    }}>
                      <Text style={[FONTS.fs_14_medium, styles.cancelText]}>선택 해제</Text>
                    </TouchableOpacity>
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
                      style={[styles.applyBtn, !inputPrice && styles.applyBtnDisabled]}
                      onPress={handleApplyPrice}
                      activeOpacity={0.8}
                    >
                      <Text style={[FONTS.fs_14_medium, styles.applyBtnText]}>요금 적용</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          ) : (
            renderSeasonTab()
          )}
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
  saveBtnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  saveBtn: {
    backgroundColor: COLORS.primary_orange,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveBtnText: {
    color: COLORS.grayscale_0,
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
    // 테두리는 connector가 담당하므로 여백 유지를 위해 투명만 사용
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
    paddingBottom: 36, // SafeArea 하단 대응 임의 여백
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
  daysFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dayFilterChip: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.grayscale_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayFilterChipSelected: {
    backgroundColor: COLORS.primary_orange,
  },
  dayFilterText: {
    color: COLORS.grayscale_600,
  },
  dayFilterTextSelected: {
    color: COLORS.grayscale_0,
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
