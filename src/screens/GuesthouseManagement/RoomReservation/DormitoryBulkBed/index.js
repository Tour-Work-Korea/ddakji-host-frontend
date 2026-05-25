import React, { useState, useEffect } from 'react';
import {
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

import Header from '@components/Header';
import ButtonScarlet from '@components/ButtonScarlet';
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

  const [roomConfigs, setRoomConfigs] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize room configuration states
  useEffect(() => {
    if (rooms.length > 0) {
      const initialConfigs = {};
      rooms.forEach(room => {
        const roomId = room.roomId || room.id;
        initialConfigs[roomId] = {
          availableBeds: Number(room.roomCapacity ?? room.displayBeds ?? 4),
        };
      });
      setRoomConfigs(initialConfigs);
    }
  }, [rooms]);

  const handleEditBeds = (roomId, delta) => {
    setRoomConfigs(prev => {
      const config = prev[roomId] || { availableBeds: 4 };
      const nextBeds = Math.max(0, config.availableBeds + delta);
      return {
        ...prev,
        [roomId]: {
          ...config,
          availableBeds: nextBeds,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      Toast.show({
        type: 'error',
        text1: '설정 기간을 입력해 주세요.',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      return;
    }

    try {
      setIsLoading(true);
      const dates = getDatesInRange(startDate, endDate);
      const promises = [];

      rooms.forEach(room => {
        const roomId = room.roomId || room.id;
        const config = roomConfigs[roomId] || { availableBeds: Number(room.roomCapacity || 4) };

        // Available beds API
        const bedPayload = dates.map(dateStr => ({
          date: dateStr,
          availableBeds: config.availableBeds,
        }));
        promises.push(hostGuesthouseApi.bulkUpdateAvailableBeds(guesthouseId, roomId, bedPayload));
      });

      await Promise.all(promises);

      Toast.show({
        type: 'success',
        text1: '선택한 기간 동안의 베드 수가 일괄 변경되었습니다',
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
      navigation.goBack();
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message ?? '일괄 변경에 실패했습니다';
      Toast.show({
        type: 'error',
        text1: message,
        position: 'top',
        topOffset: MENU_TOAST_TOP_OFFSET,
      });
    } finally {
      setIsLoading(false);
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

          <Text style={[FONTS.fs_14_semibold, styles.roomListLabel]}>객실별 설정</Text>
          <View style={styles.roomList}>
            {rooms.map(room => {
              const roomId = room.roomId || room.id;
              const config = roomConfigs[roomId] || { availableBeds: 4 };

              return (
                <View key={roomId} style={styles.roomCard}>
                  <View style={styles.roomInfoCol}>
                    <Text style={[FONTS.fs_16_semibold, styles.roomNameText]} numberOfLines={1}>
                      {room.name ?? room.roomName}
                    </Text>
                  </View>

                  <View style={styles.bedControlCol}>
                    <Text style={[FONTS.fs_12_medium, styles.bedLabel]}>예약 가능 베드 수</Text>
                    <View style={styles.controlRow}>
                      <TouchableOpacity
                        onPress={() => handleEditBeds(roomId, -1)}
                        disabled={config.availableBeds <= 0}
                        style={[styles.controlBtn, config.availableBeds <= 0 && styles.controlBtnDisabled]}
                      >
                        <MinusIcon width={12} height={12} />
                      </TouchableOpacity>
                      <Text style={[FONTS.fs_16_bold, styles.countText]}>
                        {config.availableBeds}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleEditBeds(roomId, 1)}
                        style={styles.controlBtn}
                      >
                        <PlusIcon width={12} height={12} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <ButtonScarlet
            title={isLoading ? '반영 중' : '전체 대입'}
            onPress={handleSave}
            disabled={isLoading}
          />
        </View>
      </View>
    </View>
  );
};

export default DormitoryBulkBed;
