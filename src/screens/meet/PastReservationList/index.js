import React, {useMemo, useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Calendar} from 'react-native-calendars';

import Header from '@components/Header';
import {CALENDAR_COMMON_PROPS, CALENDAR_THEME} from '@constants/calendarConfig';
import {COLORS} from '@constants/colors';
import {FONTS} from '@constants/fonts';
import styles from './PastReservationList.styles';

import ChevronLeft from '@assets/images/chevron_left_black.svg';
import ChevronRight from '@assets/images/chevron_right_black.svg';
import SearchIcon from '@assets/images/search_gray.svg';
import PhoneIcon from '@assets/images/phone_black.svg';

const summaryCards = [
  {label: '남자', value: '12명'},
  {label: '여자', value: '12명'},
  {label: '성비', value: '1:1'},
];

const reservations = [
  {
    id: 1,
    name: '이아무',
    gender: '남',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
  },
  {
    id: 2,
    name: '이영희',
    gender: '여',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
  },
  {
    id: 3,
    name: '박지수',
    gender: '여',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
  },
  {
    id: 4,
    name: '최민호',
    gender: '남',
    birthYear: '1992년생',
    time: '14:20 신청',
    phone: '010-1234-5678',
  },
];

const getTodayLocalDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateToMonthDay = localDate => {
  const [, month, day] = localDate.split('-');
  return `${month}/${day}`;
};

const shiftDate = (baseDate, diffDays) => {
  const nextDate = new Date(baseDate);
  nextDate.setDate(nextDate.getDate() + diffDays);
  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const day = String(nextDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const PastReservationList = () => {
  const today = useMemo(() => getTodayLocalDate(), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: COLORS.primary_orange,
    },
  };
  const isTodaySelected = selectedDate === today;

  return (
    <View style={styles.container}>
      <Header title="지난 예약 내역" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.dateSelectContainer}>
          <View style={styles.dateSelectBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedDate(prev => shiftDate(prev, -1));
                setIsCalendarOpen(false);
              }}>
              <ChevronLeft width={24} height={24} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsCalendarOpen(prev => !prev)}>
              <Text style={[FONTS.fs_16_medium, styles.dateText]}>
                {formatDateToMonthDay(selectedDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={isTodaySelected ? 1 : 0.8}
              disabled={isTodaySelected}
              style={isTodaySelected && styles.disabledArrowButton}
              onPress={() => {
                if (isTodaySelected) {
                  return;
                }
                setSelectedDate(prev => shiftDate(prev, 1));
                setIsCalendarOpen(false);
              }}>
              <ChevronRight
                width={24}
                height={24}
                style={isTodaySelected && styles.disabledArrowIcon}
              />
            </TouchableOpacity>
          </View>

          {isCalendarOpen ? (
            <View style={styles.calendarContainer}>
              <Calendar
                current={selectedDate}
                {...CALENDAR_COMMON_PROPS}
                markedDates={markedDates}
                maxDate={today}
                onDayPress={day => {
                  setSelectedDate(day.dateString);
                  setIsCalendarOpen(false);
                }}
                theme={CALENDAR_THEME}
              />
            </View>
          ) : null}
        </View>

        <View style={styles.summaryCard}>
          {summaryCards.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.summaryItem,
                index !== summaryCards.length - 1 && styles.summaryItemBorder,
              ]}>
              <Text style={[FONTS.fs_12_medium, styles.summaryLabel]}>
                {item.label}
              </Text>
              <Text
                style={[
                  FONTS.fs_18_semibold,
                  item.label === '남자'
                    ? styles.summaryMaleValue
                    : item.label === '여자'
                      ? styles.summaryFemaleValue
                      : styles.summaryRatio,
                ]}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.searchBox}>
          <SearchIcon width={20} height={20} />
          <TextInput
            editable={false}
            placeholder="예약자 성함 검색"
            placeholderTextColor={COLORS.grayscale_400}
            style={[FONTS.fs_14_medium, styles.searchInput]}
            value=""
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[FONTS.fs_16_medium, styles.listTitle]}>예약 명단</Text>
          <Text style={[FONTS.fs_14_medium, styles.listCount]}>24</Text>
        </View>

        <View style={styles.listSection}>
          {reservations.map(item => (
            <View key={item.id} style={styles.reservationCard}>
              <View style={styles.reservationInfo}>
                <View style={styles.nameRow}>
                  <Text style={[FONTS.fs_16_semibold, styles.nameText]}>
                    {item.name}
                  </Text>
                  <View
                    style={[
                      styles.genderBadge,
                      item.gender === '남'
                        ? styles.genderMaleBadge
                        : styles.genderFemaleBadge,
                    ]}>
                    <Text
                      style={[
                        FONTS.fs_12_medium,
                        item.gender === '남'
                          ? styles.genderMaleText
                          : styles.genderFemaleText,
                      ]}>
                      {item.gender}
                    </Text>
                  </View>
                  <Text style={[FONTS.fs_12_medium, styles.birthText]}>
                    {item.birthYear}
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Text style={[FONTS.fs_12_medium, styles.metaText]}>
                    {item.time}
                  </Text>
                  <View style={styles.metaDivider} />
                  <Text style={[FONTS.fs_12_medium, styles.metaText]}>
                    {item.phone}
                  </Text>
                </View>
              </View>

              <TouchableOpacity activeOpacity={0.8} style={styles.callButton}>
                <PhoneIcon width={18} height={18} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default PastReservationList;
